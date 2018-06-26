import requests
import requests_cache
from urllib.parse import urljoin
from bs4 import BeautifulSoup

request_headers = {"User-Agent": "Mozilla"}

requests_cache.install_cache()
import lxml.etree


def individual(url = "https://learnenglish.britishcouncil.org/en/youre-hired/episode-03"):
    html = requests.get(url, headers=request_headers)
    soup = BeautifulSoup(html.text, "html5lib")
    article = soup.find("article")
    
    # delete the comments
    comments = article.find_all("section", {"id": "comments"})
    [s.extract() for s in comments]
    
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
    
    return article
        
def output_html(soup):
    with open("output.html", "w")  as f:
        f.write(soup.prettify())
    print (soup.prettify())

output_html(individual() )