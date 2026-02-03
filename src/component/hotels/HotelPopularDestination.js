import React, { useEffect, useState } from "react";
import { fetchCityList } from "../services/hotelService";
import { Link, useNavigate } from "react-router-dom";
import { Card, Button, Row, Col } from "react-bootstrap";

function HotelPopularDestination() {
  const navigate = useNavigate();
  const [cities, setCities] = useState([]);

  const City = [
    { name: "", image: "/Images/Goa.jpg" },
    { name: "", image: "/Images/jammu.jpg"},
    { name: "", image: "/Images/kaashmir.jpg" },
    { name: "", image: "/Images/Ooty.jpg" },
    { name: "", image: "/Images/Pelling_Sikhim.jpg" },
    { name: "", image: "/Images/tamilnaduooty.jpg" },
    { name: "", image: "/Images/sikkim.jpg" },
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
             <Col key={index} xs={6} lg={3}>
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

        <div class="row">
          <div class="col-sm-12">
            <h4>Geography</h4>
            <p>
              India is located in the Northern Hemisphere, surrounded by the Himalayas in the north, the Indian Ocean in the south, and the Arabian Sea in the west and Bay of Bengal in the east.
            </p>
            <p>
              The country has diverse landscapes, including:
            </p>
            <ul>
              <li> Snowy Himalayas</li>
              <li> Great Indo-Gangetic Plains</li>
              <li> Thar Desert</li>
              <li> Hilly north-east region</li>
              <li> Islands (Andaman & Nicobar, Lakshadweep)</li>
            </ul>
            <p>India's mainland extends from North Indira Ridge in Kashmir to South Kanyakumari in Tamil Nadu (3214 km) and from west Rann of kutch in Gujarat to east Kibuthu in Arunachal Pradesh (2933 km).</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HotelPopularDestination;
