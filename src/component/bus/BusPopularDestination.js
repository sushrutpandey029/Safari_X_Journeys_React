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

  // =============================
  // Static Popular Routes (Delhi → other cities)
  // =============================
  const popularRoutes = [
    { CityId: 8463, CityName: "Bangalore", image: "/Images/shimla.jpg" },
    { CityId: 9573, CityName: "Hyderabad", image: "/Images/shimla.jpg" },
    { CityId: 16332, CityName: "Chennai", image: "/Images/shimla.jpg" },
    { CityId: 16294, CityName: "Goa", image: "/Images/goa.jpg" },
    { CityId: 7362, CityName: "Lucknow", image: "/Images/shimla.jpg" },
    { CityId: 3027, CityName: "Varanasi", image: "/Images/varanasi.jpg" },
    { CityId: 7692, CityName: "Shimla", image: "/Images/shimla.jpg" },
    { CityId: 1051, CityName: "Kedarnath", image: "/Images/kedarnath.jpg" },
  ];

  // =============================
  // State
  // =============================
  const [cities, setCities] = useState([]);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);

  const getTomorrow = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  };

  const [searchParams, setSearchParams] = useState({
    fromCity: "Delhi",
    fromCityId: 16593,
    toCity: "",
    toCityId: "",
    travelDate: getTomorrow(),
  });

  const [isSearchingBuses, setIsSearchingBuses] = useState(false);

  // =============================
  // Load cities from API
  // =============================
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cityResponse = await Bus_getCityList();
        console.log("city resp in bus", cityResponse?.resposnse);
        if (cityResponse?.resposnse?.Status === 1) {
          setCities(cityResponse.resposnse?.BusCities);
        }
      } catch (err) {
        console.error("Error loading bus cities:", err);
      }
    };

    loadCities();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close From dropdown
      if (fromRef.current && !fromRef.current.contains(event.target)) {
        setShowFromSuggestions(false);
      }

      // Close To dropdown
      if (toRef.current && !toRef.current.contains(event.target)) {
        setShowToSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =============================
  // Handle Search Param Change
  // =============================
  const handleSearchParamChange = (field, value, cityId = null) => {
    setSearchParams((prev) => ({
      ...prev,
      [field]: value,
      ...(cityId && {
        [field + "Id"]: cityId,
      }),
    }));
  };

  // =============================
  // Handle Search Click
  // =============================
  const handleSearch = () => {
    if (!searchParams.fromCityId || !searchParams.toCityId) return;

    if (!searchParams.fromCityId || !searchParams.toCityId) {
      alert("Please select both cities");
      return;
    }

    if (searchParams.fromCityId === searchParams.toCityId) {
      alert("Source and destination cannot be same");
      return;
    }

    navigate("/bus-list", {
      state: {
        fromCityId: searchParams.fromCityId,
        fromCityName: searchParams.fromCity,
        toCityId: searchParams.toCityId,
        toCityName: searchParams.toCity,
        travelDate: searchParams.travelDate,
      },
    });
  };

  // =============================
  // Handle Card Click
  // =============================
  const handleRouteClick = (route) => {
    navigate("/bus-list", {
      state: {
        fromCityId: 16593,
        fromCityName: "Delhi",
        toCityId: route.CityId,
        toCityName: route.CityName,
      },
    });
  };

  // =============================
  // Filter Cities
  // =============================
  const filterCities = (searchText) => {
    if (!searchText) return cities;

    const text = searchText.toLowerCase();

    return [
      ...cities.filter((c) => c.CityName.toLowerCase().startsWith(text)),
      ...cities.filter(
        (c) =>
          !c.CityName.toLowerCase().startsWith(text) &&
          c.CityName.toLowerCase().includes(text),
      ),
    ];
  };

  return (
    <div className="book-bus">
      <div className="container">
        {/* =============================
            Search Section
        ============================= */}
        {/* <div style={{ marginTop: "100px" }}>rendering filter</div> */}
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
              placeholder="Select source city"
              onChange={(e) => {
                handleSearchParamChange("fromCity", e.target.value);
                setShowFromSuggestions(true);
              }}
              onFocus={() => setShowFromSuggestions(true)}
            />

            {showFromSuggestions && (
              <div className="position-absolute w-100 bg-white border shadow max-h-200 overflow-auto z-3">
                {filterCities(searchParams.fromCity)
                  .slice(0, 15)
                  .map((city) => (
                    <div
                      key={city.CityId}
                      className="p-2 border-bottom"
                      style={{ cursor: "pointer" }}
                      onClick={() => {
                        handleSearchParamChange(
                          "fromCity",
                          city.CityName,
                          city.CityId,
                        );
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
              onChange={(e) =>
                handleSearchParamChange("toCity", e.target.value)
              }
              onFocus={() => setShowToSuggestions(true)}
              placeholder="Select destination"
            />

            {showToSuggestions && (
              <div className="position-absolute w-100 bg-white border shadow max-h-200 overflow-auto z-3">
                {filterCities(searchParams.toCity)
                  .slice(0, 15)
                  .map((city) => {
                    const isDisabled = city.CityId === searchParams.fromCityId;

                    return (
                      <div
                        key={city.CityId}
                        className={`p-2 border-bottom ${
                          isDisabled ? "text-muted bg-light" : ""
                        }`}
                        style={{
                          cursor: isDisabled ? "not-allowed" : "pointer",
                        }}
                        onClick={() => {
                          if (isDisabled) return;

                          handleSearchParamChange(
                            "toCity",
                            city.CityName,
                            city.CityId,
                          );

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
              selected={
                searchParams.travelDate
                  ? new Date(searchParams.travelDate)
                  : null
              }
              onChange={(date) =>
                handleSearchParamChange(
                  "travelDate",
                  date?.toISOString().split("T")[0],
                )
              }
              className="form-control"
              minDate={new Date()}
              dateFormat="yyyy-MM-dd"
            />
          </div>

          {/* Search */}
          <div className="col-md-2">
            <button
              className="explore-btn w-100"
              onClick={handleSearch}
              disabled={!searchParams.toCityId}
            >
              SEARCH
            </button>
          </div>
        </div>

        {/* =============================
            Popular Routes Cards
        ============================= */}

        <div className="row">
          <div className="col-12 mb-3">
            <h2>
              Top Bus Routes from <span>Delhi</span>
            </h2>
          </div>

          {popularRoutes.map((route, index) => (
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

                <div className="card-destination">Delhi → {route.CityName}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BusPopularDestination;
