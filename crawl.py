# british_council

import requests
import requests_cache
from urllib.parse import urljoin
from bs4 import BeautifulSoup

request_headers = {"User-Agent": "Mozilla"}

requests_cache.install_cache()
import lxml.etree

def get_soup(url):
    r = requests.get(url, headers=request_headers)
    return BeautifulSoup(r.content, "html5lib")

def skill_tree(url = "http://learnenglish.britishcouncil.org/en/skills"):
    links = []
    soup = get_soup(url)
    divs = soup.find_all("div", {"class": "views-field-name"})
    for d in divs:
        a = d.find("a")
        links.append(urljoin(url, d.find("a", recursive=True).attrs['href']))
    return links

print(skill_tree("http://learnenglish.britishcouncil.org/en/listening-skills-practice"))
    
#print(skill_tree())
    

def quick_grammar(url = "http://learnenglish.britishcouncil.org/en/quick-grammar"):
    
    links = []
    soup = get_soup(url)
    content = soup.find_all("span", {'class': 'field-content'})
    for tag in content:
        link_tags = tag.find_all("a")
        for tag in link_tags:
            links.append(urljoin(url, tag.attrs['href']))
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

print(quick_grammar())