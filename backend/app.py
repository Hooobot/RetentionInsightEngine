from flask import Flask, request, jsonify
from flask_cors import CORS
import yt_video_to_mp3  # Assumes this script handles YouTube downloading and MP3 conversion
import report_summarization_script  # Assumes this script handles audio processing and sentiment analysis

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes (adjust in production)

@app.route('/api/download-and-convert', methods=['POST', 'GET'])
def download_and_convert():
    if request.method == 'GET':
        return jsonify({'message': 'GET request received. Send a POST request with a YouTube URL to download and convert to MP3.'})
    elif request.method == 'POST':
        youtube_url = request.json.get('youtube_url')
        if not youtube_url:
            return jsonify({'error': 'No YouTube URL provided'}), 400
        try:
            yt_video_to_mp3.download_video_and_convert_to_mp3(youtube_url)
            return jsonify({'message': 'Download and conversion successful'}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

@app.route('/api/process-audio', methods=['POST', 'GET'])
def process_audio():
    if request.method == 'GET':
        return jsonify({'message': 'GET request received. Send a POST request with an audio file path to process.'})
    elif request.method == 'POST':
        audio_file = request.json.get('audio_file')
        if not audio_file:
            return jsonify({'error': 'No audio file provided'}), 400
        try:
            converted_file = report_summarization_script.convert_audio(audio_file)
            transcribed_text = report_summarization_script.transcribe_audio(converted_file)
            sentiment_results = report_summarization_script.analyze_sentiment(transcribed_text)
            return jsonify({'sentiments': sentiment_results}), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
