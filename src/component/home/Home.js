import React, { useEffect, useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  fetchFaqList,
  fetchBlog,
  fetchTestimonialList,
} from "../services/commonService";

import { BASE_URL } from "../services/apiEndpoints";
import GuidePreview from "../guides/GuidePreview";
import CabPreview from "../cabs/CabPreview";
import HomeBanner from "./HomeBanner";
import WhyChooseUs from "../common/WhyChooseUs";
import NewsLater from "../common/NewsLater";
import ScrollToTop from "../common/ScrollToTop";
import FAQ from "../common/faq/FAQ";
import HotelPopularDestination from "../hotels/HotelPopularDestination";
import FlightPreview from "../flights/Flightpreview";

const imageList = [
  { 
    id: 1, 
    src: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80", 
    title: "Mountains", 
    path: "/mountains" 
  },
  { 
    id: 2, 
    src: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80", 
    title: "Beaches", 
    path: "/beaches" 
  },
  { 
    id: 3, 
    src: "https://images.unsplash.com/photo-1609940401221-0ff46bda879b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    title: "Desert Safari", 
    path: "/desert" 
  },
  {
    id: 4, 
    src: "https://images.unsplash.com/photo-1522452237040-82a3b9a47305?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    title: "Honeymoon", 
    path: "/honeymoon" 
  },
  {
    id: 5, 
    src: "https://images.unsplash.com/photo-1508766206392-8bd5cf550d1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", 
    title: "Hill Stations", 
    path: "/hills" 
  }
];


const destinations = [
  { name: "AULI", image: "/Images/place.jpg" },
  { name: "Manali", image: "/Images/place.jpg" },
  { name: "Jammau", image: "/Images/place.jpg" },
  { name: "Jaipur", image: "/Images/place.jpg" },
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
  const [testimonialData, setTestimonialData] = useState([]);
  const navigate = useNavigate();

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

  const getTestimonials = async () => {
    try {
      const response = await fetchTestimonialList();
      console.log("Testimonials Response: ", response);
      setTestimonialData(response.data.data);
    } catch (error) {
      console.log("error in fetching testimonial list", error.response);
    }
  };

  const handleNavigate = (blog) => {
    navigate(`/blog-detail`, { state: { blog } });
  };

  useEffect(() => {
    getFaqList();
    getBlog();
    getTestimonials();
  }, []);

  return (
    <div>
      <ScrollToTop />
      <HomeBanner />

     

      <div className="container mt-5">
        <div className="row">
          {imageList &&
            imageList.map((img) => (
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
            {destinations &&
              destinations.map(function (dest, index) {
                return (
                  <div className="col-md-3" key={index}>
                    <div className="destination-card">
                      <img
                        src={dest.image}
                        alt={dest.name}
                        className="img-fluid rounded"
                      />
                      <div className="p-2">
                        <h5 className="mt-3">{dest.name}</h5>
                        <p className="text-muted small">
                          GUIDED TOUR / 2 HOURS
                        </p>
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

      <FlightPreview />

      {/* <div className="book-hotel ">
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
                  <button className="explore-btn">View More</button>
                </Link>
              </div>
            </div>
            {City &&
              City.map((dest, index) => (
                <Col key={index} md={6} lg={3}>
                  <Card
                    className="destination-card"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleCityClick(cities[index])}
                  >
                    <Card.Img variant="top" src={dest.image} />

                    <Card.Body>
                      <Card.Title>
                        {cities.length > 0 ? cities[index]?.Name : "Loading..."}
                      </Card.Title>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
          </div>
        </div>
      </div> */}
      <HotelPopularDestination />

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
              <Link to={"/testimonials"}>
                <button className="explore-btn">Read All Review</button>
              </Link>
            </div>

            <div className="card-container">
              {Array.isArray(testimonialData) &&
                testimonialData?.slice(0, 3).map((item) => (
                  <div key={item.id} className="card">
                    <div className="Time row">
                      <div className="col-sm-6">
                        <h5 className="mb-1">{item.name}</h5>
                      </div>
                      <div className="col-sm-6 text-end">
                        <div className="text-warning">
                          {"★".repeat(item.rating)}
                          {"☆".repeat(5 - item.rating)}
                        </div>
                        <div className="text-muted small">{item.time}</div>
                      </div>
                    </div>

                    <div className="col-sm-12 d-flex">
                      <div className="col-sm-5">
                        <img
                          src={`${BASE_URL}/testimonial/images/${item.image}`}
                          alt={item.name}
                          style={{
                            width: "100%",
                            height: "auto",
                            borderRadius: "10px",
                          }}
                        />
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
      <FAQ />

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
            {blogData &&
              blogData?.slice(0, 3).map(function (blog, index) {
                return (
                  <div
                    className="col-sm-4"
                    key={index}
                    onClick={() => handleNavigate(blog)}
                  >
                    <div className="blog-box" style={{ cursor: "pointer" }}>
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

                      <button
                        className="explore-btn"
                        onClick={() =>
                          navigate("/blog-detail", { state: { blog } })
                        }
                      >
                        Read More
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* newslater */}
      <NewsLater />
    </div>
  );
}

export default Home;
