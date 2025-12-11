import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./Places.css";

const staticImages = [
  "./images/place1.jpg",
  "./images/place2.png",
  "./images/place3.jpg",
  "./images/place2.png",
];

function Places() {
  const location = useLocation();
  const navigate = useNavigate();
  const { category } = location.state || {}; // received from homepage

  if (!category) return <p>No category selected</p>;

  const handleCityClick = (city) => {
    // Navigate to hotel list page with default city
    navigate("/hotel-list", {
      state: {
        city: city.code,
        cityName: city.name,
        country: "IN", // optional
      },
    });
  };

  return (
    <div className="place-box">
      <div className="container py-5">
        <div className="row mb-4" style={{marginTop : "100px"}}>
          <div className="col-sm-8">
            <h2>{category.category} Destinations</h2>
          </div>
          <div className="col-sm-4">
           
          </div>
        </div>

        <div className="row g-4">
          {category.cities.map((city, index) => (
            <div className="col-md-3" key={city.code}>
              <div
                className="card h-100 shadow-sm rounded-4 border"
                style={{ cursor: "pointer" }}
                onClick={() => handleCityClick(city)} // added click
              >
                <img
                  src={staticImages[index % staticImages.length]}
                  className="card-img-top rounded-top-4"
                  alt={city.name}
                />
                <div className="card-body">
                  <h5 className="fw-bold">{city.name}</h5>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Places;
