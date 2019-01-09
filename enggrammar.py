import lxml.html
import requests
import requests_cache
from urllib.parse import urljoin
from localise import make_local
from bs4 import BeautifulSoup
requests_cache.install_cache()
headers = {"User-Agent": "LearningEquality"}

def parse(original_url):
    url = original_url
    new_soup = BeautifulSoup("<article id='dragon'></article>", "html5lib").find("article")
    original_title = None

    while True:
        html = requests.get(url, headers=headers).content
        soup = BeautifulSoup(html, "html5lib")
        article = soup.find("article")
        article_div = article.find("div")
        title = soup.find("h1", {"id": "page-title"})
        if not original_title:
            original_title = title
        new_soup.append(title)
        new_soup.append(article_div)
        
        a_tag = soup.find("a", {"class": "page-next"})
        if not a_tag:
            break
        url = a_tag.attrs["href"]
        if "pronouns-questions" in url:
            url = "https://learnenglish.britishcouncil.org/english-grammar/reflexive-pronouns"
        url = urljoin(original_url, url)
 
    return original_title, make_local(new_soup, original_url)

def index():
    top_url = "https://learnenglish.britishcouncil.org/english-grammar"
    html = requests.get(top_url, headers=headers).content
    root = lxml.html.fromstring(html)
    top_links = root.xpath("//span[@class='field-content']/a/@href")
    top_links = [urljoin(top_url, x) for x in top_links if ".fm" not in x and x != "/grammar"]
    for link in top_links:
        yield parse(link)
