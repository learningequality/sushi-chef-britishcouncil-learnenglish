# types of quiz 

import indiv
import copy

from django.template.engine import Engine
from django.template.context import Context
from collections import OrderedDict

from ricecooker.classes import questions
from ricecooker.classes.nodes import ExerciseNode
from ricecooker.classes.licenses import get_license
from le_utils.constants import licenses, exercises
from le_utils.constants.languages import getlang
from ricecooker.classes.questions import PerseusQuestion

gap_fill_game_url = "http://learnenglish.britishcouncil.org/en/quick-grammar/adjectives-prepositions"
gap_fill_game_xml_url = indiv.get_individual_page(gap_fill_game_url)[0]
gap_fill_game_soup = indiv.handle_xml(gap_fill_game_xml_url)

multiple_choice_game_url = "http://learnenglish.britishcouncil.org/en/english-grammar/past-tense"
multiple_choice_game_xml_url = indiv.get_individual_page(multiple_choice_game_url)[0]
multiple_choice_game_soup = indiv.handle_xml(multiple_choice_game_xml_url)

__unique_id = 0
def unique_id():
    global __unique_id
    __unique_id += 1
    return "quiz:" + str(__unique_id)

templates = {}

with open("templates/multiple_choice_game.template") as f:
    templates['MultipleChoiceGame'] = f.read()

"""
key elements:
dropdown: [[☃ dropdown 1]] # pick one from many in dropdown
text-box: [[☃ numeric-input 1]] # number only?
sorter: [[☃ sorter 1]]  sort A, C, B
orderer:  [[☃ orderer 2]] # as sorter but w/red herrings: sort A, C, 2, B
Two Column Matcher: [[☃ matcher 1]] A->1, B->3, C->2
Video: [[☃ video 1]] -- if it works!
"""

class Quiz(object):
    def __init__(self):
        self.questions = []
        
    def from_soup(self, soup):
        assert not self.questions
        self.tag = list(soup.children)[0].name
        self.title = soup.find("GameTitle").text
        self.instructions = soup.find("Instructions").text
        q = Question(self)
        q['title'] = self.title
        # Clues
        q['instructions'] = self.instructions
        # EndingText
        # Description = qgrammar
        # ExternalIntroduction/Text
        # Introduction/Text
        # DisplayOption = One Question Per Page
        # ShowQuestionNo = false
        # GapFillQuestionItems .....
        
        # ... GapFillQuestionItem/Prefix, /Answer, /Suffix -> text
        if self.tag == "GapFillGame":  # WRONG
            gap_fill_questions = soup.find_all("GapFillQuestionItem")
            q['question_triplets'] = []
            for question in gap_fill_questions:
                q['question_triplets'].append([question.find("Prefix").text,
                                               question.find("Answer").text,
                                               question.find("Suffix").text])
                
        if self.tag == "MultipleChoiceGame":
            multiple_choice_options = soup.find_all("Option")
            q['global_options'] = OrderedDict()
            for tag in multiple_choice_options:
                q['global_options'][str(tag.attrs['value'])] = tag.text.strip()
        
            questions = [x.text.strip() for x in soup.find_all("Question")]
            answer_numbers = [x.text.strip() for x in soup.find_all("Answer")]
            assert len(questions) == len(answer_numbers)
            
            for question, answer_number in zip(questions, answer_numbers):
                q['question'] = question
                answers = q['global_options'].values()
                hints = [""] * len(answers)
                correct = [str(x == answer_number).lower() for x in q['global_options']]
                # hint = []
                # correct = the one we're considering matching answer_number
                q['triplets'] = zip(answers, hints, correct)
                self.questions.append(copy.deepcopy(q))
        
        return self
    
    def as_node(self):
        return ExerciseNode(
            source_id=unique_id(),
            title=self.title,
            author='British Council',
            description=self.instructions,
            language=getlang('en').code,
            license=get_license(licenses.CC_BY_NC_ND, copyright_holder='British Council'),
            #thumbnail=None,
            #exercise_data={
            #    'mastery_model': exercises.M_OF_N,
            #    'm': 1,
            #    'n': 1,
            #    },
            questions=[q.as_perseus() for q in self.questions]
        )        

class Question(dict):
    def __init__(self, quiz, template="", url=""):
        self.template = templates[quiz.tag]
        self.url = url
        self.quiz = quiz
    
    def apply_template(self, template):
        _template = Engine().from_string(template)
        _context = Context(self)
        return _template.render(_context)
    
    def as_perseus(self):
        return PerseusQuestion(
                id=unique_id(),
                raw_data=self.apply_template(self.template),
                source_url=self.url
                )

#print (multiple_choice_game_soup.prettify())
quiz = Quiz().from_soup(multiple_choice_game_soup)
for question in quiz.questions:
    print (question.apply_template(templates['MultipleChoiceGame']))
    
print (quiz.as_node())

