
import os
import speech_recognition as sr
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from pydub import AudioSegment
from transformers import pipeline, AutoTokenizer, AutoModelForTokenClassification
from concurrent.futures import ThreadPoolExecutor, as_completed
from wordcloud import WordCloud
import argparse
from deepmultilingualpunctuation import PunctuationModel
# from google.cloud import speech

# Ensure NLTK resources are downloaded
nltk.download('punkt')
nltk.download('stopwords')

def add_punctuations(text_file, filename):
    # Load the punctuation model, for example, a fine-tuned BERT model
    # punctuator = pipeline("text-generation", model="bert-base-uncased-punctuation")
    model = PunctuationModel()

    # Generate punctuated text
    result = model.restore_punctuation(text_file)

    output_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'transcriptions')
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)

    with open(output_folder + '/' + os.path.splitext(filename)[0] + 'transcription.txt', 'w') as file:
        file.write(str(result))

    return str(result)

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

def parallel_transcribe_audio(chunks):
    transcriptions = []
    workers = os.cpu_count() * 5;
    with ThreadPoolExecutor(max_workers = workers) as executor:
        future_to_chunk = {executor.submit(transcribe_audio, chunk): chunk for chunk in chunks}
        for future in as_completed(future_to_chunk):
            chunk = future_to_chunk[future]
            try:
                transcription = future.result()
                transcriptions.append(transcription)
            except Exception as exc:
                print(f'Chunk {chunk} generated an exception: {exc}')
    return " ".join(transcriptions)

def analyze_sentiment(text):
    # Load the tokenizer and sentiment-analysis pipeline
    tokenizer = AutoTokenizer.from_pretrained("bert-base-uncased")

    # Models for sentiment analysis
    # Default model
    # classifier = pipeline('sentiment-analysis', model="bert-base-uncased")
    # Model based from product reviews
    # classifier = pipeline('sentiment-analysis', model="nlptown/bert-base-multilingual-uncased-sentiment")
    # Model based on Twitter data
    classifier = pipeline('sentiment-analysis', model="CardiffNLP/twitter-roberta-base-sentiment")
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
        # Pair each sentence with its result
        sentiment_results.append((sentence, result[0]))

    return sentiment_results

def extract_entities(text, filename, keywords=["employee", "HR", "vacancies", "retention", "management"]):
    # Load the tokenizer and model for named entity recognition
    tokenizer = AutoTokenizer.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")
    model = AutoModelForTokenClassification.from_pretrained("dbmdz/bert-large-cased-finetuned-conll03-english")
    ner = pipeline("ner", model=model, tokenizer=tokenizer, aggregation_strategy="simple")

    # Tokenize the text into sentences
    sentences = sent_tokenize(text)


    # Collecting relevant entities
    relevant_entities = []
    for sentence in sentences:
        entities = ner(sentence)
        found_entities = {entity['word'].lower() for entity in entities}

        # Adding keyword matching
        for word in sentence.split():
            if word.lower() in keywords:
                found_entities.add(word.lower())

        if found_entities:
            relevant_entities.append((sentence, found_entities))

            output_folder = output_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'entity-extractions')
            if not os.path.exists(output_folder):
                os.makedirs(output_folder)

            with open(output_folder + '/' + os.path.splitext(filename)[0] + 'entityextraction.txt', 'w') as file:
                for sentence, entities in relevant_entities:
                    file.write(f"Sentence: {sentence}\nEntities: {', '.join(entities)}\n")

    return relevant_entities

def generate_word_cloud(text, filename):
    # Tokenize the text into words
    words = word_tokenize(text.lower())

    # Load stop words
    stop_words = set(stopwords.words('english'))

    # Additional common but irrelevant words could be filtered out
    additional_stopwords = {'may', 'also', 'many', 'must', 'can', 'much', 'every', 'would', 'could', 'today', 'felt', 'us'}
    stop_words.update(additional_stopwords)

    # Filter out stopwords
    filtered_words = [word for word in words if word not in stop_words and word.isalnum()]

    # Frequency distribution of words
    freq_dist = nltk.FreqDist(filtered_words)

    output_folder = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'word-clouds')
    if not os.path.exists(output_folder):
            os.makedirs(output_folder)

    wordcloud_name = os.path.splitext(filename)[0] + "wordcloud.png"
    output_path = os.path.join(output_folder, wordcloud_name)

    # Create word cloud
    wordcloud = WordCloud(width=800, height=400, background_color ='white').generate_from_frequencies(freq_dist)
    wordcloud.to_file(output_path)
    # Display the WordCloud
    # plt.figure(figsize=(10, 5))
    # plt.imshow(wordcloud, interpolation='bilinear')
    # plt.axis('off')
    # plt.show()

def sort_sentiment(sentiment_list):
    negative = []
    neutral = []
    positive = []

    for sentiment in sentiment_list:
        if sentiment[1]['label'] == 'LABEL_0':
            negative.append(sentiment)
        elif sentiment[1]['label'] == 'LABEL_1':
            neutral.append(sentiment)
        elif sentiment[1]['label'] == 'LABEL_2':
            positive.append(sentiment)

    sort_negative = sorted(negative, key=lambda p: p[1]['score'], reverse=True)
    sort_neutral = sorted(neutral, key=lambda p: p[1]['score'], reverse=True)
    sort_positive = sorted(positive, key=lambda p: p[1]['score'], reverse=True)
    return [sort_negative, sort_neutral, sort_positive]
