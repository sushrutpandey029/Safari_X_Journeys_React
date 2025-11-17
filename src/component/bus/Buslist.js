import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Bus.css";
import { Bus_authenticate, Bus_getCityList, Bus_busSearch } from "../services/busservice";

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
  
  const [toggle, setToggle] = useState({
    busType: true,
    amenities: true,
    operator: true,
  });
  
  const [filters, setFilters] = useState({
    busType: [],
    amenities: [],
    operator: [],
  });

  const [searchParams, setSearchParams] = useState({
    fromCity: "",
    toCity: "",
    travelDate: "",
    busType: "",
    fromCityId: "",
    toCityId: ""
  });

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
        const cityData = cityResponse?.resposnse?.BusCities;

        if (Array.isArray(cityData) && cityData.length > 0) {
          setCities(cityData);
          console.log(`✅ Step 4 - ${cityData.length} cities loaded`);
        } else {
          throw new Error("Invalid cities response format");
        }

        // Step 5: Set default date only (no static data)
        const today = new Date().toISOString().split("T")[0];
        setSearchParams(prev => ({ ...prev, travelDate: today }));

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
        console.log("🔑 Using existing token:", tokenId.substring(0, 10) + "...");
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

  // 🚌 DYNAMIC BUS SEARCH
  const searchBuses = async () => {
    if (!searchParams.fromCityId || !searchParams.toCityId || !searchParams.travelDate) {
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
// ✅ Fix: Handle both cases (some APIs return data inside `.data`, some directly)
const searchResult =
  searchResponse?.data?.BusSearchResult || searchResponse?.BusSearchResult;


      if (
        searchResult?.ResponseStatus === 1 &&
        Array.isArray(searchResult?.BusResults)
      ) {
        const { Origin, Destination, TraceId, BusResults } = searchResult;

        // Transform API data into frontend format
        const transformedBuses = BusResults.map((bus, index) => ({
          busId: bus.ResultIndex || index,
          resultIndex: bus.ResultIndex,
          routeId: bus.RouteId,
          operatorId: bus.OperatorId,
          busName: bus.ServiceName,
          travelName: bus.TravelName,
          operator: bus.TravelName,
          busType: bus.BusType,
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
          price: bus.BusPrice?.PublishedPriceRoundedOff || bus.BusPrice?.PublishedPrice || 0,
          fare: bus.BusPrice?.PublishedPrice || 0,
          rating: 4.0 + Math.random() * 1.5,
          amenities: bus.Amenities || [],
          imagePath: `bus${(index % 3) + 1}.jpg`,
          totalSeats: 40,
          apiData: bus,
        }));

        setBusData(transformedBuses);
        setFilteredBusData(transformedBuses);

        console.log("🚌 Bus Search Success:", {
          origin: Origin,
          destination: Destination,
          totalBuses: transformedBuses.length,
        });
      } else {
        console.warn("⚠️ No buses found in API response");
        setBusData([]);
        setFilteredBusData([]);
        setError("No buses found for this route. Please try different cities or date.");
      }
    } catch (error) {
      console.error("💥 Bus Search Error:", error);
      setError(error.message || "Failed to search buses");

      // No fallback to static data - show empty state
      setBusData([]);
      setFilteredBusData([]);
    } finally {
      setLoading(false);
    }
  };

  // Modal functions
  const handleOpenSeats = (bus) => {
    setSelectedBus(bus);
    setShowModal(true);
    setSelectedSeats([]);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBus(null);
  };

  const handleSeatSelect = (seatNumber) => {
    setSelectedSeats(prev => 
      prev.includes(seatNumber) 
        ? prev.filter(seat => seat !== seatNumber)
        : [...prev, seatNumber]
    );
  };

  const handleConfirmSeats = () => {
    if (selectedSeats.length > 0) {
      console.log("Confirmed seats:", selectedSeats, "for bus:", selectedBus.busName);

      localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));
      localStorage.setItem("selectedBus", JSON.stringify(selectedBus));

      navigate("/Bus-checkout", { state: { bus: selectedBus, seats: selectedSeats } });
    }
    handleCloseModal();
  };

  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleSearch = () => {
    setError(null);
    
    // If cities are selected with IDs, use API search
    if (searchParams.fromCityId && searchParams.toCityId) {
      searchBuses();
    } else {
      setError("Please select both source and destination cities");
    }
  };

  const handleSearchParamChange = async (field, value) => {
    const newSearchParams = {
      ...searchParams,
      [field]: value
    };

    // If fromCity or toCity changes, find corresponding city ID
    if (field === 'fromCity' && value) {
      const city = cities.find(c => c.CityName === value);
      newSearchParams.fromCityId = city ? city.CityId : "";
      console.log("📍 From City Selected:", value, "ID:", city?.CityId);
    } else if (field === 'toCity' && value) {
      const city = cities.find(c => c.CityName === value);
      newSearchParams.toCityId = city ? city.CityId : "";
      console.log("📍 To City Selected:", value, "ID:", city?.CityId);
    }

    setSearchParams(newSearchParams);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      
      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(item => item !== value);
      } else {
        newFilters[filterType] = [...newFilters[filterType], value];
      }
      
      return newFilters;
    });
  };

  // Dynamic filter options extract karein
  const getDynamicFilterOptions = () => {
    const busTypes = [...new Set(busData.map(bus => bus.busType).filter(Boolean))];
    const operators = [...new Set(busData.map(bus => bus.operator).filter(Boolean))];
    const allAmenities = busData.flatMap(bus => bus.amenities || []);
    const amenities = [...new Set(allAmenities)].filter(Boolean);

    return { busTypes, operators, amenities };
  };

  const { busTypes, operators, amenities } = getDynamicFilterOptions();

  // Dynamic city options - now from API
  const getCityOptions = () => {
    const fromCities = cities.map(city => city.CityName).filter(Boolean);
    const toCities = cities.map(city => city.CityName).filter(Boolean);
    return { fromCities, toCities };
  };
  const { fromCities, toCities } = getCityOptions();

  // Apply Filters whenever busData or filters change
  useEffect(() => {
    if (!busData || busData.length === 0) return;

    let filteredData = [...busData];

    // Filter by Bus Type
    if (filters.busType.length > 0) {
      filteredData = filteredData.filter(bus =>
        filters.busType.includes(bus.busType)
      );
    }

    // Filter by Amenities
    if (filters.amenities.length > 0) {
      filteredData = filteredData.filter(bus =>
        filters.amenities.every(amenity =>
          (bus.amenities || []).includes(amenity)
        )
      );
    }

    // Filter by Operator
    if (filters.operator.length > 0) {
      filteredData = filteredData.filter(bus =>
        filters.operator.includes(bus.operator)
      );
    }

    setFilteredBusData(filteredData);
  }, [filters, busData]);
  // Click outside to close suggestions
useEffect(() => {
  const handleClickOutside = (event) => {
    const fromInput = document.querySelector('input[placeholder="Select City"]');
    const toInput = document.querySelectorAll('input[placeholder="Select City"]')[0];
    
    if (!event.target.closest('.position-relative')) {
      setShowFromSuggestions(false);
      setShowToSuggestions(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

  // Seat Component
  const Seat = ({ number, type, isSelected, onSelect }) => {
    return (
      <div 
        className={`seat ${type} ${isSelected ? 'selected' : ''}`}
        onClick={() => onSelect(number)}
      >
        {number}
      </div>
    );
  };

  if (initializing) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", marginTop: "100px" }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Initializing bus services...</p>
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
                <div className="alert alert-warning alert-dismissible fade show mb-3" role="alert">
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
          e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
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
          const searchText = searchParams.fromCity.trim().toLowerCase();

          // 🔹 Sort logic: startsWith first, then includes
          const sortedCities = searchText
            ? [
                ...fromCities.filter((city) =>
                  city.toLowerCase().startsWith(searchText)
                ),
                ...fromCities.filter(
                  (city) =>
                    !city.toLowerCase().startsWith(searchText) &&
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
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
          e.target.value.charAt(0).toUpperCase() + e.target.value.slice(1);
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
          const searchText = searchParams.toCity.trim().toLowerCase();

          const sortedCities = searchText
            ? [
                ...toCities.filter((city) =>
                  city.toLowerCase().startsWith(searchText)
                ),
                ...toCities.filter(
                  (city) =>
                    !city.toLowerCase().startsWith(searchText) &&
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
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
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
    selected={searchParams.travelDate ? new Date(searchParams.travelDate) : null}
    onChange={(date) => {
      const formattedDate = date.toISOString().split('T')[0];
      handleSearchParamChange('travelDate', formattedDate);
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


  {/* Bus Type */}
  <div className="col-md-2">
    <label className="text-muted small mb-1">Bus Type</label>
    <select 
      className="form-select fw-bold"
      value={searchParams.busType}
      onChange={(e) => handleSearchParamChange('busType', e.target.value)}
    >
      <option value="">All Types</option>
      {busTypes.map(type => (
        <option key={type} value={type}>{type}</option>
      ))}
    </select>
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
        cursor: loading ? 'not-allowed' : 'pointer'
      }}
      onClick={handleSearch}
      disabled={loading || !searchParams.fromCityId || !searchParams.toCityId}
    >
      {loading ? (
        <>
          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
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

              {/* Bus Type Filter - Dynamic */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("busType")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Bus Type</span>
                  <FontAwesomeIcon
                    icon={toggle.busType ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.busType && (
                  <div className="filter-options mt-2">
                    {busTypes.map((type) => (
                      <div className="form-check" key={type}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`bus-${type}`}
                          checked={filters.busType.includes(type)}
                          onChange={() => handleFilterChange("busType", type)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`bus-${type}`}
                        >
                          {type}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Amenities Filter - Dynamic */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("amenities")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Amenities</span>
                  <FontAwesomeIcon
                    icon={toggle.amenities ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.amenities && (
                  <div className="filter-options mt-2">
                    {amenities.map((amenity) => (
                      <div className="form-check" key={amenity}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`amenity-${amenity}`}
                          checked={filters.amenities.includes(amenity)}
                          onChange={() => handleFilterChange("amenities", amenity)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`amenity-${amenity}`}
                        >
                          {amenity}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Operator Filter - Dynamic */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("operator")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Operator</span>
                  <FontAwesomeIcon
                    icon={toggle.operator ? faChevronUp : faChevronDown}
                  />
                </div>
                {toggle.operator && (
                  <div className="filter-options mt-2">
                    {operators.map((operator) => (
                      <div className="form-check" key={operator}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`operator-${operator}`}
                          checked={filters.operator.includes(operator)}
                          onChange={() => handleFilterChange("operator", operator)}
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`operator-${operator}`}
                        >
                          {operator}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button 
                className="btn btn-outline-secondary w-100 mt-3"
                onClick={() => setFilters({ busType: [], amenities: [], operator: [] })}
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
                <select className="form-select form-select-sm" style={{ width: "auto" }}>
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
                filteredBusData.map((bus) => (
                  <div className="col-sm-12 mb-4" key={bus.busId}>
                    <div className="bus-card rounded-4 border shadow-sm overflow-hidden h-100">
                      <div className="bus-body p-3">
                        <div className="row align-items-center">
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
                          
                          <div className="col-sm-7">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <h6 className="fw-bold mb-0">{bus.busName}</h6>
                              <div className="d-flex align-items-center">
                                <small className="text-warning me-1">★</small>
                                <small className="text-muted">{bus.rating?.toFixed(1)}</small>
                              </div>
                            </div>
                            <p className="mb-2 text-muted small">
                              {bus.busType} • {bus.operator}
                            </p>
                            <p className="mb-2 text-muted small">
                              {bus.amenities?.join(" • ")}
                            </p>
                            
                            <div className="row text-muted small bus-features">
                              <div className="col-6">
                                <ul className="ps-0 mb-0">
                                  <li><strong>Departure:</strong> {bus.departureTime}</li>
                                  <li><strong>Arrival:</strong> {bus.arrivalTime}</li>
                                </ul>
                              </div>
                              <div className="col-6">
                                <ul className="ps-0 mb-0">
                                  <li><strong>Duration:</strong> {bus.duration}</li>
                                  <li><strong>Route:</strong> {bus.from} → {bus.to}</li>
                                </ul>
                              </div>
                            </div>
                          </div>

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
                                  <small className={bus.availableSeats > 10 ? "text-success" : "text-warning"}>
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
          </div>
        </div>
      </div>
      {/* Seat Selection Modal */}
      {showModal && (
        <div className="modal-overlay" style={{marginTop: '160px'}}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>Select Seats - {selectedBus?.busName}</h2>
              <button className="close-btn" onClick={handleCloseModal}>×</button>
            </div>

            <div className="seat-type-info">
              <div className="seat-type">
                <span className="seat-color lower-berth"></span>
                <span>LOWER BERTH (27)</span>
              </div>
              <div className="seat-type">
                <span className="seat-color upper-berth"></span>
                <span>UPPER BERTH (15)</span>
              </div>
              <div className="know-seats-link">
                <a href="#know-seats">Know your seats</a>
              </div>
            </div>

            <div className="bus-layout">
              <div className="bus-driver">Driver</div>
              
              <div className="seats-grid">
                <div className="seats-left">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(seat => (
                    <Seat 
                      key={seat}
                      number={seat}
                      type={seat % 2 === 0 ? 'upper' : 'lower'}
                      isSelected={selectedSeats.includes(seat)}
                      onSelect={handleSeatSelect}
                    />
                  ))}
                </div>

                <div className="aisle"></div>

                <div className="seats-right">
                  {Array.from({ length: 12 }, (_, i) => i + 13).map(seat => (
                    <Seat 
                      key={seat}
                      number={seat}
                      type={seat % 2 === 0 ? 'lower' : 'upper'}
                      isSelected={selectedSeats.includes(seat)}
                      onSelect={handleSeatSelect}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="selected-seats-summary">
              <h3>Selected Seats</h3>
              {selectedSeats.length > 0 ? (
                <div className="selected-seats-list">
                  {selectedSeats.map(seat => (
                    <span key={seat} className="selected-seat-tag">
                      Seat {seat}
                    </span>
                  ))}
                </div>
              ) : (
                <p>No seats selected yet</p>
              )}
            </div>

            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button 
                className="confirm-btn" 
                onClick={handleConfirmSeats}
                disabled={selectedSeats.length === 0}
              >
                Confirm Seats
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BusList;