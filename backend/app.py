from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import yt_video_to_mp3  # Assumes this script handles YouTube downloading and MP3 conversion
import report_summarization_script  # Assumes this script handles audio processing and sentiment analysis
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes (adjust in production)

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), '../backend/file-uploads')
ALLOWED_EXTENSIONS = {'mp4', 'mp3'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000  # 16 MB limit

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/upload', methods=['POST'])
def upload_file():
    # Check if the post request has the file part
    if 'file' not in request.files:
        return jsonify(error='No file part'), 400
    file = request.files['file']

    # If user does not select file, browser also submits an empty part without filename
    if file.filename == '':
        return jsonify(error='No selected file'), 400
    if file and allowed_file(file.filename):
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        filename = secure_filename(file.filename)
        try:
            file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
        except Exception as e:
            app.logger.error(f'Failed to save file: {str(e)}')
            return jsonify(error='Failed to save file'), 500
        return jsonify(message=f'File {filename} uploaded successfully'), 200
    else:
        return jsonify(error='File type not allowed'), 400

@app.route('/', methods=['GET'])
def app_check():
    if request.method == 'GET':
        return jsonify({'message': 'Retention Insight Engine Backend Server'})
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
@cross_origin()
def process_audio():
    if request.method == 'GET':
        return jsonify({'message': 'GET request received. Send a POST request with an audio file path to process.'})
    elif request.method == 'POST':
        audio_file = request.files['file']
        # return jsonify({'message': 'we were here'})
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
