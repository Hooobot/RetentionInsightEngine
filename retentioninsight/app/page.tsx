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

const Home: NextPage = () => {
  // State to hold uploaded files and submission status
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Handler for file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
    setIsSubmitted(false); // Reset submission state
  }, []);

  // Handle file submission
  const handleSubmit = () => {
    // Implement your submission logic here
    console.log("Processing files:", files);
    console.log(files[0]);
    uploadData(files[0]);
    setIsSubmitted(true);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "audio/mp3": [".mp3"],
      "video/mp4": [".mp4"],
    },
  });

  //used to check GET endpoints to Flask backend server
  function fetchData() {
    fetch('http://localhost:5000/api/download-and-convert')
      .then(response => response.json())
      .then(data => console.log(data));
  }

  //template function to run python conversion and summarization scripts in the backend
  function uploadData(data: File) {
    console.log('in here')

    const formData = new FormData();
    formData.append('file', data);

    fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData
    })
    .then(response => response.json() )
    .then(data => console.log(data));
  }

  useEffect(() => {
    //run the GET function to confirm connection from Client-side
    fetchData();
}, []);

  return (
    <div className={styles.container}>
      <Head>
        <title>Retention Insight Engine</title>
      </Head>
      <main className={styles.main}>
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
                  {file.name} - {(file.size * (10**-6)).toFixed(2)} MB
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
          <div className={styles.summary}>
            <h2>Processing Summary</h2>
            {/* Display processing results here */}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;
