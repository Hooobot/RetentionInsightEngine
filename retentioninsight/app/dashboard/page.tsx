"use client";

import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

interface SentimentItem {
  sentence: string;
  sentiment: string;
  score: number;
  color?: string; // Optional, if you want to use color for visual cues
}

interface Data {
  transcription: string;
  sentiment: SentimentItem[];
  wordCloudUrl: string;
}

const Dashboard: NextPage = () => {
  const [data, setData] = useState<Record<string, Data>>({});

  useEffect(() => {
    // Fetch file names and initialize data fetching for each file
    fetch("http://localhost:5000/api/upload")
      .then((response) => response.json())
      .then((data) => {
        data.file_names.forEach((fileName: string) => {
          fetchDataForFile(fileName);
        });
      });
  }, []);

  const fetchDataForFile = (fileName: string) => {
    const sanitizedFileName = sanitizeFileName(fileName);
    Promise.all([
      fetch(
        `http://localhost:5000/api/transcriptions/${sanitizedFileName}.txt`
      ).then((res) => res.text()),
      fetch(
        `http://localhost:5000/api/sentiments/${sanitizedFileName}_sentiments.json`
      ).then((res) => res.json()),
      fetch(
        `http://localhost:5000/api/word-clouds/${sanitizedFileName}wordcloud.png`
      ).then((res) => res.url),
    ]).then(([transcription, sentiment, wordCloudUrl]) => {
      setData((prev) => ({
        ...prev,
        [fileName]: { transcription, sentiment, wordCloudUrl },
      }));
    });
  };

  const sanitizeFileName = (fileName: string) => {
    return (
      fileName
        //   .replace(/ /g, "_")
        .replace(/\.[^/.]+$/, "")
        .replace(/[()]/g, "")
    );
  };

  return (
    <div>
      <Head>
        <title>Dashboard</title>
      </Head>
      <main className={styles.main}>
        {Object.keys(data).map((fileName) => (
          <div key={fileName} className={styles.summary}>
            <h1 className={styles.description}>{fileName}</h1>
            <div>
              <h2 className={styles.description}>Transcription</h2>
              <p>{data[fileName].transcription}</p>
            </div>
            <div>
              <h2 className={styles.description}>Sentiments</h2>
              {data[fileName].sentiment.map((item, index) => (
                <div key={index} className={styles.summary}>
                  <h3 className={styles.description}>
                    Sentence: {item.sentence}
                  </h3>
                  <h3 className={styles.description}>
                    Sentiment: {item.sentiment}
                  </h3>
                  <h3 className={styles.description}>
                    Score: {item.score.toFixed(2)}
                  </h3>
                </div>
              ))}
            </div>
            <div>
              <h2 className={styles.description}>Word Cloud</h2>
              {/* Using <img> as a workaround to Next.js port fetching */}
              <img
                src={data[fileName].wordCloudUrl}
                alt="Word Cloud"
                width="800"
                height="400"
              />
            </div>
          </div>
        ))}
      </main>
    </div>
  );
};

export default Dashboard;
