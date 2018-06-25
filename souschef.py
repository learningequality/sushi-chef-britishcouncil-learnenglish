#!/usr/bin/env python
import os
import sys
sys.path.append(os.getcwd()) # Handle relative imports
import logging

from ricecooker.chefs import SushiChef


import quiz
#import requests
#from le_utils.constants import licenses
from ricecooker.classes.nodes import DocumentNode, VideoNode, TopicNode, 
from ricecooker.classes.files import HTMLZipFile, VideoFile, SubtitleFile, DownloadFile
#import json 
#from collections import OrderedDict
#from index_lessons import crawl_lesson_index
#from urllib.parse import urljoin
#from single_lesson import get_lesson
#import add_file
#from bs4 import BeautifulSoup
#import localise
#add_file.metadata = {"license": licenses.CC_BY_NC_ND,
#                     "copyright_holder": "ArtsEdge"}

#raw_lessons = crawl_lesson_index()
#lessons = OrderedDict([('Elementary', [x for x in raw_lessons if x.grade == "K-4"]),
#                       ('Middle',     [x for x in raw_lessons if x.grade == "5-8"]),
#                       ('High',       [x for x in raw_lessons if x.grade == "9-12"])])

LOGGER = logging.getLogger()


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
        channel = self.get_channel(**kwargs)
        #node = quiz.do_it()
        node = 
        channel.add_child(node)
        return channel
    
if __name__ == '__main__':
    """
    Set the environment var `CONTENT_CURATION_TOKEN` (or `KOLIBRI_STUDIO_TOKEN`)
    to your Kolibri Studio token, then call this script using:
        python souschef.py  -v --reset
    """
    mychef = BritishCouncilChef()
    if 'KOLIBRI_STUDIO_TOKEN' in os.environ:
        os.environ['CONTENT_CURATION_TOKEN'] = os.environ['KOLIBRI_STUDIO_TOKEN']
    mychef.main()    
