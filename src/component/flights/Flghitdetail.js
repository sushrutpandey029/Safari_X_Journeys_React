// FlightDetail.js
import React from "react";
import { Card, Row, Col, Button, Spinner, Alert } from "react-bootstrap";


// Utility functions
const formatTime = (timeStr) => {
  if (!timeStr) return "--:--";
  const date = new Date(timeStr);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

const formatDuration = (duration) => duration || "N/A";
const formatPrice = (price) => price || 0;

const FlightDetail = ({ searchLoading, searchError, searchResults, travelClass }) => {
  if (searchLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Searching flights...</span>
        </Spinner>
        <p className="mt-2">Searching for the best flights...</p>
      </div>
    );
  }

  if (searchError) {
    return (
      <Alert variant="danger" className="text-center">
        {searchError}
      </Alert>
    );
  }

  if (!searchResults || searchResults.length === 0) {
    return (
      <div className="text-center py-5 text-muted">
        <h5>No flights found</h5>
        <p>Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <>
      {searchResults.map((flight, index) => {
        const segments = flight.Segments || [];
        const firstSegment = segments[0]?.[0] || {};
        const airline = firstSegment.Airline || {};
        const origin = firstSegment.Origin || {};
        const destination = firstSegment.Destination || {};
        const fare = flight.Fare || {};
        const offeredFare = fare.OfferedFare || fare.PublishedFare || 0;
        const savings = (fare.PublishedFare || 0) - offeredFare;

        return (
          <Card key={index} className="shadow-sm p-3 mb-4 rounded-3">
            <Row className="align-items-center">
              {/* Airline Info */}
              <Col md={3} className="d-flex align-items-center">
                <div
                  className="bg-light rounded p-2 me-3 d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <strong className="text-primary">{airline.AirlineCode || "AI"}</strong>
                </div>
                <div>
                  <h6 className="mb-0">{airline.AirlineName || "Air India"}</h6>
                  <small className="text-muted">
                    {airline.FlightNumber ? `Flight ${airline.FlightNumber}` : "Flight 2993"}
                  </small>
                  <br />
                  <small className={flight.IsRefundable ? "text-success" : "text-danger"}>
                    {flight.IsRefundable ? "🔄 Refundable" : "❌ Non-Refundable"}
                  </small>
                </div>
              </Col>

              {/* Departure */}
              <Col md={2} className="text-center">
                <h5 className="mb-0">{formatTime(origin.DepTime)}</h5>
                <small className="text-muted">{origin.Airport?.AirportCode || "DEL"}</small>
                <br />
                <small className="text-muted small">{origin.Airport?.CityName || "Delhi"}</small>
              </Col>

              {/* Duration */}
              <Col md={2} className="text-center">
                <p className="mb-1 text-success fw-bold">{formatDuration(firstSegment.Duration)}</p>
                <small className="text-muted">{firstSegment.StopOver ? "With Stop" : "Non stop"}</small>
                <br />
                <small className="text-muted small">{firstSegment.Craft || "32N"}</small>
              </Col>

              {/* Arrival */}
              <Col md={2} className="text-center">
                <h5 className="mb-0">{formatTime(destination.ArrTime)}</h5>
                <small className="text-muted">{destination.Airport?.AirportCode || "BOM"}</small>
                <br />
                <small className="text-muted small">{destination.Airport?.CityName || "Mumbai"}</small>
              </Col>

              {/* Price + Button */}
              <Col md={3} className="text-end">
                <h5 className="fw-bold text-primary">₹ {formatPrice(offeredFare)}</h5>
                <small className="text-muted">per adult</small>
                {savings > 0 && (
                  <>
                    <br />
                    <small className="text-success small">Save ₹{formatPrice(savings)}</small>
                  </>
                )}
                <br />
                <Button variant="primary" size="sm" className="mt-2 rounded-pill px-4">
                  VIEW PRICES
                </Button>
              </Col>
            </Row>

            {/* Flight Details */}
            <Row className="mt-3">
              <Col>
                <div className="bg-light p-2 rounded-2">
                  <small className="text-muted">
                    <strong>Baggage:</strong> {firstSegment.Baggage || "15 KG"} • 
                    <strong> Cabin:</strong> {firstSegment.CabinBaggage || "7 KG"} • 
                    <strong> Class:</strong> {travelClass}
                  </small>
                </div>
              </Col>
            </Row>

            {/* Deal */}
            <Row className="mt-2">
              <Col>
                <div className="bg-warning bg-opacity-25 p-2 rounded-2">
                  <small className="text-dark">
                    🔴 EXCLUSIVE DEAL: Get FLAT ₹266 OFF using <b>TRYMMT</b> code for you
                  </small>
                </div>
              </Col>
            </Row>

            {/* Additional Info */}
            <Row className="mt-2">
              <Col className="text-end">
                <a href="#" className="text-primary">
                  View Flight Details
                </a>
              </Col>
            </Row>
          </Card>
        );
      })}
    </>
  );
};

export default FlightDetail;
