import React, { useEffect, useState } from "react";
import { BASE_URL } from "../services/apiEndpoints";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

function Blogdetail() {
  const location = useLocation();
  const blog  = location.state.blog;
  console.log("blogg", blog);
  const [error, setError] = useState("");

  

  return (
    <div className="blog-detail">
      <div className="blog-detail py-5" style={{marginTop:"50px"}}>
  <div className="container">
    
    {/* Blog Image */}
    <div className="blog-image-wrapper mb-4">
      <img
        src={`${BASE_URL}/blog/images/${blog.image}`}
        alt={`blog-${blog.id}`}
        className="blog-image1 rounded shadow-sm"
      />
    </div>

    {/* Blog Content */}
    <div className="blog-content mx-auto">
      <h3 className="blog-heading mb-3">{blog.heading}</h3>

      {blog.title && <h5 className="blog-title text-muted mb-3">{blog.title}</h5>}

      <h6 className="text-secondary mb-4">
        {new Date(blog.createdAt).toLocaleDateString("en-US", {
          year: "numeric",
          day: "numeric",
          month: "long",
        })}
      </h6>

      <p className="blog-description">{blog.description}</p>
    </div>
  </div>
</div>


     
    </div>
  );
}

export default Blogdetail;
