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
    soup = BeautifulSoup(r.content, "html5lib")
    body = (soup.find("article").find("div", {"class": "field-name-body"}))
    xml_elements = (body.find_all("a", {"class": "embed"}))
    xmls = [a.attrs['href'] for a in xml_elements]
    return xmls


def handle_xml(top_xml_url):
    r = requests.get(top_xml_url, headers=request_headers)
    soup = BeautifulSoup(r.content, "xml")
    #print(soup.prettify())
    
def do_it():
    url = "http://learnenglish.britishcouncil.org/en/english-grammar/reflexive-pronouns"
    get_individual_page(url)

    top_xml = "https://gamedata.britishcouncil.org/d/MultipleChoice_Mjk3OQ==.xml"
    handle_xml(top_xml)
    

    all_answers = ["herself", "himself", "itself", "myself", "ourselves", "yourself", "yourselves"]


    Q = questions.MultipleSelectQuestion(id="dragon",
                                         question="it is dragon __",
                                         correct_answers=["himself"],
                                         all_answers=all_answers)
    return Q

def perseus_demo():
    raw_json = '''{
        "question": {
            "content": "[[☃ matcher 1]]\n\n",
            "images": {},
            "widgets": {
                "matcher 1": {
                    "type": "matcher",
                    "alignment": "default",
                    "static": false,
                    "graded": true,
                    "options": {
                        "left": [
                            "$x$",
                            "$y$",
                            "$z$"
                        ],
                        "right": [
                            "$1$",
                            "$2$",
                            "$3$"
                        ],
                        "labels": [
                            "test",
                            "label"
                        ],
                        "orderMatters": false,
                        "padding": true
                    },
                    "version": {
                        "major": 0,
                        "minor": 0
                    }
                }
            }
        },
        "answerArea": {
            "calculator": false,
            "chi2Table": false,
            "periodicTable": false,
            "tTable": false,
            "zTable": false
        },
        "itemDataVersion": {
            "major": 0,
            "minor": 1
        },
        "hints": []
    }    '''
    
    exercise_node2 = ExerciseNode(
        source_id='<another unique id>',
        title='An exercise containing a perseus question',
        author='LE content team',
        description='An example exercise with a Persus question',
        language=getlang('en').code,
        license=get_license(licenses.CC_BY, copyright_holder='Copyright holder name'),
        thumbnail=None,
        exercise_data={
            'mastery_model': exercises.M_OF_N,
            'm': 1,
            'n': 1,
            },
        questions=[
            PerseusQuestion(
                id='ex2bQ4',
                raw_data=raw_json,
                source_url='https://github.com/learningequality/sample-channels/blob/master/contentnodes/exercise/perseus_graph_question.json'
                ),
        ]
    )
    
    return exercise_node2

if __name__ == "__main__":
    print (do_it())









