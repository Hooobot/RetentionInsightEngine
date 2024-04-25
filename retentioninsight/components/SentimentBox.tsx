// SentimentBox.tsx
import React from "react";

interface SentimentProps {
  title: string;
  sentiments: { sentence: string; score: number }[];
  color: string;
}

const SentimentBox: React.FC<SentimentProps> = ({
  title,
  sentiments,
  color,
}) => {
  return (
    <div
      style={{
        border: `2px solid ${color}`,
        padding: "10px",
        marginBottom: "20px",
      }}
    >
      <h2 style={{ color }}>{title}</h2>
      <ul>
        {sentiments.map((sentiment, index) => (
          <li key={index}>
            {sentiment.sentence} (Score: {sentiment.score.toFixed(2)})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SentimentBox;
