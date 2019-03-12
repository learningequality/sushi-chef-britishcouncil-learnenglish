import zipfile
import lxml.html
import magic
import add_file
import os

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
""".strip().split("\n")

WANTED_LIST = """
video/
application/pdf
""".strip().split("\n")

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
        if ignore:
            return None
        assert wanted, mime
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
            if _class and "field-name-field-transcript" in _class:
                nodes.append(self. make_transcript(element))
        return [x for x in nodes if x is not None]

    def __del__(self):
        self.my_zip.close()
        
nodes = ZipHandler(sample_filename).get_nodes()
print (nodes)
