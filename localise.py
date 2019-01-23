from ordered_set import OrderedSet
import re
import requests
from bs4 import BeautifulSoup, Tag

from urllib.parse import urljoin, urlparse
import hashlib
import os
import requests_cache
import codecs
import shutil
from mime import mime
import urllib3
import youtube

urllib3.disable_warnings()
requests_cache.install_cache()

from ricecooker.classes.nodes import DocumentNode, VideoNode, TopicNode, HTML5AppNode
from ricecooker.classes.files import HTMLZipFile, VideoFile, SubtitleFile, DownloadFile

DOMAINS = ["learnenglish.britishcouncil.org", "learnenglishteens.britishcouncil.org", "learnenglishkids.britishcouncil.org", ""]
LINK_ATTRIBUTES = ["src", "href"]
DOWNLOAD_FOLDER = "downloads"
headers = {"User-Agent": "Mozilla"}
                    
#response = requests.get(sample_url, headers=headers)
#soup = BeautifulSoup(response.content, "html5lib")
#import indiv_2
#soup = indiv_2.individual(sample_url)

"""
TODO LIST:
fix local anchors (even if they don't appear local)
correctly mangle links beginning with ~ -- i.e. ones with no domain
"""

def make_links_absolute(soup, base_url):
    for r in get_resources(soup):
        for attr in LINK_ATTRIBUTES:
            old_url = r.attrs.get(attr, None)
            url = old_url
            if not url:
                continue
            url = url.strip()
            url = urljoin(base_url, url)
            #if url != old_url:
            #    print ("Rewrote {} to {}".format(old_url, url))
            r.attrs[attr] = url

def guess_extension(filename):
    if "." not in filename[-8:]: # arbitarily chosen
        return ""
    ext = "." + filename.split(".")[-1]
    if "/" in ext:
        return ""
    return ext

def ext_from_mime_type(mime_type):
    if mime_type not in mime:
        return ""
    return mime[mime_type][0]

def get_resources(soup):
    def is_valid_tag(tag):
        if not any(link in tag.attrs for link in LINK_ATTRIBUTES):
            return False
        # do not rewrite self-links
        href = tag.attrs.get("href")
        if href and href[0]== "#":
            return False
        return True

    resources = OrderedSet()
    for attribute in LINK_ATTRIBUTES:
        l = soup.find_all(lambda tag: is_valid_tag(tag))
        resources.update(l)
    return resources


def make_local(soup_data, page_url, delete=True):

    def full_url(url):
        if urlparse(url).scheme == "":
            url = urljoin("https://", url)
        if urlparse(url).netloc == "":
            return urljoin(page_url, url)
        else:
            return url

    def hashed_url(url):
        return hashlib.sha1(full_url(url).encode('utf-8')).hexdigest() + guess_extension(full_url(url))


    try:
        shutil.rmtree(DOWNLOAD_FOLDER)
    except:
        pass

    soup = BeautifulSoup("", "html5lib")  # reify html chunk to a soup.
    soup.append(soup_data)

    make_links_absolute(soup, page_url)
    resources = get_resources(soup)


    # delete ratings
    for elem in soup.find_all(lambda tag: tag.has_attr("id") and 'rate-node' in tag.attrs['id']):
        elem.extract()

    for elem in soup.find_all("div", {"class": "field-name-comment-count"}):
        elem.extract()

    # delete Task X messages
    for elem in soup(text=re.compile(r'(?:Task|Activity|Mitigators) \d+')):  # TODO - consider finding all single-word + number
        print (elem)
        elem.extract()
    
    for elem in soup(text=re.compile(r'Game')):  # TODO - consider finding all single-word + number
        print (elem)
        elem.extract()

    # complicated -- delete 
    for fieldset in soup.find_all("fieldset"):
        xml_elements = fieldset.find_all("a", {"class": "embed"})
        iframes = fieldset.find_all("iframe")
        video = fieldset.find_all("video")
        if not xml_elements and not iframes and not video:
            continue
        [x.extract() for x in xml_elements]
       
        #[x.extract() for x in iframes]
        
        legend = fieldset.find("legend")
        if len ("".join(fieldset.strings)) - len("".join(legend.strings))> 60:
            continue
        if fieldset.find("img") or fieldset.find("a"):
            continue
        fieldset.extract()

    for collapsible in soup.find_all("div", {"class": "collapsible"}):
        strings = "".join(collapsible.strings).strip()
        if len (strings) < 40:
            collapsible.extract()

    # delete quizzes
    xml_elements = soup.find_all("a", {"class": "embed"})
    for xml in xml_elements:
        # insert quiz placeholder
        xml.extract()

    #[x.extract() for x in soup.find_all('iframe')] 

    try:
        os.mkdir(DOWNLOAD_FOLDER)
    except FileExistsError:
        pass

    raw_url_list = [resource.attrs.get('href') or resource.attrs.get('src') for resource in resources if "mailto:"]
    url_list = [x for x in raw_url_list if not x.startswith("mailto:")]
    url_list = [full_url(url) for url in url_list]

    # replace URLs
    resource_filenames = {}

    # download content
    # todo: don't download offsite a's?
    external_resources = []

    for resource in resources:
        for attribute in LINK_ATTRIBUTES:
            attribute_value = full_url(resource.attrs.get(attribute))
            if attribute_value and attribute_value in url_list:
                if attribute_value.startswith("mailto"):
                    continue

                if "youtube.com/" in attribute_value or "youtu.be/" in attribute_value:
                    print ("Downloading video from youtube : {}".format(attribute_value))
                    filename = youtube.download(attribute_value)
                    if filename:
                        resource_filenames[attribute_value] = filename.partition("/")[2]
                    else:
                        filename = ""

                if resource.name == "a" and urlparse(attribute_value).netloc not in DOMAINS:
                    #print (urlparse(attribute_value).netloc)
                    # print ("rewriting non-local URL {} in {}".format(attribute_value, resource.name))
                    new_tag = soup.new_tag("span")
                    u = soup.new_tag("u")
                    u.insert(0, resource.text)
                    new_tag.insert(0, " (url:\xa0{})".format(resource.attrs['href']))
                    new_tag.insert(0, u)
                    try:
                        resource.replaceWith(new_tag)  # TODO -- this might mess up the iteration?
                    except ValueError:  # if the resource isn't part of the tree, it errors.
                        pass
                    continue

                else:
                    if attribute_value not in resource_filenames:
                        try:
                            r = requests.get(attribute_value, headers=headers, verify=False)
                        except requests.exceptions.InvalidURL:
                            continue
                        content = r.content
                        try:
                            content_type = r.headers['Content-Type'].split(";")[0].strip()
                        except KeyError:
                            content_type = ""
                        extension = ext_from_mime_type(content_type)
                        filename = hashed_url(attribute_value)+extension

                        #if extension in [".mp4", ".pdf"]:  # TODO - handle video/pdf/mp3
                        #    external_resource = {'url': resource.attrs.get(attribute),
                        #                         'text': resource.text,
                        #                         'filename': filename}
                        #    external_resources.append(external_resource)

                        if "index" not in filename and not filename.endswith(".htm"):
                            with open(DOWNLOAD_FOLDER+"/"+filename, "wb") as f:
                                try:
                                    f.write(content)
                                except requests.exceptions.InvalidURL:
                                    pass

                        resource_filenames[attribute_value] = filename

                    resource.attrs[attribute] = resource_filenames[attribute_value]
                    continue


    html = soup_to_bytes(soup)

    with codecs.open(DOWNLOAD_FOLDER+"/index.html", "wb") as f:
        f.write(html)

    # add modified CSS file
    os.mkdir(DOWNLOAD_FOLDER+"/resources")
    shutil.copy("styles.css", DOWNLOAD_FOLDER+"/resources")

    # create zip file
    zipfile_name = shutil.make_archive("__"+DOWNLOAD_FOLDER+"/"+hashed_url(page_url), "zip", # automatically adds .zip extension!
                        DOWNLOAD_FOLDER)

    # copy files that are useful.
    # TODO
    try:
        os.mkdir("resources")
    except Exception:
        pass

    for f in external_resources:
        f['path'] = "resources/" + f['filename']
        shutil.copy("__"+DOWNLOAD_FOLDER+"/"+f['filename'], f['path'])

    # delete contents of downloadfolder
    assert "downloads" in DOWNLOAD_FOLDER
    if delete:
        shutil.rmtree(DOWNLOAD_FOLDER)
    print(os.path.getsize(zipfile_name))



    return zipfile_name# , external_resources

def nodes(zipfile_name):# , external_resources):
    z_file = HTMLZipFile(zipfile_name)
    z_node = HTML5AppNode(source_id, title, license)
    return z_node

def soup_to_bytes(soup):
    # TODO: download urls, mangle p.printTabHeadline to h2, mangle urls
    prefix = b"""
    <html>
    <head>
      <link rel="stylesheet" type="text/css" href="resources/styles.css">
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
    </head>
    <body>
      <div class="main">
      <div class="wrap">
      <div class="content">
    """

    suffix = b"""
    </div></div></div>
    </body>
    </html>"""



    output = []
    output.append(prefix)
    article = soup.find("article")
    output.append(article.prettify().encode('utf-8'))
    output.append(suffix)
    return b"\n\n<!-- dragon -->\n\n".join(output)


if __name__ == "__main__":
    import indiv
    #sample_url = "https://learnenglish.britishcouncil.org/en/youre-hired/episode-03"
    sample_url = "http://learnenglishteens.britishcouncil.org/study-break/youtubers/weird-things-we-do-britain"
    #sample_url = "http://learnenglishteens.britishcouncil.org/uk-now/read-uk/world-cup-2018"
    soup, metadata = indiv.individual(sample_url)
    print (make_local(soup, sample_url, delete=False))
