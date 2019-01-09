#!/usr/bin/env python
import re
import os
import sys
sys.path.append(os.getcwd()) # Handle relative imports
import logging
import index
import indiv
import localise
import add_file
import hashlib
import enggrammar
import kidsindex
from ricecooker.chefs import SushiChef

#import quiz
from ricecooker.classes.licenses import SpecialPermissionsLicense
from ricecooker.classes.nodes import DocumentNode, VideoNode, TopicNode, HTML5AppNode
from ricecooker.classes.files import HTMLZipFile, VideoFile, SubtitleFile, DownloadFile
import ricecooker.classes.nodes
add_file.metadata = {"license": SpecialPermissionsLicense("British Council", "Special permission for distribution via Kolibri platform"),
                     "copyright_holder": "British Council"}

LOGGER = logging.getLogger()

def _add_child(self, node):
        """ add_child: Adds child node to node
            Args: node to add as child
            Returns: None
        """
        assert isinstance(node, Node), "Child node must be a subclass of Node"
        node.parent = self
        source_ids = [c.source_id for c in self.children]
        if node.source_id not in source_ids:
            self.children += [node]

ricecooker.classes.nodes.add_child = _add_child


def sha1(x):
    return hashlib.sha1(x.encode('utf-8')).hexdigest()

class BritishCouncilChef(SushiChef):
    channel_info = {
        'CHANNEL_SOURCE_DOMAIN': 'learnenglish.britishcouncil.org', # who is providing the content (e.g. learningequality.org)
        'CHANNEL_SOURCE_ID': 'learnenglish',         # channel's unique id
        'CHANNEL_TITLE': 'LearnEnglish',
        'CHANNEL_LANGUAGE': 'en',                          # Use language codes from le_utils
        # 'CHANNEL_THUMBNAIL': 'https://im.openupresources.org/assets/im-logo.svg', # (optional) local path or url to image file
        'CHANNEL_DESCRIPTION': "If you want to learn English, you've come to the right place! We have hundreds of high-quality resources to help improve your English.",  # (optional) description of the channel (optional)
    }

    def construct_channel(self, **kwargs):
        cats = {}
        channel = self.get_channel(**kwargs)

        def build_structure(topic_tree):
            topic_tree = tuple(topic_tree)
            assert topic_tree[0] == "Home"
            topic_tree = topic_tree[1:]  # remove Home
            for i in range(1,len(topic_tree)+1):
                partial_tree = topic_tree[:i]
                parent = partial_tree[:-1] or None
                leaf = partial_tree[-1]
                if partial_tree not in cats:
                    print ("Partial tree not in cats")
                    cats[partial_tree] = TopicNode(source_id=sha1(repr(partial_tree)),
                                                   title=leaf,
                                                   description="")
                    if parent:
                        # check node not in parent
                        cats[parent].add_child(cats[partial_tree])
                    else:
                        channel.add_child(cats[partial_tree])
                        print("ADD TO CHANNEL")
            return cats[topic_tree]

        #node = quiz.do_it()
        idlookup = {}
        
        for title, zip_file in enggrammar.index():
            break # TODO
            cat_node = build_structure(["Home", "Grammar", "English Grammar"])
            node = add_file.create_node(filename=zip_file,
                                        file_class=HTMLZipFile,
                                        title = title.text,
                                        description = ""
                                        )
            cat_node.add_child(node)

        ## normal
        # for i, link in enumerate(index.all_entries()):

        ## sample
        # for i, link in enumerate(sample_data):

        ## kids
        for i, link in enumerate(kidsindex.all_entries()):
            if i>3: break # quit early -- TODO
            try:
                soup, metadata = indiv.individual(link)
                
            except:
                print ("link: ", link)
                raise
            if metadata is None:
                continue
            cat_node = build_structure(metadata.crumb)
            zip_file = localise.make_local(soup, link)
            print (zip_file)
            if zip_file in idlookup:
                print ("***SKIP***", idlookup[zip_file])
            else:
                idlookup[zip_file] = link

                ## SPECIAL HANDLING FOR PODCAST SERIES -- NESTED LEVELS
                match = re.search("(Series \d\d) (Episode \d\d)", metadata.title)
                if match:
                    metadata.crumb.append(match.group(1))
                    cat_node = build_structure(metadata.crumb)
                    metadata.title = match.group(2)

                ## SPECIAL HANDLING FOR WORD ON THE STREET -- DROP DIRECT LEAVES
                if metadata.crumb[-1] == "Word on the Street":
                    continue
              
                node = add_file.create_node(filename=zip_file,
                                            file_class=HTMLZipFile,
                                            title = metadata.title,
                                            description = metadata.desc
                                            )
                cat_node.add_child(node)

        def show_node(node):
            for child in node.children:
                print (repr(child))

        show_node(channel)
        return channel

if __name__ == '__main__':
    sample_data = ["https://learnenglish.britishcouncil.org/en/learnenglish-podcasts/series-03-episode-02", # podcast
                   "https://learnenglish.britishcouncil.org/en/starting-out/episode-02-toms-party", # video
                   "https://learnenglish.britishcouncil.org/en/intermediate-vocabulary/appearance-2", # quiz
                   "https://learnenglish.britishcouncil.org/en/articles/philosophy", # pdf
                   ]

    """
    Set the environment var `CONTENT_CURATION_TOKEN` (or `KOLIBRI_STUDIO_TOKEN`)
    to your Kolibri Studio token, then call this script using:
        python souschef.py  -v --reset
    """
    mychef = BritishCouncilChef()
    if 'KOLIBRI_STUDIO_TOKEN' in os.environ:
        os.environ['CONTENT_CURATION_TOKEN'] = os.environ['KOLIBRI_STUDIO_TOKEN']
    mychef.main()
