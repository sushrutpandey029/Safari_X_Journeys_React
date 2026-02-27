import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bus_getCityList } from "../services/busservice";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Bus.css";

function BusPopularDestination() {
  const navigate = useNavigate();
  const fromRef = useRef(null);
  const toRef = useRef(null);

  const [cities, setCities] = useState([]);
  const [popularRoutes, setPopularRoutes] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [citiesLoading, setCitiesLoading] = useState(true);

  // ✅ Timezone-safe aaj ki date
  const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  };

  // ✅ Timezone-safe date string (YYYY-MM-DD)
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const [searchParams, setSearchParams] = useState({
    fromCity: "",
    fromCityId: "",
    toCity: "",
    toCityId: "",
    travelDate: getToday(), // ✅ aaj ki date
  });

  const routeNames = [
    { name: "Bangalore", image: "/Images/shimla.jpg" },
    { name: "Hyderabad", image: "/Images/shimla.jpg" },
    { name: "Chennai", image: "/Images/shimla.jpg" },
    { name: "Goa", image: "/Images/goa.jpg" },
    { name: "Lucknow", image: "/Images/shimla.jpg" },
    { name: "Varanasi", image: "/Images/varanasi.jpg" },
    { name: "Shimla", image: "/Images/shimla.jpg" },
    { name: "Kedarnath", image: "/Images/kedarnath.jpg" },
  ];

  // =============================
  // Load Cities from API
  // =============================
  useEffect(() => {
    const loadCities = async () => {
      try {
        setCitiesLoading(true);
        const cityResponse = await Bus_getCityList();

        const cityData =
          cityResponse?.resposnse?.BusCities ||
          cityResponse?.BusCities ||
          cityResponse;

        if (!Array.isArray(cityData) || cityData.length === 0) {
          console.error("❌ No cities found in response");
          return;
        }

        setCities(cityData);
        console.log(`✅ ${cityData.length} cities loaded`);

        // ✅ Delhi ka real ID dynamically dhundo
        const delhi = cityData.find(
          (c) =>
            c.CityName.toLowerCase() === "delhi" ||
            c.CityName.toLowerCase() === "new delhi"
        );

        if (delhi) {
          console.log("✅ Delhi found:", delhi);
          setSearchParams((prev) => ({
            ...prev,
            fromCity: delhi.CityName,
            fromCityId: delhi.CityId,
          }));
        } else {
          console.warn("⚠️ Delhi not found in city list");
        }

        // ✅ Popular routes ke real IDs dynamically resolve karo
        const resolved = routeNames
          .map((route) => {
            const city = cityData.find((c) =>
              c.CityName.toLowerCase().includes(route.name.toLowerCase())
            );
            if (!city) {
              console.warn(`⚠️ City not found: ${route.name}`);
              return null;
            }
            return {
              CityId: city.CityId,
              CityName: city.CityName,
              image: route.image,
            };
          })
          .filter(Boolean);

        setPopularRoutes(resolved);
        console.log("✅ Resolved popular routes:", resolved);
      } catch (err) {
        console.error("❌ Error loading bus cities:", err);
      } finally {
        setCitiesLoading(false);
      }
    };

    loadCities();
  }, []);

  // =============================
  // Click Outside Handler
  // =============================
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
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =============================
  // Filter Cities (smart search)
  // =============================
  const filterCities = (searchText) => {
    if (!searchText || !searchText.trim()) return cities.slice(0, 15);

    const text = searchText.toLowerCase().trim();

    const exactMatch = cities.filter(
      (c) => c.CityName.toLowerCase() === text
    );
    const startsWith = cities.filter(
      (c) =>
        c.CityName.toLowerCase().startsWith(text) &&
        c.CityName.toLowerCase() !== text
    );
    const includes = cities.filter(
      (c) =>
        !c.CityName.toLowerCase().startsWith(text) &&
        c.CityName.toLowerCase().includes(text)
    );

    return [...exactMatch, ...startsWith, ...includes].slice(0, 15);
  };

  // =============================
  // Handle Search Param Change
  // =============================
  const handleSearchParamChange = (field, value, cityId = null) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
      ...(cityId !== null
        ? { [field + "Id"]: cityId }
        : { [field + "Id"]: "" }),
    }));
  };

  // =============================
  // Handle Search Button Click
  // =============================
  const handleSearch = () => {
    if (!searchParams.fromCityId || !searchParams.toCityId) {
      alert("Please select both source and destination cities.");
      return;
    }

    // ✅ Timezone-safe conversion
    const travelDate = formatDate(searchParams.travelDate);

    navigate("/bus-list", {
      state: {
        fromCityId: searchParams.fromCityId,
        fromCityName: searchParams.fromCity,
        toCityId: searchParams.toCityId,
        toCityName: searchParams.toCity,
        travelDate,
      },
    });
  };

  // =============================
  // Handle Popular Route Card Click
  // =============================
  const handleRouteClick = (route) => {
    if (!searchParams.fromCityId) {
      alert("Source city (Delhi) not loaded yet. Please wait.");
      return;
    }

    // ✅ Timezone-safe aaj ki date
    const travelDate = formatDate(getToday());

    navigate("/bus-list", {
      state: {
        fromCityId: searchParams.fromCityId,
        fromCityName: searchParams.fromCity,
        toCityId: route.CityId,
        toCityName: route.CityName,
        travelDate,
      },
    });
  };

  // =============================
  // RENDER
  // =============================
  return (
    <div className="book-bus">
      <div className="container">

        {/* Search Section */}
        <div
          style={{ marginTop: "100px" }}
          className="row g-3 align-items-center justify-content-center mb-4"
        >
          {/* From */}
          <div ref={fromRef} className="col-md-3 position-relative">
            <label className="small text-muted">From</label>
            <input
              className="form-control fw-bold"
              value={searchParams.fromCity}
              placeholder={citiesLoading ? "Loading cities..." : "Select source city"}
              disabled={citiesLoading}
              onChange={(e) => {
                handleSearchParamChange("fromCity", e.target.value);
                setShowFromSuggestions(true);
              }}
              onFocus={() => setShowFromSuggestions(true)}
            />

            {showFromSuggestions && !citiesLoading && (
              <div className="position-absolute w-100 bg-white border shadow max-h-200 overflow-auto z-3">
                {filterCities(searchParams.fromCity).map((city) => (
                  <div
                    key={city.CityId}
                    className="p-2 border-bottom"
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      handleSearchParamChange("fromCity", city.CityName, city.CityId);
                      setShowFromSuggestions(false);
                    }}
                  >
                    {city.CityName}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* To */}
          <div ref={toRef} className="col-md-3 position-relative">
            <label className="small text-muted">To</label>
            <input
              className="form-control fw-bold"
              value={searchParams.toCity}
              placeholder={citiesLoading ? "Loading cities..." : "Select destination"}
              disabled={citiesLoading}
              onChange={(e) => {
                handleSearchParamChange("toCity", e.target.value);
                setShowToSuggestions(true);
              }}
              onFocus={() => setShowToSuggestions(true)}
            />

            {showToSuggestions && !citiesLoading && (
              <div className="position-absolute w-100 bg-white border shadow max-h-200 overflow-auto z-3">
                {filterCities(searchParams.toCity).map((city) => {
                  const isDisabled = city.CityId === searchParams.fromCityId;
                  return (
                    <div
                      key={city.CityId}
                      className={`p-2 border-bottom ${isDisabled ? "text-muted bg-light" : ""}`}
                      style={{ cursor: isDisabled ? "not-allowed" : "pointer" }}
                      onClick={() => {
                        if (isDisabled) return;
                        handleSearchParamChange("toCity", city.CityName, city.CityId);
                        setShowToSuggestions(false);
                      }}
                    >
                      {city.CityName}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Date */}
          <div className="col-md-3">
            <label className="small text-muted">Travel Date</label>
            <DatePicker
              selected={searchParams.travelDate}
              onChange={(date) => {
                const d = new Date(date);
                d.setHours(0, 0, 0, 0); // ✅ time reset
                setSearchParams((prev) => ({ ...prev, travelDate: d }));
              }}
              className="form-control"
              minDate={getToday()} // ✅ aaj se pehle block
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Search Button */}
          <div className="col-md-2">
            <button
              className="explore-btn w-100"
              onClick={handleSearch}
              disabled={citiesLoading || !searchParams.toCityId || !searchParams.fromCityId}
            >
              {citiesLoading ? "Loading..." : "SEARCH"}
            </button>
          </div>
        </div>

        {/* Popular Routes */}
        <div className="row">
          <div className="col-12 mb-3">
            <h2>
              Top Bus Routes from <span>{searchParams.fromCity || "Delhi"}</span>
            </h2>
          </div>

          {citiesLoading ? (
            <div className="col-12 text-center py-4">
              <div className="spinner-border text-primary" role="status" />
              <p className="mt-2">Loading popular routes...</p>
            </div>
          ) : (
            popularRoutes.map((route, index) => (
              <div key={index} className="col-md-3 col-6 mb-4">
                <div
                  className="destination-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRouteClick(route)}
                >
                  <img
                    src={route.image}
                    alt={route.CityName}
                    className="img-fluid"
                  />
                  <div className="card-destination">
                    {searchParams.fromCity || "Delhi"} → {route.CityName}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default BusPopularDestination;