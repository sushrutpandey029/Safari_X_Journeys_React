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

import { getHotelCityByCategory } from "../services/hotelService";

import SearchBox from "../flights/Searchbox";

const staticImages = [
  "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoOGB-D7TqUnglnEtnn0pKWyLvHtQ1KvpfBg&s",
  "https://media.istockphoto.com/id/506598655/photo/couple-on-a-beach-jetty-at-maldives.jpg?s=612x612&w=0&k=20&c=UJha8UU51ThBgH151slXPie_fCsfvnQWYxnLOcRmUkw=",
  "https://images.pexels.com/photos/1658967/pexels-photo-1658967.jpeg?cs=srgb&dl=pexels-senuscape-728360-1658967.jpg&fm=jpg",
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
  const [hotelData, setHotelData] = useState([]);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchHotelCategories = async () => {
      try {
        const res = await getHotelCityByCategory();
        console.log("Hotel categories raw:", res);
        if (res.success) {
          setCategories(res.data); // store API 
        }
      } catch (err) {
        console.error("Fetch error hotel category:", err.response?.data || err.message);
      }
    };

    fetchHotelCategories();
  }, []); // empty dependency array → sirf mount hone pe chalega

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
        <div className="top-destination">
          <div className="container">
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-5 g-4">
              {categories.map((item, index) => (
                <div className="col" key={index}>
                  {/* Category Card */}
                  <div
                    className="place-card-link place"
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      navigate("/places", { state: { category: item } })
                    }
                  >
                    <div className="place">
                      <img
                        src={staticImages[index % staticImages.length]}
                        alt={item.category}
                      />
                      <div className="overlay">
                        <p className="card-destination">{item.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <HotelPopularDestination />

        {/* guide section */}
        <GuidePreview />

        {/* cab section */}

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

        <WhyChooseUs />

        <div className="Testionials">
          <div className="container">

            <div className="row align-items-center">
              <div className="col-sm-12 text-end mb-4">
                <Link to={"/testimonials"}>
                  <button className="explore-btn">Explore More</button>
                </Link>
              </div>
            </div>
            <div className="row align-items-start">
              {/* LEFT STATIC BOX */}
              <div className="container">
                <div className="row align-items-start">
                  {/* LEFT SECTION (col-sm-4) */}
                  <div className="col-sm-4">
                    <h2 className="feedback-title">
                      Client <span>Feedback</span>
                    </h2>
                    <p className="feedback-heading">
                      What They Say After Using Our Product
                    </p>
                    <p className="feedback-sub">
                      Many of our members have started their early careers with
                      us Many of our members have started their early careers
                      with us
                    </p>

                    {/* Slider Arrows */}
                    <div className="testimonial-arrows">
                      <button
                        onClick={() => {
                          const slider =
                            document.getElementById("testimonialSlider");
                          slider.scrollLeft -= 370;
                        }}
                      >
                        ←
                      </button>
                      <button
                        onClick={() => {
                          const slider =
                            document.getElementById("testimonialSlider");
                          slider.scrollLeft += 370;
                        }}
                      >
                        →
                      </button>
                    </div>
                  </div>

                  {/* RIGHT SECTION (col-sm-8) */}
                  <div className="col-sm-8">
                    {/* SLIDER START */}
                    <div id="testimonialSlider" className="testimonial-slider">
                      <div className="row flex-nowrap">
                        {testimonialData?.map((item) => (
                          <div key={item.id} className="col-sm-3">
                            {" "}
                            {/* ← show 3 cards */}
                            <div className="testimonial-card">
                              <div className="stars">
                                {"★".repeat(item.rating)}
                              </div>

                              <p className="review-text">
                                {item.description?.substring(0, 110)}...
                              </p>

                              <div className="review-user">
                                <img
                                  src={`${BASE_URL}/testimonial/images/${item.image}`}
                                  alt={item.name}
                                />
                                <div>
                                  <h4>{item.name}</h4>
                                  <small>{item.designation}</small>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* SLIDER END */}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ section */}
        <FAQ />

        <div className=" modern-blog">
          <div className="container">
            <div className="row align-items-center mb-4">
              <div className="col-sm-9">
                <h2>
                  Our Recent <span>Blogs</span>
                </h2>
                <p className="section-subtext">
                  Stay inspired with our latest travel stories, guides, and
                  destination tips crafted just for you.
                </p>
              </div>
              <div className="col-sm-3 text-end">
                <Link to={"/blogs"}>
                  <button className="explore-btn">Explore More</button>
                </Link>
              </div>
            </div>

            <div className="row">
              {blogData &&
                blogData.slice(0, 3).map((blog, index) => (
                  <div
                    className="col-sm-4"
                    key={index}
                    onClick={() => handleNavigate(blog)}
                  >
                    <div className="blog-card">
                      <div className="blog-image">
                        <img
                          src={`${BASE_URL}/blog/images/${blog.image}`}
                          alt="blog"
                          className="img-fluid"
                        />
                      </div>

                      <div className="blog-content">
                        <h5 className="blog-category">{blog.title}</h5>
                        <h4 className="blog-title">{blog.heading}</h4>
                        <p className="blog-desc">
                          {blog.description.length > 100
                            ? blog.description.substring(0, 100) + "..."
                            : blog.description}
                        </p>

                        <div className="d-flex justify-content-between align-items-center mt-3">
                          <h6 className="date">
                            {new Date(blog.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                day: "numeric",
                                month: "long",
                              }
                            )}
                          </h6>

                          <button
                            className="read-more-btn"
                            onClick={() =>
                              navigate("/blog-detail", { state: { blog } })
                            }
                          >
                            Read More
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>

        {/* newslater */}
        <NewsLater />
      </div>
      );
}

      export default Home;
