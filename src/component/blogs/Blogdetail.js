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
      <div className="container mt-5">
        <img
          src={`${BASE_URL}/blog/images/${blog.image}`}
          alt={`blog-${blog.id}`}
          className="blog-image1"
        />

         <h3 className="blog-heading">{blog.heading}</h3>

         {blog.title && <h5 className="blog-title">{blog.title}</h5>}
        <h6>
          {new Date(blog.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            day: "numeric",
            month: "long",
          })}
        </h6>
         <p className="blog-description">{blog.description}</p>

        <div className="">
          <h1>Related Blog</h1>
        </div>
      </div>

     
    </div>
  );
}

export default Blogdetail;
