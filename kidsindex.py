import lxml.html
import requests
from urllib.parse import urljoin
from ordered_set import OrderedSet

# TODO - parents/resources is potentially valuable.

data_template = """
view_name: glossary
view_display_id: block_1
view_path: taxonomy/term/{tax}
view_base_path: en/glossary
page: 0,0,0,0,0,0,0,0,0,{page}
"""

headers = """
User-Agent: Learning-Equality
"""

base_url = "http://learnenglishkids.britishcouncil.org/en/"
ajax_url = "http://learnenglishkids.britishcouncil.org/en/views/ajax"


def acquire_shortlink(url):
    # get the shortlink code from a URL
    content = requests.get(url).content 
    root = lxml.html.fromstring(content) 
    shortlink, = root.xpath("//link[@rel='shortlink']/@href") 
    return int(shortlink.split("/")[-1])

def get_top_urls():
    # get all the second tier URLs from the navbar
    content = requests.get(base_url).content
    root = lxml.html.fromstring(content)
    superfish, = root.xpath("//ul[@id='superfish-1']")
    for a in superfish.xpath(".//a[@class='sf-depth-2']/@href"):
        yield (urljoin(base_url,a))

def get_writing_page(tax, page):
    # Given a taxonomy number and a page number within that taxonomy, get the results
    all_links = []
    all_titles = []
    datastr = data_template.format(page=page, tax=tax)
    data = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in datastr.strip().split('\n')])
    head = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in headers.strip().split('\n')])

    while True:
        try:
            x = requests.post(ajax_url, data=data, headers=head, timeout=3)
            break
        except Exception as e:
            raise # was pass
    for i in x.json():
        print(i)
        html = i.get("data")
        if not html:
            continue
        root = lxml.html.fromstring(html)
        links = root.xpath(".//tbody//a")
        for link in links:
            yield urljoin(base_url, link.get("href"))

def get_writing_index(tax):
    # Get all results for a given taxonomy
    page = 0
    results = OrderedSet()
    while True:
        new_links = False
        for link in get_writing_page(tax, page):
            new_links = True
            results.add(link)
        if not new_links:
            break
        page = page + 1
    return results

def all_entries():
    for top_url in get_top_urls():
        print ("--", top_url)
        tax = acquire_shortlink(top_url)
        for url in get_writing_index(tax):
            yield url
        
if __name__ == "__main__":
    for i in all_entries():
        print(i)

                                                   
