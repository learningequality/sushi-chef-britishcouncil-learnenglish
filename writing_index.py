import requests

datastr = """
view_name: glossary
view_display_id: block_1
view_args:
view_path: taxonomy/term/2386
view_base_path: en/glossary
view_dom_id: 6db7ce8bf29e60857a47a4b315e9e6fd
pager_element: 9
field_section_tid[2393]: 2393
field_section_tid[2554]: 2554
page: 0,0,0,0,0,0,0,0,0,3
"""

headers = """
User-Agent: Learning-Equality
"""

data = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in datastr.strip().split('\n')])
head = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in headers.strip().split('\n')])

print (head)

x = requests.post("http://learnenglish.britishcouncil.org/en/views/ajax", data=data, headers=head)
print (x.content)
