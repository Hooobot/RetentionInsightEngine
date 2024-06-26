from flask import Flask, request, jsonify, send_from_directory, Response
from flask_cors import CORS, cross_origin
from werkzeug.utils import secure_filename
import yt_video_to_mp3  # Assumes this script handles YouTube downloading and MP3 conversion
import report_summarization_script  # Assumes this script handles audio processing and sentiment analysis
import os
import array
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains on all routes (adjust in production)

CORS(app, resources={
  r"/api/word-clouds/*": {"origins": "http://localhost:3000"}
})

# OR to allow all origins (use only for development)
CORS(app, resources={
  r"/api/word-clouds/*": {"origins": "*"}
})

# Configuration
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'file-uploads')
IMAGE_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'word-clouds')
EXTRACTION_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'entity-extractions')
TRANSCRIPTION_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'transcriptions')
SENTIMENTS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'sentiments')
ALLOWED_EXTENSIONS = {'mp4', 'mp3', 'm4a', 'txt'}

TRANSCRIPTION_NAMES = []

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1000 * 1000  # 16 MB limit

def allowed_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/check', methods=['GET'])
def check():
    if request.method == 'GET':
        return jsonify({'message': report_summarization_script.check()}),200
@app.route('/api/word-clouds/<filename>', methods=['GET'])
def get_image(filename):
    # Ensure the file exists and is a PNG file to prevent directory traversal attacks
    if not filename.endswith('.png'):
        return jsonify({'error': 'does not exist'}), 404

    # Complete file path
    file_path = os.path.join(IMAGE_FOLDER, filename)
    # Check if file exists
    if not os.path.isfile(file_path):
        return jsonify({'error': 'does not exist'}), 500

    # Serve the file from the specified folder
    return send_from_directory(IMAGE_FOLDER, filename)

@app.route('/api/entity-extractions/<filename>', methods=['GET'])
def get_extraction(filename):
    # Complete file path
    file_path = os.path.join(EXTRACTION_FOLDER, filename)

    # Check if file exists
    if not os.path.isfile(file_path):
        return jsonify({'error': 'does not exist'}), 404
    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            return Response(content, mimetype='text/plain')
    except Exception as e:
        return str(e), 500

@app.route('/api/transcriptions/<filename>', methods=['GET'])
def get_transcription(filename):
    # Complete file path
    file_path = os.path.join(TRANSCRIPTION_FOLDER, filename)
    # Check if file exists
    if not os.path.isfile(file_path):
        return jsonify({'error': 'does not exist'}), 404

    try:
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
            return Response(content, mimetype='text/plain')
    except Exception as e:
        return str(e), 500

@app.route('/api/sentiments/<filename>')
def get_saved_sentiments(filename):
    # Complete file path
    file_path = os.path.join(SENTIMENTS_FOLDER, filename)

    # Check if file exists
    if not os.path.isfile(file_path):
        return jsonify({'error': 'does not exist'}), 404

    try:
        with open(file_path, 'r') as json_file:
            sentiments = json.load(json_file)
        return jsonify(sentiments), 200
    except FileNotFoundError:
        return jsonify(error='Sentiments for the specified file not found'), 404

@app.route('/api/upload', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'GET':
        return jsonify({'file_names': TRANSCRIPTION_NAMES}), 200
    elif request.method == 'POST':
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        files = request.files.getlist('file')
        if not files:
            return jsonify(error='No files part'), 400

        response_data = []

        for file in files:
            if file.filename == '':
                continue  # Skip empty files
            if not allowed_file(file.filename):
                continue  # Skip files with disallowed extensions

            filename = secure_filename(file.filename)
            file_extension = os.path.splitext(filename)[1]
            filepath = os.path.join(TRANSCRIPTION_FOLDER if file_extension == '.txt' else UPLOAD_FOLDER, filename)
            try:
                file.save(filepath)
                # Process file based on type
                if file_extension != '.txt':
                    converted_file = report_summarization_script.convert_and_chunk_audio(filepath)
                    transcribed_text = report_summarization_script.parallel_transcribe_audio(converted_file)
                    punctuated_text = report_summarization_script.add_punctuations(transcribed_text, filename)
                    sentiment_results = report_summarization_script.analyze_sentiment(punctuated_text)
                    report_summarization_script.generate_word_cloud(punctuated_text, filename)
                else:
                    transcript = report_summarization_script.read_text_file(filepath)
                    sentiment_results = report_summarization_script.analyze_sentiment(transcript)
                    report_summarization_script.generate_word_cloud(transcript, filename)

                json_output = report_summarization_script.generate_sentiment_json(sentiment_results)
                report_summarization_script.save_sentiments_to_json(json_output, os.path.splitext(filename)[0])
                response_data.append({'filename': filename, 'sentiments': json_output})

                if filename not in TRANSCRIPTION_NAMES:
                    TRANSCRIPTION_NAMES.append(os.path.splitext(filename)[0])

            except Exception as e:
                return jsonify({'error': str(e)}), 500

        return jsonify(response_data), 200



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
