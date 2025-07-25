import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./Blogs.css";
import { BASE_URL } from "../services/apiEndpoints";
const API_URL = `${BASE_URL}/api/blog/list`;

const Blogs = () => {
  const [blogData, setBlogData] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Correctly fetch blogs
  const getBlog = async () => {
    try {
      const response = await axios.get(API_URL); // ✅ FIXED
      console.log("Blog response:", response.data);
      setBlogData(response.data.data);
    } catch (error) {}
  };
  useEffect(() => {
    getBlog();
  }, []);

  const handleNavigate = (blog) => {
    navigate(`/blog-detail`, { state: { blog } });
  };
  
  return (
    <div className="blogs">
      <div className="container my-5">
        <div className="border-bottom my-5">
          <div className="main20 d-flex justify-content-between align-items-center">
            <div className="box">
              <h5 className="fw-bold">Popular Blogs:</h5>
            </div>
            <div className="box">
              <div className="dropdown border-buttom">
                <button
                  className="btn btn-white border rounded-pill d-flex justify-content-between align-items-center"
                  type="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{
                    width: "300px",
                    height: "50px",
                    padding: "0 10px",
                    boxShadow: "0 0 6px rgba(0,0,0,0.05)",
                  }}
                >
                  <span className="text-truncate" style={{ fontSize: "20px" }}>
                    Cat
                  </span>
                  <i className="bi bi-chevron-down ms-1"></i>
                </button>
                <ul className="dropdown-menu dropdown-menu-end mt-2 rounded-4">
                  <li>
                    <a className="dropdown-item" href="#">
                      Product & Design
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Engineering
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Data Analytics
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="row g-4">
          {Array.isArray(blogData) &&
            blogData.map((blog, idx) => (
              <div className="col-md-4" key={idx}>
                <div
                  className="card h-100 rounded"
                  onClick={() => handleNavigate(blog)}
                  style={{ cursor: "pointer" }}
                >
                  <img
                    src={`${BASE_URL}/blog/images/${blog.image}`}
                    className="card-img-top blog-img"
                    alt="Article visual"
                  />
                  <div className="card-body">
                    <h5 className="badge bg-dark me-2">{blog.title}</h5>
                    <br />
                    <span className="card-title mt-3 fw-bold">
                      {blog.heading}
                    </span>
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
                      onClick={(e) => {
                        e.stopPropagation(); // 👈 stop bubbling to card
                        handleNavigate(blog);
                      }}
                    >
                      Explore More
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
export default Blogs;
