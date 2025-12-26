import React, { useEffect, useState } from "react";
import { fetchCityList } from "../services/hotelService";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Row, Col } from "react-bootstrap";

function HotelPopularDestination() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);

  const City = [
    { name: "", image: "/Images/Goa.jpg" },
    { name: "", image: "/Images/himachal Pradesh paragpur.jpg" },
    { name: "", image: "/Images/Jammu Jammu Kashmir.jpg" },
    { name: "", image: "/Images/Ooty.jpg" },
    { name: "", image: "/Images/Pelling Sikhim.jpg" },
    { name: "", image: "/Images/Katra Jammu Kashmir.jpg" },
    { name: "", image: "/Images/khass Nagrota.jpg" },
    { name: "", image: "/Images/Ladhak.jpg" },
  ];
  const handleCityClick = (city) => {
    navigate("/hotel-list", {
      state: {
        city: city.Code,
        cityName: city.Name,
        country: "IN", // optional, if you want to fix to India
      },
    });
  };

  useEffect(() => {
    const loadCities = async () => {
      try {
        // ✅ API call
        const resp = await fetchCityList("IN");
        console.log("resp in citylist", resp);
        if (resp.success && Array.isArray(resp.data)) {
          setCities(resp.data); // sirf data set karenge
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      }
    };

    loadCities();
  }, []);
  return (
    <div className="book-hotel">
      <div className="container">
        <div className="row">
          <div className="col-sm-12 d-flex">
            <div className="col-sm-6">
              <h2>
                Top Trending <span> Destinations</span>
              </h2>
            </div>
          </div>

          {City &&
            City.map((dest, index) => (
              <Col key={index} md={6} lg={3}>
                <div
                  className="place destination-card"
                  onClick={() => handleCityClick(cities[index])}
                >
                  <img
                    src={dest.image}
                    alt={cities[index]?.Name || "Destination"}
                  />
                  <div className="card-destination">
                    {cities.length > 0 ? cities[index]?.Name : "Loading..."}
                  </div>
                </div>
              </Col>
            ))}
        </div>
      </div>
    </div>
  );
}

export default HotelPopularDestination;
