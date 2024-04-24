import React, { useCallback, useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Contact: NextPage = () => {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1>Contact</h1>
            </main>
        </div>
    );
}

export default Contact;
