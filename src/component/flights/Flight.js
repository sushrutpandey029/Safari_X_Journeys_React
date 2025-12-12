import React, { useState, useEffect, useRef } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Dropdown,
  Spinner,
  Alert,
} from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./Flights.css";
import axios from "axios";
import {
  getIndianAirports,
  Flight_authenticate,
  Flight_search,
} from "../services/flightService";
import { Modal } from "react-bootstrap";
import FlightDetail from "./Flghitdetail";
import Loading from "../common/loading";

const Flight = () => {
  // Flight segments (multi-city form)
  const [flights, setFlights] = useState([{ from: "", to: "", date: "" }]);

  useEffect(() => {
    if (!flights[0]?.date) {
      const newFlights = [...flights];
      newFlights[0].date = new Date().toISOString().split("T")[0];
      setFlights(newFlights);
    }
  }, []);

  // Dynamic airports data
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Authentication and search states
  const [token, setToken] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // User details
  const [userIP, setUserIP] = useState("");
  const [tripType, setTripType] = useState("oneway");
  const [searchData, setSearchData] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");

  const [TraceId, setTraceId] = useState("");

  // fare rule detail
  const [showModal, setShowModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);

  const [visibleCount, setVisibleCount] = useState(6); // first 6 cards

  // Infinite Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setVisibleCount((prev) => prev + 6); // load next 6
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // ============ FILTER STATES ============
  const [filters, setFilters] = useState({
    refundableOnly: false,
    airlines: [],
    stops: [],
    priceRange: { min: 0, max: 50000 },
    departureTimes: [],
    durations: [],
  });

  const [toggle, setToggle] = useState({
    airlines: true,
    stops: true,
    price: true,
    departure: true,
    duration: true,
  });

  // ============ FILTER FUNCTIONS ============
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleAirlineFilter = (airlineCode, isChecked) => {
    setFilters((prev) => ({
      ...prev,
      airlines: isChecked
        ? [...prev.airlines, airlineCode]
        : prev.airlines.filter((code) => code !== airlineCode),
    }));
  };

  const handleStopFilter = (stopCount, isChecked) => {
    setFilters((prev) => ({
      ...prev,
      stops: isChecked
        ? [...prev.stops, stopCount]
        : prev.stops.filter((stop) => stop !== stopCount),
    }));
  };

  const handlePriceRangeChange = (type, value) => {
    setFilters((prev) => ({
      ...prev,
      priceRange: {
        ...prev.priceRange,
        [type]: value,
      },
    }));
  };

  const handleDepartureTimeFilter = (timeRange, isChecked) => {
    setFilters((prev) => ({
      ...prev,
      departureTimes: isChecked
        ? [...prev.departureTimes, timeRange]
        : prev.departureTimes.filter(
            (range) => !(range[0] === timeRange[0] && range[1] === timeRange[1])
          ),
    }));
  };

  const handleDurationFilter = (duration, isChecked) => {
    setFilters((prev) => ({
      ...prev,
      durations: isChecked
        ? [...prev.durations, duration.label]
        : prev.durations.filter((d) => d !== duration.label),
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      refundableOnly: false,
      airlines: [],
      stops: [],
      priceRange: { min: 0, max: 50000 },
      departureTimes: [],
      durations: [],
    });
  };

  // Filter application function - API data ke according
  const applyFilters = (flights) => {
    if (!flights || flights.length === 0) return [];

    return flights.filter((flight) => {
      // Refundable filter
      if (filters.refundableOnly && !flight.IsRefundable) {
        return false;
      }

      // Airline filter - API data structure ke hisab se
      if (filters.airlines.length > 0) {
        let airlineCode = "";

        // Multiple ways to get airline code from API response
        if (flight.Airline && flight.Airline.AirlineCode) {
          airlineCode = flight.Airline.AirlineCode;
        } else if (
          flight.Segments &&
          flight.Segments[0] &&
          flight.Segments[0][0] &&
          flight.Segments[0][0].Airline
        ) {
          airlineCode = flight.Segments[0][0].Airline.AirlineCode;
        } else if (
          flight.Segments &&
          flight.Segments[0] &&
          flight.Segments[0].Airline
        ) {
          airlineCode = flight.Segments[0].Airline.AirlineCode;
        }

        if (!airlineCode || !filters.airlines.includes(airlineCode)) {
          return false;
        }
      }

      // Stops filter - API data ke hisab se
      if (filters.stops.length > 0) {
        let stopCount = 0;

        // Calculate stops from segments
        if (flight.Segments && flight.Segments[0]) {
          const firstSegment = Array.isArray(flight.Segments[0])
            ? flight.Segments[0][0]
            : flight.Segments[0];
          stopCount = firstSegment && firstSegment.StopOver ? 1 : 0;
        }

        if (
          !filters.stops.includes(stopCount) &&
          !(stopCount >= 2 && filters.stops.includes(2))
        ) {
          return false;
        }
      }

      // Price filter
      const fare = flight.Fare?.OfferedFare || flight.Fare?.PublishedFare || 0;
      if (fare < filters.priceRange.min || fare > filters.priceRange.max) {
        return false;
      }

      // Departure time filter
      if (filters.departureTimes.length > 0) {
        let departureTime = "";

        // Get departure time from API data
        if (flight.Segments && flight.Segments[0]) {
          const firstSegment = Array.isArray(flight.Segments[0])
            ? flight.Segments[0][0]
            : flight.Segments[0];
          departureTime = firstSegment?.Origin?.DepTime;
        }

        if (departureTime) {
          const hour = new Date(departureTime).getHours();
          const matchesTime = filters.departureTimes.some(
            ([start, end]) => hour >= start && hour < end
          );
          if (!matchesTime) return false;
        }
      }

      // Duration filter
      if (filters.durations.length > 0) {
        let duration = 0;

        // Get duration from API data
        if (flight.Segments && flight.Segments[0]) {
          const firstSegment = Array.isArray(flight.Segments[0])
            ? flight.Segments[0][0]
            : flight.Segments[0];
          duration = firstSegment?.Duration || 0;
        }

        let matchesDuration = false;

        filters.durations.forEach((durLabel) => {
          if (durLabel === "Short (< 2 hours)" && duration < 120)
            matchesDuration = true;
          if (
            durLabel === "Medium (2-4 hours)" &&
            duration >= 120 &&
            duration <= 240
          )
            matchesDuration = true;
          if (durLabel === "Long (> 4 hours)" && duration > 240)
            matchesDuration = true;
        });

        if (!matchesDuration) return false;
      }

      return true;
    });
  };

  // Cabin class mapping
  const cabinClassMap = {
    Economy: 1,
    "Premium Economy": 2,
    Business: 3,
    "First Class": 4,
  };

  // Journey type mapping
  const journeyTypeMap = {
    oneway: 1,
    round: 2,
    multi: 3,
  };
  // Fetch user IP, authenticate and get airports
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);

        // Step 1: Get user IP
        const ipResponse = await axios.get("https://api.ipify.org?format=json");
        const userIp = ipResponse.data.ip;
        setUserIP(userIp);

        // Step 2: Authenticate
        const authResponse = await Flight_authenticate(userIp);
        const tokenId = authResponse?.TokenId || authResponse?.data?.TokenId;
        if (!tokenId) throw new Error("No TokenId found in auth response");

        setToken(tokenId);

        // Step 3: Fetch airports
        const airportsResponse = await getIndianAirports();
        if (airportsResponse?.data) {
          setAirports(airportsResponse.data);
        } else if (Array.isArray(airportsResponse)) {
          setAirports(airportsResponse);
        } else {
          throw new Error("Invalid airports response format");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError(`Initialization failed: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Custom Airport Dropdown Component - FIXED VERSION
  const AirportDropdown = ({
    value,
    onChange,
    placeholder = "Select Airport",
    type = "from",
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAirports, setFilteredAirports] = useState([]);
    const dropdownRef = useRef(null);

    // Get all selected airports from all flights (excluding current value)
    const getAllSelectedAirports = () => {
      const selected = new Set();

      // Add all "from" and "to" airports from all flights
      flights.forEach((flight) => {
        if (flight.from && flight.from !== value) selected.add(flight.from);
        if (flight.to && flight.to !== value) selected.add(flight.to);
      });

      return selected;
    };

    // Filter airports based on search term and exclude already selected ones
    useEffect(() => {
      if (searchTerm) {
        const selectedAirports = getAllSelectedAirports();
        const filtered = airports.filter((airport) => {
          const city = airport.city_name || "";
          const name = airport.airport_name || "";
          const code = airport.airport_code || "";

          // Check if matches search
          const matchesSearch =
            city.toLowerCase().includes(searchTerm.toLowerCase()) ||
            name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            code.toLowerCase().includes(searchTerm.toLowerCase());

          // Check if not already selected (except current value)
          const notSelected = !selectedAirports.has(airport.airport_code);

          return matchesSearch && notSelected;
        });
        setFilteredAirports(filtered.slice(0, 10));
      } else {
        // When no search term, show airports not already selected
        const selectedAirports = getAllSelectedAirports();
        const availableAirports = airports.filter(
          (airport) => !selectedAirports.has(airport.airport_code)
        );
        setFilteredAirports(availableAirports.slice(0, 10));
      }
    }, [searchTerm, airports, flights, value]);

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(event.target)
        ) {
          setIsOpen(false);
          setSearchTerm("");
        }
      };

      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

    useEffect(() => {
      if (showModal && window.history.state?.usr?.searchData) {
        const data = window.history.state.usr.searchData;

        setSearchData(data);
        setAdults(data.passengers.adults);
        setChildren(data.passengers.children);
        setInfants(data.passengers.infants);
      }
    }, [showModal]);

    const handleSelect = (airport) => {
      onChange(airport.airport_code);
      setIsOpen(false);
      setSearchTerm("");
    };

    const selectedAirport = airports.find(
      (airport) => airport.airport_code === value
    );

    const displayValue = isOpen
      ? searchTerm
      : selectedAirport
      ? `${selectedAirport.city_name} (${selectedAirport.airport_code})`
      : "";

    return (
      <div className="position-relative" ref={dropdownRef}>
        <Form.Control
          type="text"
          placeholder={placeholder}
          value={displayValue}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            // On focus, show available airports (not already selected)
            const selectedAirports = getAllSelectedAirports();
            const availableAirports = airports.filter(
              (airport) => !selectedAirports.has(airport.airport_code)
            );
            setFilteredAirports(availableAirports.slice(0, 10));
          }}
          className="custom-dropdown-input"
        />

        {isOpen && (
          <div className="custom-dropdown-menu">
            <div className="dropdown-header">
              <small className="text-muted">SUGGESTIONS</small>
            </div>

            {filteredAirports.length > 0 ? (
              filteredAirports.map((airport) => (
                <div
                  key={airport.airport_code}
                  className={`dropdown-item ${
                    value === airport.airport_code ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(airport)}
                >
                  <div className="airport-option">
                    <div className="airport-main">
                      <strong>{airport.city_name}</strong>
                      <span className="airport-code">
                        {airport.airport_code}
                      </span>
                    </div>
                    <div className="airport-name text-muted">
                      {airport.airport_name}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="dropdown-item text-muted">
                {loading ? "Loading airports..." : "No airports available"}
              </div>
            )}

            {/* Show warning if user has selected same airport elsewhere */}
            {getAllSelectedAirports().size > 0 && (
              <div className="dropdown-footer text-muted small px-3 py-2 border-top">
                <small>
                  <i className="fas fa-info-circle me-1"></i>
                  Already selected airports are hidden
                </small>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderButtons = (count, setter, max = 9) => {
    return (
      <div className="traveller-options">
        {Array.from({ length: max + 1 }, (_, i) => (
          <button
            key={i}
            className={`traveller-btn ${count === i ? "active" : ""}`}
            onClick={() => setter(i)}
            type="button"
          >
            {i}
          </button>
        ))}
      </div>
    );
  };

  const handleToggle = (section) => {
    setToggle((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addCity = () => {
    setFlights([...flights, { from: "", to: "", date: "" }]);
  };

  const removeCity = (index) => {
    if (flights.length > 1) {
      const newFlights = flights.filter((_, i) => i !== index);
      setFlights(newFlights);
    }
  };

  const handleFromChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index].from = value;
    setFlights(newFlights);
  };

  const handleToChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index].to = value;
    setFlights(newFlights);
  };

  const onViewPrices = (flight) => {
    setSelectedFlight(flight);

    // Create proper search data with passenger information
    const passengerData = {
      passengers: {
        adults,
        children,
        infants,
      },
      tripType,
      origin: flights?.[0]?.from,
      destination: flights?.[0]?.to,
      departureDate: flights?.[0]?.date,
      returnDate: flights?.[0]?.returnDate,
      travelClass,
      TraceId,
    };
    setSearchData(passengerData);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedFlight(null);
  };

  // Handle trip type change
  const handleTripTypeChange = (newTripType) => {
    setTripType(newTripType);
    setSearchResults([]);
    setSearchError(null);

    if (newTripType === "multi") {
      if (flights.length === 1) {
        setFlights([...flights, { from: "", to: "", date: "" }]);
      }
    } else {
      const firstFlight = flights[0] || { from: "", to: "", date: "" };
      if (newTripType === "round") {
        setFlights([{ ...firstFlight, returnDate: "" }]);
      } else {
        setFlights([firstFlight]);
      }
    }
  };

  // Search flights function
  const searchFlights = async () => {
    if (!token) {
      setSearchError("Please wait while we authenticate...");
      return;
    }

    // Validate form
    for (let flight of flights) {
      if (!flight.from || !flight.to || !flight.date) {
        setSearchError("Please fill all fields");
        return;
      }
    }

    if (tripType === "round" && !flights[0].returnDate) {
      setSearchError("Please select return date for round trip");
      return;
    }

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    setVisibleCount(6); // Reset visible count when new search

    try {
      let segments = [];

      if (tripType === "oneway") {
        segments = flights.map((flight) => ({
          Origin: flight.from,
          Destination: flight.to,
          FlightCabinClass: cabinClassMap[travelClass],
          PreferredDepartureTime: `${flight.date}T00:00:00`,
          PreferredArrivalTime: `${flight.date}T00:00:00`,
        }));
      } else if (tripType === "round") {
        segments = [
          {
            Origin: flights[0].from,
            Destination: flights[0].to,
            FlightCabinClass: cabinClassMap[travelClass],
            PreferredDepartureTime: `${flights[0].date}T00:00:00`,
            PreferredArrivalTime: `${flights[0].date}T00:00:00`,
          },
          {
            Origin: flights[0].to,
            Destination: flights[0].from,
            FlightCabinClass: cabinClassMap[travelClass],
            PreferredDepartureTime: `${flights[0].returnDate}T00:00:00`,
            PreferredArrivalTime: `${flights[0].returnDate}T00:00:00`,
          },
        ];
      } else if (tripType === "multi") {
        segments = flights.map((flight) => ({
          Origin: flight.from,
          Destination: flight.to,
          FlightCabinClass: cabinClassMap[travelClass],
          PreferredDepartureTime: `${flight.date}T00:00:00`,
          PreferredArrivalTime: `${flight.date}T00:00:00`,
        }));
      }

      const searchPayload = {
        EndUserIp: userIP,
        TokenId: token,
        AdultCount: adults,
        ChildCount: children,
        InfantCount: infants,
        DirectFlight: false,
        OneStopFlight: false,
        JourneyType: journeyTypeMap[tripType],
        PreferredAirlines: [],
        Segments: segments,
        Sources: ["GDS"],
      };

      const searchResponse = await Flight_search(searchPayload);
      console.log("✅ API Response in Flight_search:", searchResponse);
      let foundFlights = [];

      if (searchResponse) {
        if (
          searchResponse.data &&
          searchResponse.data.Response &&
          searchResponse.data.Response.Results
        ) {
          foundFlights = searchResponse.data.Response.Results.flat();
        } else if (searchResponse.data && searchResponse.data.Results) {
          foundFlights = searchResponse.data.Results.flat();
        } else if (searchResponse.data && Array.isArray(searchResponse.data)) {
          foundFlights = searchResponse.data;
        } else if (
          searchResponse.data &&
          searchResponse.data.data &&
          Array.isArray(searchResponse.data.data)
        ) {
          foundFlights = searchResponse.data.data;
        } else if (Array.isArray(searchResponse)) {
          foundFlights = searchResponse;
        } else if (searchResponse.Results) {
          foundFlights = searchResponse.Results.flat();
        } else if (searchResponse.data) {
          foundFlights = [searchResponse.data].flat();
        }
      }

      if (foundFlights.length > 0) {
        setSearchResults(foundFlights);
        setTraceId(searchResponse?.data?.Response.TraceId);
        setSearchError(null);
      } else {
        setSearchError(
          searchResponse?.data?.Response?.Error?.ErrorMessage ||
            "No flights found. Please try different search criteria."
        );
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(
        error.response?.data?.message ||
          error.message ||
          "Failed to search flights"
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // Format price with commas
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "0.00";
    const fixed = Number(price).toFixed(2);
    return fixed.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return "08:50";
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "08:50";
    }
  };

  // Format duration from minutes
  const formatDuration = (minutes) => {
    if (!minutes) return "02h 50m";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Render flight results with filters applied AND infinite scroll
  const renderFlightResults = () => {
    if (searchLoading) {
      return (
        <div className="text-center py-5">
          <Loading />
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

    const filteredResults = applyFilters(searchResults);

    if (filteredResults.length === 0 && searchResults.length > 0) {
      return (
        <div className="text-center py-5 text-muted">
          <h5>No flights found matching your filters</h5>
          <p>Try adjusting your filter criteria</p>
          <Button variant="outline-primary" size="sm" onClick={clearAllFilters}>
            Clear All Filters
          </Button>
        </div>
      );
    }

    if (filteredResults.length === 0) {
      return (
        <div className="text-center py-5 text-muted">
          <h5>No flights found</h5>
          <p>Try adjusting your search criteria</p>
        </div>
      );
    }

    // Only show the first `visibleCount` flights
    const visibleFlights = filteredResults.slice(0, visibleCount);

    return (
      <>
        {visibleFlights.map((flight, index) => {
          const segments = flight.Segments || [];
          const fareInfo = flight.Fare || {};
          const airlineInfo = flight.Airline || {};

          let segmentData = {};
          if (segments.length > 0) {
            const firstSegment = segments[0];
            segmentData = Array.isArray(firstSegment)
              ? firstSegment[0] || {}
              : firstSegment || {};
          }

          const segmentAirline = segmentData.Airline || airlineInfo;
          const originInfo = segmentData.Origin || {};
          const destinationInfo = segmentData.Destination || {};

          const originAirport = originInfo.Airport || {};
          const destinationAirport = destinationInfo.Airport || {};

          const publishedFare = fareInfo.PublishedFare || 0;
          const offeredFare = fareInfo.OfferedFare || publishedFare;
          const savings = publishedFare - offeredFare;

          return (
            <Card key={index} className="shadow-sm p-3 mb-4 rounded-3">
              <Row className="align-items-center">
                {/* Airline Info */}
                <Col md={3} className="d-flex align-items-center">
                  <div
                    className="bg-light rounded p-2 me-3 d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <strong className="text-primary">
                      {segmentAirline.AirlineCode || "AI"}
                    </strong>
                  </div>

                  <div>
                    <h6 className="mb-0">
                      {segmentAirline.AirlineName || "Air India"}
                    </h6>
                    <small className="text-muted">
                      {segmentAirline.FlightNumber
                        ? `Flight ${segmentAirline.FlightNumber}`
                        : "Flight 2993"}
                    </small>
                    <br />
                    <small
                      className={
                        flight.IsRefundable ? "text-success" : "text-danger"
                      }
                    >
                      {flight.IsRefundable
                        ? "🔄 Refundable"
                        : "❌ Non-Refundable"}
                    </small>
                  </div>
                </Col>

                {/* Departure */}
                <Col md={2} className="text-center">
                  <h5 className="mb-0">{formatTime(originInfo.DepTime)}</h5>
                  <small className="text-muted">
                    {originAirport.AirportCode || "DEL"}
                  </small>
                  <br />
                  <small className="text-muted small">
                    {originAirport.CityName || "Delhi"}
                  </small>
                </Col>

                {/* Duration */}
                <Col md={2} className="text-center">
                  <p className="mb-1 text-success fw-bold">
                    {formatDuration(segmentData.Duration)}
                  </p>
                  <small className="text-muted">
                    {segmentData.StopOver ? "With Stop" : "Non stop"}
                  </small>
                  <br />
                  <small className="text-muted small">
                    {segmentData.Craft || "32N"}
                  </small>
                </Col>

                {/* Arrival */}
                <Col md={2} className="text-center">
                  <h5 className="mb-0">{formatTime(destinationInfo.ArrTime)}</h5>
                  <small className="text-muted">
                    {destinationAirport.AirportCode || "BOM"}
                  </small>
                  <br />
                  <small className="text-muted small">
                    {destinationAirport.CityName || "Mumbai"}
                  </small>
                </Col>

                {/* Price */}
                <Col md={3} className="text-end">
                  <h5 className="fw-bold text-primary">
                    ₹ {formatPrice(offeredFare)}
                  </h5>
                  <small className="text-muted">per adult</small>

                  {savings > 0 && (
                    <>
                      <br />
                      <small className="text-success small">
                        Save ₹{formatPrice(savings)}
                      </small>
                    </>
                  )}

                  <br />
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-2 rounded-pill px-4"
                    onClick={() => onViewPrices(flight)}
                  >
                    VIEW PRICES
                  </Button>
                </Col>
              </Row>

              {/* Baggage Row */}
              <Row className="mt-3">
                <Col>
                  <div className="bg-light p-2 rounded-2">
                    <small className="text-muted">
                      <strong>Baggage:</strong> {segmentData.Baggage || "15 KG"}{" "}
                      •<strong> Cabin:</strong> {segmentData.CabinBaggage || "7 KG"} •
                      <strong> Class:</strong> {travelClass}
                    </small>
                  </div>
                </Col>
              </Row>
            </Card>
          );
        })}

        {/* Show loading indicator if more flights are loading */}
        {visibleCount < filteredResults.length && (
          <div className="text-center my-4">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Loading more flights...</span>
            <div className="small text-muted mt-2">
              Showing {visibleCount} of {filteredResults.length} flights
            </div>
          </div>
        )}

        {/* Show message if all flights are loaded */}
        {visibleCount >= filteredResults.length && filteredResults.length > 0 && (
          <div className="text-center my-4 text-muted">
            <small>All {filteredResults.length} flights loaded</small>
          </div>
        )}
      </>
    );
  };

  return (
    <div>
      {/* Flight Search Form */}
      <div className="flight-section" style={{ marginTop: "110px" }}>
        <div className="search-box rounded shadow-sm flight-form">
          <div className="container">
            {error && <Alert variant="warning">{error}</Alert>}

            {loading && (
              <div className="text-center py-3">
                {/* <Spinner animation="border" size="sm" className="me-2" />
                <span>Initializing application...</span> */}
              </div>
            )}

            <Row className="align-items-end g-2 mb-3 travellers">
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Trip Type
                  </Form.Label>
                  <Form.Select
                    value={tripType}
                    onChange={(e) => handleTripTypeChange(e.target.value)}
                    className="form-control"
                  >
                    <option value="oneway">One Way</option>
                    <option value="round">Round Trip</option>
                    <option value="multi">Multi City</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">From</Form.Label>
                  <AirportDropdown
                    value={flights[0].from}
                    onChange={(value) => handleFromChange(0, value)}
                    placeholder="From City"
                    type="from"
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">To</Form.Label>
                  <AirportDropdown
                    value={flights[0].to}
                    onChange={(value) => handleToChange(0, value)}
                    placeholder="To City"
                    type="to"
                  />
                </Form.Group>
              </Col>

              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Depart</Form.Label>
                  <DatePicker
                    selected={
                      flights[0]?.date ? new Date(flights[0].date) : new Date()
                    }
                    onChange={(date) => {
                      const newFlights = [...flights];
                      newFlights[0].date = date.toISOString().split("T")[0];
                      setFlights(newFlights);
                    }}
                    minDate={new Date()}
                    dateFormat="EEE, MMM d, yyyy"
                    className="form-control"
                  />
                </Form.Group>
              </Col>

              {tripType === "round" && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">
                      Return
                    </Form.Label>
                    <DatePicker
                      selected={
                        flights[0].returnDate
                          ? new Date(flights[0].returnDate)
                          : flights[0].date
                          ? new Date(flights[0].date)
                          : new Date()
                      }
                      onChange={(date) => {
                        const newFlights = [...flights];
                        newFlights[0].returnDate = date
                          .toISOString()
                          .split("T")[0];
                        setFlights(newFlights);
                      }}
                      minDate={
                        flights[0].date ? new Date(flights[0].date) : new Date()
                      }
                      dateFormat="EEE, MMM d, yyyy"
                      className="form-control"
                      placeholderText="Select Return"
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={tripType === "round" ? 2 : 2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Passengers & Class
                  </Form.Label>
                  <Dropdown className="AddClass" style={{ width: "100%" }}>
                    <Dropdown.Toggle
                      id="travellers-dropdown"
                      variant="light"
                      className="AddClass-toggle"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        textAlign: "left",
                        backgroundColor: "transparent",
                      }}
                    >
                      {adults} Adult{adults > 1 ? "s" : ""},{" "}
                      {travelClass || "Economy"}
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      className="AddClass-menu"
                      style={{ minWidth: "100%" }}
                    >
                      <Row className="p-2">
                        <Col xs={12}>
                          <Form.Label>Adults (12y+)</Form.Label>
                          {renderButtons(adults, setAdults, 9)}
                        </Col>
                        <Col xs={12}>
                          <Form.Label>Children (2y-12y)</Form.Label>
                          {renderButtons(children, setChildren, 6)}
                        </Col>
                        <Col xs={12}>
                          <Form.Label>Infants (below 2y)</Form.Label>
                          {renderButtons(infants, setInfants, 6)}
                        </Col>

                        <Col xs={12} className="mt-3">
                          <Form.Label>Travel Class</Form.Label>
                          <div className="d-flex flex-wrap gap-2">
                            {[
                              "Economy",
                              "Premium Economy",
                              "Business",
                              "First Class",
                            ].map((cls) => (
                              <Button
                                key={cls}
                                variant={
                                  travelClass === cls
                                    ? "primary"
                                    : "outline-secondary"
                                }
                                size="sm"
                                className="rounded-pill"
                                onClick={() => setTravelClass(cls)}
                              >
                                {cls}
                              </Button>
                            ))}
                          </div>
                        </Col>
                      </Row>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>

              <Col md={2}>
                <Button
                  className="explore-btn w-100"
                  style={{
                    padding: "10px 16px",
                    fontSize: "16px",
                    background: "linear-gradient(90deg, #2b87da, #1e63b5)",
                    border: "none",
                    borderRadius: "30px",
                    color: "white",
                  }}
                  onClick={searchFlights}
                  disabled={searchLoading || !token || loading}
                >
                  {searchLoading ? (
                    <>
                      <Spinner animation="border" size="sm" className="me-2" />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </Col>
            </Row>
            {tripType === "multi" &&
              flights.map((flight, index) => (
                <Row
                  key={index}
                  className="align-items-end g-2 mb-3 travellers"
                >
                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        From
                      </Form.Label>
                      <AirportDropdown
                        value={flight.from}
                        onChange={(value) => handleFromChange(index, value)}
                        placeholder="From City"
                        type="from"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">To</Form.Label>
                      <AirportDropdown
                        value={flight.to}
                        onChange={(value) => handleToChange(index, value)}
                        placeholder="To City"
                        type="to"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2}>
                    <Form.Group>
                      <Form.Label className="fw-semibold small">
                        Depart
                      </Form.Label>

                      {/* 🔥 FINAL FIX - this keeps dates separate for each row */}
                      <DatePicker
                        selected={flight.date ? new Date(flight.date) : null}
                        onChange={(date) => {
                          const updatedFlights = flights.map((f, i) =>
                            i === index
                              ? {
                                  ...f,
                                  date: date
                                    ? date.toISOString().split("T")[0]
                                    : null,
                                }
                              : f
                          );
                          setFlights(updatedFlights);
                        }}
                        minDate={new Date()}
                        dateFormat="EEE, MMM d, yyyy"
                        className="form-control"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={2} className="d-flex gap-2">
                    {index === flights.length - 1 ? (
                      <Button
                        variant="outline-primary"
                        className="rounded-pill"
                        onClick={addCity}
                      >
                        + Add City
                      </Button>
                    ) : (
                      <Button
                        variant="outline-danger"
                        className="rounded-pill"
                        onClick={() => removeCity(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </Col>
                </Row>
              ))}
          </div>
        </div>
      </div>

      <div className="container py-5">
        <Row>
          {/* Filter Sidebar */}
          <Col sm={3}>
            <div className="filter-box p-3 border rounded shadow-sm">
              <h5 className="mb-3 fw-bold">FILTER</h5>

              {/* Refundable Filter */}
              <div className="filter-group mb-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="refundable"
                    checked={filters.refundableOnly}
                    onChange={(e) =>
                      handleFilterChange("refundableOnly", e.target.checked)
                    }
                  />
                  <label
                    className="form-check-label fw-semibold"
                    htmlFor="refundable"
                  >
                    Refundable Only
                  </label>
                </div>
              </div>

              {/* Airlines Filter */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("airlines")}
                >
                  <span className="fw-semibold">Airlines</span>
                  <FontAwesomeIcon
                    icon={toggle.airlines ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.airlines && (
                  <div className="filter-options mt-2">
                    {[
                      { name: "IndiGo", code: "6E" },
                      { name: "Air India", code: "AI" },
                      { name: "SpiceJet", code: "SG" },
                      { name: "Vistara", code: "UK" },
                      { name: "Go First", code: "G8" },
                      { name: "AirAsia", code: "I5" },
                    ].map((airline, i) => (
                      <div className="form-check" key={airline.code}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`airline-${airline.code}`}
                          checked={filters.airlines.includes(airline.code)}
                          onChange={(e) =>
                            handleAirlineFilter(airline.code, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`airline-${airline.code}`}
                        >
                          {airline.name}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Stops Filter */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("stops")}
                >
                  <span className="fw-semibold">Stops</span>
                  <FontAwesomeIcon
                    icon={toggle.stops ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.stops && (
                  <div className="filter-options mt-2">
                    {[
                      { label: "Non-stop", value: 0 },
                      { label: "1 Stop", value: 1 },
                      { label: "2+ Stops", value: 2 },
                    ].map((stop, i) => (
                      <div className="form-check" key={stop.value}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`stop-${stop.value}`}
                          checked={filters.stops.includes(stop.value)}
                          onChange={(e) =>
                            handleStopFilter(stop.value, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`stop-${stop.value}`}
                        >
                          {stop.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Price Range Filter */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("price")}
                >
                  <span className="fw-semibold">Price Range</span>
                  <FontAwesomeIcon
                    icon={toggle.price ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.price && (
                  <div className="filter-options mt-2">
                    <div className="mb-2">
                      <label className="form-label small">
                        Min: ₹{filters.priceRange.min}
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={filters.priceRange.min}
                        onChange={(e) =>
                          handlePriceRangeChange(
                            "min",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small">
                        Max: ₹{filters.priceRange.max}
                      </label>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="50000"
                        step="1000"
                        value={filters.priceRange.max}
                        onChange={(e) =>
                          handlePriceRangeChange(
                            "max",
                            parseInt(e.target.value)
                          )
                        }
                      />
                    </div>
                    <div className="d-flex justify-content-between small text-muted">
                      <span>₹0</span>
                      <span>₹50,000</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Departure Time Filter */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("departure")}
                >
                  <span className="fw-semibold">Departure Time</span>
                  <FontAwesomeIcon
                    icon={toggle.departure ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.departure && (
                  <div className="filter-options mt-2">
                    {[
                      { label: "Early Morning (00:00-06:00)", range: [0, 6] },
                      { label: "Morning (06:00-12:00)", range: [6, 12] },
                      { label: "Afternoon (12:00-18:00)", range: [12, 18] },
                      { label: "Evening (18:00-24:00)", range: [18, 24] },
                    ].map((time, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`departure-${i}`}
                          checked={filters.departureTimes.some(
                            (t) =>
                              t[0] === time.range[0] && t[1] === time.range[1]
                          )}
                          onChange={(e) =>
                            handleDepartureTimeFilter(
                              time.range,
                              e.target.checked
                            )
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`departure-${i}`}
                        >
                          {time.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Duration Filter */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle("duration")}
                >
                  <span className="fw-semibold">Flight Duration</span>
                  <FontAwesomeIcon
                    icon={toggle.duration ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.duration && (
                  <div className="filter-options mt-2">
                    {[
                      { label: "Short (< 2 hours)", max: 120 },
                      { label: "Medium (2-4 hours)", min: 120, max: 240 },
                      { label: "Long (> 4 hours)", min: 240 },
                    ].map((duration, i) => (
                      <div className="form-check" key={i}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`duration-${i}`}
                          checked={filters.durations.includes(duration.label)}
                          onChange={(e) =>
                            handleDurationFilter(duration, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`duration-${i}`}
                        >
                          {duration.label}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Clear Filters Button */}
              <div className="filter-group mb-3">
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="w-100"
                  onClick={clearAllFilters}
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </Col>

          {/* Flight Results Section */}
          <Col sm={9}>{renderFlightResults()}</Col>
        </Row>
      </div>

      {/* Flight Detail Modal */}
      <FlightDetail
        flightData={selectedFlight}
        travelClass={travelClass}
        showModal={showModal}
        onHide={handleCloseModal}
        searchData={searchData}
      />
    </div>
  );
};

export default Flight;