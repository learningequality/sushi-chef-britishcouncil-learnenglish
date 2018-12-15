#!/usr/bin/env python
import os
import sys
sys.path.append(os.getcwd()) # Handle relative imports
import logging
import index
import indiv
import localise
import add_file
import hashlib

from ricecooker.chefs import SushiChef

#import quiz
from le_utils.constants import licenses
from ricecooker.classes.nodes import DocumentNode, VideoNode, TopicNode, HTML5AppNode
from ricecooker.classes.files import HTMLZipFile, VideoFile, SubtitleFile, DownloadFile
add_file.metadata = {"license": licenses.CC_BY_NC_ND,
                     "copyright_holder": "British Council"}

LOGGER = logging.getLogger()

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
            for i in range(1,len(topic_tree)+1):
                partial_tree = topic_tree[:i]
                parent = partial_tree[:-1] or None
                leaf = partial_tree[-1]
                if partial_tree not in cats:
                    cats[partial_tree] = TopicNode(source_id=sha1(repr(partial_tree)),
                                                   title=leaf,
                                                   description="")
                    if parent:
                        cats[parent].add_child(cats[partial_tree])
                    else:
                        channel.add_child(cats[partial_tree])
            return cats[topic_tree]

        #node = quiz.do_it()

        for i, link in enumerate(index.all_entries()):
        #for i, link in enumerate(sample_data):
            print (link)
            #if i>3: break # quit early -- TODO
            # page title, url, description
            try:
                soup, metadata = indiv.individual(link)
            except:
                print ("link: ", link)
                raise
            cat_node = build_structure(metadata.crumb)
            zip_file = localise.make_local(soup, link)
            print (zip_file)
            node = add_file.create_node(filename=zip_file,
                                        file_class=HTMLZipFile,
                                        title = metadata.title,
                                        description = metadata.desc
                                        )
            cat_node.add_child(node)


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
