// Dashboard.tsx
"use client";

import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Dashboard.module.css";

interface SentimentItem {
  sentence: string;
  sentiment: string;
  score: number;
}

interface Data {
  transcription: string;
  sentiment: SentimentItem[];
  wordCloudUrl: string;
}

const Dashboard: NextPage = () => {
  const [selectedFile, setSelectedFile] = useState<string>("");
  const [data, setData] = useState<Record<string, Data>>({});

  useEffect(() => {
    fetch("http://localhost:5000/api/upload")
      .then((response) => response.json())
      .then((data) => {
        const fileNames: string[] = data.file_names;
        setSelectedFile(fileNames[0]); // Automatically select the first file
        fileNames.forEach((fileName: string) => {
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
    return fileName.replace(/\.[^/.]+$/, "").replace(/[()]/g, "");
  };

  // Extracting sentiment data for the selected file
  const sentiments = (selectedFile && data[selectedFile]?.sentiment) || [];
  const negativeSentiments = sentiments.filter(
    (item) => item.sentiment === "Negative"
  );
  const positiveSentiments = sentiments.filter(
    (item) => item.sentiment === "Positive"
  );
  const neutralSentiments = sentiments.filter(
    (item) => item.sentiment === "Neutral"
  );

  const sentimentCounts: Record<string, number> = {
    Positive: 0,
    Negative: 0,
    Neutral: 0,
  };

  // Calculate counts for each sentiment
  data[selectedFile]?.sentiment.forEach((item) => {
    sentimentCounts[item.sentiment] += 1;
  });

  const totalSentiments =
    sentimentCounts.Positive +
    sentimentCounts.Negative +
    sentimentCounts.Neutral;
  const positiveDegrees = (sentimentCounts.Positive / totalSentiments) * 360;
  const negativeDegrees = (sentimentCounts.Negative / totalSentiments) * 360;
  const neutralDegrees = (sentimentCounts.Neutral / totalSentiments) * 360;

  // Compute the stops for the conic-gradient
  const positiveStop = positiveDegrees;
  const negativeStop = positiveStop + negativeDegrees;

  return (
    <div className={styles.dashboardContainer}>
      <Head>
        <title>Dashboard</title>
      </Head>
      <main className={styles.mainContent}>
        {/* File Selection Dropdown and Transcription Display */}
        <div className={`${styles.fileSearchContainer} ${styles.box}`}>
          <div className={styles.fileSelector}>
            <label htmlFor="fileSelect">Select a File:</label>
            <select
              id="fileSelect"
              onChange={(e) => setSelectedFile(e.target.value)}
              value={selectedFile}
            >
              {Object.keys(data).map((fileName) => (
                <option key={fileName} value={fileName}>
                  {fileName}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.transcriptionContainer}>
            <h2>Transcription</h2>
            <p className={styles.transcriptionText}>
              {data[selectedFile]?.transcription}
            </p>
          </div>
        </div>

        {/* Charts and Word Cloud */}
        <div className={styles.chartsContainer}>
          <h2>Overall Sentiment</h2>
          <div
            className={styles.sentimentChart}
            style={{
              background: `conic-gradient(
        #4caf50 0deg ${positiveStop}deg, 
        #f44336 ${positiveStop}deg ${negativeStop}deg,
        #ffeb3b ${negativeStop}deg 360deg
      )`,
            }}
          >
            <div className={styles.sentimentChartInner}></div>
          </div>

          <h2>Word Cloud</h2>
          {selectedFile && (
            <img
              src={data[selectedFile]?.wordCloudUrl}
              alt={`${selectedFile} Word Cloud`}
              className={styles.wordCloudImage}
            />
          )}
        </div>

        <div className={styles.sentimentsContainer}>
          <div className={styles.positiveSentiments}>
            <h2 style={{ color: "#a6e3a1" }}>Positive</h2>
            {positiveSentiments.map((item, index) => (
              <div key={index} className={styles.positiveSentimentItem}>
                <p>{item.sentence}</p>
              </div>
            ))}
          </div>
          <div className={styles.neutralSentiments}>
            <h2 style={{ color: "#cdd6f4" }}>Neutral</h2>
            {neutralSentiments.map((item, index) => (
              <div key={index} className={styles.neutralSentimentItem}>
                <p>{item.sentence}</p>
              </div>
            ))}
          </div>
          <div className={styles.negativeSentiments}>
            <h2 style={{ color: "#f38ba8" }}>Negative</h2>
            {negativeSentiments.map((item, index) => (
              <div key={index} className={styles.negativeSentimentItem}>
                <p>{item.sentence}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
