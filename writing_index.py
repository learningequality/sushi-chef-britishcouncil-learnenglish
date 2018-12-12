import requests
import lxml.html


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

def get_writing_page(tax, page):
    all_links = []
    all_titles = []
    datastr = data_template.format(page=page, tax=tax)
    data = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in datastr.strip().split('\n')])
    head = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in headers.strip().split('\n')])

    x = requests.post("http://learnenglish.britishcouncil.org/en/views/ajax", data=data, headers=head)
    for i in x.json():
        html = i.get("data")
        if not html:
            continue
        root = lxml.html.fromstring(html)
        links = root.xpath(".//tbody//a")

        all_links.extend([x.get("href") for x in links])
        all_titles.extend([x.text for x in links])
    print (all_titles)
    return all_links, all_titles

def get_writing_index(tax):
    links = []
    titles = []
    page = 0
    while True:
        new_links, new_titles = get_writing_page(tax, page)
        links.extend(new_links)
        titles.extend(new_titles)
        if not new_links:
            break
        page = page + 1
    assert links
    return links, titles

data = {"writing": 2386,
        "listening": 2345,
        "reading": 2741,
        "speaking": 2802,
        "basic-grammar": 2769,
        "intermediate-grammar": 2770,
        # "english-grammar": 2403, # NOPE -- NOT THIS WAY TODO
        "basic-vocabulary": 2767,
        "intermediate-vocabulary": 2768,
        "youre-hired": 2389,
        "professionals-podcast": 2390,
        "business-magazine": 2391,
        "video-zone": 2742,
        # "games": None # Flash
        "jokes": 2394, # compress TODO
        "how-to": 2379,
        "talk-about": 2400,
        "overcooked": 2402,
        "shakespeare": 2690,
        "uk-culture": 2401,
        "premier-skills": 2382,
        "ielts-interview-skills": 2396,
        "ielts-study-tips-and-skills": 2397,
        # moocs, apps out of scope
        }

print (get_writing_index(2767)[0])
