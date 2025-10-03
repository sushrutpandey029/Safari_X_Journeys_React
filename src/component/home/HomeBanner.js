import React, { useState, useEffect } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BASE_URL } from "../services/apiEndpoints";
import { getBannerData } from "../services/commonService";
import SearchBox from "../flights/Searchbox";

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
  {bannerData &&
    bannerData.map((item) => (
      <div key={item.id} className="banner-slide">
        <video
          src={`${BASE_URL}/banner/images/${item.image}`}
          className="banner-video"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="banner-overlay"></div>
      </div>
    ))}

  {/* 🔹 SearchBox floating over banner */}
  <div className="banner-searchbox container">
    <SearchBox placeholder="Search..." />
  </div>
</div>

  );
}

export default HomeBanner;
