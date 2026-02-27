import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Form,
  Button,
  Row,
  Col,
  Card,
  Dropdown,
  Spinner,
  Alert,
  Tabs,
  Tab,
} from "react-bootstrap";
import { FaUndoAlt } from "react-icons/fa";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import "./Flights.css";
import axios from "axios";
import { getIndianAirports, Flight_search } from "../services/flightService";
import FlightDetail from "./Flghitdetail";
import Laoding from "../common/loading";
import { Offcanvas } from "react-bootstrap";
import { useLocation } from "react-router-dom";

// ─────────────────────────────────────────────────────────────────────────────
// AirportDropdown — defined OUTSIDE Flight so it is not recreated on every render
// ─────────────────────────────────────────────────────────────────────────────
const AirportDropdown = ({
  value,
  onChange,
  placeholder = "Select Airport",
  disabled = false,
  type = "from",
  segmentIndex = 0,
  airports = [],
  flights = [],
  loading = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredAirports, setFilteredAirports] = useState([]);
  const dropdownRef = useRef(null);

  const getExcludedAirports = useCallback(() => {
    const excluded = new Set();
    const currentFlight = flights[segmentIndex];
    if (currentFlight) {
      if (type === "from" && currentFlight.to) excluded.add(currentFlight.to);
      else if (type === "to" && currentFlight.from) excluded.add(currentFlight.from);
    }
    return excluded;
  }, [flights, segmentIndex, type]);

  useEffect(() => {
    const excludedAirports = getExcludedAirports();
    let filtered = airports;

    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = airports.filter((airport) => {
        const city = airport.city_name?.toLowerCase() || "";
        const airportName = airport.airport_name?.toLowerCase() || "";
        const airportCode = airport.airport_code?.toLowerCase() || "";
        const countryName = airport.country_name?.toLowerCase() || "";
        const countryCode = airport.country_code?.toLowerCase() || "";
        return (
          city.includes(search) ||
          airportName.includes(search) ||
          airportCode.includes(search) ||
          countryName.includes(search) ||
          countryCode.includes(search)
        );
      });
    }

    filtered = filtered.filter(
      (airport) => !excludedAirports.has(airport.airport_code)
    );
    setFilteredAirports([...filtered.slice(0, 15)].reverse());
  }, [searchTerm, airports, flights, segmentIndex, type, getExcludedAirports]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (airport) => {
    onChange(airport.airport_code);
    setIsOpen(false);
    setSearchTerm("");
  };

  const selectedAirport = airports.find((a) => a.airport_code === value);
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
          if (disabled) return;
          setIsOpen(true);
          const excludedAirports = getExcludedAirports();
          const available = airports.filter(
            (a) => !excludedAirports.has(a.airport_code)
          );
          setFilteredAirports([...available.slice(0, 15)].reverse());
        }}
        className="custom-dropdown-input"
        disabled={disabled}
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
                className={`dropdown-item ${value === airport.airport_code ? "selected" : ""
                  }`}
                onClick={() => handleSelect(airport)}
              >
                <div className="airport-option">
                  <div className="airport-main">
                    <strong>{`${airport.city_name}, ${airport.country_name}`}</strong>
                    <span className="airport-code">{airport.airport_code}</span>
                  </div>
                  <div className="airport-name text-muted">
                    {airport.airport_name}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="dropdown-item text-muted">
              {loading ? "Loading airports..." : "No airports found"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main Flight Component
// ─────────────────────────────────────────────────────────────────────────────
const Flight = () => {
  // Flight segments (multi-city form)
  const [flights, setFlights] = useState([]);

  const [selectedFlights, setSelectedFlights] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [pricingBreakdown, setPricingBreakdown] = useState({
    commissionAmount: 0,
    commissionPercent: 6,
    finalAmount: 0,
    gstAmount: 0,
    gstPercent: 18,
    netFare: 0,
  });

  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [airports, setAirports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [userIP, setUserIP] = useState("");
  const [tripType, setTripType] = useState("oneway");
  const [searchData, setSearchData] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);
  const [infants, setInfants] = useState(0);
  const [travelClass, setTravelClass] = useState("Economy");
  const [TraceId, setTraceId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [isDomestic, setIsDomestic] = useState(true);

  const [dynamicPriceBounds, setDynamicPriceBounds] = useState({
    min: 0,
    max: 0,
  });

  const [filters, setFilters] = useState({
    refundableOnly: false,
    airlines: [],
    stops: [],
    priceRange: { min: 0, max: 1000000 },
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

  const location = useLocation();
  const navigationState = location.state;

  console.log("navigationState in flight", navigationState);

  // Add city functions
  const addCity = () => {
    if (flights.length < 4) {
      setFlights([...flights, { from: "", to: "", date: "" }]);
    }
  };

  const removeCity = (index) => {
    if (flights.length > 1) {
      const newFlights = flights.filter((_, i) => i !== index);
      setFlights(newFlights);
    }
  };

  // ✅ HELPER FUNCTION TO GET DISPLAY PRICE
  const getDisplayPrice = (flight) => {
    if (!flight) return 0;

    if (flight.DisplayPrice !== undefined && flight.DisplayPrice !== null) {
      return flight.DisplayPrice;
    }

    if (flight.Fare) {
      if (flight.Fare.DisplayPrice != null) return flight.Fare.DisplayPrice;
      if (flight.Fare.OfferedFare != null) return flight.Fare.OfferedFare;
      if (flight.Fare.PublishedFare != null) return flight.Fare.PublishedFare;
    }
    return 0;
  };

  const getPricingData = (flight) => {
    if (!flight) return null;
    if (flight.Pricing) return flight.Pricing;
    const displayPrice = getDisplayPrice(flight);
    const commissionPercent = 6;
    const gstPercent = 18;
    const commissionAmount = (displayPrice * commissionPercent) / 100;
    const gstAmount = (commissionAmount * gstPercent) / 100;
    const netFare = displayPrice - commissionAmount;
    const finalAmount = netFare + gstAmount;
    return { commissionAmount, commissionPercent, finalAmount, gstAmount, gstPercent, netFare };
  };

  // price dynamic
  useEffect(() => {
    if (!searchResults || searchResults.length === 0) return;

    const currentFlights = getFilteredResultsForDisplay();

    if (!currentFlights || currentFlights.length === 0) return;

    const prices = currentFlights
      .map((flight) => getDisplayPrice(flight))
      .filter((price) => price && price > 0);

    if (prices.length === 0) return;

    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    setDynamicPriceBounds({
      min: minPrice,
      max: maxPrice,
    });

    setFilters((prev) => ({
      ...prev,
      priceRange: {
        min: minPrice,
        max: maxPrice,
      },
    }));
  }, [searchResults, activeTab, tripType]);

  // ─── Recalculate totals when selection changes ────────────────────────────
  useEffect(() => {
    let total = 0, totalCommission = 0, totalGST = 0, totalNetFare = 0, totalFinalAmount = 0;
    selectedFlights.forEach((flight) => {
      if (!flight) return;
      const price = getDisplayPrice(flight);
      total += price;
      const pricing = getPricingData(flight);
      if (pricing) {
        totalCommission += pricing.commissionAmount || 0;
        totalGST += pricing.gstAmount || 0;
        totalNetFare += pricing.netFare || price;
        totalFinalAmount += pricing.finalAmount || price;
      } else {
        const ca = (price * 6) / 100;
        const ga = (ca * 18) / 100;
        totalCommission += ca;
        totalGST += ga;
        totalNetFare += price - ca;
        totalFinalAmount += price - ca + ga;
      }
    });
    setTotalPrice(total);
    setPricingBreakdown({
      commissionAmount: parseFloat(totalCommission.toFixed(2)),
      commissionPercent: 6,
      finalAmount: parseFloat(totalFinalAmount.toFixed(2)),
      gstAmount: parseFloat(totalGST.toFixed(2)),
      gstPercent: 18,
      netFare: parseFloat(totalNetFare.toFixed(2)),
    });
  }, [selectedFlights]);

  // ─── Infinite scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setVisibleCount((prev) => prev + 6);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
          (range) =>
            !(range[0] === timeRange[0] && range[1] === timeRange[1]),
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
      priceRange: { min: 0, max: 100000 },
      departureTimes: [],
      durations: [],
    });
  };

  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // ✅ Helper function to check if an airport is Indian
  const isIndianAirport = (airport) => {
    if (!airport) return false;
    if (airport.country_code === "IN") return true;
    if (airport.country_name?.toLowerCase().includes("india")) return true;
    const keywords = ["delhi", "mumbai", "chennai", "bangalore", "kolkata", "hyderabad", "ahmedabad", "pune", "jaipur", "lucknow", "goa", "kochi"];
    return keywords.some((k) => airport.city_name?.toLowerCase().includes(k));
  };

  const checkIfDomestic = useCallback(
    (origin, destination) => {
      if (!airports || airports.length === 0) return false;
      const o = origin?.toUpperCase().trim();
      const d = destination?.toUpperCase().trim();
      const oa = airports.find((a) => a.airport_code === o);
      const da = airports.find((a) => a.airport_code === d);
      if (!oa || !da) return false;
      return isIndianAirport(oa) && isIndianAirport(da);
    },
    [airports]
  );

  const getAirportCodeFromSegment = (segment, type = "origin") => {
    if (!segment) return "";
    const location = type === "origin" ? segment.Origin : segment.Destination;
    if (typeof location === "string") return location;
    if (location?.Airport?.AirportCode) return location.Airport.AirportCode;
    if (location?.AirportCode) return location.AirportCode;
    return "";
  };

  // ✅ FIXED: Get filtered results based on trip type and active tab
  const getFilteredResultsForDisplay = () => {
    if (!searchResults || searchResults.length === 0) return [];

    if (
      Array.isArray(searchResults[0]) &&
      searchResults[0].length > 0 &&
      Array.isArray(searchResults[1]) &&
      searchResults[1].length > 0
    ) {
      if (tripType === "round") {
        return activeTab === 0 ? searchResults[0] : searchResults[1];
      }

      if (tripType === "multi" && Array.isArray(searchResults[0])) {
        if (activeTab < searchResults.length) {
          return searchResults[activeTab] || [];
        }
        return [];
      }

      return searchResults.flat();
    }

    if (tripType === "round" && isDomestic) {
      const outboundFlights = searchResults.filter(
        (flight) =>
          flight.TripIndicator === "OB" ||
          flight.TripIndicator === "Outbound" ||
          flight.TripIndicator === "1",
      );

      const inboundFlights = searchResults.filter(
        (flight) =>
          flight.TripIndicator === "IB" ||
          flight.TripIndicator === "Inbound" ||
          flight.TripIndicator === "RT" ||
          flight.TripIndicator === "Return" ||
          flight.TripIndicator === "2",
      );

      if (outboundFlights.length > 0 || inboundFlights.length > 0) {
        return activeTab === 0 ? outboundFlights : inboundFlights;
      }

      const origin = flights[0]?.from;
      const destination = flights[0]?.to;

      const obFlights = searchResults.filter((flight) => {
        const segments = flight.Segments || [];
        if (segments.length === 0) return false;

        const firstSegment = segments[0];
        const segment = Array.isArray(firstSegment)
          ? firstSegment[0]
          : firstSegment;
        if (!segment) return false;

        const segOrigin = getAirportCodeFromSegment(segment, "origin");
        const segDest = getAirportCodeFromSegment(segment, "destination");

        return segOrigin === origin && segDest === destination;
      });

      const ibFlights = searchResults.filter((flight) => {
        const segments = flight.Segments || [];
        if (segments.length === 0) return false;

        const firstSegment = segments[0];
        const segment = Array.isArray(firstSegment)
          ? firstSegment[0]
          : firstSegment;
        if (!segment) return false;

        const segOrigin = getAirportCodeFromSegment(segment, "origin");
        const segDest = getAirportCodeFromSegment(segment, "destination");

        return segOrigin === destination && segDest === origin;
      });

      return activeTab === 0 ? obFlights : ibFlights;
    }

    if (tripType === "multi") {
      if (!Array.isArray(searchResults)) return [];

      if (Array.isArray(searchResults[activeTab])) {
        return searchResults[activeTab];
      }

      return [];
    }

    return searchResults;
  };

  const applyFilters = (flights) => {
    if (!flights || flights.length === 0) return [];

    return flights.filter((flight) => {
      if (filters.refundableOnly && !flight.IsRefundable) {
        return false;
      }

      if (filters.airlines.length > 0) {
        let airlineCode = "";
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

      if (filters.stops.length > 0) {
        let stopCount = 0;
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

      const price = getDisplayPrice(flight);
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      if (filters.departureTimes.length > 0) {
        let departureTime = "";
        if (flight.Segments && flight.Segments[0]) {
          const firstSegment = Array.isArray(flight.Segments[0])
            ? flight.Segments[0][0]
            : flight.Segments[0];
          departureTime = firstSegment?.Origin?.DepTime;
        }

        if (departureTime) {
          const hour = new Date(departureTime).getHours();
          const matchesTime = filters.departureTimes.some(
            ([start, end]) => hour >= start && hour < end,
          );
          if (!matchesTime) return false;
        }
      }

      if (filters.durations.length > 0) {
        let duration = 0;
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

  // ✅ HANDLE FLIGHT SELECTION WITH PRICING DATA
  const handleFlightSelect = (flight) => {
    const newSelectedFlights = [...selectedFlights];

    const flightPricing = getPricingData(flight);

    const flightWithPricing = {
      ...flight,
      Pricing: flightPricing,
    };

    const existingIndex = newSelectedFlights.findIndex(
      (f) =>
        f &&
        f.Segments &&
        flight.Segments &&
        f.Segments[0]?.[0]?.Airline?.FlightNumber ===
        flight.Segments[0]?.[0]?.Airline?.FlightNumber &&
        f.Segments[0]?.[0]?.Origin?.DepTime ===
        flight.Segments[0]?.[0]?.Origin?.DepTime,
    );

    if (existingIndex === activeTab) {
      newSelectedFlights[activeTab] = null;
    } else {
      newSelectedFlights[activeTab] = flightWithPricing;
    }

    setSelectedFlights(newSelectedFlights);
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
    special: 5,
  };

  // ✅ DYNAMIC AIRPORTS INITIALIZATION
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setLoading(true);
        setError(null);
        const ipResponse = await axios.get("https://api.ipify.org?format=json");
        setUserIP(ipResponse.data.ip);

        const airportsResponse = await getIndianAirports();
        let airportsData = [];
        if (airportsResponse?.data && Array.isArray(airportsResponse.data)) {
          airportsData = airportsResponse.data;
        } else if (Array.isArray(airportsResponse)) {
          airportsData = airportsResponse;
        } else {
          throw new Error("Invalid airports response format");
        }
        setAirports(airportsData);
        localStorage.setItem("airportsCache", JSON.stringify(airportsData));
        localStorage.setItem("airportsCacheTimestamp", Date.now().toString());
      } catch (err) {
        console.error("Initialization error:", err);
        setError(`Initialization failed: ${err.message}`);
        try {
          const cachedData = localStorage.getItem("airportsCache");
          const cachedTimestamp = localStorage.getItem("airportsCacheTimestamp");
          if (cachedData && cachedTimestamp && Date.now() - parseInt(cachedTimestamp) < 86400000) {
            setAirports(JSON.parse(cachedData));
          }
        } catch (cacheErr) {
          console.error("Cache load error:", cacheErr);
        }
      } finally {
        setLoading(false);
        setIsInitialLoading(false);
      }
    };
    initializeApp();
  }, []);

  // Handle navigation data from FlightPopularDestination
  useEffect(() => {
    if (navigationState) {
      console.log("Received navigation state:", navigationState);

      if (navigationState.flights && navigationState.flights.length > 0) {
        setFlights(navigationState.flights);
      }

      if (navigationState.tripType) {
        setTripType(navigationState.tripType);
      }

      if (navigationState.passengers) {
        setAdults(navigationState.passengers.adults || 1);
        setChildren(navigationState.passengers.children || 0);
        setInfants(navigationState.passengers.infants || 0);
      }

      if (navigationState.travelClass) {
        setTravelClass(navigationState.travelClass);
      }

      if (navigationState.isDomestic !== undefined) {
        setIsDomestic(navigationState.isDomestic);
      }
    } else {
      setFlights([
        {
          from: "DEL",
          to: "BOM",
          date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0],
        },
      ]);
    }
  }, [navigationState]);


  // Add this new useEffect - runs only once when airports load
  useEffect(() => {
    const performInitialSearch = async () => {
      // Only search if we have airports loaded
      if (airports.length > 0) {
        // Check if we have navigation state with flights data
        if (navigationState?.flights && navigationState.flights.length > 0) {
          // Check if all required fields are filled
          const isValid = navigationState.flights.every(
            (flight) => flight.from && flight.to && flight.date,
          );

          if (isValid) {
            try {
              setIsInitialLoading(true);
              await searchFlights();
            } catch (error) {
              console.error("Error during initial search:", error);
            } finally {
              setIsInitialLoading(false);
            }
          } else {
            setIsInitialLoading(false);
          }
        } else {
          setIsInitialLoading(false);
        }
      }
    };

    performInitialSearch();
  }, [airports]); // Only depend on airports

  const handleFromChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index] = { ...newFlights[index], from: value };
    setFlights(newFlights);
    if (index === 0 && newFlights[0].to) setIsDomestic(checkIfDomestic(value, newFlights[0].to));
  };

  const handleToChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index] = { ...newFlights[index], to: value };
    setFlights(newFlights);

    if (index === 0 && newFlights[0].from) {
      const domesticStatus = checkIfDomestic(newFlights[0].from, value);
      setIsDomestic(domesticStatus);
    }
  };

  const onViewPrices = () => {
    if (tripType === "round") {
      if (!selectedFlights[0] || !selectedFlights[1]) {
        alert("Please select outbound and return flights");
        return;
      }
    } else if (tripType === "oneway") {
      if (!selectedFlights[0]) {
        alert("Please select a flight");
        return;
      }
    } else if (tripType === "multi") {
      if (!selectedFlights[activeTab]) {
        alert(`Please select flight for segment ${activeTab + 1}`);
        return;
      }
    }

    let flightsToSend = [];

    if (tripType === "multi") {
      flightsToSend = [selectedFlights[activeTab]];
    } else {
      flightsToSend = selectedFlights.filter(Boolean);
    }

    const passengerData = {
      passengers: {
        adults,
        children,
        infants,
      },
      tripType,
      flights: flightsToSend,
      totalPrice,
      pricingBreakdown,
      origin: flights?.[activeTab]?.from,
      destination: flights?.[activeTab]?.to,
      departureDate: flights?.[activeTab]?.date,
      travelClass,
      TraceId,
      isDomestic,
      activeTab,
    };

    setSearchData(passengerData);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleTripTypeChange = (newTripType) => {
    setTripType(newTripType);
    setSearchResults([]);
    setSearchError(null);
    setActiveTab(0);

    if (newTripType === "multi") {
      const newFlights = flights.length === 1
        ? [...flights, { from: flights[0].to || "", to: "", date: flights[0].date || new Date().toISOString().split("T")[0] }]
        : flights;
      setFlights(newFlights);
      setSelectedFlights(new Array(newFlights.length).fill(null));
    } else if (newTripType === "round") {
      setFlights([{ ...flights[0], returnDate: "" }]);
      setSelectedFlights([null, null]);
    } else {
      setFlights([flights[0]]);
      setSelectedFlights([null]);
    }

    if (flights[0]?.from && flights[0]?.to)
      setIsDomestic(checkIfDomestic(flights[0].from, flights[0].to));
  };

  // ─── FLIGHT SEARCH ────────────────────────────────────────────────────────
  const searchFlights = async () => {
    if (airports.length === 0) {
      setSearchError("Please wait, airports data is loading...");
      return;
    }
    for (const flight of flights) {
      if (!flight.from || !flight.to || !flight.date) {
        setSearchError("Please fill all fields");
        return;
      }
    }
    if (tripType === "round" && !flights[0].returnDate) {
      setSearchError("Please select return date for round trip");
      return;
    }

    const domesticCheck = checkIfDomestic(flights[0].from, flights[0].to);
    setIsDomestic(domesticCheck);

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    setVisibleCount(6);
    setFilters((prev) => ({ ...prev, airlines: [] }));

    try {
      let segments = [];

      if (tripType === "oneway") {
        segments = flights.map((f) => ({
          Origin: f.from,
          Destination: f.to,
          FlightCabinClass: cabinClassMap[travelClass],
          PreferredDepartureTime: `${f.date}T00:00:00`,
          PreferredArrivalTime: `${f.date}T00:00:00`,
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
        segments = flights.map((f, i) => ({
          Origin: f.from,
          Destination: f.to,
          FlightCabinClass: cabinClassMap[travelClass],
          PreferredDepartureTime: `${f.date}T00:00:00`,
          PreferredArrivalTime: `${f.date}T00:00:00`,
          SegmentIndex: i,
        }));
      }

      const searchPayload = {
        AdultCount: adults,
        ChildCount: children,
        InfantCount: infants,
        DirectFlight: false,
        OneStopFlight: false,
        JourneyType: journeyTypeMap[tripType],
        PreferredAirlines: [],
        Segments: segments,
        // Sources: ["GDS"],
      };

      const searchResponse = await Flight_search(searchPayload);
      console.log("flight search resp", searchResponse);
      let foundFlights = [];

      const rawResults =
        searchResponse?.data?.Response?.Results ||
        searchResponse?.data?.Results ||
        null;

      if (rawResults) {
        const isArrayOfArrays = Array.isArray(rawResults[0]);

        if (tripType === "multi") {
          if (isArrayOfArrays) {
            foundFlights = rawResults;
          } else {
            const segmentedResults = flights.map((flight) => {
              return rawResults.filter((f) => {
                const segments = f.Segments || [];
                if (!segments.length) return false;
                const firstSeg = segments[0];
                const seg = Array.isArray(firstSeg) ? firstSeg[0] : firstSeg;
                if (!seg) return false;
                return (
                  getAirportCodeFromSegment(seg, "origin") === flight.from &&
                  getAirportCodeFromSegment(seg, "destination") === flight.to
                );
              });
            });
            foundFlights = segmentedResults;
          }
        } else if (tripType === "round" && domesticCheck) {
          foundFlights = isArrayOfArrays ? rawResults : [rawResults];
        } else {
          foundFlights = isArrayOfArrays ? rawResults.flat() : rawResults;
        }
      } else if (Array.isArray(searchResponse?.data)) {
        foundFlights = searchResponse.data;
      } else if (Array.isArray(searchResponse)) {
        foundFlights = searchResponse;
      } else if (searchResponse?.Results) {
        foundFlights = searchResponse.Results.flat();
      }

      if (foundFlights.length > 0) {
        setSearchResults(foundFlights);
        setTraceId(searchResponse?.data?.Response?.TraceId || "");
        setSearchError(null);
      } else {
        setSearchError("No flights found for the selected route and dates.");
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchError(err.response?.data?.message || err.message || "Failed to search flights");
    } finally {
      setSearchLoading(false);
    }
  };

  // ─── Available airlines (memoised) ───────────────────────────────────────
  const availableAirlines = React.useMemo(() => {
    const map = new Map();
    const current = getFilteredResultsForDisplay();
    current.forEach((flight) => {
      const seg = flight?.Segments?.[0]?.[0];
      if (seg?.Airline?.AirlineCode)
        map.set(seg.Airline.AirlineCode, seg.Airline.AirlineName);
    });
    return Array.from(map.entries())
      .map(([code, name]) => ({
        code,
        name,
        count: current.filter((f) => f?.Segments?.[0]?.[0]?.Airline?.AirlineCode === code).length,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [searchResults, activeTab, tripType, isDomestic]);

  // ─── Format helpers ───────────────────────────────────────────────────────
  const formatTime = (iso) => {
    if (!iso) return "--:--";
    try {
      return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false });
    } catch { return "--:--"; }
  };

  const formatDuration = (mins) => {
    if (!mins && mins !== 0) return "--";
    return `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  // ─── RENDER TABS ──────────────────────────────────────────────────────────
  const renderTabs = () => {
    if (searchResults.length === 0) return null;

    if (tripType === "multi") {
      const segmentArrays = Array.isArray(searchResults[0])
        ? searchResults
        : flights.map(() => []);

      return (
        <div className="mb-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(Number(k))}
            className="mb-3"
          >
            {segmentArrays.map((segFlights, index) => (
              <Tab
                key={index}
                eventKey={index}
                title={
                  <div className="d-flex align-items-center">
                    <span>{flights[index]?.from} → {flights[index]?.to}</span>
                    <span className="badge bg-secondary ms-2">
                      {segFlights?.length || 0}
                    </span>
                    {selectedFlights[index] && (
                      <span className="badge bg-success ms-1">✓</span>
                    )}
                  </div>
                }
              />
            ))}
          </Tabs>
          <div className="alert alert-info py-2">
            <small>
              Showing flights for:{" "}
              <strong>{flights[activeTab]?.from} → {flights[activeTab]?.to}</strong>{" "}
              on {flights[activeTab]?.date}
            </small>
            <div className="small text-muted mt-1">
              Segment {activeTab + 1} of {segmentArrays.length} •{" "}
              {selectedFlights.filter(Boolean).length} of {segmentArrays.length} selected
            </div>
          </div>
        </div>
      );
    }

    if (tripType === "round") {
      const isArrayOfArrays = Array.isArray(searchResults[0]);
      const obCount = isArrayOfArrays ? searchResults[0]?.length : 0;
      const ibCount = isArrayOfArrays ? searchResults[1]?.length : 0;

      return (
        <div className="mb-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(Number(k))}
            className="mb-3"
          >
            <Tab
              eventKey={0}
              title={
                <div className="d-flex align-items-center">
                  <span>Departure: {flights[0].from} → {flights[0].to}</span>
                  <span className="badge bg-primary ms-2">{obCount}</span>
                  {selectedFlights[0] && <span className="badge bg-success ms-1">✓</span>}
                </div>
              }
            />
            <Tab
              eventKey={1}
              title={
                <div className="d-flex align-items-center">
                  <span>Return: {flights[0].to} → {flights[0].from}</span>
                  <span className="badge bg-primary ms-2">{ibCount}</span>
                  {selectedFlights[1] && <span className="badge bg-success ms-1">✓</span>}
                </div>
              }
            />
          </Tabs>
          <div className="alert alert-info py-2">
            <small>
              <strong>Round Trip</strong> — Showing{" "}
              {activeTab === 0 ? "Outbound (Departure)" : "Inbound (Return)"} flights
            </small>
            <div className="small mt-1">
              Segment {activeTab + 1} of {searchResults.length}
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  // ✅ Check if a flight is selected for current active tab
  const isFlightSelected = (flight) => {
    return (
      selectedFlights[activeTab] &&
      selectedFlights[activeTab].Segments &&
      flight.Segments &&
      selectedFlights[activeTab].Segments[0]?.[0]?.Airline?.FlightNumber ===
      flight.Segments[0]?.[0]?.Airline?.FlightNumber &&
      selectedFlights[activeTab].Segments[0]?.[0]?.Origin?.DepTime ===
      flight.Segments[0]?.[0]?.Origin?.DepTime
    );
  };

  // Render flight results
  const renderFlightResults = () => {
    if (searchLoading) return <div className="text-center py-5"><Laoding /></div>;
    if (searchError) return <Alert variant="danger" className="text-center">{searchError}</Alert>;

    const currentFlights = getFilteredResultsForDisplay();
    console.log("current flights", currentFlights);
    const filteredResults = applyFilters(currentFlights);
    console.log("filtered flights", filteredResults);

    if (filteredResults.length === 0 && currentFlights.length > 0) {
      return (
        <div className="text-center py-5 text-muted">
          <h5>No flights match your filters</h5>
          <Button variant="outline-primary" size="sm" onClick={clearAllFilters}>Clear All Filters</Button>
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

    const visibleFlights = filteredResults.slice(0, visibleCount);

    return (
      <>
        {visibleFlights.map((flight, index) => {
          const segments = flight.Segments || [];
          const fareInfo = flight.Fare || {};
          const airlineInfo = flight.Airline || {};
          const firstSeg = segments[0];
          const segmentData = (Array.isArray(firstSeg) ? firstSeg[0] : firstSeg) || {};
          const segmentAirline = segmentData.Airline || airlineInfo;
          const originInfo = segmentData.Origin || {};
          const destinationInfo = segmentData.Destination || {};
          const originAirport = originInfo.Airport || {};
          const destinationAirport = destinationInfo.Airport || {};
          const displayPrice = getDisplayPrice(flight);
          const savings = (fareInfo.PublishedFare || 0) - displayPrice;
          const isSelected = isFlightSelected(flight);

          return (
            <Card
              key={index}
              className={`flight-card shadow-sm p-3 mb-4 rounded-3 ${isSelected ? "border-primary border-2" : ""}`}
              onClick={() => handleFlightSelect(flight)}
              style={{ cursor: "pointer" }}
            >
              {isSelected && (
                <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-success">Selected ✓</span>
                </div>
              )}
              <Row className="align-items-center">
                {/* Airline */}
                <Col md={3} className="d-flex align-items-center">
                  <div className="bg-light rounded p-2 me-3 d-flex align-items-center justify-content-center" style={{ width: "50px", height: "50px" }}>
                    <strong className="text-primary">{segmentAirline?.AirlineCode || "--"}</strong>
                  </div>
                  <div>
                    <h6 className="mb-0">{segmentAirline?.AirlineName || "Unknown Airline"}</h6>
                    <small className="text-muted">
                      {segmentAirline?.FlightNumber ? `Flight ${segmentAirline.FlightNumber}` : ""}
                    </small>
                    <br />
                    <small className={flight.IsRefundable ? "text-success" : "text-danger"}>
                      {flight.IsRefundable ? "🔄 Refundable" : "❌ Non-Refundable"}
                    </small>
                  </div>
                </Col>

                {/* Departure */}
                <Col md={2} className="text-center">
                  <h5 className="mb-0">{formatTime(originInfo.DepTime)}</h5>
                  <small className="text-muted">{originAirport?.AirportCode || "--"}</small>
                  <br />
                  <small className="text-muted">{originAirport?.CityName || "--"}</small>
                </Col>
                
                {/* Duration */}
                <Col md={2} className="text-center">
                  <p className="mb-1 text-success fw-bold">{formatDuration(segmentData.Duration)}</p>
                  <small className="text-muted">{segmentData.StopOver ? "With Stop" : "Non stop"}</small>
                </Col>

                {/* Arrival */}
                <Col md={2} className="text-center">
                  <h5 className="mb-0">{formatTime(destinationInfo.ArrTime)}</h5>
                  <small className="text-muted">{destinationAirport?.AirportCode || "--"}</small>
                  <br />
                  <small className="text-muted">{destinationAirport?.CityName || "--"}</small>
                </Col>

                {/* Price */}
                <Col md={3} className="text-end">
                  <h5 className="fw-bold text-primary">₹ {Math.ceil(displayPrice)}</h5>
                  <small className="text-muted">Total {adults} adult{adults > 1 ? "s" : ""}</small>
                  {savings > 0 && <><br /><small className="text-success">Save ₹{Math.ceil(savings)}</small></>}
                  <br />
                  <Button
                    className={`view-price-flight mt-1 ${isSelected ? "btn-success" : ""}`}
                    onClick={(e) => { e.stopPropagation(); handleFlightSelect(flight); }}
                  >
                    {isSelected ? "SELECTED ✓" : "SELECT FLIGHT"}
                  </Button>
                </Col>
              </Row>

              {/* Baggage */}
              <Row className="mt-3">
                <Col>
                  <div className="bg-light p-2 rounded-2">
                    <small className="text-muted">
                      <strong>Baggage:</strong> {segmentData?.Baggage || "--"} •{" "}
                      <strong>Cabin:</strong> {segmentData?.CabinBaggage || "--"} •{" "}
                      <strong>Class:</strong> {travelClass}
                    </small>
                  </div>
                </Col>
              </Row>
            </Card>
          );
        })}

        {/* Sticky bottom bar */}
        {selectedFlights.some(Boolean) && (
          <div className="sticky-bottom flight-summary-bar bg-white p-3 border-top shadow-sm">
            <Row className="align-items-center">
              <Col md={6}>
                <h5 className="mb-0">Selected Flights:</h5>
                <small className="text-muted">
                  {selectedFlights.filter(Boolean).length} of{" "}
                  {tripType === "round" ? 2 : tripType === "multi" ? flights.length : 1} segments selected
                </small>
              </Col>
              <Col md={4} className="text-end">
                <h4 className="fw-bold mb-0">Total: ₹ {Math.ceil(totalPrice)}</h4>
              </Col>
              <Col md={2}>
                <Button variant="primary" className="w-100 view-price-flight mt-0" onClick={onViewPrices}>
                  VIEW PRICES
                </Button>
              </Col>
            </Row>
          </div>
        )}

        {visibleCount < filteredResults.length && (
          <div className="text-center my-4">
            <Spinner animation="border" size="sm" className="me-2" />
            <span>Loading more flights... ({visibleCount} of {filteredResults.length})</span>
          </div>
        )}
        {visibleCount >= filteredResults.length && filteredResults.length > 0 && (
          <div className="text-center my-4 text-muted">
            <small>All {filteredResults.length} flights loaded</small>
          </div>
        )}
      </>
    );
  };

  // ─── Passenger count buttons ──────────────────────────────────────────────
  const renderButtons = (count, setter, max = 9) => (
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

  // ─── buildFlightDetailPayload ─────────────────────────────────────────────
  const buildFlightDetailPayload = () => {
    if (tripType === "round") {
      return {
        TraceId, tripType, isDomestic,
        resultIndexes: { outbound: selectedFlights[0]?.ResultIndex, inbound: selectedFlights[1]?.ResultIndex },
        pricingBreakdown,
        passengers: { adults, children, infants },
        travelClass,
      };
    }
    return {
      TraceId, tripType, isDomestic,
      resultIndexes: selectedFlights.map((f) => f?.ResultIndex),
      pricingBreakdown,
      passengers: { adults, children, infants },
      travelClass,
    };
  };

  // ─── Filter Panel (reusable JSX, avoids duplication) ─────────────────────
  const FilterPanel = ({ idSuffix = "" }) => (
    <fieldset disabled={isInitialLoading || searchLoading}>
      <div className="filter-box p-3 border rounded shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="fw-bold mb-0">FILTER</h5>
          <FaUndoAlt title="Reset Filters" style={{ cursor: "pointer", color: "#d04856ff" }} onClick={clearAllFilters} />
        </div>

        {/* Refundable */}
        <div className="filter-group mb-3">
          <div className="form-check">
            <input className="form-check-input" type="checkbox"
              id={`refundable${idSuffix}`}
              checked={filters.refundableOnly}
              onChange={(e) => handleFilterChange("refundableOnly", e.target.checked)} />
            <label className="form-check-label" htmlFor={`refundable${idSuffix}`}>Refundable Only</label>
          </div>
        </div>

        {/* Airlines */}
        <div className="filter-group mb-3">
          <div className="filter-title d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={() => handleToggle("airlines")}>
            <span className="flight-heading">Airlines</span>
            <FontAwesomeIcon icon={toggle.airlines ? faChevronUp : faChevronDown} />
          </div>
          {toggle.airlines && (
            <div className="filter-options mt-2">
              {availableAirlines.length === 0
                ? <small className="text-muted">No airlines available</small>
                : availableAirlines.map((airline) => (
                  <div className="form-check" key={airline.code}>
                    <input className="form-check-input" type="checkbox"
                      id={`airline-${airline.code}${idSuffix}`}
                      checked={filters.airlines.includes(airline.code)}
                      onChange={(e) => handleAirlineFilter(airline.code, e.target.checked)} />
                    <label className="form-check-label" htmlFor={`airline-${airline.code}${idSuffix}`}>
                      {airline.name} <span className="text-muted">({airline.count})</span>
                    </label>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Stops */}
        <div className="filter-group mb-3">
          <div className="filter-title d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={() => handleToggle("stops")}>
            <span className="flight-heading">Stops</span>
            <FontAwesomeIcon icon={toggle.stops ? faChevronUp : faChevronDown} />
          </div>
          {toggle.stops && (
            <div className="filter-options mt-2">
              {[{ label: "Non-stop", value: 0 }, { label: "1 Stop", value: 1 }, { label: "2+ Stops", value: 2 }].map((stop) => (
                <div className="form-check" key={stop.value}>
                  <input className="form-check-input" type="checkbox"
                    id={`stop-${stop.value}${idSuffix}`}
                    checked={filters.stops.includes(stop.value)}
                    onChange={(e) => handleStopFilter(stop.value, e.target.checked)} />
                  <label className="form-check-label" htmlFor={`stop-${stop.value}${idSuffix}`}>{stop.label}</label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        {/* Price Range - Dual Handle Slider */}
        <div className="filter-section mb-3">
          <div
            className="filter-header d-flex justify-content-between"
            onClick={() => handleToggle("price")}
            style={{ cursor: "pointer", fontWeight: "600" }}
          >
            <span className="flight-heading">Price Range</span>
            <FontAwesomeIcon icon={toggle.price ? faChevronUp : faChevronDown} />
          </div>

          {toggle.price && (
            <div className="filter-body mt-2">
              <div className="dual-range-value">
                ₹{filters.priceRange.min.toLocaleString()} – ₹{filters.priceRange.max.toLocaleString()}
              </div>

              <div className="dual-range-wrapper">
                {/* Track background */}
                <div className="dual-range-track" />

                {/* Filled track between thumbs */}
                <div
                  className="dual-range-fill"
                  style={{
                    left: `${((filters.priceRange.min - dynamicPriceBounds.min) /
                      (dynamicPriceBounds.max - dynamicPriceBounds.min || 1)) * 100}%`,
                    right: `${100 - ((filters.priceRange.max - dynamicPriceBounds.min) /
                      (dynamicPriceBounds.max - dynamicPriceBounds.min || 1)) * 100}%`,
                  }}
                />

                {/* MIN thumb */}
                <input
                  type="range"
                  className="dual-range-input"
                  style={{ zIndex: filters.priceRange.min > dynamicPriceBounds.max - 1000 ? 5 : 3 }}
                  min={dynamicPriceBounds.min}
                  max={dynamicPriceBounds.max}
                  value={filters.priceRange.min}
                  step="500"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val <= filters.priceRange.max - 500) {
                      handlePriceRangeChange("min", val);
                    }
                  }}
                />

                {/* MAX thumb */}
                <input
                  type="range"
                  className="dual-range-input"
                  style={{ zIndex: 4 }}
                  min={dynamicPriceBounds.min}
                  max={dynamicPriceBounds.max}
                  value={filters.priceRange.max}
                  step="500"
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= filters.priceRange.min + 500) {
                      handlePriceRangeChange("max", val);
                    }
                  }}
                />
              </div>

              <div className="dual-range-labels">
                <span>₹{dynamicPriceBounds.min.toLocaleString()}</span>
                <span>₹{dynamicPriceBounds.max.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Departure Time */}
        <div className="filter-group mb-3">
          <div className="filter-title d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={() => handleToggle("departure")}>
            <span className="flight-heading">Departure Time</span>
            <FontAwesomeIcon icon={toggle.departure ? faChevronUp : faChevronDown} />
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
                  <input className="form-check-input" type="checkbox"
                    id={`departure-${i}${idSuffix}`}
                    checked={filters.departureTimes.some((t) => t[0] === time.range[0] && t[1] === time.range[1])}
                    onChange={(e) => handleDepartureTimeFilter(time.range, e.target.checked)} />
                  <label className="form-check-label" htmlFor={`departure-${i}${idSuffix}`}>{time.label}</label>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Duration */}
        <div className="filter-group mb-3">
          <div className="filter-title d-flex justify-content-between" style={{ cursor: "pointer" }} onClick={() => handleToggle("duration")}>
            <span className="flight-heading">Flight Duration</span>
            <FontAwesomeIcon icon={toggle.duration ? faChevronUp : faChevronDown} />
          </div>
          {toggle.duration && (
            <div className="filter-options mt-2">
              {[
                { label: "Short (< 2 hours)", max: 120 },
                { label: "Medium (2-4 hours)", min: 120, max: 240 },
                { label: "Long (> 4 hours)", min: 240 },
              ].map((duration, i) => (
                <div className="form-check" key={i}>
                  <input className="form-check-input" type="checkbox"
                    id={`duration-${i}${idSuffix}`}
                    checked={filters.durations.includes(duration.label)}
                    onChange={(e) => handleDurationFilter(duration, e.target.checked)} />
                  <label className="form-check-label" htmlFor={`duration-${i}${idSuffix}`}>{duration.label}</label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </fieldset>
  );

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div>
      {/* Search Form */}
      <div className="flight-section" style={{ marginTop: "98px" }}>
        <div className="search-box rounded shadow-sm flight-form">
          <div className="container">
            {error && <Alert variant="warning">{error}</Alert>}
            {loading && (
              <div className="text-center py-3">
                <Spinner animation="border" size="sm" className="me-2" />
                <span>Initializing application...</span>
              </div>
            )}

            <Row className="align-items-end g-2 mb-3 mt-0 travellers justify-content-center">
              {/* Trip type tabs */}
              <Col md={12} className="mb-4 tabing-section">
                <Form.Group>
                  <div className="trip-tabs text-center">
                    <button type="button"
                      className={`trip-tab ${tripType === "oneway" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("oneway")}
                      disabled={isInitialLoading || searchLoading}>
                      <i className="bi bi-airplane"></i> One Way
                    </button>
                    <button type="button"
                      className={`trip-tab ${tripType === "round" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("round")}
                      disabled={isInitialLoading || searchLoading}>
                      <i className="bi bi-arrow-left-right"></i> Round Trip
                    </button>
                    <button type="button"
                      className={`trip-tab ${tripType === "multi" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("multi")}
                      disabled={isInitialLoading || searchLoading}>
                      <i className="bi bi-signpost-split"></i> Multi City
                    </button>
                  </div>
                </Form.Group>
              </Col>

              {/* From */}
              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">From</Form.Label>
                  <AirportDropdown
                    value={flights[0]?.from}
                    onChange={(v) => handleFromChange(0, v)}
                    placeholder="From City"
                    type="from"
                    segmentIndex={0}
                    airports={airports}
                    flights={flights}
                    loading={loading}
                    disabled={isInitialLoading || searchLoading}
                  />
                </Form.Group>
              </Col>

              {/* To */}
              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">To</Form.Label>
                  <AirportDropdown
                    value={flights[0]?.to}
                    onChange={(v) => handleToChange(0, v)}
                    placeholder="To City"
                    type="to"
                    segmentIndex={0}
                    airports={airports}
                    flights={flights}
                    loading={loading}
                    disabled={isInitialLoading || searchLoading}
                  />
                </Form.Group>
              </Col>

              {/* Depart */}
              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Depart</Form.Label>
                  <DatePicker
                    selected={flights[0]?.date ? new Date(flights[0].date) : new Date()}
                    onChange={(date) => {
                      const nf = [...flights];
                      nf[0] = { ...nf[0], date: date.toISOString().split("T")[0] };
                      setFlights(nf);
                    }}
                    minDate={new Date()}
                    dateFormat="EEE, MMM d, yyyy"
                    className="form-control"
                    disabled={isInitialLoading || searchLoading}
                  />
                </Form.Group>
              </Col>

              {/* Return date */}
              {tripType === "round" && (
                <Col xs={6} md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small">Return</Form.Label>
                    <DatePicker
                      selected={
                        flights[0].returnDate
                          ? new Date(flights[0].returnDate)
                          : flights[0].date ? new Date(flights[0].date) : new Date()
                      }
                      onChange={(date) => {
                        const nf = [...flights];
                        nf[0] = { ...nf[0], returnDate: date.toISOString().split("T")[0] };
                        setFlights(nf);
                      }}
                      minDate={flights[0].date ? new Date(flights[0].date) : new Date()}
                      dateFormat="EEE, MMM d, yyyy"
                      className="form-control"
                      placeholderText="Select Return"
                      disabled={isInitialLoading || searchLoading}
                    />
                  </Form.Group>
                </Col>
              )}

              {/* Passengers & Class */}
              <Col xs={6} sm={2} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Passengers & Class</Form.Label>
                  <Dropdown className="AddClass" style={{ width: "100%" }}
                    show={showTravellerDropdown}
                    onToggle={(isOpen) => setShowTravellerDropdown(isOpen)}>
                    <Dropdown.Toggle id="travellers-dropdown" variant="light"
                      className="AddClass-toggle form-control"
                      disabled={isInitialLoading || searchLoading}>
                      {adults} Adult{adults > 1 ? "s" : ""}, {travelClass || "Economy"}
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="AddClass-menu" style={{ minWidth: "100%" }}>
                      <Row className="p-2">
                        <Col xs={12}><Form.Label>Adults (12y+)</Form.Label>{renderButtons(adults, setAdults, 9)}</Col>
                        <Col xs={12}><Form.Label>Children (2y-12y)</Form.Label>{renderButtons(children, setChildren, 6)}</Col>
                        <Col xs={12}><Form.Label>Infants (below 2y)</Form.Label>{renderButtons(infants, setInfants, 6)}</Col>
                        <Col xs={12} className="mt-3">
                          <Form.Label>Travel Class</Form.Label>
                          <div className="d-flex flex-wrap gap-2">
                            {["Economy", "Premium Economy", "Business", "First Class"].map((cls) => (
                              <Button key={cls} variant={travelClass === cls ? "primary" : "outline-secondary"}
                                size="sm" className="rounded-pill" onClick={() => setTravelClass(cls)}>
                                {cls}
                              </Button>
                            ))}
                          </div>
                        </Col>
                      </Row>
                      <button className="btn btn-primary w-100 mt-3" onClick={() => setShowTravellerDropdown(false)}>
                        Done
                      </button>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>

              {/* Search */}
              <Col xs={6} md={2}>
                <Button type="submit" className="explore-flight-btn w-100"
                  onClick={searchFlights}
                  disabled={searchLoading || loading || isInitialLoading}>
                  {searchLoading
                    ? <><Spinner animation="border" size="sm" className="me-2 spinner-white" />Searching...</>
                    : "Search"}
                </Button>
              </Col>
            </Row>

            {/* Multi-city extra segments */}
            {tripType === "multi" &&
              flights.slice(1).map((flight, index) => {
                const actualIndex = index + 1;
                return (
                  <Row key={actualIndex} className="align-items-end g-2 mb-3 travellers justify-content-center">
                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">From</Form.Label>
                        <AirportDropdown
                          value={flight.from}
                          onChange={(v) => handleFromChange(actualIndex, v)}
                          placeholder="From City"
                          type="from"
                          segmentIndex={actualIndex}
                          airports={airports}
                          flights={flights}
                          loading={loading}
                          disabled={isInitialLoading || searchLoading}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">To</Form.Label>
                        <AirportDropdown
                          value={flight.to}
                          onChange={(v) => handleToChange(actualIndex, v)}
                          placeholder="To City"
                          type="to"
                          segmentIndex={actualIndex}
                          airports={airports}
                          flights={flights}
                          loading={loading}
                          disabled={isInitialLoading || searchLoading}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">Depart</Form.Label>
                        <DatePicker
                          selected={flight.date ? new Date(flight.date) : null}
                          onChange={(date) => {
                            const nf = [...flights];
                            nf[actualIndex] = { ...nf[actualIndex], date: date ? date.toISOString().split("T")[0] : null };
                            setFlights(nf);
                          }}
                          minDate={flights[actualIndex - 1]?.date ? new Date(flights[actualIndex - 1].date) : new Date()}
                          dateFormat="EEE, MMM d, yyyy"
                          className="form-control"
                          disabled={isInitialLoading || searchLoading}
                        />
                      </Form.Group>
                    </Col>
                    <Col xs={6} md={2} className="d-flex align-items-center gap-2">
                      <Button variant="outline-danger" className="rounded-pill" onClick={() => removeCity(actualIndex)}>
                        REMOVE
                      </Button>
                      {actualIndex === flights.length - 1 && flights.length < 4 && (
                        <Button variant="outline-primary" className="rounded-pill" onClick={addCity}>
                          ADD
                        </Button>
                      )}
                    </Col>
                  </Row>
                );
              })}
          </div>
        </div>
      </div>

      {/* Results + Sidebar */}
      <div className="container py-5 filters-mob">
        <Row>
          {/* Desktop Filter Sidebar */}
          <Col sm={3} style={{ opacity: isInitialLoading ? 0.5 : 1 }} className="d-none d-lg-block">
            <FilterPanel idSuffix="-desktop" />
          </Col>

          {/* Flight Results */}
          <Col sm={9}>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h6 className="mb-0 fw-bold">Available Flights</h6>
              <button className="filters-mini-btn d-lg-none" onClick={() => setShowMobileFilter(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" viewBox="0 0 24 24">
                  <path d="M3 5h18l-7 8v5l-4 2v-7z"></path>
                </svg>
                Filter
              </button>
            </div>
            {renderTabs()}
            {renderFlightResults()}
          </Col>
        </Row>
      </div>

      {/* Mobile Filter Offcanvas */}
      <Offcanvas show={showMobileFilter} onHide={() => setShowMobileFilter(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Filters</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <FilterPanel idSuffix="-mobile" />
        </Offcanvas.Body>
      </Offcanvas>

      {/* Flight Detail Modal */}
      <FlightDetail
        flightContext={buildFlightDetailPayload()}
        showModal={showModal}
        onHide={handleCloseModal}
      />
    </div>
  );
};

export default Flight;