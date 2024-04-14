
import os
from yt_dlp import YoutubeDL

def download_video_and_convert_to_mp3(youtube_url, ffmpeg_path='/usr/bin/ffmpeg'):
    # Specify download options
    download_options = {
        'format': 'bestaudio/best',
        'extractaudio': True,  # Keeps only audio
        'audioformat': 'mp3',  # Converts to mp3
        'outtmpl': '%(title)s.%(ext)s',  # Saves file with the video title
        'noplaylist': True,  # Only download single video, not playlist
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],
        'ffmpeg_location': ffmpeg_path  # Use this if ffmpeg is not in PATH
    }

    # Download and convert the video
    with YoutubeDL(download_options) as ydl:
        ydl.download([youtube_url])

# Example usage (uncomment the following lines to use):
# youtube_url = 'https://www.youtube.com/watch?v=EcojyBV4QJ4'  # Replace URL with desired video
# download_video_and_convert_to_mp3(youtube_url)
