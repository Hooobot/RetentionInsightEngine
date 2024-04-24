import React, { useCallback, useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Dashboard: NextPage = () => {
    // State to hold uploaded files and submission status
    const [transcription, setTranscription] = useState('');
    const [sentiment, setSentiment] = useState([]);
    const [sort, setSort] = useState<Object[]>([]);
    function fetchData() {
        fetch('http://localhost:5000/api/download-and-convert')
            .then(response => response.json())
            .then(data => console.log(data));
    }

    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1>Dashboard</h1>
            </main>
        </div>
    );
}

export default Dashboard;
