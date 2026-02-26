import React from "react";
import "./BlockingLoader.css";

export default function BlockingLoader({
  show,
  title = "Processing Request",
  message = "Your cancellation request is being processed. Please do not go back or close this window.",
}) {
  if (!show) return null;

  return (
    <div className="blocking-overlay">
      <div className="blocking-card">
        <div className="spinner"></div>

        <h4>{title}</h4>

        <p>{message}</p>
      </div>
    </div>
  );
}
