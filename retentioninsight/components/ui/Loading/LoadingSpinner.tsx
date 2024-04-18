import React from 'react';
import styles from './LoadingSpinner.module.css'; // Import the CSS module

const LoadingSpinner = () => (
  <div className={styles.overlay}>
    <div className={styles.spinner}>
    </div>
    <p className={styles.loadingText}>Processing File ...</p>
  </div>
);

export default LoadingSpinner;