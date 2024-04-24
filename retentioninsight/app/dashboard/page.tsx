// Start with client-side rendering
"use client";

import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

interface SentimentItem {
    0: string;  // Sentence
    1: { score: number };  // Object with a 'score' property
}

interface SentimentCategories {
    positive: SentimentItem[];
    negative: SentimentItem[];
    neutral: SentimentItem[];
}

interface Data {
    transcription: string;
    sentiment: SentimentCategories;
    wordCloudUrl: string;
}

const Dashboard: NextPage = () => {
    const [data, setData] = useState<Record<string, Data>>({});
    const [fileNames, setFileNames] = useState<string[]>([]);

    useEffect(() => {
        fetch('http://localhost:5000/api/upload')
            .then(response => response.json())
            .then(data => {
                console.log(data);
                setFileNames(data.file_names);
            });
    }, []);

    useEffect(() => {
        fileNames.forEach(fileName => {
            if (!data[fileName]) {  // Only fetch if data for this file hasn't been fetched
                fetchDataForFile(fileName);
            }
        });
    }, [fileNames, data]);

    const fetchDataForFile = (fileName: string) => {
        const sanitizedFileName = sanitizeFileName(fileName);
        Promise.all([
            fetch(`http://localhost:5000/api/transcriptions/${sanitizedFileName}transcription.txt`).then(res => res.text()),
            fetch(`http://localhost:5000/api/sentiments/${sanitizedFileName}sentiments.json`).then(res => res.json()),
            fetch(`http://localhost:5000/api/word-clouds/${sanitizedFileName}wordcloud.png`).then(res => res.url)
        ]).then(([transcription, sentiment, wordCloudUrl]) => {
            console.log(sentiment);
            setData(prev => ({
                ...prev,
                [fileName]: { transcription, sentiment, wordCloudUrl }
            }));
        });
    };

    const sanitizeFileName = (fileName: string) => {
        return fileName.replace(/ /g, '_').replace(/\.[^/.]+$/, "").replace(/[()]/g, "");
    };

    return (
        <div>
            <Head>
                <title>Dashboard</title>
            </Head>
            <main className={styles.main}>
                {fileNames && fileNames.map(fileName => (
                    <div key={fileName} className={styles.summary}>
                        <h1 className={styles.description}>{fileName}</h1>
                        <div className={styles.summary}>
                            <h1 className={styles.description}>Transcription</h1>
                            <h2 className={styles.description}>{data[fileName] ? data[fileName].transcription : 'Loading transcription...'}</h2>
                        </div>
                        <div  className={styles.summary}>
                            <h1>Negative</h1>
                            {data[fileName] && data[fileName].sentiment['negative'].map((item: SentimentItem, index: number) => (
                                <div key={index} className={styles.summary}>
                                    <h2 className={styles.description}>Sentence: {item[0]}</h2>
                                    <h2 className={styles.description}>Score: {item[1].score}</h2>
                                </div>
                            ))}
                        </div>
                        <div className={styles.summary}>
                            <h1 className={styles.description}>Neutral</h1>
                            {data[fileName] && data[fileName].sentiment['neutral'].map((item: SentimentItem, index: number) => (
                                <div key={index} className={styles.summary}>
                                    <h2 className={styles.description}>Sentence: {item[0]}</h2>
                                    <h2 className={styles.description}>Score: {item[1].score}</h2>
                                </div>
                            ))}
                        </div>
                        <div className={styles.summary}>
                            <h1 className={styles.description}>Positive</h1>
                            {data[fileName] && data[fileName].sentiment['positive'].map((item: SentimentItem, index: number) => (
                                <div key={index} className={styles.summary}>
                                    <h2 className={styles.description}>Sentence: {item[0]}</h2>
                                    <h2 className={styles.description}>Score: {item[1].score}</h2>
                                </div>
                            ))}
                        </div>
                        <div className={styles.summary}>
                            <h1 className={styles.description}>Word Cloud</h1>
                            {data[fileName] && <Image src={data[fileName].wordCloudUrl} alt="Word Cloud" width="800" height="400" />}
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

export default Dashboard;
