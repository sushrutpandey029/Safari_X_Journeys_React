import React, { useEffect, useState } from "react";
import { Card, Button, Row, Col } from "react-bootstrap";

import { Link,useNavigate } from "react-router-dom";

import { fetchFaqList, fetchBlog } from "../services/commonService";
import { BASE_URL } from "../services/apiEndpoints";
import GuidePreview from "../guides/GuidePreview";
import CabPreview from "../cabs/CabPreview";
import HomeBanner from "./HomeBanner";
import WhyChooseUs from "../common/WhyChooseUs";

const imageList = [
  { id: 1, src: "/Images/place.jpg", title: "Mountains", path: "/mountains" },
  { id: 1, src: "/Images/place.jpg", title: "Honeymoon", path: "/honeymoon" },
  { id: 1, src: "/Images/place.jpg", title: "North-East", path: "/north-east" },
  {
    id: 1,
    src: "/Images/place.jpg",
    title: "South-India",
    path: "/south-india",
  },
  { id: 1, src: "/Images/place.jpg", title: "West-India", path: "/west-india" },
];

const destinations = [
  { name: "AULI", image: "/Images/place.jpg" },
  { name: "Manali", image: "/Images/place.jpg" },
  { name: "Jammau", image: "/Images/place.jpg" },
  { name: "Jaipur", image: "/Images/place.jpg" },
];

const Populardestinations = [
  { name: "leh ladakh", image: "/Images/popular.png" },
  { name: "MaManaLinali", image: "/Images/popular.png" },
  { name: "JaDarjeeling", image: "/Images/popular.png" },
  { name: "Jamussoorie", image: "/Images/popular.png" },
  { name: "Jamussoorie", image: "/Images/popular.png" },
  { name: "Jamussoorie", image: "/Images/popular.png" },
  { name: "Jamussoorie", image: "/Images/popular.png" },
  { name: "Jamussoorie", image: "/Images/popular.png" },
];

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

function Home() {
  const [faqData, setFaqData] = useState([]);
  const [blogData, setBlogData] = useState([]);
  const navigate = useNavigate()

  const getFaqList = async () => {
    try {
      const response = await fetchFaqList();
      setFaqData(response.data);
    } catch (error) {
      console.log("error in fetching faq list", error.response);
    }
  };

  const getBlog = async () => {
    try {
      const response = await fetchBlog();
      console.log("blog response", response.data);
      setBlogData(response.data);
    } catch (error) {
      console.log("error in fetching blog list");
    }
  };

  useEffect(() => {
    getFaqList();
    getBlog();
  }, []);

  return (
    <div>
      <HomeBanner />

      <div className="container mt-5">
        <div className="row">
          {imageList.map((img) => (
            <div className="col mb-5" key={img.id}>
              <div className="place">
                <Link to={img.path} className="custom-link">
                  <img src={img.src} alt={img.title} />
                  <p className="card-destination">{img.title}</p>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="trending-destination">
        <div className="container">
          <div className="row">
            <div className="col-sm-9">
              <h2>
                Top Trending <span>Destinations</span>
              </h2>
              <p className="perra">
                Explore The Hottest Travel Spots Around The Globe.
              </p>
            </div>
            <div className="col-sm-3 text-end">
              <Link to={"/places"}>
                <button className="explore-btn">Explore More</button>
              </Link>
            </div>
          </div>
          <div className="row">
            {destinations.map(function (dest, index) {
              return (
                <div className="col-md-3" key={index}>
                  <div className="destination-card">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      className="img-fluid rounded"
                    />
                    <h5 className="mt-3">{dest.name}</h5>
                    <p className="text-muted small">GUIDED TOUR / 2 HOURS</p>
                    <div className="row">
                      <div className="col-sm-6 col-6">
                        <p>Starting From</p>
                      </div>
                      <div className="col-sm-6 col-6 text-end">
                        <span className="text-muted text-decoration-line-through">
                          ₹42,000
                        </span>{" "}
                        <span className="text-primary">₹8,000</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* guide section */}
      <GuidePreview />

      {/* cab section */}

      <CabPreview />

      <div className="book-hotel ">
        <div className="container">
          <div class="row">
            <div className="col-sm-12 d-flex">
              <div className="col-sm-6">
                <h2>
                  Book Hotel At{" "}
                  <span>
                    {" "}
                    <br></br> Populer Destinations
                  </span>
                </h2>
              </div>
              <div className="col-sm-6 text-end my-5">
                <Link to={"/hotel"}>
                  <Button className="explore-btn">View More</Button>
                </Link>
              </div>
            </div>
            {Populardestinations.map((dest, index) => (
              <Col key={index} md={6} lg={3}>
                <Card className="destination-card ">
                  <Card.Img variant="top" src={dest.image} />
                  <Card.Body>
                    <div className="place-pop">
                      <div className="col-sm-6">
                        <Card.Title className="destination-title">
                          {dest.name}{" "}
                        </Card.Title>
                      </div>
                      <div className="col-sm-6">
                        <p className="destination-properties text-end">
                          {dest.properties} Properties
                        </p>
                      </div>
                    </div>
                    <Card.Text className="destination-price">
                      <a>Starting from - ₹ 10,000</a> <span>{dest.price}</span>
                    </Card.Text>

                    <Card.Text className="destination-desc">
                      Hotels, Budget Hotels, 3 Star Hotels, 4 Star Hotels, 5
                      Star Hotels
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </div>
        </div>
      </div>

      <WhyChooseUs />

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

      {/* FAQ section */}
      <div className="Faq">
        <div className="container-fluid">
          <div className="main">
            <div className="row justify-content-center">
              <div className="col-sm-6">
                <h2 className="text-start mb-3"> FAQ</h2>
                <div
                  class="accordion accordion-flush"
                  id="accordionFlushExample"
                >
                  {faqData.map((item, index) => (
                    <div class="accordion-item" key={index}>
                      <h2
                        class="accordion-header"
                        id={`flush-heading-${index}`}
                      >
                        <button
                          class="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#flush-collapse-${index}`}
                          aria-expanded="false"
                          aria-controls={`flush-collapse-${index}`}
                        >
                          {item.question}
                          {/* Lorem ipsum dolor sit amet consectetur. Porttitor
                          dolor malesuada */}
                        </button>
                      </h2>
                      <div
                        id={`flush-collapse-${index}`}
                        class="accordion-collapse collapse"
                        aria-labelledby={`flush-heading-${index}`}
                        data-bs-parent="#accordionFlushExample"
                      >
                        <div class="accordion-body">{item.answer}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="blog">
        <div className="container">
          <div class="row">
            <div class="col-sm-9">
              <h2>
                Our Recent <span>Blogs</span>
              </h2>
              <p className="perra">
                Lorem ipsum dolor sit amet consectetur. Porttitor dolor
                malesuada sodales convallis nisi odio Porttitor dolor malesuada
                sodales convallis nisi odio{" "}
              </p>
            </div>
            <div class="col-sm-3 text-end">
              <Link to={"/blogs"}>
                <button class="explore-btn">Explore More</button>
              </Link>
            </div>
          </div>
          <div className="row">
            {blogData.slice(0, 3).map(function (blog, index) {
              return (
                <div className="col-sm-4" key={index}>
                  <div className="blog-box">
                    <img
                      src={`${BASE_URL}/blog/images/${blog.image}`}
                      alt="blog"
                      className="img-fluid"
                    />
                    <h5>{blog.title}</h5>
                    <h4>{blog.heading}</h4>
                    <p>
                      {blog.description.length > 100
                        ? blog.description.substring(0, 100) + "..."
                        : blog.description}
                    </p>
                    <h6>
                      {new Date(blog.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        day: "numeric",
                        month: "long",
                      })}
                    </h6>
                   
                    <button className="explore-btn" onClick={() => navigate("/blog-detail",{state:{blog}})}>Read More</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="newslater">
        <div className="container my-5">
          <div className="row  rounded-4 overflow-hidden ">
            {/* Left Image Section */}
            <div className="col-md-6 p-0">
              <img
                src="/images/banner.jpeg"
                alt="Travel"
                className="img-fluid h-100 w-100 object-cover"
              />
            </div>

            {/* Right Content Section */}
            <div className="col-md-6 d-flex newsletter-box flex-column justify-content-center align-items-start p-4">
              <h3 className="fw-bold mb-2">
                Your <span className="text-primary">Travel Journey</span> Starts
                Here
              </h3>
              <p className="mb-3">
                Sign Up And We'll Send The Best Deals To You
              </p>

              <form>
                <input
                  type="email"
                  placeholder="Your Email"
                  className="form-control me-2 rounded-pill"
                />
                <button className="explore-btn" type="submit">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
