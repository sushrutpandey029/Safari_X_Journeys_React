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

  
 <div className="Testimonials" style={{ margin: "50px" }}>

  {/* -------- PAGE HEADING -------- */}
  <div className="heading-section text-center mb-5">
    <h2 className="main-title">
      Our Client <span>Testimonials</span>
    </h2>
    <p className="sub-title">
      What our clients say after using our services
    </p>
  </div>

  {/* -------- AUTO 2 ROWS (3 CARDS EACH) -------- */}
  <div className="testimonial-row">
    {Array.isArray(testimonialData) &&
      testimonialData.slice(0, 6).map((item) => (   // 6 cards = 2 rows
        <div key={item.id} className="testimonial-card">

          {/* Stars */}
          <div className="stars">
            {"★".repeat(item.rating)}
            {"☆".repeat(5 - item.rating)}
          </div>

          {/* Description */}
          <p className="testimonial-text">
            {item.description?.substring(0, 140)}...
          </p>

          {/* User */}
          <div className="testimonial-user">
            <img
              src={`${BASE_URL}/testimonial/images/${item.image}`}
              alt={item.name}
              className="user-img"
            />
            <h4 className="user-name">{item.name}</h4>
          </div>

        </div>
      ))}
  </div>

</div>


);

}

export default Testimonials;
