// Start with client-side rendering
"use client";

// Import necessary hooks and components
import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "./styles/Home.module.css";
import logo from "../public/RIE_Logo.png";
import LoadingSpinner from "../components/ui/Loading/LoadingSpinner";

const Home: NextPage = () => {
  // State to hold uploaded files and submission status
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [processed, setProcessed] = useState(true);
  const [sentimentData, setSentimentData] = useState([]);

  const [sort, setSort] = useState<Array<Array<any>>>([]);

  // Handler for file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setIsSubmitted(false); // Reset submission state
  }, []);

  // Handle file submission
  const handleSubmit = () => {
    // Implement your submission logic here
    setProcessed(false);
    // Pass the array of files instead of a single file
    processData(files);
    // fetchData(files[0]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mp3": [".mp3"],
      "audio/m4a": [".m4a"],
      "video/mp4": [".mp4"],
      "text/plain": [".txt"],
    },
  });

  //used to check GET endpoints to Flask backend server
  function fetchData(file: File) {
    console.log("processData called");

    const formData = new FormData();
    formData.append("file", file);

    fetch("http://localhost:5000/api/check", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => console.log(data));
  }

  //function to run python conversion and summarization scripts in the backend
  function processData(files: File[]) {
    console.log("processData called");
    const formData = new FormData();
    files.forEach((file) => formData.append("file", file)); // Append each file to form data

    fetch("http://localhost:5000/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Data received:", data);

        // Check the number of files processed
        if (files.length === 1) {
          if (!Array.isArray(data)) {
            data = [data]; // Now 'data' is an array with a single object
          }
          // Set the state with the processed array
          setSentimentData(data);
          setIsSubmitted(true);
          setProcessed(true);
          getTranscription(files[0].name);
        } else {
          // Redirect to the dashboard for multiple files WITHOUT router
          window.location.href = "/dashboard";
        }
      })
      .catch((error) => {
        console.error("Error processing files:", error);
        setProcessed(true); // Stop showing the loading spinner on error
      });
  }

  function getTranscription(filename: string) {
    let transcript = "";
    let newFileName = filename.replace(/ /g, "_");
    newFileName = newFileName.replace(/\.[^/.]+$/, "");
    newFileName = newFileName.replace(/[()]/g, "");
    fetch(`http://localhost:5000/api/transcriptions/${newFileName}.txt`)
      .then((response) => response.text())
      .then((text) => setTranscription(text));
  }

  function getWordCloud(filename: string) {
    let newFileName = filename.replace(/ /g, "_");
    newFileName = newFileName.replace(/(\.[^/.]+)$/, "");
    newFileName = newFileName.replace(/[()]/g, "");
    return `http://localhost:5000/api/word-clouds/${newFileName}wordcloud.png`;
  }

  function getEntityExtractions(filename: string) {
    let newFileName = filename.replace(/\.[^/.]+$/, "");
    fetch(
      `http://localhost:5000/api/entity-extractions/${newFileName}entityextractions.txt`
    )
      .then((response) => response.json())
      .then((data) => console.log(data));
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Retention Insight Engine</title>
      </Head>
      <main className={styles.main}>
        {!processed && !isSubmitted && <LoadingSpinner />}
        <Image src={logo} alt="Retention Insight Engine" />
        <h1 className={styles.title}>Retention Insight Engine</h1>
        <div
          {...getRootProps()}
          className={isDragActive ? styles.dragActive : styles.uploadContainer}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>
              Drag and drop your MP3 or MP4 files here, or click to browse and
              select files.
            </p>
          )}
        </div>
        {files.length > 0 && (
          <aside>
            <br />
            <h4>Files ready for processing:</h4>
            <ul>
              {files.map((file) => (
                <li key={file.name}>
                  {file.name} - {(file.size * 10 ** -6).toFixed(2)} MB
                </li>
              ))}
            </ul>
            <button
              className={styles.submitButton}
              onClick={handleSubmit}
              disabled={files.length === 0}
            >
              Submit for Processing
            </button>
          </aside>
        )}
        {isSubmitted && (
          <div>
            <div className={styles.summary}>
              <h2 className={styles.description}>Transcription</h2>
              <p>{transcription}</p>
            </div>

            <div className={styles.summary}>
              <h1 className={styles.description}>Sentiment Analysis</h1>
              {isSubmitted &&
                Array.isArray(sentimentData) &&
                sentimentData.map((fileData, fileIndex) => (
                  <div key={fileIndex}>
                    <h2 className={styles.description}>
                      {(fileData as { filename: string }).filename}
                    </h2>
                    {((fileData as { sentiments: any[] }).sentiments || []).map(
                      (item, index) => (
                        <div key={index} className={styles.summary}>
                          <p className={styles.description}>
                            Sentence: {item.sentence}
                          </p>
                          <p className={styles.description}>
                            Sentiment: {item.sentiment}
                          </p>
                          <p className={styles.description}>
                            Score:{" "}
                            {typeof item.score === "number"
                              ? item.score.toFixed(2)
                              : "N/A"}
                          </p>
                        </div>
                      )
                    )}
                  </div>
                ))}
            </div>

            <div className={styles.summary}>
              <h2 className={styles.description}>Word Cloud</h2>
              {/* Using <img> as a workaround to Next.js port fetching */}
              <img
                src={getWordCloud(files[0].name)}
                alt={`${files[0].name}-word-cloud`}
                style={{ width: "40%", height: "auto" }}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
