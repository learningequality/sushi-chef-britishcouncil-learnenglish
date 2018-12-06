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
ajax_page_state[jquery_version]: 1.10"""

headers = """Accept: application/json, text/javascript, */*; q=0.01
Accept-Encoding: gzip, deflate
Accept-Language: en-GB,en-US;q=0.9,en;q=0.8
Cache-Control: no-cache
Connection: keep-alive
Content-Length: 9842
Content-Type: application/x-www-form-urlencoded; charset=UTF-8
Cookie: has_js=1; learnenglish-britishcouncil-org-eu-cookie=1
DNT: 1
Host: learnenglish.britishcouncil.org
Origin: http://learnenglish.britishcouncil.org
Pragma: no-cache
Referer: http://learnenglish.britishcouncil.org/en/writing
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Ubuntu Chromium/70.0.3538.77 Chrome/70.0.3538.77 Safari/537.36
X-Requested-With: XMLHttpRequest"""

data = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in datastr.strip().split('\n')])
head = dict([[h.partition(': ')[0], h.partition(': ')[2]] for h in headers.strip().split('\n')])

print (head)

x = requests.post("http://learnenglish.britishcouncil.org/en/views/ajax", data=data, headers=head)
print (x.content)
