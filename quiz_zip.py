import requests
import shutil
import os
import lxml.etree
from urllib.parse import urljoin

TEMPLATE_DIR = "template.zip/"
NUGGET_DIR = "nugget/"
TARGET_DIR = "demo.zip/"
XML1_URL = "//gamedata.britishcouncil.org/d/ImageMatching_MjA0MDA=.xml"
XML2_URL = "//gamedata.britishcouncil.org/d/FindThePairs_ODA0NQ==.xml"
BASE_URL =  "http://gamedata.britishcouncil.org/sites/all/modules/lep25loader/theme/"

def clean_zip():
    try:
        shutil.rmtree(TARGET_DIR)
    except OSError as e:
        if e.errno != 2: raise  # no such file or directory
    shutil.copytree(TEMPLATE_DIR, TARGET_DIR)

def zip_bits():
    shutil.copytree(TEMPLATE_DIR, TARGET_DIR)

def handle_xml(xml_data):
    """Download images etc. used by XML file and modify XML file to point to them"""
    root = lxml.etree.fromstring(xml_data)
    url_nodes = root.xpath("//URL")
    for url_node in url_nodes:
        url = urljoin(BASE_URL, url_node.text)
        response = requests.get(url)
        try:
            response.raise_for_status()
        except Exception as e:
            print (e, url)
            continue
        filename = "resource/"+url.split("/")[-1]
        with open(TARGET_DIR + filename, "wb") as f:
            f.write(response.content)
        url_node.text = filename
    url_nodes= root.xpath("//*[@url]")
    for url_node in url_nodes:
        url = urljoin(BASE_URL, url_node.attrib["url"])
        response = requests.get(url)
        try:
            response.raise_for_status()
        except Exception as e:
            print (e,url)
            continue
        filename = "resource/"+url.split("/")[-1]
        with open(TARGET_DIR + filename, "wb") as f:
            f.write(response.content)
        url_node.attrib["url"] = filename

    return lxml.etree.tostring(root)



def create_quiz(xml_url, title="Quiz"):
    """Download XML and create Quiz HTML"""
    print (repr(xml_url))
    xml_full_url = urljoin(BASE_URL, xml_url)
    xml_filename = xml_url.split("/")[-1]
    html_filename = xml_filename.replace(".xml", ".html")
    with open(NUGGET_DIR+"quiz.html", "r") as f:
        html = f.read()
    html = html.replace("%%%TITLE", title)
    html = html.replace("%%%XML", xml_filename)
    with open(TARGET_DIR+html_filename, "w") as f:
        f.write(html)
    xml_request = requests.get(xml_full_url)
    xml_request.raise_for_status()
    xml_data = handle_xml(xml_request.content)
    with open(TARGET_DIR+xml_filename, "wb") as f:
        f.write(xml_data)
    return html_filename

if __name__ == "__main__":
    clean_zip()
    with open("sample_xml_list.txt") as f:
        for x in f.readlines():
            create_quiz(x.strip())

#create_quiz(XML1_URL)
#create_quiz(XML2_URL)


