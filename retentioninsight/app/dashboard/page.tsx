// Start with client-side rendering
"use client";

import React, { useCallback, useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

interface SentimentItem {
    0: string; // Sentence
    1: { score: number }; // Object with a 'score' property
}

const Dashboard: NextPage = () => {
    // State to hold uploaded files and submission status
    const [transcription, setTranscription] = useState('');
    const [negative, setNegative] = useState<Array<Array<any>>>([]);
    const [neutral, setNeutral] = useState<Array<Array<any>>>([]);
    const [positive, setPositive] = useState<Array<Array<any>>>([]);
    const [sort, setSort] = useState<Object[]>([]);
    const [fileNames, setFileNames] = useState<string[]>([]);

    function fetchData() {
        let names: string[] = [];
        fetch('http://localhost:5000/api/upload')
            .then(response => response.json())
            .then(data => {console.log(data); setFileNames(data.file_names);});
    }

    useEffect(() => {
        fetchData();
    }, []);

    function getTranscription(filename: string) {
        let transcript = '';
        let newFileName = filename.replace(/ /g, '_');
        newFileName = newFileName.replace(/\.[^/.]+$/, "");
        newFileName = newFileName.replace(/[()]/g, "");
        fetch(`http://localhost:5000/api/transcriptions/${newFileName}transcription.txt`)
          .then(response => response.text())
            .then(text => setTranscription(text));
      }
    
      function getWordCloud(filename: string) {
        let newFileName = filename.replace(/ /g, '_');
        newFileName = newFileName.replace(/(\.[^/.]+)$/, "");
        newFileName = newFileName.replace(/[()]/g, "");
        return (`http://localhost:5000/api/word-clouds/${newFileName}wordcloud.png`);
      }
    
      function getEntityExtractions(filename: string) {
        let newFileName = filename.replace(/\.[^/.]+$/, "");
        fetch(`http://localhost:5000/api/entity-extractions/${newFileName}entityextractions.txt`)
        .then(response => response.json())
        .then(data => console.log(data));
      }

      function getSentiments(filename: string) {
        let newFileName = filename.replace(/ /g, '_');
        newFileName = newFileName.replace(/(\.[^/.]+)$/, "");
        newFileName = newFileName.replace(/[()]/g, "");
        fetch(`http://localhost:5000/api/sentiments/${newFileName}sentiments.json`)
        .then(response => response.json())
        .then(data => {console.log(data); setNegative(data.negative); setNeutral(data.neutral); setPositive(data.positive);});
      }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1 className={styles.description}>Dashboard</h1>
                {fileNames && 
                    <div>
                        {fileNames.map((file, i) => {
                            getSentiments(file);
                            return (
                                <div key={file}>
                                <h2 className={styles.description}>{file}</h2>
                                    <div className={styles.summary}>
                                        <h2 className={styles.description}>Word Cloud</h2>
                                        <Image src={getWordCloud(file)} width={800} height={400} alt={`${file}-word-cloud`}/>
                                        <h2 className={styles.description}>Negative</h2>
                                        {negative && negative.map((neg: Array<any>, i: number) => {
                                            return(
                                                <div key={`negative-${i}`} className={styles.summary}>
                                                    <h2 className={styles.description}>Sentence: {neg[0]}</h2>
                                                    <h2 className={styles.description}>Score: {neg[1]['score']}</h2>
                                                </div>
                                                )
                                            })}
                                        <h2 className={styles.description}>Neutral</h2>
                                        {neutral && neutral.map((neu: Array<any>, i: number) => {
                                            return(
                                                <div key={`neutral-${i}`} className={styles.summary}>
                                                    <h2 className={styles.description}>Sentence: {neu[0]}</h2>
                                                    <h2 className={styles.description}>Score: {neu[1]['score']}</h2>
                                                </div>
                                                )
                                            })}
                                            <h2 className={styles.description}>Positive</h2>
                                        {positive && positive.map((pos: Array<any>, i: number) => {
                                            return(
                                                <div key={`positive-${i}`} className={styles.summary}>
                                                    <h2 className={styles.description}>Sentence: {pos[0]}</h2>
                                                    <h2 className={styles.description}>Score: {pos[1]['score']}</h2>
                                                </div>
                                                )
                                            })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
            </main>
        </div>
    );
}

export default Dashboard;
