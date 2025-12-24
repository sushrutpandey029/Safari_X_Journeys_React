// src/components/Loading.js

import React from "react";
import "./loading.css";

const Loading = ({ text = "Loading..." }) => {
  return (
    <div className="d-flex justify-content-center align-items-center loading-full">
      <div className="text-center">

        {/* 🔵 Circle + Logo in Center */}
        <div className="circle-loader">
          <img
            src="/images/Safarix-Blue-Logo.png"
            alt="loader-logo"
            className="loader-center-logo"
          />
        </div>

        <p className="mt-2 loading-text">{text}</p>
      </div>
    </div>
  );
};

export default Loading;
