# individual

import requests
import requests_cache
from bs4 import BeautifulSoup
from lxml import etree

from ricecooker.classes import questions
from ricecooker.classes.nodes import ExerciseNode
from ricecooker.classes.licenses import get_license
from le_utils.constants import licenses, exercises
from le_utils.constants.languages import getlang
from ricecooker.classes.questions import PerseusQuestion

requests_cache.install_cache()
request_headers = {"User-Agent": "Mozilla"}

    

def get_individual_page(url):
    r = requests.get(url, headers = request_headers)
    soup = BeautifulSoup(r.content, "html5lib") # html5lib handles encodings, so throw raw bytes at it with .content
    body = (soup.find("article").find("div", {"class": "field-name-body"}))
    xml_elements = (body.find_all("a", {"class": "embed"}))
    xmls = [a.attrs['href'].strip() for a in xml_elements]
    return xmls


def handle_xml(top_xml_url):
    r = requests.get(top_xml_url, headers=request_headers)
    soup = BeautifulSoup(r.text, "xml")  # note: use .text to decode UTF-8 properly rather than just having bytes
    return soup
    #print(soup.prettify())

if __name__ == "__main__":
    print (do_it())









