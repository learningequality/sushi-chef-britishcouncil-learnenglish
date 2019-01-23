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

def parse_exam(original_url):
    url = original_url
    new_soup = BeautifulSoup("<article id='dragon'></article>", "html5lib").find("article")
    original_title = None

    while True:
        html = requests.get(url, headers=headers).content
        soup = BeautifulSoup(html, "html5lib")
        article_div = soup.find("div", {"class": "field-name-body"})
        if not article_div:
            a_tag = soup.find("a", {"class": "page-next"})
            url = a_tag.attrs["href"]
            url = urljoin(original_url, url)
            continue
        #//div[contains(@class,"field-name-body")]
        title = soup.find("h1", {"id": "page-title"})
        if not original_title:
            original_title = title
        new_soup.append(title)
        new_soup.append(article_div)
        
        a_tag = soup.find("a", {"class": "page-next"})
        if not a_tag:
            break
        url = a_tag.attrs["href"]
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

def exam_index():
    urls = """/exams/reading-exams/you-read
/exams/reading-exams/while-you-read
/exams/reading-exams/reading-tasks
/exams/writing-exams/planning-time
/exams/writing-exams/writing-time
/exams/writing-exams/reviewing-time
/exams/listening-exams/you-listen
/exams/listening-exams/while-you-listen
/exams/listening-exams/after-you-listen
/exams/listening-exams/listening-tasks
/exams/speaking-exams/speaking-tips
/exams/speaking-exams/communication-strategies
/exams/speaking-exams/accuracy-fluency
/exams/speaking-exams/typical-speaking-tasks
/exams/grammar-and-vocabulary-exams/learning-new-grammar
/exams/grammar-vocabulary-exams/grammar-exercise-types
/exams/grammar-vocabulary-exams/learning-new-words
/exams/grammar-and-vocabulary-exams/recording-vocabulary
/exams/grammar-vocabulary-exams/vocabulary-exercise-types
/exams/exam-study-tips/exam
/exams/exam-study-tips/night-exam
/exams/exam-study-tips/day-exam
/exams/exam-study-tips/boost-your-memory""".split("\n")

    full_urls = ["https://learnenglishteens.britishcouncil.org" + u for u in urls]
    for link in full_urls:
        yield parse_exam(link)

if __name__ == "__main__":
    print ([x for x in exam_index()])
