# crawl redux

import requests
import requests_cache
from bs4 import BeautifulSoup
from html import unescape
request_headers = {"User-Agent": "Mozilla"}

requests_cache.install_cache()
import lxml.etree

def get_soup(url, library="html5lib"):
    r = requests.get(url, headers=request_headers)
    soup = BeautifulSoup(r.content, library)
    soup.url = url
    return soup

class Page(object):
    def __init__(self, url, parent = None):
        self.url = url
        self.soup = get_soup(url)
        self.breadcrumb = self.soup.find("div", {'class': 'breadcrumb'}).text.split(" » ")
        self.title = get_title(self.soup)
        self.parent = parent
        
    def __repr__(self):
        return "<{}: {} @ {}>".format(self.title, self.breadcrumb, self.url)        
    pass

class Index(Page):
    pass

class Detail(Page):
    pass


# sample pages
samples = {
    "http://learnenglish.britishcouncil.org/en/listening": (Index, 1),
    "http://learnenglish.britishcouncil.org/en/britain-great": (Index, 1),
    "http://learnenglish.britishcouncil.org/en/beginner-vocabulary": (Index, 1), # note ?page=1 is page 2
    "http://learnenglish.britishcouncil.org/en/shopping-great/shopping-great-part-1": (Detail, 0),
    "http://learnenglish.britishcouncil.org/en/english-grammar/pronouns": (Detail, 0), # really?
}

patterns = {
    Index: lambda x: x.xpath("//div[@class='views-row views-row-1 views-row-odd views-row-first']"),
    Detail: lambda x: x.xpath("//div[@id='block-i18n-book-navigation-i18n-book-navigation']"),
}

def get_type(root):
    is_index = root.xpath("//div[@class='views-row views-row-1 views-row-odd views-row-first']")
    is_detail = root.xpath("//div[@id='block-i18n-book-navigation-i18n-book-navigation']")
    if is_index and not is_detail: return Index
    if is_detail and not is_index: return Detail
    if is_index and is_detail: raise RuntimeError("Appears to be both index and detail page")
    if not is_index and not is_detail: raise RuntimeError("Appears to be neither index nor detail page")
    
    
def get_rss_from_url(url):
    "returns dictionary of titles, links and descriptions from RSS for a page"
    html_soup = get_soup(url)
    return get_rss(soup)
    
def get_rss(root):
    # does pagination too!
    # some urls broken -- /en/en/ -> /en/
    index = 0
    items = []
    
    rss_urls = root.xpath("//a[@class='feed-icon']/@href")
    if len(rss_urls) == 0:
        return []
    while True:
        xml_soup = get_soup(rss_urls[0]+"?page={}".format(index), "xml")
        xml_items = xml_soup.findAll("item")
        for item in xml_items:
            descr = unescape(item.find("description").text)
            descr_soup = BeautifulSoup(descr, "html5lib")
            description_text = descr_soup.getText().strip()
            
            items.append({"title": item.find("title").text,
                          "link": item.find("link").text.replace("/en/en/", "/en/"),
                          "description": description_text})
        if xml_items:
            index = index + 1
        else:
            return items
    
    """<item>
        <title>Clothes 2</title>
        <link>http://learnenglish.britishcouncil.org/en/en/beginner-vocabulary/clothes-2</link>
        <description>&lt;div class=&quot;field-content&quot;&gt;
        &lt;p&gt;Do the exercises to learn vocabulary to talk about clothes.&lt;/p&gt;
        </description>
       </item>    """
    
    

def verify_pattern():
    # dead code, remove later
    import lxml.html
    for url, (pattern_type, target_count) in samples.items():
        r = requests.get(url, headers=request_headers)
        html = r.content
        root = lxml.html.fromstring(html)
        print(lxml.html.tostring(root))
        for pattern_candidate, verifier in patterns.items():
            if verifier is None: continue
            if pattern_type == pattern_candidate:
                assert verifier(root), "{} should be {} but does not match".format(url, pattern_type)
            else:
                assert not verifier(root), "{} matches {} but is a {}".format(url, pattern_candidate, pattern_type)
                
        rss = get_rss(root)
        for item in rss:
            print (item['link'])

    print ("Success!")
        
    
if __name__ == "__main__":
    verify_pattern()
    

 
 
 
 
 
 
 
