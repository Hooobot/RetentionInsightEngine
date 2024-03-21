import Image from "next/image";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <h1>Retention Insight Engine</h1>

      <button className={styles.button}>Upload audio/video file</button>
    </main>
  );
}
