"use client";
// Import necessary hooks and components
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "./styles/Home.module.css";
import logo from "./RIE_Logo.png";

const Home: NextPage = () => {
  // State to hold uploaded files
  const [files, setFiles] = useState<File[]>([]);

  // Handler for file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Do something with the files
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: [".mp3", ".mp4"],
  });

  return (
    <div className={styles.container}>
      <Head>
        <title>Retention Insight Engine</title>
        <meta name="description" content="Your go-to solution for insights" />
        <link rel="icon" href="/favicon.ico" />
        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <main className={styles.main}>
        <img src={logo.src} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Retention Insight Engine</h1>

        <div {...getRootProps()} className={styles.uploadContainer}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>

        {/* Lists uploaded file */}
        <aside>
          <br />
          <h4>Files</h4>
          <ul>
            {files.map((file) => (
              <li key={file.name}>
                {file.name} - {file.size} bytes
              </li>
            ))}
          </ul>
        </aside>
      </main>
    </div>
  );
};

export default Home;
