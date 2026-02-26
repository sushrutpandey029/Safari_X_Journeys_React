import React from 'react'

function Populardesitnatiodummy() {
  return (
    <div>Populardesitnatiodummy</div>
  )
}

export default Populardesitnatiodummyimport React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getIndianAirports } from "../services/flightService";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Dropdown, Button, Spinner, Form, Row, Col } from "react-bootstrap";

function FlightPopularDestination() {
  const navigate = useNavigate();
  const [tripType, setTripType] = useState("oneway");
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [activeFromIndex, setActiveFromIndex] = useState(null);
  const [activeToIndex, setActiveToIndex] = useState(null);
  const [flights, setFlights] = useState([
    {
      id: 1,
      from: "DEL",
      fromCity: "Delhi",
      to: "",
      toCity: "",
      date: new Date().toISOString().split("T")[0],
      returnDate: null,
    },
  ]);

  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");
  const fromRef = useRef(null);
  const toRef = useRef(null);

  // =============================
  // Fixed Popular Destinations
  // =============================
  const popularDestinations = [
    { code: "BOM", city: "Mumbai", image: "/Images/dharamshala.jpg" },
    { code: "CCU", city: "Kolkata", image: "/Images/dharamshala.jpg" },
    { code: "MAA", city: "Chennai", image: "/Images/dharamshala.jpg" },
    { code: "HYD", city: "Hyderabad", image: "/Images/dharamshala.jpg" },
    { code: "CMB", city: "Colombo", image: "/Images/dharamshala.jpg" },
    { code: "PEK", city: "Beijing", image: "/Images/dharamshala.jpg" },
    { code: "EWR", city: "New York", image: "/Images/dharamshala.jpg" },
    { code: "LCY", city: "London", image: "/Images/dharamshala.jpg" },
  ];

  // =============================
  // State
  // =============================

  const [airports, setAirports] = useState([]);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [loadingAirports, setLoadingAirports] = useState(false);

  const [searchParams, setSearchParams] = useState({
    from: "DEL",
    fromCity: "Delhi",
    to: "",
    toCity: "",
    date: new Date(Date.now() + 24 * 60 * 60 * 1000),
    returnDate: null,
    adults: 1,
    children: 0,
    infants: 0,
    travelClass: "Economy",
  });

  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);

  const dropdownRef = useRef(null);

  const handleMultiFromSelect = (airport, index) => {
    setFlights((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        from: airport.airport_code,
        fromCity: airport.city_name,
      };

      return updated;
    });

    setActiveFromIndex(null);
  };

  const handleMultiToSelect = (airport, index) => {
    setFlights((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        to: airport.airport_code,
        toCity: airport.city_name,
      };

      return updated;
    });

    setActiveToIndex(null);
  };

  // =============================
  // Load Airports
  // =============================

  useEffect(() => {
    const loadAirports = async () => {
      try {
        setLoadingAirports(true);

        const resp = await getIndianAirports();

        if (resp?.data && Array.isArray(resp.data)) {
          setAirports(resp.data);
        }
      } catch (err) {
        console.error("Airport load error", err);
      } finally {
        setLoadingAirports(false);
      }
    };

    loadAirports();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }

      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // check if clicked inside any dropdown
      if (!event.target.closest(".airport-dropdown")) {
        setActiveFromIndex(null);
        setActiveToIndex(null);

        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================
  // Filter Airports
  // =============================

  const filterAirports = (searchText) => {
    if (!searchText) return airports.slice(0, 15);

    const text = searchText.toLowerCase();

    return [
      ...airports.filter(
        (a) =>
          a.city_name?.toLowerCase().startsWith(text) ||
          a.airport_code?.toLowerCase().startsWith(text),
      ),

      ...airports.filter(
        (a) =>
          !(
            a.city_name?.toLowerCase().startsWith(text) ||
            a.airport_code?.toLowerCase().startsWith(text)
          ) &&
          (a.city_name?.toLowerCase().includes(text) ||
            a.airport_name?.toLowerCase().includes(text) ||
            a.country_name?.toLowerCase().includes(text)),
      ),
    ].slice(0, 15);
  };

  const handleFromSelect = (airport) => {
    setFlights((prev) => {
      const updated = [...prev];

      updated[0] = {
        ...updated[0],
        from: airport.airport_code,
        fromCity: airport.city_name,
      };

      return updated;
    });

    setShowFromSuggestions(false);
  };

  // =============================
  // Handle Airport Select
  // =============================

  const handleToSelect = (airport) => {
    setFlights((prev) => {
      const updated = [...prev];

      updated[0] = {
        ...updated[0],
        to: airport.airport_code,
        toCity: airport.city_name,
      };

      return updated;
    });

    setShowToSuggestions(false);
  };

  // =============================
  // Handle Search
  // =============================

  const handleSearch = () => {
    if (!flights[0].to) {
      alert("Please select destination");
      return;
    }
    if (flights[0].from === flights[0].to) {
      alert("Source and destination cannot be same");
      return;
    }

    navigate("/flight", {
      state: {
        tripType,

        flights,

        passengers: {
          adults,
          children,
          infants,
        },

        travelClass,
      },
    });
  };

  // =============================
  // Handle Card Click
  // =============================

  const handleCardClick = (dest) => {
    const updatedFlights = [...flights];

    updatedFlights[0].to = dest.code;

    navigate("/flight", {
      state: {
        tripType,

        flights: updatedFlights,

        passengers: {
          adults,
          children,
          infants,
        },

        travelClass,
      },
    });
  };

  // =============================
  // Traveller UI
  // =============================

  const renderButtons = (count, setter, max = 9) => {
    return (
      <div className="d-flex flex-wrap gap-2">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            className={`btn btn-sm ${
              count === i ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setter(i)}
            type="button"
          >
            {i}
          </button>
        ))}
      </div>
    );
  };

  const addCity = () => {
    if (flights.length >= 4) return;

    const lastFlight = flights[flights.length - 1];

    setFlights([
      ...flights,
      {
        id: Date.now(),
        from: lastFlight.to || "",
        to: "",
        date: lastFlight.date,
      },
    ]);
  };

  const removeCity = (index) => {
    const updated = flights.filter((_, i) => i !== index);
    setFlights(updated);
  };

  // =============================
  // Render
  // =============================

  return (
    <div className="book-flight" style={{ marginTop: "100px" }}>
      <div className="container">
        {/* =============================
            Filter Section
        ============================= */}

        <div className="row g-3 align-items-end mt-5">
          {/* Trip Type */}
          <div className="col-md-2">
            <label>Trip Type</label>

            <select
              className="form-control"
              value={tripType}
              onChange={(e) => {
                const newTripType = e.target.value;

                setTripType(newTripType);

                if (newTripType === "multi") {
                  if (flights.length === 1) {
                    setFlights([
                      flights[0],
                      {
                        id: Date.now(),
                        from: flights[0].to || "",
                        to: "",
                        date:
                          flights[0].date ||
                          new Date().toISOString().split("T")[0],
                      },
                    ]);
                  }
                } else if (newTripType === "round") {
                  setFlights([
                    {
                      ...flights[0],
                      returnDate: flights[0].returnDate || flights[0].date,
                    },
                  ]);
                } else {
                  setFlights([flights[0]]);
                }
              }}
            >
              <option value="oneway">One Way</option>
              <option value="round">Round Trip</option>
              <option value="multi">Multi City</option>
            </select>
          </div>
          {/* FROM */}
          <div className="col-md-3 position-relative" ref={fromRef}>
            <label>From</label>

            <input
              className="form-control"
              value={flights[0]?.fromCity || ""}
              placeholder="Select origin"
              onChange={(e) => {
                const value = e.target.value;

                setFlights((prev) => {
                  const updated = [...prev];
                  updated[0].fromCity = value;
                  return updated;
                });

                setShowFromSuggestions(true);
              }}
              onFocus={() => setShowFromSuggestions(true)}
            />

            {showFromSuggestions && (
              <div className="position-absolute w-100 bg-white border shadow z-3 max-h-200 overflow-auto">
                {loadingAirports ? (
                  <div className="p-2">Loading...</div>
                ) : (
                  filterAirports(flights[0]?.fromCity).map((airport) => {
                    // ✅ check if same as TO airport
                    const isDisabled = airport.airport_code === flights[0]?.to;

                    return (
                      <div
                        key={airport.airport_code}
                        className={`p-2 border-bottom ${
                          isDisabled ? "text-muted bg-light" : ""
                        }`}
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.6 : 1,
                        }}
                        onClick={() => {
                          // ✅ prevent selecting same airport
                          if (isDisabled) return;

                          handleFromSelect(airport);
                        }}
                      >
                        {/* Airport Name + Code */}
                        <div className="fw-semibold">
                          {airport.airport_name} ({airport.airport_code})
                        </div>

                        {/* City + Country */}
                        <div className="small text-muted">
                          {airport.city_name}, {airport.country_name}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* TO */}
          <div className="col-md-3 position-relative" ref={toRef}>
            <label>To</label>

            <input
              className="form-control"
              value={flights[0]?.toCity || ""}
              placeholder="Select destination"
              onChange={(e) => {
                const value = e.target.value;

                setFlights((prev) => {
                  const updated = [...prev];
                  updated[0].toCity = value;
                  return updated;
                });

                setShowToSuggestions(true);
              }}
              onFocus={() => setShowToSuggestions(true)}
            />

            {showToSuggestions && (
              <div className="position-absolute w-100 bg-white border shadow z-3 max-h-200 overflow-auto">
                {loadingAirports ? (
                  <div className="p-2">Loading...</div>
                ) : (
                  filterAirports(flights[0]?.toCity).map((airport) => {
                    // ✅ disable if same as FROM airport
                    const isDisabled =
                      airport.airport_code === flights[0]?.from;

                    return (
                      <div
                        key={airport.airport_code}
                        className={`p-2 border-bottom ${
                          isDisabled ? "text-muted bg-light" : ""
                        }`}
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                          opacity: isDisabled ? 0.6 : 1,
                        }}
                        onClick={() => {
                          // ✅ prevent selecting same airport
                          if (isDisabled) return;

                          handleToSelect(airport);
                        }}
                      >
                        {/* Airport Name + Code */}
                        <div className="fw-semibold">
                          {airport.airport_name} ({airport.airport_code})
                        </div>

                        {/* City + Country */}
                        <div className="small text-muted">
                          {airport.city_name}, {airport.country_name}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* DATE */}
          <div className="col-md-2">
            <label>Date</label>

            <DatePicker
              selected={searchParams.date}
              onChange={(date) =>
                setSearchParams((prev) => ({
                  ...prev,
                  date,
                }))
              }
              minDate={new Date()}
              className="form-control"
              dateFormat="dd MMM yyyy"
            />
          </div>
          {tripType === "round" && (
            <div className="col-md-2">
              <label>Return Date</label>

              <DatePicker
                selected={
                  searchParams.returnDate
                    ? searchParams.returnDate
                    : searchParams.date
                }
                onChange={(date) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    returnDate: date,
                  }))
                }
                minDate={searchParams.date}
                className="form-control"
                dateFormat="dd MMM yyyy"
              />
            </div>
          )}
          {/* PASSENGER */}
          <div className="col-md-3">
            <label>Travellers & Class</label>

            <Dropdown
              show={showTravellerDropdown}
              onToggle={(isOpen) => setShowTravellerDropdown(isOpen)}
            >
              <Dropdown.Toggle className="form-control">
                {adults} Adult{adults > 1 ? "s" : ""},{children} Child,
                {infants} Infant,
                {travelClass}
              </Dropdown.Toggle>

              <Dropdown.Menu className="p-3">
                <Form.Label>Adults</Form.Label>
                {renderButtons(adults, setAdults, 9)}

                <Form.Label>Children</Form.Label>
                {renderButtons(children, setChildren, 6)}

                <Form.Label>Infants</Form.Label>
                {renderButtons(infants, setInfants, 6)}

                <hr />

                <Form.Label>Class</Form.Label>

                {["Economy", "Premium Economy", "Business", "First Class"].map(
                  (cls) => (
                    <Button
                      key={cls}
                      variant={
                        travelClass === cls ? "primary" : "outline-secondary"
                      }
                      size="sm"
                      onClick={() => setTravelClass(cls)}
                    >
                      {cls}
                    </Button>
                  ),
                )}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* SEARCH */}
          <div className="col-md-2">
            <button className="explore-btn w-100" onClick={handleSearch}>
              Search
            </button>
          </div>
        </div>

        {tripType === "multi" &&
          flights.slice(1).map((flight, index) => {
            const actualIndex = index + 1;

            return (
              <Row key={flight.id}>
                <Col md={2}>
                  <div className="position-relative airport-dropdown">
                    <input
                      className="form-control"
                      value={flight.fromCity || ""}
                      placeholder="From"
                      onFocus={() => setActiveFromIndex(actualIndex)}
                      onChange={(e) => {
                        const value = e.target.value;

                        setFlights((prev) => {
                          const updated = [...prev];
                          updated[actualIndex].fromCity = value;

                          return updated;
                        });

                        setActiveFromIndex(actualIndex);
                      }}
                    />

                    {activeFromIndex === actualIndex && (
                      <div className="position-absolute w-100 bg-white border shadow z-3">
                        {filterAirports(flight.fromCity).map((airport) => {
                          const isDisabled = airport.airport_code === flight.to;

                          return (
                            <div
                              key={airport.airport_code}
                              className={`p-2 ${isDisabled ? "text-muted" : ""}`}
                              onClick={() => {
                                if (isDisabled) return;

                                handleMultiFromSelect(airport, actualIndex);
                              }}
                            >
                              <div>
                                {airport.airport_name} ({airport.airport_code})
                              </div>
                              <div className="small text-muted">
                                {airport.city_name}, {airport.country_name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Col>

                <Col md={2}>
                  <div className="position-relative airport-dropdown">
                    <input
                      className="form-control"
                      value={flight.toCity || ""}
                      placeholder="To"
                      onFocus={() => setActiveToIndex(actualIndex)}
                      onChange={(e) => {
                        const value = e.target.value;

                        setFlights((prev) => {
                          const updated = [...prev];
                          updated[actualIndex].toCity = value;

                          return updated;
                        });

                        setActiveToIndex(actualIndex);
                      }}
                    />

                    {activeToIndex === actualIndex && (
                      <div className="position-absolute w-100 bg-white border shadow z-3">
                        {filterAirports(flight.toCity).map((airport) => {
                          const isDisabled =
                            airport.airport_code === flight.from;

                          return (
                            <div
                              key={airport.airport_code}
                              className={`p-2 ${isDisabled ? "text-muted" : ""}`}
                              onClick={() => {
                                if (isDisabled) return;

                                handleMultiToSelect(airport, actualIndex);
                              }}
                            >
                              <div>
                                {airport.airport_name} ({airport.airport_code})
                              </div>
                              <div className="small text-muted">
                                {airport.city_name}, {airport.country_name}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Col>

                <Col md={2}>
                  <DatePicker
                    selected={flight.date ? new Date(flight.date) : null}
                    onChange={(date) => {
                      const updated = [...flights];
                      updated[actualIndex].date = date
                        .toISOString()
                        .split("T")[0];
                      setFlights(updated);
                    }}
                    className="form-control"
                  />
                </Col>

                <Col md={2}>
                  <Button onClick={() => removeCity(actualIndex)}>
                    REMOVE
                  </Button>

                  {actualIndex === flights.length - 1 && (
                    <Button onClick={addCity}>ADD</Button>
                  )}
                </Col>
              </Row>
            );
          })}

        {/* =============================
            Popular Destinations
        ============================= */}

        <div className="row mt-5">
          <h2>
            Popular Flights from <span>Delhi</span>
          </h2>

          {popularDestinations.map((dest, index) => (
            <div key={index} className="col-md-3 col-6 mb-4">
              <div
                className="destination-card"
                style={{ cursor: "pointer" }}
                onClick={() => handleCardClick(dest)}
              >
                <img src={dest.image} className="img-fluid" alt={dest.city} />

                <div className="card-destination">Delhi → {dest.city}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FlightPopularDestination;
