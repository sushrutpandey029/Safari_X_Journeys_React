import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Button from "react-bootstrap/Button";
import { getAllGuides } from "../services/guideService";
import GuideCard from "./GuideCard";
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

const dataList = [
  {
    id: 1,
    name: "Tarun kumar",
    time: "12 Hr Ago",
    image: "/Images/guide.webp",
    description: "t sodales convallis nisi odio malesuada adipiscing.",
  },
  {
    id: 2,
    name: "Tarun kumar",
    time: "12 Hr Ago",
    image: "/Images/guide.webp",
    description: "t sodales convallis nisi odio malesuada adipiscing.",
  },
  {
    id: 3,
    name: "Tarun kumar",
    time: "12 Hr Ago",
    image: "/Images/guide.webp",
    description: "t sodales convallis nisi odio malesuada adipiscing.",
  },
];
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

function GuideList() {
  const [guides, setGuides] = useState([]);

  const fetchAllGuides = async () => {
    try {
      const response = await getAllGuides();
      setGuides(response.data);
    } catch (err) {
      console.log("error in getting respone", err.response);
    }
  };

  useEffect(() => {
    fetchAllGuides();
  }, []);

  return (
    <div>
      <div className="banner">
        <Slider {...settings}>
          <div>
            <img
              src="/images/banner.jpeg"
              className="banner-img"
              alt="Banner 1"
            />
          </div>
          <div>
            <img
              src="/images/banner.jpeg"
              className="banner-img"
              alt="Banner 2"
            />
          </div>
          <div>
            <img
              src="/images/banner.jpeg"
              className="banner-img"
              alt="Banner 3"
            />
          </div>
        </Slider>

        <div className="text-banner text-center mt-3">
          <h2>Where Every Experience Counts!</h2>
        </div>
      </div>

      <div className="best-guide">
        <div className="container">
          <div className="row">
            <div className="col-sm-12">
              <h2>
                Our <span>Best Guide</span>
              </h2>
              <p className="perra">
                Lorem ipsum dolor sit amet consectetur. Porttitor dolor
                malesuada sodales convallis nisi odio malesuada adipiscing.
                Etiam Lorem ipsum dolor sit amet consectetur. Porttitor dolor
                malesuada{" "}
              </p>
            </div>

            {guides && guides.map((guide) => <GuideCard guide={guide} />)}
          </div>
        </div>
      </div>

      <div className="Testionials">
        <div className="container">
          <div className="row">
            <div className="col-sm-9">
              <h2>
                Client <span>Testimonials</span>
              </h2>
            </div>
            <div className="col-sm-3 text-end ">
              <Button className="explore-btn">Read All Review</Button>
            </div>
            <div className="card-container">
              {dataList.map((item) => (
                <div key={item.id} className="card">
                  <div className="Time d-flex">
                    <h5 className="col-sm-6">{item.name}</h5>
                    <div className="col-sm-6">
                      <a className href="#">
                        {item.time}
                      </a>
                    </div>
                  </div>

                  <div className="col-sm-12 d-flex">
                    <div className="col-sm-5">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="col-sm-7">
                      <p className="mb-0">{item.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GuideList;
