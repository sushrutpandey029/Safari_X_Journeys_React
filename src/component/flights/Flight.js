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
import { Modal } from "react-bootstrap";
import FlightDetail from "./Flghitdetail";
import Laoding from "../common/loading";
import { Offcanvas } from "react-bootstrap";
import { useLocation } from "react-router-dom";

const Flight = () => {
  // Flight segments (multi-city form)
  const [flights, setFlights] = useState([]);

  // ✅ STATE FOR SELECTED FLIGHTS AND TOTAL PRICE WITH PRICING DATA
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
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [visibleCount, setVisibleCount] = useState(6);
  const [showTravellerDropdown, setShowTravellerDropdown] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);

  const [showFilter, setShowFilter] = useState(false);

  // ✅ Active tab for multi-city and return OB/IB
  const [activeTab, setActiveTab] = useState(0);

  // Track if flight is domestic
  const [isDomestic, setIsDomestic] = useState(true);

  // ============ FILTER STATES ============
  const [filters, setFilters] = useState({
    refundableOnly: false,
    airlines: [],
    stops: [],
    priceRange: { min: 0, max: 100000 },
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

  // ✅ HELPER FUNCTION TO GET DISPLAY PRICE
  const getDisplayPrice = (flight) => {
    if (!flight) return 0;

    // First check for DisplayPrice at root level (from your example)
    if (flight.DisplayPrice !== undefined && flight.DisplayPrice !== null) {
      return flight.DisplayPrice;
    }

    // Then check in Fare object
    if (flight.Fare) {
      if (
        flight.Fare.DisplayPrice !== undefined &&
        flight.Fare.DisplayPrice !== null
      ) {
        return flight.Fare.DisplayPrice;
      }
      if (
        flight.Fare.OfferedFare !== undefined &&
        flight.Fare.OfferedFare !== null
      ) {
        return flight.Fare.OfferedFare;
      }
      if (
        flight.Fare.PublishedFare !== undefined &&
        flight.Fare.PublishedFare !== null
      ) {
        return flight.Fare.PublishedFare;
      }
    }

    return 0;
  };

  // ✅ HELPER FUNCTION TO GET PRICING BREAKDOWN FROM FLIGHT DATA
  const getPricingData = (flight) => {
    if (!flight) return null;

    // Check if pricing data exists in flight object
    if (flight.Pricing) {
      return flight.Pricing;
    }

    // If pricing data doesn't exist, calculate it based on display price
    const displayPrice = getDisplayPrice(flight);

    // Use fixed percentages for calculation if not provided
    const commissionPercent = 6;
    const gstPercent = 18;
    const commissionAmount = (displayPrice * commissionPercent) / 100;
    const gstAmount = (commissionAmount * gstPercent) / 100;
    const netFare = displayPrice - commissionAmount;
    const finalAmount = netFare + gstAmount;

    return {
      commissionAmount,
      commissionPercent,
      finalAmount,
      gstAmount,
      gstPercent,
      netFare,
    };
  };

  // ✅ CALCULATE TOTAL PRICE AND PRICING BREAKDOWN WHENEVER SELECTED FLIGHTS CHANGE
  useEffect(() => {
    const calculateTotalAndPricing = () => {
      let total = 0;
      let totalCommission = 0;
      let totalGST = 0;
      let totalNetFare = 0;
      let totalFinalAmount = 0;

      selectedFlights.forEach((flight) => {
        if (flight) {
          const price = getDisplayPrice(flight);
          total += price;

          const pricing = getPricingData(flight);
          if (pricing) {
            totalCommission += pricing.commissionAmount || 0;
            totalGST += pricing.gstAmount || 0;
            totalNetFare += pricing.netFare || price;
            totalFinalAmount += pricing.finalAmount || price;
          } else {
            // If no pricing data, use default calculation
            const commissionPercent = 6;
            const gstPercent = 18;
            const commissionAmount = (price * commissionPercent) / 100;
            const gstAmount = (commissionAmount * gstPercent) / 100;
            const netFare = price - commissionAmount;
            const finalAmount = netFare + gstAmount;

            totalCommission += commissionAmount;
            totalGST += gstAmount;
            totalNetFare += netFare;
            totalFinalAmount += finalAmount;
          }
        }
      });

      setTotalPrice(total);

      // Calculate averages for percentages
      const avgCommissionPercent = 6; // Default or calculate from individual flights
      const avgGSTPercent = 18; // Default or calculate from individual flights

      setPricingBreakdown({
        commissionAmount: parseFloat(totalCommission.toFixed(2)),
        commissionPercent: avgCommissionPercent,
        finalAmount: parseFloat(totalFinalAmount.toFixed(2)),
        gstAmount: parseFloat(totalGST.toFixed(2)),
        gstPercent: avgGSTPercent,
        netFare: parseFloat(totalNetFare.toFixed(2)),
      });
    };

    calculateTotalAndPricing();
  }, [selectedFlights]);

  // Infinite Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
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

  // ✅ COMPLETELY DYNAMIC: No static airports list
  const checkIfDomestic = (origin, destination) => {
    // Check if airports data is available
    if (!airports || airports.length === 0) {
      return false; // Default to false until data loads
    }

    // Normalize airport codes
    const normalizedOrigin = origin?.toUpperCase().trim();
    const normalizedDest = destination?.toUpperCase().trim();

    // If same airport, check if it's Indian
    if (normalizedOrigin === normalizedDest) {
      const airport = airports.find((a) => a.airport_code === normalizedOrigin);
      return airport && isIndianAirport(airport);
    }

    // Find origin and destination airports
    const originAirport = airports.find(
      (a) => a.airport_code === normalizedOrigin,
    );
    const destinationAirport = airports.find(
      (a) => a.airport_code === normalizedDest,
    );

    // If either airport not found in our data
    if (!originAirport || !destinationAirport) {
      console.warn(
        `Airport not found in database: ${origin} or ${destination}`,
      );
      return false;
    }

    // Check if both are Indian airports
    const isOriginIndian = isIndianAirport(originAirport);
    const isDestIndian = isIndianAirport(destinationAirport);

    console.log(
      `Route check: ${originAirport.city_name || origin} (${
        originAirport.country_name || "Unknown"
      }) → ${destinationAirport.city_name || destination} (${
        destinationAirport.country_name || "Unknown"
      }) = ${isOriginIndian && isDestIndian ? "Domestic" : "International"}`,
    );

    return isOriginIndian && isDestIndian;
  };

  // ✅ Helper function to check if an airport is Indian
  const isIndianAirport = (airport) => {
    if (!airport) return false;

    // Check by country code
    if (airport.country_code === "IN") return true;

    // Check by country name
    if (
      airport.country_name &&
      (airport.country_name.toLowerCase().includes("india") ||
        airport.country_name.toLowerCase().includes("indian"))
    ) {
      return true;
    }

    // Check by city name (fallback)
    const indianCityKeywords = [
      "delhi",
      "mumbai",
      "chennai",
      "bangalore",
      "kolkata",
      "hyderabad",
      "ahmedabad",
      "pune",
      "jaipur",
      "lucknow",
      "goa",
      "kochi",
    ];
    if (
      airport.city_name &&
      indianCityKeywords.some((keyword) =>
        airport.city_name.toLowerCase().includes(keyword),
      )
    ) {
      return true;
    }

    return false;
  };

  // ✅ Helper function to get airport code from segment
  const getAirportCodeFromSegment = (segment, type = "origin") => {
    if (!segment) return "";

    const location = type === "origin" ? segment.Origin : segment.Destination;

    if (typeof location === "string") {
      return location;
    }

    if (location?.Airport?.AirportCode) {
      return location.Airport.AirportCode;
    }

    if (location?.AirportCode) {
      return location.AirportCode;
    }

    return "";
  };

  // ✅ FIXED: Get filtered results based on trip type and active tab - FIXED FOR MULTI-CITY
  const getFilteredResultsForDisplay = () => {
    if (!searchResults || searchResults.length === 0) return [];

    console.log("Total search results:", searchResults.length);
    console.log(
      "Search results structure:",
      Array.isArray(searchResults[0]) ? "Array of arrays" : "Flat array",
    );

    // Check if searchResults is an array of arrays (domestic return response)
    if (
      Array.isArray(searchResults[0]) &&
      searchResults[0].length > 0 &&
      Array.isArray(searchResults[1]) &&
      searchResults[1].length > 0
    ) {
      // For domestic return with array of arrays structure
      if (tripType === "round") {
        // API returns: searchResults[0] = Outbound, searchResults[1] = Inbound
        return activeTab === 0 ? searchResults[0] : searchResults[1];
      }

      // For multi-city with array of arrays structure
      if (tripType === "multi" && Array.isArray(searchResults[0])) {
        // Check if we have enough arrays for each segment
        if (activeTab < searchResults.length) {
          return searchResults[activeTab] || [];
        }
        return [];
      }

      // For other trip types, flatten the array
      return searchResults.flat();
    }

    // For domestic return with flat array (old logic)
    if (tripType === "round" && isDomestic) {
      // First check TripIndicator if available
      const outboundFlights = searchResults.filter(
        (flight) =>
          flight.TripIndicator === "OB" ||
          flight.TripIndicator === "Outbound" ||
          flight.TripIndicator === "1", // Sometimes numeric
      );

      const inboundFlights = searchResults.filter(
        (flight) =>
          flight.TripIndicator === "IB" ||
          flight.TripIndicator === "Inbound" ||
          flight.TripIndicator === "RT" ||
          flight.TripIndicator === "Return" ||
          flight.TripIndicator === "2", // Sometimes numeric
      );

      console.log(
        "TripIndicator - OB:",
        outboundFlights.length,
        "IB:",
        inboundFlights.length,
      );

      // If TripIndicator worked, use it
      if (outboundFlights.length > 0 || inboundFlights.length > 0) {
        return activeTab === 0 ? outboundFlights : inboundFlights;
      }

      // Fallback to route-based filtering
      const origin = flights[0]?.from;
      const destination = flights[0]?.to;

      // Filter outbound flights (origin → destination)
      const obFlights = searchResults.filter((flight) => {
        const segments = flight.Segments || [];
        if (segments.length === 0) return false;

        // Get first segment
        const firstSegment = segments[0];
        const segment = Array.isArray(firstSegment)
          ? firstSegment[0]
          : firstSegment;
        if (!segment) return false;

        const segOrigin = getAirportCodeFromSegment(segment, "origin");
        const segDest = getAirportCodeFromSegment(segment, "destination");

        return segOrigin === origin && segDest === destination;
      });

      // Filter inbound flights (destination → origin)
      const ibFlights = searchResults.filter((flight) => {
        const segments = flight.Segments || [];
        if (segments.length === 0) return false;

        // Get first segment
        const firstSegment = segments[0];
        const segment = Array.isArray(firstSegment)
          ? firstSegment[0]
          : firstSegment;
        if (!segment) return false;

        const segOrigin = getAirportCodeFromSegment(segment, "origin");
        const segDest = getAirportCodeFromSegment(segment, "destination");

        return segOrigin === destination && segDest === origin;
      });

      console.log(
        "Route-based - OB:",
        obFlights.length,
        "IB:",
        ibFlights.length,
      );

      return activeTab === 0 ? obFlights : ibFlights;
    }

    // ✅ FIXED: For multi-city - filter by active segment route
    // if (tripType === "multi") {
    //   const currentFlight = flights[activeTab];
    //   if (!currentFlight) return [];

    //   console.log(
    //     `Filtering multi-city segment ${activeTab}: ${currentFlight.from} -> ${currentFlight.to}`,
    //   );

    //   const segmentFlights = searchResults.filter((flight) => {
    //     const segments = flight.Segments || [];
    //     if (segments.length === 0) return false;

    //     // Get first segment
    //     const firstSegment = segments[0];
    //     const segment = Array.isArray(firstSegment)
    //       ? firstSegment[0]
    //       : firstSegment;
    //     if (!segment) return false;

    //     const segOrigin = getAirportCodeFromSegment(segment, "origin");
    //     const segDest = getAirportCodeFromSegment(segment, "destination");

    //     // Also check TripIndicator for multi-city segments
    //     const hasMatchingRoute =
    //       segOrigin === currentFlight.from && segDest === currentFlight.to;

    //     // Check if flight has segment index indicator
    //     if (flight.SegmentIndex !== undefined) {
    //       return flight.SegmentIndex === activeTab;
    //     }

    //     return hasMatchingRoute;
    //   });

    //   console.log(
    //     `Multi-city segment ${activeTab} flights:`,
    //     segmentFlights.length,
    //   );
    //   return segmentFlights;
    // }

    // ✅ CORRECT MULTI-CITY HANDLING
    if (tripType === "multi") {
      if (!Array.isArray(searchResults)) return [];

      if (Array.isArray(searchResults[activeTab])) {
        return searchResults[activeTab];
      }

      return [];
    }

    // For one-way: return all
    console.log("One-way flights total:", searchResults.length);
    return searchResults;
  };

  const applyFilters = (flights) => {
    if (!flights || flights.length === 0) return [];

    return flights.filter((flight) => {
      // Refundable filter
      if (filters.refundableOnly && !flight.IsRefundable) {
        return false;
      }

      // Airline filter
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

      // Stops filter
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

      // Price filter - ✅ FIXED: Use getDisplayPrice helper
      const price = getDisplayPrice(flight);
      if (price < filters.priceRange.min || price > filters.priceRange.max) {
        return false;
      }

      // Departure time filter
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

      // Duration filter
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

    // Get pricing data for this flight
    const flightPricing = getPricingData(flight);

    // Add pricing data to flight object
    const flightWithPricing = {
      ...flight,
      Pricing: flightPricing,
    };

    // Check if this flight is already selected for this segment
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
      // Same flight clicked again, deselect it
      newSelectedFlights[activeTab] = null;
    } else {
      // Select this flight for current active tab
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

        // Get user IP
        const ipResponse = await axios.get("https://api.ipify.org?format=json");
        const userIp = ipResponse.data.ip;
        setUserIP(userIp);

        // Fetch airports data dynamically
        const airportsResponse = await getIndianAirports();
        console.log("airportsResponse data", airportsResponse);
        if (airportsResponse?.data && Array.isArray(airportsResponse.data)) {
          const airportsData = airportsResponse.data;
          setAirports(airportsData);

          // Cache data for better performance
          localStorage.setItem("airportsCache", JSON.stringify(airportsData));
          localStorage.setItem("airportsCacheTimestamp", Date.now().toString());

          // Check initial flight route
          if (flights[0]?.from && flights[0]?.to) {
            const domesticStatus = checkIfDomestic(
              flights[0].from,
              flights[0].to,
            );
            setIsDomestic(domesticStatus);
          }
        } else if (Array.isArray(airportsResponse)) {
          setAirports(airportsResponse);
        } else {
          throw new Error("Invalid airports response format");
        }
      } catch (error) {
        console.error("Initialization error:", error);
        setError(`Initialization failed: ${error.message}`);

        // Try to load from cache
        try {
          const cachedData = localStorage.getItem("airportsCache");
          const cachedTimestamp = localStorage.getItem(
            "airportsCacheTimestamp",
          );

          if (cachedData && cachedTimestamp) {
            const oneDay = 24 * 60 * 60 * 1000;
            const cacheAge = Date.now() - parseInt(cachedTimestamp);

            if (cacheAge < oneDay) {
              // Cache is less than 1 day old
              const cachedAirports = JSON.parse(cachedData);
              setAirports(cachedAirports);
            }
          }
        } catch (cacheError) {
          console.error("Cache load error:", cacheError);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeApp();
  }, []);

  // Handle navigation data from FlightPopularDestination
  useEffect(() => {
    if (navigationState) {
      console.log("Received navigation state:", navigationState);

      // Set flights from navigation state
      if (navigationState.flights && navigationState.flights.length > 0) {
        setFlights(navigationState.flights);
      }

      // Set trip type
      if (navigationState.tripType) {
        setTripType(navigationState.tripType);
      }

      // Set passengers
      if (navigationState.passengers) {
        setAdults(navigationState.passengers.adults || 1);
        setChildren(navigationState.passengers.children || 0);
        setInfants(navigationState.passengers.infants || 0);
      }

      // Set travel class
      if (navigationState.travelClass) {
        setTravelClass(navigationState.travelClass);
      }

      // Set domestic status
      if (navigationState.isDomestic !== undefined) {
        setIsDomestic(navigationState.isDomestic);
      }
    } else {
      // Fallback default values if no navigation state
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

  // Custom Airport Dropdown Component with FIXES
  const AirportDropdown = ({
    value,
    onChange,
    placeholder = "Select Airport",
    disabled = false,
    type = "from",
    segmentIndex = 0,
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAirports, setFilteredAirports] = useState([]);
    const dropdownRef = useRef(null);

    // ✅ FIXED: Get airports to exclude
    const getExcludedAirports = () => {
      const excluded = new Set();

      // Always exclude the opposite field of the same segment
      const currentFlight = flights[segmentIndex];
      if (currentFlight) {
        if (type === "from" && currentFlight.to) {
          excluded.add(currentFlight.to);
        } else if (type === "to" && currentFlight.from) {
          excluded.add(currentFlight.from);
        }
      }

      return excluded;
    };

    useEffect(() => {
      const filterAirports = () => {
        const excludedAirports = getExcludedAirports();

        let filtered = airports;

        // Apply search filter

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

        // Apply exclusion filter
        filtered = filtered.filter(
          (airport) => !excludedAirports.has(airport.airport_code),
        );

        return filtered.slice(0, 15);
      };

      const results = filterAirports();
      setFilteredAirports(results);
    }, [searchTerm, airports, flights, segmentIndex, type]);

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
      (airport) => airport.airport_code === value,
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
            if (disabled) return;
            setIsOpen(true);
            const excludedAirports = getExcludedAirports();
            const availableAirports = airports.filter(
              (airport) => !excludedAirports.has(airport.airport_code),
            );
            setFilteredAirports(availableAirports.slice(0, 15));
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
              filteredAirports.reverse().map((airport) => (
                <div
                  key={airport.airport_code}
                  className={`dropdown-item ${
                    value === airport.airport_code ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(airport)}
                >
                  <div className="airport-option">
                    <div className="airport-main">
                      <strong>{`${airport.city_name},${airport.country_name}`}</strong>
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

  // ✅ UPDATED: Add city with auto-fill and max limit of 4
  const addCity = () => {
    if (flights.length >= 4) {
      alert("Maximum 4 cities allowed for multi-city trip");
      return;
    }

    const lastFlight = flights[flights.length - 1];
    const newFlight = {
      from: lastFlight.to || "", // Auto-fill from previous segment's "to"
      to: "",
      date: lastFlight.date || new Date().toISOString().split("T")[0],
    };
    setFlights([...flights, newFlight]);

    // Initialize selected flights array for new segment
    const newSelectedFlights = [...selectedFlights, null];
    setSelectedFlights(newSelectedFlights);

    setActiveTab(flights.length); // Switch to new tab
  };

  const removeCity = (index) => {
    if (flights.length > 1) {
      const newFlights = flights.filter((_, i) => i !== index);
      setFlights(newFlights);

      // Remove corresponding selected flight
      const newSelectedFlights = selectedFlights.filter((_, i) => i !== index);
      setSelectedFlights(newSelectedFlights);

      if (activeTab >= newFlights.length) {
        setActiveTab(newFlights.length - 1);
      }
    }
  };

  const handleFromChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index].from = value;
    setFlights(newFlights);

    if (index === 0 && newFlights[0].to) {
      const domesticStatus = checkIfDomestic(value, newFlights[0].to);
      setIsDomestic(domesticStatus);
    }
  };

  const handleToChange = (index, value) => {
    const newFlights = [...flights];
    newFlights[index].to = value;
    setFlights(newFlights);

    if (index === 0 && newFlights[0].from) {
      const domesticStatus = checkIfDomestic(newFlights[0].from, value);
      setIsDomestic(domesticStatus);
    }
  };

  const onViewPrices = () => {
    // ✅ ROUND TRIP → require both
    if (tripType === "round") {
      if (!selectedFlights[0] || !selectedFlights[1]) {
        alert("Please select outbound and return flights");
        return;
      }
    }

    // ✅ ONE WAY → require 1
    else if (tripType === "oneway") {
      if (!selectedFlights[0]) {
        alert("Please select a flight");
        return;
      }
    }

    // ✅ MULTI CITY → require ONLY current active tab
    else if (tripType === "multi") {
      if (!selectedFlights[activeTab]) {
        alert(`Please select flight for segment ${activeTab + 1}`);
        return;
      }
    }

    // ✅ prepare payload

    let flightsToSend = [];

    if (tripType === "multi") {
      // send only selected segment flight
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
    setSelectedFlights([]); // Reset selected flights

    if (newTripType === "multi") {
      if (flights.length === 1) {
        // Auto-fill second segment's "from" with first segment's "to"
        const newFlights = [
          ...flights,
          {
            from: flights[0].to || "", // Auto-fill from first segment's "to"
            to: "",
            date: flights[0].date || new Date().toISOString().split("T")[0],
          },
        ];
        setFlights(newFlights);
        setSelectedFlights([null, null]); // Initialize for 2 segments
      }
    } else {
      if (newTripType === "round") {
        setFlights([{ ...flights[0], returnDate: "" }]);
        setSelectedFlights([null, null]); // For outbound and inbound
      } else {
        setFlights([flights[0]]);
        setSelectedFlights([null]); // For one way
      }
    }

    if (flights[0] && flights[0].from && flights[0].to) {
      const domesticStatus = checkIfDomestic(flights[0].from, flights[0].to);
      setIsDomestic(domesticStatus);
    }
  };

  const searchFlights = async () => {
    // First check if airports data is loaded
    if (airports.length === 0) {
      setSearchError("Please wait, airports data is loading...");
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

    // Check if domestic - DYNAMIC CHECK
    const domesticCheck = checkIfDomestic(flights[0].from, flights[0].to);
    setIsDomestic(domesticCheck);

    setSearchLoading(true);
    setSearchError(null);
    setSearchResults([]);
    setVisibleCount(6);
    setFilters((prev) => ({
      ...prev,
      airlines: [],
    }));

    try {
      let segments = [];
      let journeyType = journeyTypeMap[tripType];

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
        segments = flights.map((flight, index) => ({
          Origin: flight.from,
          Destination: flight.to,
          FlightCabinClass: cabinClassMap[travelClass],
          PreferredDepartureTime: `${flight.date}T00:00:00`,
          PreferredArrivalTime: `${flight.date}T00:00:00`,
          SegmentIndex: index, // Add segment index for identification
        }));
      }

      const searchPayload = {
        AdultCount: adults,
        ChildCount: children,
        InfantCount: infants,
        DirectFlight: false,
        OneStopFlight: false,
        JourneyType: journeyType,
        PreferredAirlines: [],
        Segments: segments,
        Sources: ["GDS"], //by default it is LCC and it not allow booking api call
      };

      console.log("Search payload", searchPayload);

      const searchResponse = await Flight_search(searchPayload);
      console.log("fligh search resp", searchResponse);
      let foundFlights = [];

      if (searchResponse) {
        // Try different response structures
        if (
          searchResponse.data &&
          searchResponse.data.Response &&
          searchResponse.data.Response.Results
        ) {
          // Check if it's an array of arrays for domestic return or multi-city
          if ((tripType === "round" && isDomestic) || tripType === "multi") {
            if (Array.isArray(searchResponse.data.Response.Results)) {
              // Check if it's an array of arrays
              if (
                searchResponse.data.Response.Results.length > 0 &&
                Array.isArray(searchResponse.data.Response.Results[0])
              ) {
                foundFlights = searchResponse.data.Response.Results;
                console.log("✅ Found array of arrays for", tripType);
                console.log("Array length:", foundFlights.length);
                foundFlights.forEach((arr, idx) => {
                  console.log(`Segment ${idx} has ${arr.length} flights`);
                });
              } else {
                foundFlights = [searchResponse.data.Response.Results]; // Wrap in array for consistency
              }
            } else {
              foundFlights = [searchResponse.data.Response.Results];
            }
          } else {
            foundFlights = searchResponse.data.Response.Results.flat();
          }
        } else if (searchResponse.data && searchResponse.data.Results) {
          // Check if it's an array of arrays for domestic return or multi-city
          if ((tripType === "round" && isDomestic) || tripType === "multi") {
            if (Array.isArray(searchResponse.data.Results)) {
              if (
                searchResponse.data.Results.length > 0 &&
                Array.isArray(searchResponse.data.Results[0])
              ) {
                foundFlights = searchResponse.data.Results;
                console.log("✅ Found array of arrays for", tripType);
              } else {
                foundFlights = [searchResponse.data.Results];
              }
            } else {
              foundFlights = [searchResponse.data.Results];
            }
          } else {
            foundFlights = searchResponse.data.Results.flat();
          }
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
        console.log("=== API RESPONSE ANALYSIS ===");
        console.log("Total flights found:", foundFlights.length);
        console.log("Trip type:", tripType);

        // For multi-city, ensure we have the right structure
        // if (tripType === "multi") {
        //   if (
        //     Array.isArray(foundFlights[0]) &&
        //     !Array.isArray(foundFlights[0][0])
        //   ) {
        //     // We have a flat array, need to split by segment
        //     console.log("Flat array for multi-city, splitting by segment...");

        //     const segmentedResults = [];
        //     flights.forEach((flight, index) => {
        //       const segmentFlights = foundFlights.filter((f) => {
        //         const segments = f.Segments || [];
        //         if (segments.length === 0) return false;

        //         const firstSegment = segments[0];
        //         const segment = Array.isArray(firstSegment)
        //           ? firstSegment[0]
        //           : firstSegment;
        //         if (!segment) return false;

        //         const segOrigin = getAirportCodeFromSegment(segment, "origin");
        //         const segDest = getAirportCodeFromSegment(
        //           segment,
        //           "destination",
        //         );

        //         return segOrigin === flight.from && segDest === flight.to;
        //       });

        //       segmentedResults.push(segmentFlights);
        //       console.log(
        //         `Segment ${index} (${flight.from} -> ${flight.to}): ${segmentFlights.length} flights`,
        //       );
        //     });

        //     foundFlights = segmentedResults;
        //   }
        // }
        if (tripType === "multi") {
          const results = searchResponse?.data?.Response?.Results || [];

          if (Array.isArray(results) && Array.isArray(results[0])) {
            // PERFECT multi-city format
            foundFlights = results;
          } else {
            // fallback safety
            foundFlights = [results];
          }
        }

        setSearchResults(foundFlights);
        setTraceId(searchResponse?.data?.Response?.TraceId || "");
        setSearchError(null);
      }
    } catch (error) {
      console.error("Search error:", error);
      setSearchError(
        error.response?.data?.message ||
          error.message ||
          "Failed to search flights",
      );
    } finally {
      setSearchLoading(false);
    }
  };

  // Format time from ISO string
  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    try {
      const date = new Date(isoString);
      return date?.toLocaleTimeString("en-IN", {
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
    if (!minutes && minutes !== 0) return "--";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // ✅ FIXED: Render tabs based on trip type with accurate counts
  const renderTabs = () => {
    if (searchResults.length === 0) return null;

    if (tripType === "round") {
      let obCount, ibCount;

      // Check if we have array of arrays structure
      if (Array.isArray(searchResults[0]) && Array.isArray(searchResults[1])) {
        obCount = searchResults[0].length;
        ibCount = searchResults[1].length;
      } else {
        // Flat array structure - use filtering logic
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
          obCount = outboundFlights.length;
          ibCount = inboundFlights.length;
        } else {
          // Fallback to route filtering
          const origin = flights[0]?.from;
          const destination = flights[0]?.to;

          const obByRoute = searchResults.filter((flight) => {
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
          }).length;

          const ibByRoute = searchResults.filter((flight) => {
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
          }).length;

          obCount = obByRoute;
          ibCount = ibByRoute;
        }

        // If still 0, split evenly
        if (obCount === 0 && ibCount === 0 && searchResults.length > 0) {
          obCount = Math.floor(searchResults.length / 2);
          ibCount = searchResults.length - obCount;
        }
      }

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
                  <span>
                    Departure: {flights[0].from} → {flights[0].to}
                  </span>
                  <span className="badge bg-primary ms-2">{obCount}</span>
                </div>
              }
            />
            <Tab
              eventKey={1}
              title={
                <div className="d-flex align-items-center">
                  <span>
                    Return: {flights[0].to} → {flights[0].from}
                  </span>
                  <span className="badge bg-primary ms-2">{ibCount}</span>
                </div>
              }
            />
          </Tabs>

          <div className="alert alert-info py-2">
            <small>
              <strong>Domestic Return Flight</strong> - Showing{" "}
              {activeTab === 0 ? "Outbound (Departure)" : "Inbound (Return)"}{" "}
              flights
            </small>
            <div className="small mt-1">
              Found {activeTab === 0 ? obCount : ibCount} flights out of{" "}
              {searchResults.length} total
            </div>
            <div className="small text-muted">
              Format:{" "}
              {Array.isArray(searchResults[0]) ? "Array[OB, IB]" : "Flat Array"}
            </div>
          </div>
        </div>
      );
    }

    if (tripType === "multi") {
      return (
        <div className="mb-4">
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(Number(k))}
            className="mb-3"
          >
            {searchResults.map((segmentFlights, index) => (
              <Tab
                key={index}
                eventKey={index}
                title={
                  <div className="d-flex align-items-center">
                    <span>
                      {flights[index]?.from} → {flights[index]?.to}
                    </span>

                    <span className="badge bg-secondary ms-2">
                      {segmentFlights?.length || 0}
                    </span>
                  </div>
                }
              />
            ))}
          </Tabs>

          <div className="alert alert-info py-2">
            Showing flights for:
            <strong>
              {" "}
              {flights[activeTab]?.from} → {flights[activeTab]?.to}
            </strong>
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
    if (searchLoading) {
      return (
        <div className="text-center py-5">
          <Laoding />
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

    const currentFlights = getFilteredResultsForDisplay();
    console.log("current flights", currentFlights);
    const filteredResults = applyFilters(currentFlights);
    console.log("filterred flihts", filteredResults);
    if (filteredResults.length === 0 && currentFlights.length > 0) {
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
          // ✅ FIXED: Use getDisplayPrice helper
          const displayPrice = getDisplayPrice(flight);
          const savings = publishedFare - displayPrice;

          const isSelected = isFlightSelected(flight);

          return (
            <Card
              key={index}
              className={`shadow-sm p-3 mb-4 rounded-3 ${
                isSelected ? "border-primary border-2" : ""
              }`}
              onClick={() => handleFlightSelect(flight)}
              style={{ cursor: "pointer" }}
            >
              {isSelected && (
                <div className="position-absolute top-0 end-0 m-2">
                  <span className="badge bg-success">Selected</span>
                </div>
              )}

              <Row className="align-items-center">
                {/* Airline Info */}
                <Col md={3} className="d-flex align-items-center">
                  <div
                    className="bg-light rounded p-2 me-3 d-flex align-items-center justify-content-center"
                    style={{ width: "50px", height: "50px" }}
                  >
                    <strong className="text-primary">
                      {segmentAirline?.AirlineCode || "--"}
                    </strong>
                  </div>

                  <div>
                    <h6 className="mb-0">
                      {segmentAirline?.AirlineName || "Unknown Airline"}
                    </h6>
                    <small className="text-muted">
                      {segmentAirline?.FlightNumber
                        ? `Flight ${segmentAirline.FlightNumber}`
                        : ""}
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
                    {originAirport?.AirportCode || "--"}
                  </small>
                  <br />
                  <small className="text-muted small">
                    {originAirport?.CityName || "--"}
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
                </Col>

                {/* Arrival */}
                <Col md={2} className="text-center">
                  <h5 className="mb-0">
                    {formatTime(destinationInfo.ArrTime)}
                  </h5>
                  <small className="text-muted">
                    {destinationAirport?.AirportCode || "--"}
                  </small>
                  <br />
                  <small className="text-muted small">
                    {destinationAirport?.CityName || "--"}
                  </small>
                </Col>

                {/* Price - ✅ FIXED: Use DisplayPrice */}
                <Col md={3} className="text-end">
                  <h5 className="fw-bold text-primary">
                    ₹ {Math.ceil(displayPrice)}
                  </h5>
                  <small className="text-muted">
                    Total {adults} adult{adults > 1 ? "s" : ""}
                  </small>

                  {savings > 0 && (
                    <>
                      <br />
                      <small className="text-success small">
                        Save ₹{savings}
                      </small>
                    </>
                  )}

                  <br />
                  <Button
                    className={`view-price-flight ${
                      isSelected ? "btn-success" : ""
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleFlightSelect(flight);
                    }}
                  >
                    {isSelected ? "SELECTED ✓" : "SELECT FLIGHT"}
                  </Button>
                </Col>
              </Row>

              {/* Baggage Row */}
              <Row className="mt-3">
                <Col>
                  <div className="bg-light p-2 rounded-2">
                    <small className="text-muted">
                      <strong>Baggage:</strong> {segmentData?.Baggage || "--"}•
                      <strong> Cabin:</strong>{" "}
                      {segmentData?.CabinBaggage || "--"} •
                      <strong> Class:</strong> {travelClass}
                    </small>
                  </div>
                </Col>
              </Row>
            </Card>
          );
        })}

        {/* ✅ FIXED: SHOW TOTAL PRICE AND VIEW PRICES BUTTON FOR ALL TRIP TYPES */}
        {selectedFlights.some((f) => f) && (
          <div className="sticky-bottom bg-white p-3 border-top shadow-sm">
            <Row className="align-items-center">
              <Col md={6}>
                <h5 className="mb-0">Selected Flights:</h5>
                <small className="text-muted">
                  {selectedFlights.filter((f) => f).length} of{" "}
                  {tripType === "round"
                    ? 2
                    : tripType === "multi"
                      ? flights.length
                      : 1}{" "}
                  segments selected
                </small>
                <div className="mt-2"></div>
              </Col>
              <Col md={4} className="text-end">
                <h4 className="fw-bold mb-0">
                  Total: ₹ {Math.ceil(totalPrice)}
                </h4>
              </Col>
              <Col md={2}>
                <Button
                  variant="primary"
                  className="w-100 view-price-flight mt-0"
                  onClick={onViewPrices}
                >
                  VIEW PRICES
                </Button>
              </Col>
            </Row>
          </div>
        )}

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
        {visibleCount >= filteredResults.length &&
          filteredResults.length > 0 && (
            <div className="text-center my-4 text-muted">
              <small>All {filteredResults.length} flights loaded</small>
            </div>
          )}
      </>
    );
  };

  // Initialize selectedFlights based on trip type and flights length
  useEffect(() => {
    if (flights.length > 0) {
      if (tripType === "round") {
        setSelectedFlights([null, null]); // Outbound and inbound
      } else if (tripType === "multi") {
        setSelectedFlights(new Array(flights.length).fill(null));
      } else {
        setSelectedFlights([null]); // One way
      }
    }
  }, [tripType, flights.length]);

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

  const availableAirlines = React.useMemo(() => {
    const map = new Map();
    const currentFlights = getFilteredResultsForDisplay();

    currentFlights.forEach((flight) => {
      const seg = flight?.Segments?.[0]?.[0];
      if (seg?.Airline?.AirlineCode) {
        map.set(seg.Airline.AirlineCode, seg.Airline.AirlineName);
      }
    });

    return Array.from(map.entries())
      .map(([code, name]) => {
        const count = currentFlights.filter(
          (f) => f?.Segments?.[0]?.[0]?.Airline?.AirlineCode === code,
        ).length;
        return { code, name, count };
      })
      .sort((a, b) => a?.name?.localeCompare(b.name));
  }, [searchResults, activeTab, tripType, isDomestic]);

  const buildFlightDetailPayload = () => {
    if (tripType === "round") {
      return {
        TraceId,
        tripType,
        isDomestic,
        resultIndexes: {
          outbound: selectedFlights[0]?.ResultIndex,
          inbound: selectedFlights[1]?.ResultIndex,
        },
        pricingBreakdown,
        passengers: { adults, children, infants },
        travelClass,
      };
    }

    // One-way / Multi-city
    return {
      TraceId,
      tripType,
      isDomestic,
      resultIndexes: selectedFlights.map((f) => f?.ResultIndex),
      pricingBreakdown,
      passengers: { adults, children, infants },
      travelClass,
    };
  };

  return (
    <div>
      {/* Flight Search Form */}
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

            <Row className="align-items-end g-2 mb-3 mt-0  travellers justify-content-center">
              <Col md={12} className="mb-4 tabing-section">
                <Form.Group>
                  <div className="trip-tabs text-center">
                    <button
                      type="button"
                      className={`trip-tab ${tripType === "oneway" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("oneway")}
                      disabled={isInitialLoading || searchLoading}
                    >
                      <i class="bi bi-airplane"></i> One Way
                    </button>

                    <button
                      type="button"
                      className={`trip-tab ${tripType === "round" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("round")}
                      disabled={isInitialLoading || searchLoading}
                    >
                      <i class="bi bi-arrow-left-right"></i> Round Trip
                    </button>

                    <button
                      type="button"
                      className={`trip-tab ${tripType === "multi" ? "active" : ""}`}
                      onClick={() => handleTripTypeChange("multi")}
                      disabled={isInitialLoading || searchLoading}
                    >
                      <i class="bi bi-signpost-split"></i> Multi City
                    </button>
                  </div>
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">From</Form.Label>
                  <AirportDropdown
                    value={flights[0]?.from}
                    onChange={(value) => handleFromChange(0, value)}
                    placeholder="From City"
                    type="from"
                    segmentIndex={0}
                    disabled={isInitialLoading || searchLoading}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">To</Form.Label>
                  <AirportDropdown
                    value={flights[0]?.to}
                    onChange={(value) => handleToChange(0, value)}
                    placeholder="To City"
                    type="to"
                    segmentIndex={0}
                    disabled={isInitialLoading || searchLoading}
                  />
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
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
                    disabled={isInitialLoading || searchLoading}
                  />
                </Form.Group>
              </Col>

              {tripType === "round" && (
                <Col xs={6} md={2}>
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
                      disabled={isInitialLoading || searchLoading}
                    />
                  </Form.Group>
                </Col>
              )}

              <Col xs={6} sm={2} md={tripType === "round" ? 2 : 2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">
                    Passengers & Class
                  </Form.Label>
                  <Dropdown
                    className="AddClass"
                    style={{ width: "100%" }}
                    show={showTravellerDropdown}
                    onToggle={(isOpen) => setShowTravellerDropdown(isOpen)}
                  >
                    <Dropdown.Toggle
                      id="travellers-dropdown"
                      variant="light"
                      className="AddClass-toggle form-control"
                      disabled={isInitialLoading || searchLoading}
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
                      <button
                        className="btn btn-primary w-100 mt-3"
                        onClick={() => setShowTravellerDropdown(false)}
                      >
                        Done
                      </button>
                    </Dropdown.Menu>
                  </Dropdown>
                </Form.Group>
              </Col>

              <Col xs={6} md={2}>
                <Button
                  type="submit"
                  className="explore-flight-btn w-100"
                  onClick={searchFlights}
                  disabled={searchLoading || loading || isInitialLoading}
                >
                  {searchLoading ? (
                    <>
                      <Spinner
                        animation="border"
                        size="sm"
                        className="me-2 spinner-white"
                      />
                      Searching...
                    </>
                  ) : (
                    "Search"
                  )}
                </Button>
              </Col>
            </Row>

            {tripType === "multi" &&
              flights.slice(1).map((flight, index) => {
                const actualIndex = index + 1;

                return (
                  <Row
                    key={flight.id || actualIndex}
                    className="align-items-end g-2 mb-3 travellers justify-content-center"
                  >
                    {/* FROM */}
                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">
                          From
                        </Form.Label>
                        <AirportDropdown
                          value={flight.from}
                          onChange={(value) => {
                            const updatedFlights = [...flights];
                            updatedFlights[actualIndex] = {
                              ...updatedFlights[actualIndex],
                              from: value,
                            };
                            setFlights(updatedFlights);
                          }}
                          placeholder="From City"
                          type="from"
                          segmentIndex={actualIndex}
                          disabled={isInitialLoading || searchLoading}
                        />
                      </Form.Group>
                    </Col>

                    {/* TO */}
                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">
                          To
                        </Form.Label>
                        <AirportDropdown
                          value={flight.to}
                          onChange={(value) => {
                            const updatedFlights = [...flights];
                            updatedFlights[actualIndex] = {
                              ...updatedFlights[actualIndex],
                              to: value,
                            };
                            setFlights(updatedFlights);
                          }}
                          placeholder="To City"
                          type="to"
                          segmentIndex={actualIndex}
                          disabled={isInitialLoading || searchLoading}
                        />
                      </Form.Group>
                    </Col>

                    {/* DATE */}
                    <Col xs={6} md={2}>
                      <Form.Group>
                        <Form.Label className="fw-semibold small">
                          Depart
                        </Form.Label>
                        <DatePicker
                          selected={flight.date ? new Date(flight.date) : null}
                          onChange={(date) => {
                            const updatedFlights = [...flights];
                            updatedFlights[actualIndex] = {
                              ...updatedFlights[actualIndex],
                              date: date
                                ? date.toISOString().split("T")[0]
                                : null,
                            };
                            setFlights(updatedFlights);
                          }}
                          minDate={
                            flights[actualIndex - 1]?.date
                              ? new Date(flights[actualIndex - 1].date)
                              : new Date()
                          }
                          dateFormat="EEE, MMM d, yyyy"
                          className="form-control"
                          disabled={isInitialLoading || searchLoading}
                        />
                      </Form.Group>
                    </Col>

                    {/* ACTION BUTTONS */}
                    <Col md={2} className="d-flex align-items-center gap-2">
                      {/* Remove Button (first row ke alawa) */}
                      {actualIndex > 0 && (
                        <Button
                          variant="outline-danger"
                          className="rounded-pill"
                          onClick={() => removeCity(actualIndex)}
                        >
                          REMOVE
                        </Button>
                      )}

                      {/* Add City Button (sirf last row me) */}
                      {actualIndex === flights.length - 1 &&
                        flights.length < 4 && (
                          <Button
                            variant="outline-primary"
                            className="rounded-pill"
                            onClick={addCity}
                          >
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

      <div className="container py-5 filters-mob">
        <Row>
          {/* Filter Sidebar */}
          <Col sm={3} style={{ opacity: isInitialLoading ? 0.5 : 1 }}>
            <fieldset disabled={isInitialLoading || searchLoading}>
              <div className="filter-box p-3 border rounded shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="fw-bold mb-0">FILTER</h5>
                  <FaUndoAlt
                    title="Reset Filters"
                    style={{ cursor: "pointer", color: "#d04856ff" }}
                    onClick={clearAllFilters}
                  />
                </div>

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
                    <label className="form-check-label" htmlFor="refundable">
                      Refundable Only
                    </label>
                  </div>
                </div>

                {/* Airlines Filter */}
                <fieldset disabled={isInitialLoading || searchLoading}>
                  <div className="filter-group mb-3">
                    <div
                      className="filter-title d-flex justify-content-between"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleToggle("airlines")}
                    >
                      <span className="flight-heading">Airlines</span>
                      <FontAwesomeIcon
                        icon={toggle.airlines ? faChevronUp : faChevronDown}
                      />
                    </div>

                    {toggle.airlines && (
                      <div className="filter-options mt-2">
                        {availableAirlines.length === 0 ? (
                          <small className="text-muted">
                            No airlines available
                          </small>
                        ) : (
                          availableAirlines.map((airline) => (
                            <div className="form-check" key={airline.code}>
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={`airline-${airline.code}`}
                                checked={filters.airlines.includes(
                                  airline.code,
                                )}
                                onChange={(e) =>
                                  handleAirlineFilter(
                                    airline.code,
                                    e.target.checked,
                                  )
                                }
                              />
                              <label
                                className="form-check-label"
                                htmlFor={`airline-${airline.code}`}
                              >
                                {airline.name}
                                <span className="text-muted">
                                  ({airline.count})
                                </span>
                              </label>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </fieldset>

                {/* Stops Filter */}
                <div className="filter-group mb-3">
                  <div
                    className="filter-title d-flex justify-content-between"
                    style={{ cursor: "pointer" }}
                    onClick={() => handleToggle("stops")}
                  >
                    <span className="flight-heading">Stops</span>
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
                    <span className="flight-heading">Price Range</span>
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
                          max="100000"
                          step="1000"
                          value={filters.priceRange.min}
                          onChange={(e) =>
                            handlePriceRangeChange(
                              "min",
                              parseInt(e.target.value),
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
                          max="100000"
                          step="1000"
                          value={filters.priceRange.max}
                          onChange={(e) =>
                            handlePriceRangeChange(
                              "max",
                              parseInt(e.target.value),
                            )
                          }
                        />
                      </div>
                      <div className="d-flex justify-content-between small text-muted">
                        <span>₹0</span>
                        <span>₹10,00,000</span>
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
                    <span className="flight-heading">Departure Time</span>
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
                                t[0] === time.range[0] &&
                                t[1] === time.range[1],
                            )}
                            onChange={(e) =>
                              handleDepartureTimeFilter(
                                time.range,
                                e.target.checked,
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
                    <span className="flight-heading">Flight Duration</span>
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
              </div>
            </fieldset>
          </Col>

          {/* Flight Results Section */}
          <Col sm={9}>
            {/* Tabs for multi-city and return */}
            {renderTabs()}

            {/* Flight Results */}
            {renderFlightResults()}
          </Col>
        </Row>
      </div>

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
