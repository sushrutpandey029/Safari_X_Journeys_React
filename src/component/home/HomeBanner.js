import React,{useState,useEffect} from "react";
import { Card, Button, Row, Col } from "react-bootstrap";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { BASE_URL } from "../services/apiEndpoints";
import { getBannerData } from "../services/commonService";


const PrevArrow = (props) => {
  const { onClick } = props;
  return (
    <img
      src="/images/right.svg"
      alt="Previous"
      className="custom-arrow right-arrow right-arrow"
      onClick={onClick}
    />
  );
};

const NextArrow = (props) => {
  const { onClick } = props;
  return (
    <img
      src="/images/left.svg"
      alt="Next"
      className="custom-arrow left-arrow"
      onClick={onClick}
    />
  );
};

const settings = {
  dots: true,
  infinite: true,
  speed: 800,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: false,
  autoplaySpeed: 2500,
  arrows: true,
  nextArrow: <NextArrow />,
  prevArrow: <PrevArrow />,
};



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
      <Slider {...settings}>
        {bannerData.map((item) => (
          <div key={item.id}>
            <div className="banner-slide">
              <img
                src={`${BASE_URL}/banner/images/${item.image}`}
                className="banner-img"
                alt="Banner"
              />
              <div className="text-banner text-center">
                <h2>{item.title}</h2>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
}

export default HomeBanner;
