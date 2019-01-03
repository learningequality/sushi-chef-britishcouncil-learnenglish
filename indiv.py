import requests
import requests_cache
from urllib.parse import urljoin
from bs4 import BeautifulSoup

class Metadata(object):
    pass

request_headers = {"User-Agent": "Mozilla"}

requests_cache.install_cache()
import lxml.etree

def html_soup(url):
    "html5lib handles encodings, so throw raw bytes at it with .content"
    html = requests.get(url, headers=request_headers)
    soup = BeautifulSoup(html.content, "html5lib")
    return soup
    
def xml_soup(url):
    "note: use .text to decode UTF-8 properly rather than just having bytes"
    html = requests.get(url, headers=request_headers)
    soup = BeautifulSoup(html.text, "xml") 
    return soup

def quiz_links(soup):
    "return the urls for the quiz XML"
    body = (soup.find("article").find("div", {"class": "field-name-body"}))
    xml_elements = (body.find_all("a", {"class": "embed"}))
    urls = [a.attrs['href'].strip() for a in xml_elements]
    return urls

def individual(url = "https://learnenglish.britishcouncil.org/en/youre-hired/episode-03"):
    soup = html_soup(url)
    article = soup.find("article")
    if not article:
        with open("log.log", "a") as f:
            _id = soup.find("link", {"rel": "shortlink"})
            f.write("no article: {} {}".format(url, _id.get("href")))
        return soup, None
    metadata = Metadata()
    metadata.title = soup.find("h1", {"id": "page-title"}).text
    metadata.crumb = [x.text for x in soup.find("div", {"class": "breadcrumb"}).find_all("a")]
    try:
        metadata.desc = soup.find(None, {"class": "views-field-description"}).text
    except AttributeError:
        metadata.desc = None
    
    # remove trash    
    rubbish = {
        "comments section": ["section", {"id": "comments"}],
        "discussion section": ["div", {"class": "group-discussion"}],
        "login boxes": ["li", {"class": "comment_forbidden"}],
        "printer friendly": ["li", {"class": "print_html"}],
        "topics": ["fieldset", {"class": "group-topics"}],
        "iframes": ["iframe", {}],
        }
        
    for (rubbish_name, rubbish_description) in rubbish.items():
        
        rubbish_tag, rubbish_attr = rubbish_description
        try:
            rubbish_elements = article.find_all(*rubbish_description)
            print ("removing {} {}".format(len(rubbish_elements), rubbish_name))
            [s.extract() for s in rubbish_elements]
        except Exception:
            pass
    
    # remove pointless hyperlinks to "#"
    hashlinks = article.find_all("a", {"href": "#"})
    [link.replaceWithChildren() for link in hashlinks]
    
    # unhide hidden styles
    divs = article.find_all("div", {"style": "display: none;"})
    for div in divs:
        div.attrs['style'] = ""
    
    # replace viddler videos
    # see viddler_demo for the origin of the URL which may not be viable in all cases.
    # we might need to use the API each time.
    
    viddlers = article.find_all("div", {"class":"viddler-auto-embed"})
    
    for vid in viddlers:
        viddler_id = vid.attrs['data-video-id'] 
        video = BeautifulSoup('<video controls><source src="http://www.viddler.com/file/{}/html5" type="video/mp4"></video>'.format(viddler_id), "html5lib")
        vid.replaceWith(video)
    
    return article, metadata

def get_individual_page(url):
    # from old version: used by quiz
    # get all 
    soup = html_soup(url)
    return quiz_links(soup)

def wrap_soup(soup):
    template = """<!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>Resource</title>
        </head>
        <body>
    {}
        </body>
    </html>"""
    
    return template.format(soup.prettify())
        
def output_html(soup):
    with open("output.html", "w")  as f:
        f.write(wrap_soup(soup))

if __name__ == "__main__":
    output_html(individual("https://learnenglish.britishcouncil.org/en/intermediate-grammar"))
