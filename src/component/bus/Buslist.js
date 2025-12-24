import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Bus.css";
import {
  Bus_authenticate,
  Bus_getCityList,
  Bus_busSearch,
  Bus_busLayout,
  fetchBoardingPoints,
} from "../services/busservice";
import Loading from "../common/loading";

function BusList() {
  const [busData, setBusData] = useState([]);
  const [filteredBusData, setFilteredBusData] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [cities, setCities] = useState([]);
  const [tokenId, setTokenId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [seatLayoutData, setSeatLayoutData] = useState(null);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [seatPrices, setSeatPrices] = useState({});
  const [traceId, setTraceId] = useState(null);

  const [toggle, setToggle] = useState({
    busType: true,
    busTypeCategory: true, // नया: AC/Non-AC के लिए
    seatType: true, // नया: Seat Type के लिए
    amenities: true,
    operator: true,
  });

  const [filters, setFilters] = useState({
    busType: [],
    busTypeCategory: [], // नया: AC/Non-AC
    seatType: [], // नया: Sleeper/Seater
    amenities: [],
    operator: [],
  });

  const [searchParams, setSearchParams] = useState({
    fromCity: "",
    toCity: "",
    travelDate: "",
    busType: "",
    fromCityId: "",
    toCityId: "",
  });

  const [visibleCount, setVisibleCount] = useState(6);
  const loadAmount = 6; // हर बार 6 load होंगे
  const maxLoad = filteredBusData.length;

  // throttle flag
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isLoading) return; // already loading? don't load again

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {
        // LOAD MORE
        setIsLoading(true);
        setTimeout(() => {
          setVisibleCount((prev) =>
            prev + loadAmount > maxLoad ? maxLoad : prev + loadAmount
          );
          setIsLoading(false);
        }, 600); // delay to prevent multiple triggers
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoading, filteredBusData]);

  const navigate = useNavigate();

  // 🚀 INITIALIZATION - Sequential flow: Auth → Cities → Defaults
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitializing(true);
        setError(null);

        console.log("🔄 Starting bus authentication...");

        // Step 1: Authenticate and get token
        const authResponse = await Bus_authenticate();
        console.log("✅ Step 1 - Auth Response:", authResponse);

        // Extract token from response
        const token = authResponse?.tokenId || authResponse?.TokenId;
        if (!token) throw new Error("No TokenId found in auth response");

        setTokenId(token);
        console.log("✅ Step 2 - Token saved:", token);

        // Step 3: Fetch cities using the same token
        console.log("🔄 Fetching city list...");
        const cityResponse = await Bus_getCityList(token);
        console.log("✅ Step 3 - City Response:", cityResponse);

        // Extract cities from response
        const cityData =
          cityResponse?.resposnse?.BusCities ||
          cityResponse?.BusCities ||
          cityResponse;

        if (Array.isArray(cityData) && cityData.length > 0) {
          setCities(cityData);
          console.log(`✅ Step 4 - ${cityData.length} cities loaded`);
        } else {
          throw new Error("Invalid cities response format");
        }

        // Step 5: Set default date only (no static data)
        const today = new Date().toISOString().split("T")[0];
        setSearchParams((prev) => ({ ...prev, travelDate: today }));

        console.log("✅ Bus initialization complete: Token + City list ready");
      } catch (error) {
        console.error("🔥 Bus initialization error:", error);
        setError(`Initialization failed: ${error.message}`);
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // 🧠 AUTHENTICATE USER
  const authenticateUser = async () => {
    try {
      // If we already have token, use it
      if (tokenId) {
        console.log(
          "🔑 Using existing token:",
          tokenId.substring(0, 10) + "..."
        );
        return tokenId;
      }

      // Otherwise get new token
      const authResponse = await Bus_authenticate();
      const token = authResponse?.tokenId || authResponse?.TokenId;

      if (token) {
        setTokenId(token);
        console.log("🔑 New token generated:", token.substring(0, 10) + "...");
        return token;
      } else {
        throw new Error("Authentication failed - No token received");
      }
    } catch (error) {
      console.error("🔥 Error during authentication:", error);
      throw error;
    }
  };

  const getSeatFare = (seat) => {
    return (
      seat.SeatFare ?? seat.Price?.BasePrice ?? seat.Price?.PublishedPrice ?? 0
    );
  };

  // 🚌 GET BUS LAYOUT - CORRECTED VERSION
  const fetchBusLayout = async (bus) => {
    try {
      setLoadingSeats(true);
      setError(null);
      setSeatPrices({});

      console.log("🔄 Fetching Seat Layout for bus:", bus);

      const TokenId = tokenId || bus?.TokenId;
      const TraceId = bus?.traceId || bus?.TraceId;
      const ResultIndex = bus?.resultIndex ?? bus?.ResultIndex;

      if (!TokenId || !TraceId || ResultIndex == null) {
        throw new Error("Missing required parameters for seat layout");
      }

      console.log("📤 Layout API Payload:", {
        TokenId: TokenId.substring(0, 10) + "...",
        TraceId,
        ResultIndex,
      });

      const payload = { TokenId, TraceId, ResultIndex };
      const response = await Bus_busLayout(payload);
      console.log("📥 API Layout Response:", response);

      if (!response) throw new Error("Empty response from layout API");

      const layout =
        response?.data?.SeatLayoutDetails ||
        response?.SeatLayoutDetails ||
        response?.SeatLayout ||
        response;

      if (!layout) throw new Error("No seat layout found in response");

      console.log("🎉 Final Layout Extracted:", layout);

      setSeatLayoutData(layout);

      // Extract seat prices from layout
      extractSeatPrices(layout);
      let seatDetailsRaw =
        layout?.SeatDetails ||
        layout?.SeatLayoutDetails?.SeatDetails ||
        layout?.SeatLayout?.SeatDetails ||
        layout?.Seats ||
        [];

      console.log("RAW SEAT DETAILS:", seatDetailsRaw);

      // IMPORTANT: Flatten 2D array into flat list of seats
      let seatDetails = Array.isArray(seatDetailsRaw[0])
        ? seatDetailsRaw.flat()
        : seatDetailsRaw;
      console.log("SEATS GOING TO MODAL:", seatDetails);

      console.log("FLATTENED SEAT DETAILS:", seatDetails);

      setSeatLayoutData({
        ...layout,
        seats: seatDetails,
      });

      return layout;
    } catch (err) {
      console.error("❌ Layout Fetch Failed:", err);
      setError("Failed to load seat layout");

      // Fallback mock layout
      const mockLayout = {
        HTMLLayout: `<div class='outerseat'>
          <div class='busSeatlft'><div class='lower'></div></div>
          <div class='busSeatrgt'>
            <div class='busSeat'><div class='seatcontainer clearfix'>
              ${Array.from(
                { length: 20 },
                (_, i) =>
                  `<div class="nseat" style="top:${
                    i * 35
                  }px; left:10px;" onclick="AddRemoveSeat('S${i + 1}', '${
                    selectedBus?.price || 500
                  }')">S${i + 1}</div>`
              ).join("")}
            </div></div>
          </div>
        </div>`,
      };

      setSeatLayoutData(mockLayout);
      extractSeatPrices(mockLayout);
      return mockLayout;
    } finally {
      setLoadingSeats(false);
    }
  };

  // Extract seat prices from layout data
  const extractSeatPrices = (layout) => {
    const prices = {};

    if (layout.HTMLLayout) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(layout.HTMLLayout, "text/html");
      const seatDivs = doc.querySelectorAll(".nseat");

      seatDivs.forEach((seatDiv) => {
        const onclickAttr = seatDiv.getAttribute("onclick");
        if (onclickAttr) {
          // Extract seat number and price from onclick attribute
          const seatMatch = onclickAttr.match(
            /AddRemoveSeat\(['"]([^'"]*)['"],\s*['"]([^'"]*)['"]\)/
          );

          if (seatMatch) {
            const seatNumber = seatMatch[1];
            const price = parseFloat(seatMatch[2]);
            prices[seatNumber] = price;
          }
        }
      });
    }

    // If no prices found in HTML, use bus base price
    if (Object.keys(prices).length === 0 && selectedBus) {
      prices["default"] = selectedBus.price;
    }

    setSeatPrices(prices);
    console.log("💰 Extracted Seat Prices:", prices);
  };

  // 🚌 DYNAMIC BUS SEARCH - CORRECTED VERSION
  const searchBuses = async () => {
    if (
      !searchParams.fromCityId ||
      !searchParams.toCityId ||
      !searchParams.travelDate
    ) {
      setError("Please select both source, destination, and travel date");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log("🔍 Starting bus search...");

      // ✅ Get token
      const token = await authenticateUser();
      if (!token) throw new Error("Authentication failed");

      // 🧾 Prepare payload
      const searchData = {
        TokenId: token,
        DateOfJourney: searchParams.travelDate,
        OriginId: searchParams.fromCityId,
        DestinationId: searchParams.toCityId,
        PreferredCurrency: "INR",
      };

      console.log("📦 Bus Search Payload:", {
        fromCityId: searchParams.fromCityId,
        toCityId: searchParams.toCityId,
        travelDate: searchParams.travelDate,
        token: token.substring(0, 10) + "...",
      });

      // 🔍 API call
      const searchResponse = await Bus_busSearch(searchData);
      console.log("📨 Bus Search API Response:", searchResponse);

      // 🔥 Fix: works for multiple response formats
      const searchResult =
        searchResponse?.data?.BusSearchResult ||
        searchResponse?.BusSearchResult ||
        searchResponse;

      if (
        searchResult?.ResponseStatus === 1 &&
        Array.isArray(searchResult?.BusResults)
      ) {
        const {
          Origin,
          Destination,
          TraceId,
          BusResults,
          TokenId: SearchToken,
        } = searchResult;

        // 🟢 SAVE SearchToken and TraceId GLOBALLY
        if (SearchToken) {
          setTokenId(SearchToken);
          localStorage.setItem("Bus_Search_Token", SearchToken);
          console.log("🔑 Token saved:", SearchToken);
        }

        if (TraceId) {
          setTraceId(TraceId);
          localStorage.setItem("Bus_Trace_Id", TraceId);
          console.log("🔍 TraceId saved:", TraceId);
        }

        // 🚍 Transform API BUS data
        const transformedBuses = BusResults.map((bus, index) => {
          // बस के नाम/टाइप से AC/Non-AC पहचानें
          const busName = bus.ServiceName || bus.TravelName || "";
          const busType = bus.BusType || "";
          const busTypeLower = busName.toLowerCase() + " " + busType.toLowerCase();
          
          // Determine if AC or Non-AC
          let busTypeCategory = "";
          if (busTypeLower.includes("ac") || busName.includes("AC") || busType.includes("AC")) {
            busTypeCategory = "AC";
          } else {
            busTypeCategory = "Non-AC";
          }

          // Determine seat type from bus type
          let seatType = "";
          if (busTypeLower.includes("sleeper") || busName.includes("Sleeper")) {
            seatType = "Sleeper";
          } else if (busTypeLower.includes("seater") || busName.includes("Seater")) {
            seatType = "Seater";
          } else {
            // Default based on bus type
            seatType = busType.includes("SLEEPER") ? "Sleeper" : "Seater";
          }

          return {
            busId: bus.ResultIndex || index,
            resultIndex: bus.ResultIndex,
            routeId: bus.RouteId,
            operatorId: bus.OperatorId,
            busName: bus.ServiceName,
            travelName: bus.TravelName,
            operator: bus.TravelName,
            busType: bus.BusType,
            busTypeCategory: busTypeCategory, // नया: AC/Non-AC
            seatType: seatType, // नया: Sleeper/Seater
            availableSeats: bus.AvailableSeats,
            maxSeatsPerTicket: bus.MaxSeatsPerTicket,
            idProofRequired: bus.IdProofRequired,
            isDropPointMandatory: bus.IsDropPointMandatory,
            liveTracking: bus.LiveTrackingAvailable,
            mTicketEnabled: bus.MTicketEnabled,
            partialCancellationAllowed: bus.PartialCancellationAllowed,
            boardingPoints: bus.BoardingPointsDetails || [],
            departureTime: bus.DepartureTime,
            arrivalTime: bus.ArrivalTime,
            origin: Origin,
            destination: Destination,
            from: Origin || "Unknown",
            to: Destination || "Unknown",
            traceId: TraceId,
            duration: bus.Duration || "N/A",
            price:
              bus.BusPrice?.PublishedPriceRoundedOff ||
              bus.BusPrice?.PublishedPrice ||
              0,
            fare: bus.BusPrice?.PublishedPrice || 0,
            rating: 4.0 + Math.random() * 1.5,
            amenities: bus.Amenities || [],
            imagePath: `bus${(index % 3) + 1}.jpg`,
            totalSeats: 40,
            apiData: bus,
            // Ensure TokenId is available for layout API
            TokenId: SearchToken || token,
          };
        });

        setBusData(transformedBuses);
        setFilteredBusData(transformedBuses);

        console.log("🚌 Bus Search Success:", {
          origin: Origin,
          destination: Destination,
          totalBuses: transformedBuses.length,
          traceId: TraceId,
        });
      } else {
        console.warn("⚠️ No buses found in API response");
        setBusData([]);
        setFilteredBusData([]);
        setError(
          "No buses found for this route. Please try different cities or date."
        );
      }
    } catch (error) {
      console.error("💥 Bus Search Error:", error);
      setError(error.message || "Failed to search buses");
      setBusData([]);
      setFilteredBusData([]);
    } finally {
      setLoading(false);
    }
  };

  // 🪑 MODAL FUNCTIONS - CORRECTED VERSION
  const handleOpenSeats = async (bus) => {
    console.log("🚌 Opening seat selection for bus:", bus);

    // ✅ Validate required parameters
    const TokenId = bus?.TokenId || tokenId;
    const TraceId = bus?.traceId || traceId;
    const ResultIndex = bus?.resultIndex ?? bus?.ResultIndex;

    if (!TokenId || !TraceId || ResultIndex == null) {
      console.error("❌ Missing required layout parameters:", {
        TokenId,
        TraceId,
        ResultIndex,
      });
      setError("Cannot load seat layout. Missing required parameters.");
      return;
    }

    // ✅ Set selected bus and open modal
    setSelectedBus(bus);
    setSelectedSeats([]);
    setSeatLayoutData(null);
    setShowModal(true);

    // ✅ Fetch seat layout
    await fetchBusLayout(bus);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBus(null);
    setSeatLayoutData(null);
    setSeatPrices({});
  };

  // In BusList.js
  const handleSeatSelect = (seat) => {
    setSelectedSeats((prev) => {
      const seatIndex = seat.SeatIndex;
      if (!seatIndex) return prev;

      const exists = prev.some((s) => s.SeatIndex === seatIndex);

      // If already selected → remove seat
      if (exists) {
        return prev.filter((s) => s.SeatIndex !== seatIndex);
      }

      // ADD THE FULL SEAT OBJECT EXACTLY AS RECEIVED FROM API
      return [...prev, seat];
    });
  };

  // BusList.js - Sirf handleConfirmSeats function correct karo
  const handleConfirmSeats = async () => {
    if (selectedSeats.length === 0) return;

    try {
      console.log("🚀 Starting seat confirmation process...");

      // ✅ CRITICAL: Extract ALL parameters from selectedBus
      const TokenId = selectedBus?.TokenId || tokenId;
      const TraceId = selectedBus?.traceId || selectedBus?.TraceId;
      const ResultIndex = selectedBus?.resultIndex ?? selectedBus?.ResultIndex;

      console.log("🔍 Extracted Parameters:", {
        TokenId: TokenId ? TokenId.substring(0, 10) + "..." : "MISSING",
        TraceId: TraceId ? TraceId.substring(0, 10) + "..." : "MISSING",
        ResultIndex: ResultIndex ?? "MISSING",
      });

      // ✅ Validate we have ALL required parameters
      if (!TokenId || !TraceId || ResultIndex == null) {
        console.error("❌ CRITICAL: Missing API parameters in BusList");
        throw new Error("Required parameters missing for boarding points");
      }

      // ✅ STEP 1: Call Boarding Points API in BusList itself
      console.log("📤 Calling Boarding Points API from BusList...");
      const boardingResponse = await fetchBoardingPoints(
        TokenId,
        TraceId,
        ResultIndex
      );
      console.log("📥 Boarding API Response:", boardingResponse);

      // Extract boarding points data
      const boardingData = boardingResponse?.data?.BoardingPointsDetails || [];
      const droppingData = boardingResponse?.data?.DroppingPointsDetails || [];

      console.log(
        `✅ Boarding Points: ${boardingData.length}, Dropping Points: ${droppingData.length}`
      );

      // ✅ STEP 2: Prepare COMPLETE bus data with ALL parameters
      const completeBusData = {
        ...selectedBus,
        // ✅ FORCE include all critical parameters
        TokenId: TokenId,
        TraceId: TraceId,
        ResultIndex: ResultIndex,
        // ✅ Include boarding points data directly
        boardingPoints: boardingData,
        droppingPoints: droppingData,
      };

      // ✅ STEP 3: Save EVERYTHING to localStorage
      localStorage.setItem("selectedBus", JSON.stringify(completeBusData));
      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
      localStorage.setItem("boardingPoints", JSON.stringify(boardingData));
      localStorage.setItem("droppingPoints", JSON.stringify(droppingData));
      localStorage.setItem("Bus_Search_Token", TokenId);
      localStorage.setItem("Bus_Trace_Id", TraceId);
      localStorage.setItem("Bus_Result_Index", ResultIndex.toString());

      console.log("💾 ALL data saved to localStorage successfully");

      // ✅ STEP 4: Navigate to Checkout with COMPLETE data
      const navigationState = {
        bus: completeBusData,
        seats: selectedSeats,
        // ✅ Include raw parameters separately too
        tokenId: TokenId,
        traceId: TraceId,
        resultIndex: ResultIndex,
      };

      console.log("🚀 Navigating to checkout with complete data...");

      navigate("/Bus-checkout", { state: navigationState });
    } catch (error) {
      console.error("❌ Error in seat confirmation:", error);

      // ✅ FALLBACK: Still save basic data and navigate
      const fallbackBusData = {
        ...selectedBus,
        TokenId: selectedBus?.TokenId || tokenId,
        TraceId: selectedBus?.traceId || selectedBus?.TraceId,
        ResultIndex: selectedBus?.resultIndex ?? selectedBus?.ResultIndex,
      };

      localStorage.setItem("selectedBus", JSON.stringify(fallbackBusData));
      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));

      navigate("/Bus-checkout", {
        state: {
          bus: fallbackBusData,
          seats: selectedSeats,
        },
      });
    }

    // Close modal
    handleCloseModal();
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    return selectedSeats.reduce((total, seat) => total + getSeatFare(seat), 0);
  };

  const renderSeatsFromAPI = () => {
    console.log("seatlayout data in renderSeatsFromAPI", seatLayoutData);
    if (!seatLayoutData) return <div>Loading seat layout...</div>;

    const seats =
      seatLayoutData.seats ||
      seatLayoutData.SeatDetails ||
      seatLayoutData.SeatLayoutDetails?.SeatDetails ||
      seatLayoutData.SeatLayout?.SeatDetails ||
      [];

    if (seats.length === 0) return <div>No seat layout available</div>;

    return (
      <div
        className="bus-layout-api"
        style={{ position: "relative", height: "500px", overflow: "auto" }}
      >
        {seats.map((seat) => {
          const isSelected = selectedSeats.some(
            (s) => s.SeatIndex === seat.SeatIndex
          );

          const row = Number(seat.RowNo) || 0;
          const col = Number(seat.ColumnNo) || 0;

          return (
            <div
              key={seat.SeatIndex}
              className={`seat-api ${isSelected ? "selected" : ""}`}
              style={{
                position: "absolute",
                top: row * 45,
                left: col * 45,
              }}
              onClick={() => seat.SeatStatus && handleSeatSelect(seat)}
            >
              <div className="seat-icon">{seat.SeatName}</div>
              <span>₹{getSeatFare(seat)}</span>
            </div>
          );
        })}
      </div>
    );
  };

  // Rest of the component remains the same...
  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSearch = () => {
    setError(null);

    if (searchParams.fromCityId && searchParams.toCityId) {
      searchBuses();
    } else {
      setError("Please select both source and destination cities");
    }
  };

  const handleSearchParamChange = async (field, value) => {
    const newSearchParams = {
      ...searchParams,
      [field]: value,
    };

    if (field === "fromCity" && value) {
      const city = cities.find((c) => c.CityName === value);
      newSearchParams.fromCityId = city ? city.CityId : "";
    } else if (field === "toCity" && value) {
      const city = cities.find((c) => c.CityName === value);
      newSearchParams.toCityId = city ? city.CityId : "";
    }

    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(
          (item) => item !== value
        );
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }

      return newFilters;
    });
  };

  const getDynamicFilterOptions = () => {
    const busTypes = [
      ...new Set(busData.map((bus) => bus.busType).filter(Boolean)),
    ];
    const busTypeCategories = ["AC", "Non-AC"]; // Fixed categories
    const seatTypes = ["Sleeper", "Seater"]; // Fixed categories
    const operators = [
      ...new Set(busData.map((bus) => bus.operator).filter(Boolean)),
    ];
    const allAmenities = busData.flatMap((bus) => bus.amenities || []);
    const amenities = [...new Set(allAmenities)].filter(Boolean);

    return { busTypes, busTypeCategories, seatTypes, operators, amenities };
  };

  const { busTypes, busTypeCategories, seatTypes, operators, amenities } = getDynamicFilterOptions();

  const getCityOptions = () => {
    const fromCities = cities.map((city) => city.CityName).filter(Boolean);
    const toCities = cities.map((city) => city.CityName).filter(Boolean);
    return { fromCities, toCities };
  };

  const { fromCities, toCities } = getCityOptions();




  useEffect(() => {
    if (!busData || busData.length === 0) return;

    let filteredData = [...busData];

    // Apply Bus Type filter
    if (filters.busType.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.busType.includes(bus.busType)
      );
    }

    // Apply Bus Type Category filter (AC/Non-AC)
    if (filters.busTypeCategory.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.busTypeCategory.includes(bus.busTypeCategory)
      );
    }

    // Apply Seat Type filter (Sleeper/Seater)
    if (filters.seatType.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.seatType.includes(bus.seatType)
      );
    }

    // Apply Amenities filter
    if (filters.amenities.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.amenities.every((amenity) =>
          (bus.amenities || []).includes(amenity)
        )
      );
    }

    // Apply Operator filter
    if (filters.operator.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.operator.includes(bus.operator)
      );
    }

    setFilteredBusData(filteredData);
  }, [filters, busData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".position-relative")) {
        setShowFromSuggestions(false);
        setShowToSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  if (initializing) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ height: "100vh", marginTop: "100px" }}
      >
        <div className="text-center">
        
          <Loading />
        
          <p className="mt-2">Loading bus services...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search Section */}
      <div className="col-sm-12" style={{ marginTop: "100px" }}>
        <div className="col-sm-12">
          <div className="bus-section text-center">
            <div className="container search-box p-4 rounded shadow-lg bg-white">
              <h6 className="text-muted mb-3">Bus Ticket Booking</h6>

              {error && (
                <div
                  className="alert alert-warning alert-dismissible fade show mb-3"
                  role="alert"
                >
                  {error}
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setError(null)}
                  ></button>
                </div>
              )}

              <div className="row g-3 align-items-center justify-content-center">
                {/* From City */}
                <div className="col-md-3">
                  <label className="text-muted small mb-1">From</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control fw-bold text-capitalize"
                      placeholder="Select City"
                      value={searchParams.fromCity}
                      onChange={(e) => {
                        const formattedValue =
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1);
                        handleSearchParamChange("fromCity", formattedValue);
                        setShowFromSuggestions(true);
                      }}
                      onFocus={() => setShowFromSuggestions(true)}
                      disabled={cities.length === 0}
                    />

                    {showFromSuggestions && (
                      <div
                        className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 z-3 max-h-200 overflow-auto"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {(() => {
                          const searchText = searchParams.fromCity
                            .trim()
                            .toLowerCase();

                          const sortedCities = searchText
                            ? [
                                ...fromCities.filter((city) =>
                                  city.toLowerCase().startsWith(searchText)
                                ),
                                ...fromCities.filter(
                                  (city) =>
                                    !city
                                      .toLowerCase()
                                      .startsWith(searchText) &&
                                    city.toLowerCase().includes(searchText)
                                ),
                              ]
                            : fromCities;

                          return sortedCities.slice(0, 15).map((city) => (
                            <div
                              key={city}
                              className="p-2 border-bottom hover-bg-light text-capitalize"
                              style={{ cursor: "pointer" }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                handleSearchParamChange("fromCity", city);
                                setShowFromSuggestions(false);
                              }}
                            >
                              {city
                                .split(" ")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(" ")}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                  {cities.length === 0 && (
                    <small className="text-warning">Loading cities...</small>
                  )}
                </div>

                {/* To City */}
                <div className="col-md-3">
                  <label className="text-muted small mb-1">To</label>
                  <div className="position-relative">
                    <input
                      type="text"
                      className="form-control fw-bold text-capitalize"
                      placeholder="Select City"
                      value={searchParams.toCity}
                      onChange={(e) => {
                        const formattedValue =
                          e.target.value.charAt(0).toUpperCase() +
                          e.target.value.slice(1);
                        handleSearchParamChange("toCity", formattedValue);
                        setShowToSuggestions(true);
                      }}
                      onFocus={() => setShowToSuggestions(true)}
                      disabled={cities.length === 0}
                    />

                    {showToSuggestions && (
                      <div
                        className="position-absolute w-100 bg-white border rounded shadow-sm mt-1 z-3 max-h-200 overflow-auto"
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {(() => {
                          const searchText = searchParams.toCity
                            .trim()
                            .toLowerCase();

                          const sortedCities = searchText
                            ? [
                                ...toCities.filter((city) =>
                                  city.toLowerCase().startsWith(searchText)
                                ),
                                ...toCities.filter(
                                  (city) =>
                                    !city
                                      .toLowerCase()
                                      .startsWith(searchText) &&
                                    city.toLowerCase().includes(searchText)
                                ),
                              ]
                            : toCities;

                          return sortedCities.slice(0, 15).map((city) => (
                            <div
                              key={city}
                              className="p-2 border-bottom hover-bg-light text-capitalize"
                              style={{ cursor: "pointer" }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                handleSearchParamChange("toCity", city);
                                setShowToSuggestions(false);
                              }}
                            >
                              {city
                                .split(" ")
                                .map(
                                  (word) =>
                                    word.charAt(0).toUpperCase() +
                                    word.slice(1).toLowerCase()
                                )
                                .join(" ")}
                            </div>
                          ));
                        })()}
                      </div>
                    )}
                  </div>
                  {cities.length === 0 && (
                    <small className="text-warning">Loading cities...</small>
                  )}
                </div>

                {/* Travel Date */}
                <div className="col-md-2">
                  <label className="text-muted small mb-1">Travel Date</label>
                  <DatePicker
                    selected={
                      searchParams.travelDate
                        ? new Date(searchParams.travelDate)
                        : null
                    }
                    onChange={(date) => {
                      const formattedDate = date.toISOString().split("T")[0];
                      handleSearchParamChange("travelDate", formattedDate);
                    }}
                    className="form-control fw-bold"
                    dateFormat="yyyy-MM-dd"
                    minDate={new Date()}
                    placeholderText="Select Date"
                    popperPlacement="bottom"
                    wrapperClassName="w-100"
                    style={{ cursor: "pointer" }}
                  />
                </div>

             
                {/* Search Button */}
                <div className="col-md-2">
                  <button
                    className="btn btn-primary w-100 fw-bold py-2"
                    style={{
                      background: "linear-gradient(to right, #007bff, #0056d2)",
                      border: "none",
                      borderRadius: "30px",
                      letterSpacing: "1px",
                      cursor: loading ? "not-allowed" : "pointer",
                    }}
                    onClick={handleSearch}
                    disabled={
                      loading ||
                      !searchParams.fromCityId ||
                      !searchParams.toCityId
                    }
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        SEARCHING...
                      </>
                    ) : (
                      "SEARCH"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Buses
            </li>
          </ol>
        </nav>
           <div className="row">
          {/* FILTER COLUMN */}
          <div className="col-sm-3 mb-4">
            <div className="bus-card rounded-4 border shadow-sm p-3">
              <h5 className="mb-3 fw-bold">FILTER</h5>

           
            
              {/* Bus Type Category Filter (AC/Non-AC) */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("busTypeCategory")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Bus Type (AC/Non-AC)</span>
                  <FontAwesomeIcon
                    icon={toggle.busTypeCategory ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.busTypeCategory && (
                  <div className="filter-options mt-2">
                    {busTypeCategories.map((category) => (
                      <div className="form-check" key={category}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`bus-category-${category}`}
                          checked={filters.busTypeCategory.includes(category)}
                          onChange={() => handleFilterChange("busTypeCategory", category)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`bus-category-${category}`}
                        >
                          {category}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Seat Type Filter (Sleeper/Seater) */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("seatType")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Seat Type</span>
                  <FontAwesomeIcon
                    icon={toggle.seatType ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.seatType && (
                  <div className="filter-options mt-2">
                    {seatTypes.map((type) => (
                      <div className="form-check" key={type}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`seat-${type}`}
                          checked={filters.seatType.includes(type)}
                          onChange={() => handleFilterChange("seatType", type)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`seat-${type}`}
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

             

              <button
                className="btn btn-outline-secondary w-100 mt-3"
                onClick={() =>
                  setFilters({ 
                    
                    busTypeCategory: [], 
                    seatType: [], 
              
                  
                  })
                }
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* BUS LIST COLUMN */}
          <div className="col-sm-9">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h5 className="fw-bold mb-0">
                Available Buses ({filteredBusData.length})
              </h5>
              <div className="d-flex align-items-center">
                <span className="me-2">Sort by:</span>
                <select
                  className="form-select form-select-sm"
                  style={{ width: "auto" }}
                >
                  <option>Departure Time</option>
                  <option>Arrival Time</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Rating</option>
                </select>
              </div>
            </div>

            <div className="row">
              {filteredBusData.length > 0 ? (
                filteredBusData.slice(0, visibleCount).map((bus) => (
                  <div className="col-sm-12 mb-4" key={bus.busId}>
                    <div className="bus-card rounded-4 border shadow-sm overflow-hidden h-100">
                      <div className="bus-body p-3">
                        <div className="row align-items-center">
                          {/* ==== Left Image ==== */}
                          <div className="col-sm-2">
                            <img
                              src={`https://via.placeholder.com/150x120/667eea/ffffff?text=Bus+${bus.busId}`}
                              alt={bus.busName}
                              className="bus-img img-fluid rounded"
                              style={{
                                height: "120px",
                                objectFit: "cover",
                                width: "100%",
                              }}
                            />
                          </div>

                          {/* ==== Middle Info ==== */}
                          <div className="col-sm-7">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="fw-bold mb-0">{bus.busName}</h6>
                              <div className="d-flex align-items-center">
                                <small className="text-warning me-1">★</small>
                                <small className="text-muted">
                                  {bus.rating?.toFixed(1)}
                                </small>
                              </div>
                            </div>

                            <p className="mb-2 text-muted small">
                              {bus.busType} • {bus.operator} • {bus.busTypeCategory} • {bus.seatType}
                            </p>
                            <p className="mb-2 text-muted small">
                              {bus.amenities?.join(" • ")}
                            </p>

                            <div className="row text-muted small bus-features">
                              <div className="col-6">
                                <ul className="ps-0 mb-0">
                                  <li>
                                    <strong>Departure:</strong>{" "}
                                    {bus.departureTime}
                                  </li>
                                  <li>
                                    <strong>Arrival:</strong> {bus.arrivalTime}
                                  </li>
                                </ul>
                              </div>
                              <div className="col-6">
                                <ul className="ps-0 mb-0">
                                  <li>
                                    <strong>Duration:</strong> {bus.duration}
                                  </li>
                                  <li>
                                    <strong>Route:</strong> {bus.from} →{" "}
                                    {bus.to}
                                  </li>
                                </ul>
                              </div>
                            </div>
                          </div>

                          {/* ==== Right Price Box ==== */}
                          <div className="col-sm-3">
                            <div className="d-flex flex-column justify-content-between h-100">
                              <div>
                                <div className="mb-2">
                                  <small className="text-decoration-line-through text-muted">
                                    ₹{bus.price + 200}
                                  </small>
                                  <small className="text-danger fw-semibold ms-2">
                                    10% Off
                                  </small>
                                </div>

                                <h5 className="fw-bold mb-1">₹{bus.price}</h5>
                                <small className="text-muted">per seat</small>

                                <div className="mt-1">
                                  <small
                                    className={
                                      bus.availableSeats > 10
                                        ? "text-success"
                                        : "text-warning"
                                    }
                                  >
                                    {bus.availableSeats} seats left
                                  </small>
                                </div>
                              </div>

                              <button
                                className="explore-btn mt-3 w-100"
                                onClick={() => handleOpenSeats(bus)}
                              >
                                View Seats
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-12 text-center py-5">
                  <h5>No buses found</h5>
                  <p>Try searching for buses between different cities</p>
                </div>
              )}
            </div>

            {/* ⭐ SPINNER OUTSIDE THE MAP (Correct Spot) */}
            {isLoading && visibleCount < filteredBusData.length && (
              <div className="text-center my-3">
                <div className="spinner-border text-primary"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {showModal && (
        <div
          className="modal-overlay make-mytrip-style"
          style={{ marginTop: "100px" }}
        >
          <div className="modal-content make-mytrip-modal">
            {/* Modal Header */}
            <div className="modal-header make-mytrip-header">
              <div className="header-content">
                <h2>Select Seats</h2>
                <div className="bus-info">
                  <strong>{selectedBus?.busName}</strong>
                  <span>
                    {selectedBus?.from} → {selectedBus?.to}
                  </span>
                  <span>
                    {selectedBus?.departureTime} • {selectedBus?.travelDate}
                  </span>
                </div>
              </div>
              <button
                className="close-btn make-mytrip-close"
                onClick={handleCloseModal}
              >
                ×
              </button>
            </div>

            {/* Seat Type Legend */}
            <div className="seat-legend make-mytrip-legend">
              <div className="legend-item">
                <div className="seat-sample available"></div>
                <span>Available</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample selected"></div>
                <span>Selected</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample booked"></div>
                <span>Booked</span>
              </div>
              <div className="legend-item">
                <div className="seat-sample ladies"></div>
                <span>Ladies</span>
              </div>
            </div>

            {/* Bus Layout Container */}
            <div className="bus-layout-container">
              <div className="bus-driver-section">
                <div className="driver-cabin">Driver Cabin</div>
              </div>

              <div className="seats-section">
                {loadingSeats ? (
                  <div className="loading-seats">Loading seat layout...</div>
                ) : (
                  <div className="seats-layout-wrapper">
                    {renderSeatsFromAPI()}
                  </div>
                )}
              </div>
            </div>

            {/* Selected Seats & Pricing Summary */}
            <div className="selection-summary make-mytrip-summary">
              <div className="selected-seats-section">
                <h4>Selected Seats</h4>
                {selectedSeats.length > 0 ? (
                  <div className="selected-seats-list">
                    {selectedSeats.map((seat, index) => (
                      <div key={index} className="selected-seat-item">
                        <span className="seat-number">
                          Seat {seat.SeatName}
                        </span>
                        <span className="seat-price">₹{getSeatFare(seat)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-seats-text">No seats selected</p>
                )}
              </div>

              <div className="price-summary">
                <div className="total-price">
                  <span>Total Amount:</span>
                  <span className="amount">₹{calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="modal-actions make-mytrip-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button
                className="explore-btn"
                onClick={handleConfirmSeats}
                disabled={selectedSeats.length === 0}
              >
                Proceed to Book ({selectedSeats.length}{" "}
                {selectedSeats.length === 1 ? "Seat" : "Seats"})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusList;