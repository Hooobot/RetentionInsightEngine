import React, { useCallback, useState, useEffect } from "react";
import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const Dashboard: NextPage = () => {
    return (
        <div className={styles.container}>
            <main className={styles.main}>
                <h1>Dashboard</h1>
            </main>
        </div>
    );
}

export default Dashboard;
