url = "https://api.viddler.com/api/v2/viddler.videos.getPlaybackDetails.json?video_id=d981adb4&include_comments=true&key=v0vhrt7bg2xq1vyxhkct"
headers = {"Referer": "https://learnenglish.britishcouncil.org"}

import requests
import json

raw_json = requests.get(url, headers=headers).text
j = json.loads(raw_json)['video']
#print (json.dumps(j, indent=2))
url = j['html5_video_source']
cdn_urls = [f['cdn_url'] for f in j['files'] if ".mp4?" in f['cdn_url']]

title  = j["title"]
desc = j['description']
print (url, cdn_urls, title, desc) # www.viddler.com/file/d981adb4/html5

