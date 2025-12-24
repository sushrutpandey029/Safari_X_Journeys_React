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
    <div className="Testionials" style={{ marginTop: "100px" }}>
      <div className="container">
        <div className="row align-items-center mb-4">
          <div className="col-sm-9">
            <h2>
              Our Recent <span>Testimonials</span>
            </h2>
          </div>

          {testimonialData?.map((item) => (
            <div key={item.id} className="col-sm-4 mb-4">
              <div className="testimonial-card">
                <div className="stars">{"★".repeat(item.rating)}</div>

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
    </div>
  );
}

export default Testimonials;
