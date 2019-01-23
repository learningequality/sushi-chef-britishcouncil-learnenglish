import youtube_dl
import re
import glob

class MyLogger(object):
    def debug(self, msg):
        pass

    def warning(self, msg):
        pass

    def error(self, msg):
        print(msg)

youtube_directory = "downloads"
youtube_status = None

def my_hook(d):
    global youtube_status
    #if d['status'] == 'finished':
    #    print('Done downloading, now converting ...')
    youtube_status = d


ydl_opts = {
#    'format': 'bestaudio/best',
    'format': 'best[height<=480]',
#    'postprocessors': [{
#        'key': 'FFmpegExtractAudio',
#        'preferredcodec': 'mp3',
#        'preferredquality': '192',
#    }],
    'logger': MyLogger(),
    'nooverwrites': True,
    'progress_hooks': [my_hook],
    'outtmpl': youtube_directory+"/%(id)s.%(ext)s"
}

def get_id(url):
    try:
       _id, = re.search(".*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*", url).groups()
    except Exception:
       return url
    return _id

def download_if_new(url):
    if "user" in url:
        with open(youtube_directory + "/fake", "w") as f:
            f.write()
        return youtube_directory + "/fake"
    _id = get_id(url)
    files = glob.glob(youtube_directory + "/" + _id + ".*")
    if not files:
        return download(url)
    else:
        print ("Using cached " + files[0])
        return files[0]

def download(url):
    if "user" in url:
        return None
    print ("URL:", url, "does not contain user")
    with youtube_dl.YoutubeDL(ydl_opts) as ydl:
        try:
            ydl.download([url])
        except Exception as e:
            print (e)
            return None
        print ("Downloaded " + youtube_status['filename'])
        return youtube_status['filename']

if __name__ == "__main__":
    download_if_new("http://www.youtube.com/embed/k4xkj8O7-dE?wmode=opaque&modestbranding=1&rel=0")
