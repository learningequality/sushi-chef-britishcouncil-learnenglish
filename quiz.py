# types of quiz 

import indiv
import django

gap_fill_game_url = "http://learnenglish.britishcouncil.org/en/quick-grammar/adjectives-prepositions"
gap_fill_game_xml_url = indiv.get_individual_page(gap_fill_game_url)[0]
gap_fill_game_soup = indiv.handle_xml(gap_fill_game_xml_url)

"""
key elements:
dropdown: [[☃ dropdown 1]] # pick one from many in dropdown
text-box: [[☃ numeric-input 1]] # number only?
sorter: [[☃ sorter 1]]  sort A, C, B
orderer:  [[☃ orderer 2]] # as sorter but w/red herrings: sort A, C, 2, B
Two Column Matcher: [[☃ matcher 1]] A->1, B->3, C->2
Video: [[☃ video 1]] -- if it works!
"""

class Quiz(dict):
    def apply_template(template):
        _template = django.template.Engine().from_string(template)
        _context = django.template.Content(self)
        return _template.render(_context)
        
    #def __repr__(self):
    #    d = {}
    #    for i in ['title', 'tag', 'instructions', 'question_triplets']:
    #        d[i] = getattr(self, i)
    #    return repr(d)
    
def create_quiz(soup):
    q = Quiz()
    q['title'] = soup.find("GameTitle").text
    q['tag'] = list(soup.children)[0].name
    # Clues
    q['instructions'] = soup.find("Instructions").text
    # EndingText
    # Description = qgrammar
    # ExternalIntroduction/Text
    # Introduction/Text
    # DisplayOption = One Question Per Page
    # ShowQuestionNo = false
    # GapFillQuestionItems .....
    
    # ... GapFillQuestionItem/Prefix, /Answer, /Suffix -> text
    gap_fill_questions = soup.find_all("GapFillQuestionItem")
    q['question_triplets'] = []
    for question in gap_fill_questions:
        q['question_triplets'].append([question.find("Prefix").text,
                                       question.find("Answer").text,
                                       question.find("Suffix").text])
      
    return q



print (gap_fill_game_soup.prettify())
quiz = create_quiz(gap_fill_game_soup))

print (quiz)
print quiz.apply_template(gap_fill_template)

