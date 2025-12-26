import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";

import { BASE_URL } from "../services/apiEndpoints";
import { getBannerData } from "../services/commonService";
import SearchBox from "../flights/Searchbox";
import FlightPreview from "../flights/Flightpreview";

function HomeBanner() {
  const [bannerData, setBannerData] = useState([]);
  const fetchBannerData = async () => {
    try {
      const response = await getBannerData();
      setBannerData(response.data);
    } catch (error) {
      console.log("error in getting banner data", error.response);
    }
  };
  useEffect(() => {
    fetchBannerData();
  }, []);
  return (
  <div className="banner">
  {bannerData && bannerData.length > 0 && (
    <video
      src={`${BASE_URL}/banner/images/${bannerData[0].image}`}
      className="banner-video"
      autoPlay
      muted
      loop
      playsInline
    />
  )}

  {/* 🔹 SearchBox floating over banner */}
  <div className="banner-searchbox container">
    {/* your searchbox content */}
  </div>
</div>


  );
}

export default HomeBanner;
