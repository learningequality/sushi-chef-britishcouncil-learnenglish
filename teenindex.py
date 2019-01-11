import requests
import lxml.html
import requests_cache
requests_cache.install_cache()
base_url = "http://learnenglishteens.britishcouncil.org/"
headers = {"User-Agent": "Learning-Equality"}

def get_magazine(template_url = "http://learnenglishteens.britishcouncil.org/magazine?page={}", contains="magazine"):
    page = 0
    links = set()
    while True:
        print (page)
        url = template_url.format(page)
        content = requests.get(url, headers=headers).content
        root = lxml.html.fromstring(content)
        new_links = root.xpath(f"//div[@id='content']//div[@class='view-content']//span[@class='field-content']/a[contains(@href, '{contains}')]/@href")
        if not new_links:
            break
        links.update(new_links)
        if 'singleton' in url:
            break
        page = page + 1
    return links

#print(get_magazine(template_url = "http://learnenglishteens.britishcouncil.org/study-break/video-zone?page={}", contains=""))

url_list = [
    "http://learnenglishteens.britishcouncil.org/magazine",
    "http://learnenglishteens.britishcouncil.org/study-break/video-zone",
    "http://learnenglishteens.britishcouncil.org/study-break/youtubers",
    "http://learnenglishteens.britishcouncil.org/study-break/graded-reading",
    "http://learnenglishteens.britishcouncil.org/study-break/graded-listening",
    "http://learnenglishteens.britishcouncil.org/uk-now/read-uk",
    "http://learnenglishteens.britishcouncil.org/uk-now/video-uk",
    "http://learnenglishteens.britishcouncil.org/uk-now/literature-uk?singleton",
    "http://learnenglishteens.britishcouncil.org/uk-now/film-uk",
    "http://learnenglishteens.britishcouncil.org/uk-now/music-uk",
    "http://learnenglishteens.britishcouncil.org/uk-now/science-uk",
    "http://learnenglishteens.britishcouncil.org/grammar/beginner-grammar?singleton",
    "http://learnenglishteens.britishcouncil.org/grammar/intermediate-grammar?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/speaking/beginner-a1-speaking?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/speaking/elementary-a2-speaking?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/speaking/intermediate-b1-speaking?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/speaking/upper-intermediate-b2-speaking?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/listening/beginner-a1-listening?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/listening/elementary-a2-listening?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/listening/intermediate-b1-listening?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/listening/upper-intermediate-b2-listening?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/listening/advanced-c1-listening?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/reading/beginner-a1-reading?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/reading/elementary-a2-reading?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/reading/intermediate-b1-reading?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/reading/upper-intermediate-b2-reading?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/reading/advanced-c1-reading?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/writing/beginner-a1-writing?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/writing/elementary-a2-writing?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/writing/intermediate-B1-writing?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/writing/upper-intermediate-B2-writing?singleton",
    "http://learnenglishteens.britishcouncil.org/skills/writing/advanced-C1-writing?singleton",
]

def all_entries():
    # TODO - exams -- adult-grammar like agglutination?
    # TODO - vocab -- NOPE -- is just quizzes
    
    
    all_urls = []
    for url in url_list:
        print (url)
        if "magazine" in url:
            contains = "magazine"
        else:   
            contains = ""
        all_urls.extend(list(get_magazine(url+"?page={}", contains)))
    return all_urls