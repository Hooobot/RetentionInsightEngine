// Start with client-side rendering
"use client";

// Import necessary hooks and components
import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "./styles/Home.module.css";
import logo from "./RIE_Logo.png";

const Home: NextPage = () => {
  // State to hold uploaded files
  const [files, setFiles] = useState<File[]>([]);

  // Handler for file drops
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(acceptedFiles);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Directly specify file extensions
    accept: {
      "audio/mp3": [".mp3"],
      "video/mp4": [".mp4"],
    },
  });

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <Image src={logo} alt="Retention Insight Engine" />
        <h1 className={styles.title}>Retention Insight Engine</h1>

        <div {...getRootProps()} className={styles.uploadContainer}>
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </div>

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
