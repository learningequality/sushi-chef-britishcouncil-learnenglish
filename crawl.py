# british_council

import requests
import requests_cache
from urllib.parse import urljoin
from bs4 import BeautifulSoup
import lxml.html

request_headers = {"User-Agent": "Mozilla"}

requests_cache.install_cache()
import lxml.etree

def get_type(root):
    is_index = root.xpath("//div[@class='views-row views-row-1 views-row-odd views-row-first']")
    is_detail = root.xpath("//div[@id='block-i18n-book-navigation-i18n-book-navigation']")
    if is_index and not is_detail: return Index
    if is_detail and not is_index: return Detail
    if is_index and is_detail: raise RuntimeError("Appears to be both index and detail page")
    if not is_index and not is_detail: raise RuntimeError("Appears to be neither index nor detail page")

class NotRightPageError(Exception):
    pass

class Page(object):
    def __init__(self, url, parent = None):
        self.url = url
        self.soup = get_soup(url)
        self.breadcrumb = self.soup.find("div", {'class': 'breadcrumb'}).text.split(" » ")
        self.title = get_title(self.soup)
        self.parent = parent
        
    def __repr__(self):
        return "<{}: {} @ {}>".format(self.title, self.breadcrumb, self.url)
    
def get_title(soup):
    h1 = soup.find("h1", {"id": "page-title"})
    if h1:
        return h1.text.strip()
    title = soup.find("title")
    if title:
        return title.text.partition("|")[0].strip()
    raise RuntimeError("No title!")
    
    

def get_soup(url):
    r = requests.get(url, headers=request_headers)
    soup = BeautifulSoup(r.content, "html5lib")
    soup.url = url
    return soup

def skill_tree(soup):
    links = []
    divs = soup.find_all("div", {"class": "views-field-name"})
    if not divs:
        raise NotRightPageError()
    
    for d in divs:
        a = d.find("a", recursive=True)
        if not a:
            raise NotRightPageError()
        url = a.attrs.get('href')
        if url:
            links.append(urljoin(soup.url, url))
    return links
    

def quick_grammar(soup = get_soup("http://learnenglish.britishcouncil.org/en/quick-grammar")):
    
    links = []
    content = soup.find_all("span", {'class': 'field-content'})
    for tag in content:
        link_tags = tag.find_all("a")
        for tag in link_tags:
            links.append(urljoin(soup.url, tag.attrs['href']))
    return links

def get_vocab_nodes(url="http://learnenglish.britishcouncil.org/en/vocabulary-exercises"):
    urls = []
    next_page = True
    while next_page:
        soup = get_soup(url)
        try:
            url_fragment = soup.find("li", {'class': 'pager-next'}).find('a').attrs.get("href") #  None after first page
            url = urljoin(url, url_fragment)
        except AttributeError:  # one of the finds is a None.
            next_page = False
        spans = soup.find("div", {'id': 'content'}).find_all("span", {'class': 'field-content'})
        for span in spans:
            links = span.find_all("a")
            for link in links:
                l = urljoin(url, link.attrs.get("href"))
                if l not in urls:
                    urls.append(l)
    return urls
    

def get_grammar_nodes(base_url = "http://learnenglish.britishcouncil.org/en/english-grammar/"):
    top_level = ["pronouns", "determiners-and-quantifiers", "possessives", "adjectives", "adverbials", "nouns", "verbs", "clause-phrase-and-sentence"]
    
    grammar_nodes = []

    # TODO: also needs structure & actual top-level entrys scraping!

    for item in top_level:
        soup = get_soup(base_url + item)
        links = soup.find('aside', {'class': 'sidebars'}).find("ul", {"class": "menu"}).find("ul", {"class": "menu"}).find_all("a", {"class": "menu__link"})
        
        for link in links:
            grammar_nodes.append(urljoin(base_url, link.attrs['href']))
    return grammar_nodes

#print(quick_grammar())



pages = set([Page("http://learnenglish.britishcouncil.org/en/skills")])
deadurls = set()

def url_filter(url):
    if url in deadurls:
        return False
    if "britishcouncil" not in url:
        print (url)
        return False
    return True


def target_page(page):
    article = page.find("article")
    
       
    

while pages:
    page = pages.pop()
    print(page.url)
    deadurls.add(page.url)
    try:
        urls = skill_tree(page.soup)
        print ("Skill tree {}".format(len(urls)))
        for url in urls:
            if url_filter(url):
                pages.add(Page(url, parent=page.url))
        continue
    except NotRightPageError:
        print ("Not Skill Tree")
        pass
    try:
        urls = set(quick_grammar(page.soup))
        print ("Quick Grammar {}".format(len(urls)))
        print (urls)
        for url in urls:
            if url_filter(url):
                pages.add(Page(url, parent=page.url))
        continue
        
    except NotRightPageError:
        print ("not quick grammar")