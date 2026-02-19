import React, { useEffect, useRef, useState } from "react";
import { BASE_URL } from "../services/apiEndpoints";
import { useLocation } from "react-router-dom";
import { FaFacebookF, FaInstagram } from "react-icons/fa";

function Blogdetail() {
  const location = useLocation();
  const blog = location.state.blog;

  const imageRef = useRef(null);
  const contentRef = useRef(null);

  const [stopSticky, setStopSticky] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!contentRef.current || !imageRef.current) return;

      const contentBottom =
        contentRef.current.getBoundingClientRect().bottom;

      const imageHeight = imageRef.current.offsetHeight;

      // jab content ka bottom image ke height se upar aa jaye
      if (contentBottom <= imageHeight + 120) {
        setStopSticky(true);
      } else {
        setStopSticky(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="blog-detail py-5" style={{ marginTop: "150px" }}>
      <div className="container">
        <div className="row align-items-start">

          {/* RIGHT CONTENT */}
          <div className="col-md-8" ref={contentRef}>
            <div className="blog-content">
              <h4 className="heading">{blog.heading}</h4>
              {blog.title && <h5>{blog.title}</h5>}

              <p className="blog-description">{blog.description}</p>

              <h6>
                {new Date(blog.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </h6>
            </div>
          </div>

          {/* LEFT IMAGE */}
          <div className="col-md-4">
            <div
              ref={imageRef}
              className={`blog-image-wrapper ${
                stopSticky ? "stop-sticky" : "sticky"
              }`}
            >
              <img
                src={`${BASE_URL}/blog/images/${blog.image}`}
                alt="blog"
                className="blog-image1"
              />
            </div>
          </div>
        </div>

        <div className="blog-social-links mt-3">
          <a className="social-icon facebook">
            <FaFacebookF />
          </a>
          <a className="social-icon instagram">
            <FaInstagram />
          </a>
        </div>
      </div>
    </div>
  );
}

export default Blogdetail;
