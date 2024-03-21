// pages/index.tsx
import type { NextPage } from "next";
import Head from "next/head";
import styles from "./styles/Home.module.css";
import logo from "./RIE_Logo.webp";

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <Head>
        <title>Retention Insight Engine</title>
        <meta name="description" content="Your go-to solution for insights" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <img src={logo.src} alt="Logo" className={styles.logo} />
        <h1 className={styles.title}>Retention Insight Engine</h1>

        <div className={styles.uploadContainer}>
          <label htmlFor="upload-button" className={styles.uploadButton}>
            <button id="upload-button">Upload Files</button>
          </label>
          <input
            type="file"
            id="upload-button"
            name="uploads"
            accept=".mp3,.mp4"
            multiple
            style={{ display: "none" }}
          />
        </div>
      </main>
    </div>
  );
};

export default Home;
