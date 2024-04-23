# Retention Insight Engine

## Objective

Retention Insight Engine (RIE) focuses on transcribing given audio data relating with performance reviews, exit interview, or one-on-one meetings to text data and processing the resulting text into data painpoints

## Running the Application

Ensure that you have [Python](https://www.python.org/downloads/) and [NodeJS](https://nodejs.org/en/download) installed.

### Run the Front-End Application
To install the dependencies for the front-end application, change directory to 'RetentionInsightEngine/retentioninsight' and run the following command:
```
npm run build
```

When the dependencies are finished installing, run the following command:
```
npm run start
```

### Run the Back-End Server
To install the dependencies for the backend server, change directory to 'RetentionInsightEngine/backend'.

Now use the following command to install [pipenv](https://pypi.org/project/pipenv/).
```
pip install pipenv
```

Pipenv is responsible for tracking the dependencies used by the backend server within the Pipefile and Pipefile.lock files. To install said dependencies, use the following command:
```
pipenv install
```

After the dependencies are installed, please run the following command to launch the backend server:
```
pipenv run python app.py
```

### Running using 'concurrently'
If you have all dependencies installed for both the backend and frontend, then you can use the following command:
```
npm run dev:all
```

This will run both the frontend and backend all at once. 
