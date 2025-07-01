import React, { useState, useEffect } from "react";

import "./HotelBooking.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";
import { FaStar, FaCheckCircle } from "react-icons/fa";

import { Swiper, SwiperSlide } from "swiper/react";
import { Thumbs } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import "@fancyapps/ui/dist/fancybox/fancybox.css";
import { Fancybox } from "@fancyapps/ui";
import HomeBanner from "../home/HomeBanner";

function HotelBooking() {
  // Toggle states for each filter section
  const [toggle, setToggle] = useState({
    showProperties: true,
    price: true,
    star: true,
    review: true,
    amenities: true,
  });

  // Toggle handler
  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const [thumbsSwiper, setThumbsSwiper] = useState(null);

  const productImages = [
    "/images/place1.jpg",
    "/images/place3.jpg",
    "/images/place3.jpg",
    "/images/place3.jpg",
  ];

  useEffect(() => {
    Fancybox.bind('[data-fancybox="gallery"]', {});
  }, []);

  return (
    <div className="container pt-5 pb-5">
      {/*<HomeBanner /> */}
      <div className="row">
        <div className="col-sm-12">
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb">
              <li className="breadcrumb-item">
                <a href="/">Home</a>
              </li>
              <li className="breadcrumb-item active" aria-current="page">
                Hotels
              </li>
            </ol>
          </nav>

          <div className="search-box">
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="City Name, Location Or Specific Hotel"
                />
              </div>
              <div className="col-md-2 floating-label">
                <label htmlFor="checkin">Check-In</label>
                <input type="date" className="form-control" id="checkin" />
              </div>
              <div className="col-md-2 floating-label">
                <label htmlFor="checkout">Check-Out</label>
                <input type="date" className="form-control" id="checkout" />
              </div>
              <div className="col-md-2">
                <select className="form-select">
                  <option defaultValue>Rooms/Guests</option>
                  <option>1 Room, 2 Guests</option>
                  <option>2 Rooms, 4 Guests</option>
                </select>
              </div>
              <div className="col-md-2">
                <button className="btn modify-btn w-100">Modify Search</button>
              </div>
            </div>

            <div className="row mt-2 g-3">
              <div className="col-md-4">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter Hotel Name Or Location"
                />
              </div>
              <div className="col-md-3">
                <select className="form-select">
                  <option defaultValue>Popularity</option>
                  <option>Price (Low to High)</option>
                  <option>Price (High to Low)</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col-sm-3">
          <div className="filter-box p-3 border rounded">
            <h5 className="mb-3 fw-bold">FILTER</h5>

            {/* Filter: Show Properties With */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("showProperties")}
                style={{ cursor: "pointer" }}
              >
                <span>Show Properties With</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.showProperties ? faChevronUp : faChevronDown}
                  />
                </span>
              </div>
              {toggle.showProperties && (
                <div className="filter-options mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="bookZero"
                    />
                    <label className="form-check-label" htmlFor="bookZero">
                      Book With ₹0
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="freeCancel"
                    />
                    <label className="form-check-label" htmlFor="freeCancel">
                      Free Cancellation
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="freeBreakfast"
                    />
                    <label className="form-check-label" htmlFor="freeBreakfast">
                      Free Breakfast
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Filter: Price */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("price")}
                style={{ cursor: "pointer" }}
              >
                <span>Price (Per Night)</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.price ? faChevronUp : faChevronDown}
                  />
                </span>
              </div>
              {toggle.price && (
                <div className="filter-options mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="p1"
                    />
                    <label className="form-check-label" htmlFor="p1">
                      Below ₹2000
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="p2"
                    />
                    <label className="form-check-label" htmlFor="p2">
                      ₹ 2001 - ₹ 4000
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="p3"
                    />
                    <label className="form-check-label" htmlFor="p3">
                      ₹4001 - ₹ 8000
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="p4"
                    />
                    <label className="form-check-label" htmlFor="p4">
                      ₹8001 - ₹ 20000
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="p5"
                    />
                    <label className="form-check-label" htmlFor="p5">
                      Above ₹ 30000
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Filter: Star Rating */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("star")}
                style={{ cursor: "pointer" }}
              >
                <span>Star Rating</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.star ? faChevronUp : faChevronDown}
                  />
                </span>
              </div>
              {toggle.star && (
                <div className="filter-options mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="s1"
                    />
                    <label className="form-check-label" htmlFor="s1">
                      5 Star <span className="text-muted">[205]</span>
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="s2"
                    />
                    <label className="form-check-label" htmlFor="s2">
                      4 Star <span className="text-muted">[550]</span>
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="s3"
                    />
                    <label className="form-check-label" htmlFor="s3">
                      3 Star <span className="text-muted">[305]</span>
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="s4"
                    />
                    <label className="form-check-label" htmlFor="s4">
                      Budget <span className="text-muted">[750]</span>
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="s5"
                    />
                    <label className="form-check-label" htmlFor="s5">
                      Unrated <span className="text-muted">[500]</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Filter: User Review Rating */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("review")}
                style={{ cursor: "pointer" }}
              >
                <span>User Review Rating</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.review ? faChevronUp : faChevronDown}
                  />
                </span>
              </div>
              {toggle.review && (
                <div className="filter-options mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="r1"
                    />
                    <label className="form-check-label" htmlFor="r1">
                      4.5 & Above (Excellent)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="r2"
                    />
                    <label className="form-check-label" htmlFor="r2">
                      4 & Above (Very Good)
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="r3"
                    />
                    <label className="form-check-label" htmlFor="r3">
                      3 & Above (Good)
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Filter: Amenities */}
            <div className="filter-group mb-3">
              <div
                className="filter-title d-flex justify-content-between"
                onClick={() => handleToggle("amenities")}
                style={{ cursor: "pointer" }}
              >
                <span>Amenities</span>
                <span>
                  <FontAwesomeIcon
                    icon={toggle.amenities ? faChevronUp : faChevronDown}
                  />
                </span>
              </div>
              {toggle.amenities && (
                <div className="filter-options mt-2">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="a1"
                    />
                    <label className="form-check-label" htmlFor="a1">
                      Free Cancellation
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="a2"
                    />
                    <label className="form-check-label" htmlFor="a2">
                      24 Hour Front Desk
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="a3"
                    />
                    <label className="form-check-label" htmlFor="a3">
                      Ac
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="a4"
                    />
                    <label className="form-check-label" htmlFor="a4">
                      Bar
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="a5"
                    />
                    <label className="form-check-label" htmlFor="a5">
                      Wi-Fi
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="a6"
                    />
                    <label className="form-check-label" htmlFor="a6">
                      Breakfast
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-sm-9">
          <div className="row">
            <div className="col-sm-4">
              <div className="product-carousel">
                {/* Main Image Swiper */}
                <Swiper
                  spaceBetween={10}
                  thumbs={{ swiper: thumbsSwiper }}
                  modules={[Thumbs]}
                  className="main-swiper"
                >
                  {productImages.map((img, index) => (
                    <SwiperSlide key={index}>
                      <a href={img} data-fancybox="gallery">
                        <img
                          src={img}
                          alt={`Main ${index}`}
                          className="main-image"
                        />
                      </a>
                    </SwiperSlide>
                  ))}
                </Swiper>

                {/* Thumbnail Swiper */}
                <Swiper
                  onSwiper={setThumbsSwiper}
                  spaceBetween={10}
                  slidesPerView={4}
                  watchSlidesProgress
                  modules={[Thumbs]}
                  className="thumb-swiper mt-3"
                >
                  {productImages.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img
                        src={img}
                        alt={`Thumb ${index}`}
                        className="thumb-image"
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                <h5>The Orchid Shimla</h5>
                <span class="stars">★★★★</span>
                <p className="location">
                  <FontAwesomeIcon icon={faLocationDot} className="me-1" />{" "}
                  Shimla/Sanjauli
                </p>
                <ul>
                  <li>
                    <p>Lorem ipsum dolor sit amet consectetur </p>
                  </li>
                  <li>
                    <p>Lorem ipsum dolor sit amet consectetur </p>
                  </li>
                </ul>
                <div class="price-box">
                  <div class="tax-rating">
                    <div>
                      <p class="text-muted small">+ ₹317 Taxes & Fees</p>
                      <p class="text-muted small">Per Night</p>
                    </div>
                    <div class="rating-box text-end">
                      <p class="text-muted small mb-1">Excellent</p>
                      <p class="text-muted small">40 Review</p>
                    </div>
                  </div>

                  <div class="price-view">
                    <div>
                      <p class="old-price">₹10,000</p>
                      <p class="new-price">₹8,000</p>
                    </div>
                    <button class="view-room-btn">View Room</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelBooking;
