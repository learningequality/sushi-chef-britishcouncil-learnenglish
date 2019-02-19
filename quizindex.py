import requests
import requests_cache
requests_cache.install_cache()
import index, kidsindex, teenindex
import lxml.html
from urllib.parse import urljoin
import re

BASE_URL = "http://learnenglish.britishcouncil.org"
sample_url = "http://gamedata.britishcouncil.org/lep25_embed/MjEzODE=/teens"

def findquiz(url):
    html = requests.get(url).content
    root = lxml.html.fromstring(html)
    for quiz_url in root.xpath("//*[contains(@src, 'gamedata')]/@src"):
        print(urljoin(BASE_URL, quiz_url))

def indexquiz():
    for url in index.all_entries():
        findquiz(url)
    for url in kidsindex.all_entries():
        findquiz(url)
    for url in teenindex.all_entries():
        findquiz(url)

def get_quiz_xml(url):
    html = requests.get(url).content
    root = lxml.html.fromstring(html)
    iframe_src, = root.xpath("//iframe/@src")
    iframe_html = requests.get(urljoin(url, iframe_src)).content
    print (urljoin(url, iframe_src))
    xml_data = re.search(b"var xmlData += '([^']+)'", iframe_html).groups(1)[0]
    return xml_data, requests.get(urljoin(url, xml_data.decode('utf-8'))).content
    # var xmlData  = '//gamedata.britishcouncil.org/d/GapFillDragAndDrop_MjAzOTM=.xml';

def download():
    with open("all_quizzes.txt") as f:
        fake_quiz_urls = [x.strip() for x in f.readlines()]
    for url in fake_quiz_urls:
        xml_url, xml_content = get_quiz_xml(url)
        continue
       
        
        filename = xml_url.split(b"/")[-1]
        with open(filename, "wb") as xmlout:
            print (filename)
            xmlout.write(xml_content)
        

if __name__ == "__main__":
    download()
