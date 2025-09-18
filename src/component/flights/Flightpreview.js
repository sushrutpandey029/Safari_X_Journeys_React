// src/components/FlightPreview.js
import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";   // ✅ add this
import "./Flights.css";

function FlightPreview() {
  const navigate = useNavigate();   // ✅ hook initialize

  const flights = [
    { route: "Chennai ↔ Mumbai", code: "MAA–BOM", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUzqvRyQXKu8r47QONwkvx8XCHxKXuSIADRA&s" },
    { route: "Delhi ↔ Ahmedabad", code: "DEL-AMD", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrVsPRKsu_D6CzzJr260cDH3zozOir4ykYBw&s" },
    { route: "Delhi ↔ Lucknow", code: "DEL-LKO", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSR5SCk1k4iWyfJGL6wvs88uDjA5kq0pjFK4Q&s" },
    { route: "Mumbai ↔ Chennai", code: "BOM-MAA", image: "https://img.12go.asia/0/fit/1024/0/ce/1/plain/s3://12go-web-static/static/images/upload-media/4271.jpeg" },
    { route: "Mumbai ↔ Dubai", code: "BOM-DXB", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSU4_qU7y2ajoFif0OUiVgXTQH3cqPVAU2qhA&s" },
    { route: "Mumbai ↔ Kolkata", code: "BOM-CCU", image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTPzjeFg1xoMHSGjHcon8xfEC_DUtB9l4E1-w&s" },
  ];

  return (
    <div className="top-flight-routes">
      <Container>
        <h2>
          Top Flight <span> Routes</span>
        </h2>

        <Row className="g-4">
          {flights.map((flight, index) => (
            <Col key={index} xs={12} sm={6} md={4}>
              <Card
                className="flight-card shadow-sm text-center"
                onClick={() => navigate("/flight")}   // ✅ click par navigate karega
                style={{ cursor: "pointer" }}
              >
                <Card.Img
                  variant="top"
                  src={flight.image}
                  alt={flight.route}
                />
                <Card.Body className="p-3 pt-0">
                  <h6>{flight.route}</h6>
                  <p className="code mb-0">{flight.code}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
}

export default FlightPreview;

