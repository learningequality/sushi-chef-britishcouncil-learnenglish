import shutil
import zipfile
import lxml.html
import magic
import add_file
import os
import quiz_zip
from ricecooker.classes.files import HTMLZipFile
from ricecooker.classes.licenses import SpecialPermissionsLicense

from zipfile import ZipFile
from io import BytesIO

sample_filename = "__downloads/3f5856786772d8726136a713530ee21ff2af9080.zip"
add_file.metadata = {"license": SpecialPermissionsLicense("British Council", "Special permission for distribution via Kolibri platform"),
                     "copyright_holder": "British Council"}

IGNORE_LIST = """
text/
image/
application/
""".strip().split("\n")

WANTED_LIST = """
video/
application/pdf
audio/
""".strip().split("\n")

EXCLUDE_LIST = """
video/webm
"""

try:
  os.rmdir("__mini")
except:
  pass

try:
  os.mkdir("__mini")
except:
  pass

__increment = 0
def counter():
    global __increment
    __increment = __increment + 1
    return str(__increment)
  


class ZipHandler(object):
    def __init__(self, filename):
        self.my_zip = ZipFile(filename, 'r')

    def consider_file(self, element, url):
        mime = magic.from_buffer(self.my_zip.open(url).read(1024), mime=True)
        ignore = any([mime.startswith(x) for x in IGNORE_LIST])
        wanted = any([mime.startswith(x) for x in WANTED_LIST])
        exclude = any([mime.startswith(x) for x in EXCLUDE_LIST])
        if exclude:
            return None
        if not wanted:
            assert ignore, mime
            return None
        with self.my_zip.open(url) as f:
           target = "__mini/" + counter()
           with open(target, "wb") as ff:
               ff.write(f.read())
        return add_file.create_node(filename = target,
                                    file_class = add_file.guess_type(content_type=mime),
                                    title = "TODO",
                                    #license = "Special Permissions",
                                    #copyright_holder = "TODO",
                                    description = "TODO",
                                   )
        
    def make_transcript(self, element):
        html = lxml.html.tostring(element)
        target = "__mini/" + counter()
        with ZipFile(target, 'w') as myzip:
            myzip.writestr("index.html", html)
        return add_file.create_node(filename = target,
                                    file_class = HTMLZipFile,
                                    title = "Transcript")

    def handle_quiz(self, html_filename):
        url = "http://gamedata.britishcouncil.org/d/" + html_filename.replace(".html", ".xml")
        quiz_zip.create_standalone_quiz(url)
        ## now zip up the directory called demo.zip/
        print ("FOUND {} FILES".format( len(os.listdir("demo.zip/") )))
        zipfile_name = shutil.make_archive("__mini/"+counter(), "zip", "demo.zip/")
        return add_file.create_node(filename = zipfile_name,
                                    file_class = HTMLZipFile,
                                    title = "Quiz") 

    def get_nodes(self):
        root = lxml.html.fromstring(self.my_zip.read("index.html"))
        nodes = []
        for element in root.getiterator():
            src = element.get("src")
            href = element.get("href")
            _class = element.get("class")
            try:
                if src:
                    nodes.append(self.consider_file(element, src))
                if href:
                    nodes.append(self.consider_file(element, href))
            except KeyError as e:
                assert "There is no item " in str(e)
            if src and element.tag == "iframe":
                nodes.append(self.handle_quiz(src))
            if _class and "field-name-field-transcript" in _class:
                nodes.append(self.make_transcript(element))
        return [x for x in nodes if x is not None]

    def __del__(self):
        self.my_zip.close()
        
if __name__ == "__main__":
    nodes = ZipHandler(sample_filename).get_nodes()
    print (nodes)
