import lxml.html
import requests
import requests_cache
from urllib.parse import urljoin
from localise import make_local
from bs4 import BeautifulSoup
requests_cache.install_cache()
headers = {"User-Agent": "LearningEquality"}

def parse(link):
    url = link
    new_soup = BeautifulSoup("<span id='dragon'></span>", "html5lib").find("span")

    while True:
        html = requests.get(url, headers=headers).content
        root = lxml.html.fromstring(html)
        article_div = root.xpath("//article/div")[0]
        try:
            url, = root.xpath("//a[@class='page-next']/@href")
        except ValueError:
            break
        if "pronouns-questions" in url:
            url = "https://learnenglish.britishcouncil.org/english-grammar/reflexive-pronouns"
        url = urljoin(top_url, url)
 
        print (url)

    print (bodies)

    return make_local(soup_data, page_url)  # name of zipfile
    exit()









top_url = "https://learnenglish.britishcouncil.org/english-grammar"
html = requests.get(top_url, headers=headers).content
root = lxml.html.fromstring(html)
top_links = root.xpath("//span[@class='field-content']/a/@href")
top_links = [urljoin(top_url, x) for x in top_links if ".fm" not in x and x != "/grammar"]
for link in top_links:
    parse(link)


