
import os
import speech_recognition as sr
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from pydub import AudioSegment
from transformers import pipeline, AutoTokenizer

# Ensure NLTK resources are downloaded
nltk.download('punkt')
nltk.download('stopwords')

def convert_audio(input_file):
    try:
        sound = AudioSegment.from_mp3(input_file)
        output_file = "converted_file.wav"
        sound.export(output_file, format="wav")
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    return output_file

def transcribe_audio(file_path):
    recognizer = sr.Recognizer()
    with sr.AudioFile(file_path) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Google Speech Recognition could not understand audio"
        except sr.RequestError as e:
            return f"Could not request results from Google Speech Recognition service; {e}"

def convert_and_chunk_audio(input_file, output_folder="audio_chunks", chunk_length_ms=30000):
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    sound = AudioSegment.from_mp3(input_file)
    chunks = []
    for i in range(0, len(sound), chunk_length_ms):
        chunk = sound[i:i+chunk_length_ms]
        chunk_name = f"{output_folder}/chunk{i//chunk_length_ms}.wav"
        chunk.export(chunk_name, format="wav")
        chunks.append(chunk_name)
    return chunks

def analyze_sentiment(text):
    # Load the tokenizer and sentiment-analysis pipeline
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")
    
    # Models for sentiment analysis
    # Default model
    classifier = pipeline('sentiment-analysis', model="bert-base-uncased")
    # Model based from product reviews
    # classifier = pipeline('sentiment-analysis', model="nlptown/bert-base-multilingual-uncased-sentiment")
    # Model based on Twitter data
    # classifier = pipeline('sentiment-analysis', model="CardiffNLP/twitter-roberta-base-sentiment")
    # classifier = pipeline('sentiment-analysis', model="bert-base-uncased-finetuned-sst-2-english")


    # Tokenize the text into sentences
    sentences = sent_tokenize(text)
    
    sentiment_results = []
    for sentence in sentences:
        # Check if the length of the tokens does not exceed the maximum size
        tokens = tokenizer.tokenize(sentence)
        if len(tokens) > 510:
            tokens = tokens[:510]  # truncate tokens if they are too long
        # Convert tokens back to string
        sentence_text = tokenizer.convert_tokens_to_string(tokens)
        # Analyze sentiment of the sentence
        result = classifier(sentence_text)
        sentiment_results.extend(result)

    return sentiment_results

# Example usage:
# file_path = convert_audio('sample.mp3')
# transcribed_text = transcribe_audio(file_path)
# sentiment_analysis_results = analyze_sentiment(transcribed_text)
