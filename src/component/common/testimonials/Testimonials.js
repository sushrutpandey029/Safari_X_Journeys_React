import React, { useState, useEffect } from "react";
import { BASE_URL } from "../../services/apiEndpoints";
import { fetchTestimonialList } from "../../services/commonService";

import "./Testimonials.css";

function Testimonials() {
  const [testimonialData, setTestimonialData] = useState([]);

  const getTestimonials = async () => {
    try {
      const response = await fetchTestimonialList();
      console.log("Testimonials Response: ", response);
      setTestimonialData(response.data.data);
    } catch (error) {
      console.log("error in fetching testimonial list", error.response);
    }
  };

  useEffect(() => {
    getTestimonials();
  }, []);

  return (
    <div className="Testimonials">
      <div className="card-container">
        {Array.isArray(testimonialData) &&
          testimonialData.map((item) => (
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
  );
}

export default Testimonials;
