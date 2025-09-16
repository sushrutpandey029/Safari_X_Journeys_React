// FlightPreview.js
import React from "react";
import { Link } from "react-router-dom";
import "./Flights.css";
import { Container, Row, Col, Card } from "react-bootstrap";


function FlightPreview({ flights, BASE_URL }) {
  return (
    <div className="best-flight py-5">
  <div className="container">
    <div className="row">
      <div className="col-sm-12 d-flex">
        {/* ✅ Left side title */}
        <div className="col-sm-6">
          <h2>
            Find the <span><br /> Best Flights ✈️</span>
          </h2>
          <p className="perra">
            Discover affordable and comfortable flights to your dream
            destinations. Compare, choose, and book with just one click.
          </p>
        </div>

        {/* ✅ Right side button */}
        <div className="col-sm-6 text-end my-5">
          <Link to={"/flight-lists"}>
            <button className="explore-btn">Explore More</button>
          </Link>
        </div>
      </div>

      {/* ✅ Flight Cards */}
      {flights && flights.slice(0, 4).map((flight, index) => (
        <Col key={index} md={6} lg={3}>
          <Card
            className="destination-card"
            style={{ cursor: "pointer" }}
            // onClick={() => handleFlightClick(flight)} // you can define click handler
          >
            {/* Flight image */}
            <Card.Img
              variant="top"
              src={`${BASE_URL}/flight/images/${flight.imagePath}`}
              alt={flight.flightName}
            />

            <Card.Body>
              <Card.Title>
                {flight.flightName}
              </Card.Title>
              <p className="price">Starting - {flight.price}/ticket</p>
              <button className="explore-btn w-100 mt-2">BOOK NOW</button>
            </Card.Body>
          </Card>
        </Col>
      ))}
    </div>
  </div>
</div>

  );
}
export default FlightPreview;