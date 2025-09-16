import React, { useState, useEffect } from "react";
import "./HotelBooking.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faLocationDot,
} from "@fortawesome/free-solid-svg-icons";

import { getCityList, getHotelCodeListNew } from "../services/hotelService";
import { getHotelCodeList } from "../services/hotelService";
import { searchHotels } from "../services/hotelService";
import { useNavigate, useLocation } from "react-router-dom";

function HotelBooking() {
  // Location
  const location = useLocation();
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("IN");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");


  // Date & Rooms
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [rooms, setRooms] = useState(1);
  const [paxRooms, setPaxRooms] = useState([
    { Adults: 2, Children: 0, ChildrenAges: [] },
  ]);
  const [open, setOpen] = useState(false);
  // Guest nationality
  const [guestNationality, setGuestNationality] = useState("IN");

  // Filters
  const [isRefundable, setIsRefundable] = useState(false);
  const [mealType, setMealType] = useState("All");
  const [isDetailedResponse, setIsDetailedResponse] = useState(false);
  const [responseTime, setResponseTime] = useState(30);

  // Results
  const [hotelList, setHotelList] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Extra UI filters
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState("Popularity");

  // pagination 

  
  const navigate = useNavigate();

  useEffect(() => {
    const today = new Date();

    // ✅ check-in = tomorrow
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    // ✅ check-out = day after tomorrow
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);

    const formatDate = (d) => d.toISOString().split("T")[0];

    setCheckIn(formatDate(tomorrow));
    setCheckOut(formatDate(dayAfterTomorrow));
  }, []);

  const handleSearch = async () => {
    setIsSearching(true);

    try {
      // 🔹 Step 1: Get hotel codes for selected city
      const data = await getHotelCodeListNew(selectedCountry, selectedCity);
      console.log("Search List API Full Response:", data);

      let hotels = [];
      if (Array.isArray(data)) {
        hotels = data;
      } else if (data?.Hotels && Array.isArray(data.Hotels)) {
        hotels = data.Hotels;
      } else if (data?.data?.Hotels && Array.isArray(data.data.Hotels)) {
        hotels = data.data.Hotels;
      } else if (data?.data && Array.isArray(data.data)) {
        hotels = data.data;
      }

      console.log("✅ Final Filtered Hotels:", hotels);
      setHotelList(hotels);

      // 🔹 Step 2: Extract hotel codes
      const hotelCodes = hotels.map((h) => h.HotelCode || h.Code);
      if (hotelCodes.length === 0) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      // 🔹 Step 3: Build payload according to TBO Docs
      const payload = {
        CheckIn: checkIn,
        CheckOut: checkOut,
        HotelCodes: hotelCodes.slice(0, 100), // ⚡ in chunks of 100
        GuestNationality: guestNationality,
        NoOfRooms: rooms,
        PaxRooms: paxRooms.map((p) => ({
          Adults: p.Adults,
          Children: p.Children,
          ChildrenAges: p.ChildrenAges,
        })),
        ResponseTime: responseTime, // default 30s
        IsDetailedResponse: isDetailedResponse, // true/false
        Filters: {
          Refundable: isRefundable,
          MealType: mealType, // All | WithMeal | RoomOnly
        },
      };

      console.log("🔹 Final Payload:", payload);

      // 🔹 Step 4: Call Search API
      const res = await searchHotels(payload);
      console.log("Hotel Search Response:", res);
      console.log("HotelResult", JSON.stringify(res.HotelResult));
      if (res?.data?.HotelResult) {
        setSearchResults(res.data.HotelResult);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("❌ Error in search:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // ✅ Fetch Cities for India by default
  // Step 1: Load city list
  useEffect(() => {
    const loadCities = async () => {
      try {
        const resp = await getCityList("IN");
        console.log("Cities API Raw Response:", resp);

        let cities = [];
        if (Array.isArray(resp)) cities = resp;
        else if (resp?.CityList) cities = resp.CityList;
        else if (resp?.data?.CityList) cities = resp.data.CityList;
        else if (resp?.data && Array.isArray(resp.data)) cities = resp.data;

        setCityList(cities);

        // ✅ Navigation se city aaye toh match karo cityList ke sath
        if (cities.length > 0 && location.state?.city) {
          const cityCode = location.state.city.toString();
          const cityObj = cities.find(
            (c) => (c.CityCode?.toString() || c.Code?.toString()) === cityCode
          );

          if (cityObj) {
            setSelectedCity(cityObj.CityCode || cityObj.Code);
            setSelectedCityName(
              cityObj.CityName || cityObj.Name || cityObj.City
            );
          }
        }

        // ✅ Agar navigation se kuch nahi aaya toh first city select
        if (cities.length > 0 && !location.state?.city) {
          setSelectedCity(cities[0].CityCode || cities[0].Code);
          setSelectedCityName(
            cities[0].CityName || cities[0].Name || cities[0].City
          );
        }
      } catch (err) {
        console.error("❌ Error fetching cities:", err);
      }
    };

    loadCities();
  }, [location.state]);

  // Toggle states for each filter section
  const [toggle, setToggle] = useState({
    showProperties: true,
    price: true,
    star: true,
    review: true,
    amenities: true,
  });

  // Toggle handler
  const handleToggle = (section) => {
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleViewDetail = (hotelCode) => {
    navigate(`/hotel-detail/${hotelCode}`, {
      state: {
        checkIn: checkIn,
        checkOut: checkOut,
        GuestNationality: guestNationality,
        NoOfRooms: rooms,
        PaxRooms: paxRooms.map((p) => ({
          Adults: p.Adults,
          Children: p.Children,
          ChildrenAges: p.ChildrenAges,
        })),
        ResponseTime: responseTime, // default 30s
        IsDetailedResponse: isDetailedResponse, // true/false
        Filters: {
          Refundable: "true",
          MealType: "WithMeal", // All | WithMeal | RoomOnly
        },
      },
    });
  };

  // Determine which hotels to display
  const displayedHotels = isSearching ? searchResults : hotelList;

  // ✅ Run only once on first load if data exists
  useEffect(() => {
    if (location.state) {
      const { country, city, cityName, checkIn, checkOut, rooms, paxRooms } =
        location.state;

      // ✅ handle when coming from HotelPopularDestination
      if (city && cityName) {
        setSelectedCity(city);
        setSelectedCityName(cityName);

        // optional: set default dates if none provided
        if (!checkIn) setCheckIn(new Date().toISOString().split("T")[0]);
        if (!checkOut) {
          const tomorrow = new Date();
          tomorrow.setDate(tomorrow.getDate() + 1);
          setCheckOut(tomorrow.toISOString().split("T")[0]);
        }
      }

      // ✅ handle when coming from your other component
      if (country) setSelectedCountry(country);
      if (checkIn) setCheckIn(checkIn);
      if (checkOut) setCheckOut(checkOut);
      if (rooms) setRooms(rooms);
      if (paxRooms) setPaxRooms(paxRooms);
    }
  }, [location.state]);
  // sirf jab navigation se data aaye

  // Trigger search when all relevant state values are ready
  useEffect(() => {
    if (selectedCity && checkIn && checkOut) {
      handleSearch();
    }
  }, [selectedCity, checkIn, checkOut, rooms, paxRooms, guestNationality]);

  return (

    <div>

      {/* search hotel box filter */}

      <div className="search-box listing-search-form">
        <div className="container">
          <div className="row g-3 align-items-end">
            {/* City */}
            <div className="col-md-2">
              <label className="form-label">City</label>
              <select
                className="form-control"
                value={selectedCity}
                onChange={(e) => {
                  const cityCode = e.target.value;
                  setSelectedCity(cityCode);

                  const cityObj = cityList.find(
                    (c) =>
                      (c.CityCode?.toString() || c.Code?.toString()) ===
                      cityCode.toString()
                  );

                  const cityName =
                    cityObj?.CityName || cityObj?.Name || cityObj?.City || "";

                  setSelectedCityName(cityName);
                  localStorage.setItem("selectedCity", cityCode);
                  localStorage.setItem("selectedCityName", cityName);
                }}
                disabled={!selectedCountry || loading}
              >
                <option value="">-- Select City --</option>
                {cityList.map((city, index) => (
                  <option key={index} value={city.CityCode || city.Code}>
                    {city.CityName || city.Name || city.City}
                  </option>
                ))}
              </select>
            </div>

            {/* Check-in */}
            <div className="col-md-2">
              <label className="form-label">Check-In</label>
              <input
                type="date"
                className="form-control"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>

            {/* Check-out */}
            <div className="col-md-2">
              <label className="form-label">Check-Out</label>
              <input
                type="date"
                className="form-control"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>

            {/* Rooms Dropdown */}
            <div className="col-md-4 position-relative">
              {/* Dropdown Trigger */}
              <label className="form-label">Rooms/Guests</label>
              <div
                className="form-control d-flex justify-content-between align-items-center"
                onClick={() => setOpen(!open)}
                style={{ cursor: "pointer" }}
              >
                {rooms} Room{rooms > 1 ? "s" : ""},{" "}
                {paxRooms.reduce((acc, r) => acc + r.Adults + r.Children, 0)}{" "}
                Guests
                <span>▼</span>
              </div>

              {/* Dropdown Content */}
              {open && (
                <div
                  className="border rounded p-3 bg-white shadow-sm position-absolute mt-1"
                  style={{ zIndex: 1000, width: "100%" }}
                >
                  {/* Pax Rooms */}
                  {paxRooms.map((room, idx) => (
                    <div key={idx} className="mb-3">
                      <h6 className="fw-bold mb-2">Room {idx + 1}</h6>

                      {/* Adults & Children */}
                      <div className="d-flex align-items-center gap-4 mb-2">
                        {/* Adults */}
                        <div>
                          <label className="form-label">
                            Adult (Above 12 years)
                          </label>
                          <div className="d-flex align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const updated = [...paxRooms];
                                if (updated[idx].Adults > 1)
                                  updated[idx].Adults -= 1;
                                setPaxRooms(updated);
                              }}
                            >
                              -
                            </button>
                            <span className="px-3">{room.Adults}</span>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const updated = [...paxRooms];
                                if (updated[idx].Adults < 8)
                                  updated[idx].Adults += 1;
                                setPaxRooms(updated);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* Children */}
                        <div>
                          <label className="form-label">
                            Child (Below 12 years)
                          </label>
                          <div className="d-flex align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const updated = [...paxRooms];
                                if (updated[idx].Children > 0) {
                                  updated[idx].Children -= 1;
                                  updated[idx].ChildrenAges = updated[
                                    idx
                                  ].ChildrenAges.slice(
                                    0,
                                    updated[idx].Children
                                  );
                                }
                                setPaxRooms(updated);
                              }}
                            >
                              -
                            </button>
                            <span className="px-3">{room.Children}</span>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const updated = [...paxRooms];
                                if (updated[idx].Children < 4) {
                                  updated[idx].Children += 1;
                                  updated[idx].ChildrenAges.push(1);
                                }
                                setPaxRooms(updated);
                              }}
                            >
                              +
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Children Ages */}
                      {room.Children > 0 && (
                        <div>
                          <label className="form-label">
                            Age(s) of Children
                          </label>
                          <div className="d-flex gap-2">
                            {room.ChildrenAges.map((age, cIdx) => (
                              <select
                                key={cIdx}
                                className="form-control"
                                style={{ width: "80px" }}
                                value={age}
                                onChange={(e) => {
                                  const updated = [...paxRooms];
                                  updated[idx].ChildrenAges[cIdx] = Number(
                                    e.target.value
                                  );
                                  setPaxRooms(updated);
                                }}
                              >
                                {Array.from(
                                  { length: 12 },
                                  (_, i) => i + 1
                                ).map((a) => (
                                  <option key={a} value={a}>
                                    {a}
                                  </option>
                                ))}
                              </select>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add/Remove Room */}
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => {
                        if (rooms < 5) {
                          setRooms(rooms + 1);
                          setPaxRooms([
                            ...paxRooms,
                            { Adults: 2, Children: 0, ChildrenAges: [] },
                          ]);
                        }
                      }}
                    >
                      + Add Room
                    </button>
                    {rooms > 1 && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setRooms(rooms - 1);
                          setPaxRooms(paxRooms.slice(0, -1));
                        }}
                      >
                        Remove Room
                      </button>
                    )}
                  </div>

                  {/* Done Button */}
                  <button
                    className="btn btn-warning w-100 mt-3"
                    onClick={() => setOpen(false)}
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
            {/* Search Button */}
            <div className="col-md-2">
              <button
                className=" form-control explore-btn w-100"
                onClick={handleSearch}
              >
                Modify Search
              </button>
            </div>
          </div>
        </div>

        {/* Keyword + Sort */}
      </div>
      <div className="container hotel-listing">
        <div className="row">
          <div className="col-sm-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Hotels
                </li>
              </ol>
            </nav>


          </div>

          <div className="col-sm-3">
            <div className="filter-box p-3 border rounded">
              <h5 className="mb-3 fw-bold">FILTER</h5>

              {/* Filter: Show Properties With */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("showProperties")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Show Properties With</span>
                  <span>
                    <FontAwesomeIcon
                      icon={toggle.showProperties ? faChevronUp : faChevronDown}
                    />
                  </span>
                </div>
                {toggle.showProperties && (
                  <div className="filter-options mt-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="bookZero"
                      />
                      <label className="form-check-label" htmlFor="bookZero">
                        Book With ₹0
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="freeCancel"
                      />
                      <label className="form-check-label" htmlFor="freeCancel">
                        Free Cancellation
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="freeBreakfast"
                      />
                      <label className="form-check-label" htmlFor="freeBreakfast">
                        Free Breakfast
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={isRefundable}
                        onChange={(e) => setIsRefundable(e.target.checked)}
                        id="refundable"
                      />
                      <label className="form-check-label" htmlFor="refundable">
                        Refundable Only
                      </label>
                    </div>
                  </div>
                )}
              </div>




              {/* Filter: Star Rating */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("star")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Star Rating</span>
                  <span>
                    <FontAwesomeIcon
                      icon={toggle.star ? faChevronUp : faChevronDown}
                    />
                  </span>
                </div>
                {toggle.star && (
                  <div className="filter-options mt-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="s1"
                      />
                      <label className="form-check-label" htmlFor="s1">
                        5 Star <span className="text-muted">[205]</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="s2"
                      />
                      <label className="form-check-label" htmlFor="s2">
                        4 Star <span className="text-muted">[550]</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="s3"
                      />
                      <label className="form-check-label" htmlFor="s3">
                        3 Star <span className="text-muted">[305]</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="s4"
                      />
                      <label className="form-check-label" htmlFor="s4">
                        Budget <span className="text-muted">[750]</span>
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="s5"
                      />
                      <label className="form-check-label" htmlFor="s5">
                        Unrated <span className="text-muted">[500]</span>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter: User Review Rating */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("review")}
                  style={{ cursor: "pointer" }}
                >
                  <span>User Review Rating</span>
                  <span>
                    <FontAwesomeIcon
                      icon={toggle.review ? faChevronUp : faChevronDown}
                    />
                  </span>
                </div>
                {toggle.review && (
                  <div className="filter-options mt-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="r1"
                      />
                      <label className="form-check-label" htmlFor="r1">
                        4.5 & Above (Excellent)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="r2"
                      />
                      <label className="form-check-label" htmlFor="r2">
                        4 & Above (Very Good)
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="r3"
                      />
                      <label className="form-check-label" htmlFor="r3">
                        3 & Above (Good)
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Filter: Amenities */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("amenities")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Amenities</span>
                  <span>
                    <FontAwesomeIcon
                      icon={toggle.amenities ? faChevronUp : faChevronDown}
                    />
                  </span>
                </div>
                {toggle.amenities && (
                  <div className="filter-options mt-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="a1"
                      />
                      <label className="form-check-label" htmlFor="a1">
                        Free Cancellation
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="a2"
                      />
                      <label className="form-check-label" htmlFor="a2">
                        24 Hour Front Desk
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="a3"
                      />
                      <label className="form-check-label" htmlFor="a3">
                        Ac
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="a4"
                      />
                      <label className="form-check-label" htmlFor="a4">
                        Bar
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="a5"
                      />
                      <label className="form-check-label" htmlFor="a5">
                        Wi-Fi
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="a6"
                      />
                      <label className="form-check-label" htmlFor="a6">
                        Breakfast
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-9">
            <div className="row mt-3">
              <div className="col-sm-8 ms-auto d-flex gap-2">
                <input
                  type="text"
                  className="form-control flex-fill"
                  placeholder="Enter Hotel Name or Location"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
               <select
  className="form-select flex-fill"
  value={sortOption}
  onChange={(e) => setSortOption(e.target.value)}
>
  <option value="Popularity">Popularity</option>
  <option value="PriceLowHigh">Price (Low to High)</option>
  <option value="PriceHighLow">Price (High to Low)</option>
  <option value="Rating">Rating</option>
</select>

              </div>
            </div>

            {isSearching ? (
              <div className="text-center mt-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <div className="row mt-3">
                {displayedHotels && displayedHotels.length > 0 ? (
                  displayedHotels.map((hotel, idx) => (
                    <div key={idx} className="col-md-4 mb-4">
                      <div className="card shadow-sm border-0 h-100 rounded-3">
                        {/* Hotel Image */}
                        <div className="card-img-top position-relative">
                          {hotel.ImageUrls && hotel.ImageUrls.length > 0 ? (
                            <img
                              src={hotel.ImageUrls[0].ImageUrl}
                              alt={hotel.HotelName}
                              className="img-fluid rounded-top"
                              style={{
                                height: "180px",
                                objectFit: "cover",
                                width: "100%",
                              }}
                            />
                          ) : (
                            <div
                              className="d-flex align-items-center justify-content-center bg-light rounded-top"
                              style={{ height: "180px" }}
                            >
                              <p className="text-muted mb-0">No Image Available</p>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="card-body">
                          <small className="hotel-place">
                            {hotel.CityName || "Hotel"}
                          </small>

                          <h6 className="hotel-name">{hotel.HotelName}</h6>
                          <p className="text-muted small mb-2">
                            {hotel.Address}, {hotel.CityName}, {hotel.CountryName}
                          </p>

                          {/* Rating */}
                          <div className="rating">
                            {hotel.HotelRating === "FiveStar" && "⭐⭐⭐⭐⭐"}
                            {hotel.HotelRating === "FourStar" && "⭐⭐⭐⭐"}
                            {hotel.HotelRating === "ThreeStar" && "⭐⭐⭐"}
                            {hotel.HotelRating === "TwoStar" && "⭐⭐"}
                            {hotel.HotelRating === "OneStar" && "⭐"}
                          </div>

                          {/* Expiry Tag + Button */}
                          <div className="d-flex justify-content-between align-items-center">
                            <button
                              className="btn btn-primary btn-sm detail"
                              onClick={() => handleViewDetail(hotel.HotelCode)}
                            >
                              View Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    <h5>No hotels available</h5>

                    {selectedCity ? (
                      <img
                        src="/images/Safarix-Logo1.png" //✅ apni image ka path yaha dalna
                        alt="Try changing search"
                        style={{ maxWidth: "200px", height: "auto" }}
                      />
                    ) : (
                      <img
                        src="/images/select-city.png" // ✅ dusri image agar city select nahi hai
                        alt="Select city"
                        style={{ maxWidth: "200px", height: "auto" }}
                      />
                    )}
                  </div>
                )}

                {/* ✅ Bootstrap 5 Pagination */}
                <nav aria-label="Hotel pagination">
                  <ul className="pagination justify-content-center float-end">
                    <li className="page-item disabled">
                      <button className="page-link">Previous</button>
                    </li>
                    <li className="page-item active" aria-current="page">
                      <button className="page-link">1</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">2</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">3</button>
                    </li>
                    <li className="page-item">
                      <button className="page-link">Next</button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}

export default HotelBooking;




// import React, { useState, useEffect } from "react";
// import "./HotelBooking.css";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faChevronUp,
//   faChevronDown,
//   faLocationDot,
// } from "@fortawesome/free-solid-svg-icons";

// import { getCityList, getHotelCodeListNew } from "../services/hotelService";
// import { getHotelCodeList } from "../services/hotelService";
// import { searchHotels } from "../services/hotelService";
// import { useNavigate, useLocation } from "react-router-dom";

// function HotelBooking() {
//   // Location
//   const location = useLocation();
//   const [cityList, setCityList] = useState([]);
//   const [selectedCountry, setSelectedCountry] = useState("IN");
//   const [selectedCity, setSelectedCity] = useState("");
//   const [selectedCityName, setSelectedCityName] = useState("");

//   // Date & Rooms
//   const [checkIn, setCheckIn] = useState("");
//   const [checkOut, setCheckOut] = useState("");

//   const [rooms, setRooms] = useState(1);
//   const [paxRooms, setPaxRooms] = useState([
//     { Adults: 2, Children: 0, ChildrenAges: [] },
//   ]);
//   const [open, setOpen] = useState(false);
//   // Guest nationality
//   const [guestNationality, setGuestNationality] = useState("IN");

//   // Filters
//   const [isRefundable, setIsRefundable] = useState(false);
//   const [mealType, setMealType] = useState("All");
//   const [isDetailedResponse, setIsDetailedResponse] = useState(false);
//   const [responseTime, setResponseTime] = useState(30);

//   // Results
//   const [hotelList, setHotelList] = useState([]);
//   const [hotels, setHotels] = useState([]);
//   const [searchResults, setSearchResults] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [isSearching, setIsSearching] = useState(false);

//   // Extra UI filters
//   const [searchKeyword, setSearchKeyword] = useState("");
//   const [sortOption, setSortOption] = useState("Popularity");

//   // NEW: Filter states
//   const [filters, setFilters] = useState({
//     starRating: [],
//     priceRange: [0, 50000], // min and max price
//     amenities: [],
//     mealType: [],
//     propertyType: [],
//   });

//   // NEW: Toggle states for each filter section
//   const [toggle, setToggle] = useState({
//     showProperties: true,
//     price: true,
//     star: true,
//     review: true,
//     amenities: true,
//   });

//   const navigate = useNavigate();

//   useEffect(() => {
//     const today = new Date();

//     // ✅ check-in = tomorrow
//     const tomorrow = new Date(today);
//     tomorrow.setDate(today.getDate() + 1);

//     // ✅ check-out = day after tomorrow
//     const dayAfterTomorrow = new Date(today);
//     dayAfterTomorrow.setDate(today.getDate() + 2);

//     const formatDate = (d) => d.toISOString().split("T")[0];

//     setCheckIn(formatDate(tomorrow));
//     setCheckOut(formatDate(dayAfterTomorrow));
//   }, []);

//   // NEW: Filter handler functions
//   const handleFilterChange = (filterType, value) => {
//     setFilters((prev) => {
//       if (filterType === "priceRange") {
//         return { ...prev, priceRange: value };
//       }

//       return {
//         ...prev,
//         [filterType]: prev[filterType].includes(value)
//           ? prev[filterType].filter((item) => item !== value)
//           : [...prev[filterType], value],
//       };
//     });
//   };

//   // NEW: Apply filters to search results
//   const applyFilters = (hotels) => {
//     if (!hotels || !Array.isArray(hotels)) return [];

//     return hotels.filter((hotel) => {
//       // Filter by star rating (you'll need to add starRating to your hotel data)
//       if (
//         filters.starRating.length > 0 &&
//         hotel.starRating &&
//         !filters.starRating.includes(hotel.starRating.toString())
//       ) {
//         return false;
//       }

//       // Filter by price range (using the minimum room price)
//       const minRoomPrice = Math.min(
//         ...hotel.Rooms.map((room) => room.TotalFare)
//       );
//       if (
//         minRoomPrice < filters.priceRange[0] ||
//         minRoomPrice > filters.priceRange[1]
//       ) {
//         return false;
//       }

//       // Filter by meal type (check if any room has the selected meal type)
//       if (
//         filters.mealType.length > 0 &&
//         !hotel.Rooms.some((room) => filters.mealType.includes(room.MealType))
//       ) {
//         return false;
//       }

//       // Filter by amenities (you'll need to add amenities to your hotel data)
//       if (filters.amenities.length > 0 && hotel.amenities) {
//         const hasAllSelectedAmenities = filters.amenities.every((amenity) =>
//           hotel.amenities.includes(amenity)
//         );
//         if (!hasAllSelectedAmenities) return false;
//       }

//       return true;
//     });
//   };

//   // NEW: Toggle handler for filter sections
//   const handleToggle = (section) => {
//     setToggle((prev) => ({ ...prev, [section]: !prev[section] }));
//   };

//   // NEW: Filtered search results
//   const filteredSearchResults = applyFilters(searchResults);

//   const handleSearch = async () => {
//     setIsSearching(true);

//     try {
//       // 🔹 Step 1: Get hotel codes for selected city
//       const data = await getHotelCodeListNew(selectedCountry, selectedCity);
//       console.log("Search List API Full Response:", data);

//       let hotels = [];
//       if (Array.isArray(data)) {
//         hotels = data;
//       } else if (data?.Hotels && Array.isArray(data.Hotels)) {
//         hotels = data.Hotels;
//       } else if (data?.data?.Hotels && Array.isArray(data.data.Hotels)) {
//         hotels = data.data.Hotels;
//       } else if (data?.data && Array.isArray(data.data)) {
//         hotels = data.data;
//       }

//       console.log("✅ Final Filtered Hotels:", hotels);
//       setHotelList(hotels);

//       // 🔹 Step 2: Extract hotel codes
//       const hotelCodes = hotels.map((h) => h.HotelCode || h.Code);
//       if (hotelCodes.length === 0) {
//         setSearchResults([]);
//         setIsSearching(false);
//         return;
//       }

//       // 🔹 Step 3: Build payload according to TBO Docs
//       const payload = {
//         CheckIn: checkIn,
//         CheckOut: checkOut,
//         HotelCodes: hotelCodes.slice(0, 100), // ⚡ in chunks of 100
//         GuestNationality: guestNationality,
//         NoOfRooms: rooms,
//         PaxRooms: paxRooms.map((p) => ({
//           Adults: p.Adults,
//           Children: p.Children,
//           ChildrenAges: p.ChildrenAges,
//         })),
//         ResponseTime: responseTime, // default 30s
//         IsDetailedResponse: isDetailedResponse, // true/false
//         Filters: {
//           Refundable: isRefundable,
//           MealType: mealType, // All | WithMeal | RoomOnly
//         },
//       };

//       console.log("🔹 Final Payload:", payload);

//       // 🔹 Step 4: Call Search API
//       const res = await searchHotels(payload);
//       console.log("Hotel Search Response:", res);
//       console.log("HotelResult", JSON.stringify(res.HotelResult));
//       if (res?.data?.HotelResult) {
//         setSearchResults(res.data.HotelResult);
//       } else {
//         setSearchResults([]);
//       }
//     } catch (err) {
//       console.error("❌ Error in search:", err);
//       setSearchResults([]);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   // ✅ Fetch Cities for India by default
//   // Step 1: Load city list
//   useEffect(() => {
//     const loadCities = async () => {
//       try {
//         const resp = await getCityList("IN");
//         console.log("Cities API Raw Response:", resp);

//         let cities = [];
//         if (Array.isArray(resp)) cities = resp;
//         else if (resp?.CityList) cities = resp.CityList;
//         else if (resp?.data?.CityList) cities = resp.data.CityList;
//         else if (resp?.data && Array.isArray(resp.data)) cities = resp.data;

//         setCityList(cities);

//         // ✅ Navigation se city aaye toh match karo cityList ke sath
//         if (cities.length > 0 && location.state?.city) {
//           const cityCode = location.state.city.toString();
//           const cityObj = cities.find(
//             (c) => (c.CityCode?.toString() || c.Code?.toString()) === cityCode
//           );

//           if (cityObj) {
//             setSelectedCity(cityObj.CityCode || cityObj.Code);
//             setSelectedCityName(
//               cityObj.CityName || cityObj.Name || cityObj.City
//             );
//           }
//         }

//         // ✅ Agar navigation se kuch nahi aaya toh first city select
//         if (cities.length > 0 && !location.state?.city) {
//           setSelectedCity(cities[0].CityCode || cities[0].Code);
//           setSelectedCityName(
//             cities[0].CityName || cities[0].Name || cities[0].City
//           );
//         }
//       } catch (err) {
//         console.error("❌ Error fetching cities:", err);
//       }
//     };

//     loadCities();
//   }, [location.state]);

//   const handleViewDetail = (hotelCode) => {
//     navigate(`/hotel-detail/${hotelCode}`, {
//       state: {
//         checkIn: checkIn,
//         checkOut: checkOut,
//         GuestNationality: guestNationality,
//         NoOfRooms: rooms,
//         PaxRooms: paxRooms.map((p) => ({
//           Adults: p.Adults,
//           Children: p.Children,
//           ChildrenAges: p.ChildrenAges,
//         })),
//         ResponseTime: responseTime, // default 30s
//         IsDetailedResponse: isDetailedResponse, // true/false
//         Filters: {
//           Refundable: "true",
//           MealType: "WithMeal", // All | WithMeal | RoomOnly
//         },
//       },
//     });
//   };

//   // Determine which hotels to display - UPDATED to use filtered results
//   const displayedHotels = isSearching ? filteredSearchResults : hotelList;

//   // ✅ Run only once on first load if data exists
//   useEffect(() => {
//     if (location.state) {
//       const { country, city, cityName, checkIn, checkOut, rooms, paxRooms } =
//         location.state;

//       // ✅ handle when coming from HotelPopularDestination
//       if (city && cityName) {
//         setSelectedCity(city);
//         setSelectedCityName(cityName);

//         // optional: set default dates if none provided
//         if (!checkIn) setCheckIn(new Date().toISOString().split("T")[0]);
//         if (!checkOut) {
//           const tomorrow = new Date();
//           tomorrow.setDate(tomorrow.getDate() + 1);
//           setCheckOut(tomorrow.toISOString().split("T")[0]);
//         }
//       }

//       // ✅ handle when coming from your other component
//       if (country) setSelectedCountry(country);
//       if (checkIn) setCheckIn(checkIn);
//       if (checkOut) setCheckOut(checkOut);
//       if (rooms) setRooms(rooms);
//       if (paxRooms) setPaxRooms(paxRooms);
//     }
//   }, [location.state]);

//   // Trigger search when all relevant state values are ready
//   useEffect(() => {
//     if (selectedCity && checkIn && checkOut) {
//       handleSearch();
//     }
//   }, [selectedCity, checkIn, checkOut, rooms, paxRooms, guestNationality]);

//   // Rest of your component code will go here
//   return (
//     <div className="container pt-5 pb-5">
//       <div className="row">
//         <div className="col-sm-12">
//           <nav aria-label="breadcrumb">
//             <ol className="breadcrumb">
//               <li className="breadcrumb-item">
//                 <a href="/">Home</a>
//               </li>
//               <li className="breadcrumb-item active" aria-current="page">
//                 Hotels
//               </li>
//             </ol>
//           </nav>

//           {/* search hotel box filter */}

//           <div className="search-box p-3 bg-light rounded shadow-sm">
//             <div className="row g-3 align-items-end">
//               {/* City */}
//               <div className="col-md-2">
//                 <label className="form-label">City</label>
//                 <select
//                   className="form-select"
//                   value={selectedCity}
//                   onChange={(e) => {
//                     const cityCode = e.target.value;
//                     setSelectedCity(cityCode);

//                     const cityObj = cityList.find(
//                       (c) =>
//                         (c.CityCode?.toString() || c.Code?.toString()) ===
//                         cityCode.toString()
//                     );

//                     const cityName =
//                       cityObj?.CityName || cityObj?.Name || cityObj?.City || "";

//                     setSelectedCityName(cityName);
//                     localStorage.setItem("selectedCity", cityCode);
//                     localStorage.setItem("selectedCityName", cityName);
//                   }}
//                   disabled={!selectedCountry || loading}
//                 >
//                   <option value="">-- Select City --</option>
//                   {cityList.map((city, index) => (
//                     <option key={index} value={city.CityCode || city.Code}>
//                       {city.CityName || city.Name || city.City}
//                     </option>
//                   ))}
//                 </select>
//               </div>

//               {/* Check-in */}
//               <div className="col-md-2">
//                 <label className="form-label">Check-In</label>
//                 <input
//                   type="date"
//                   className="form-control"
//                   value={checkIn}
//                   onChange={(e) => setCheckIn(e.target.value)}
//                 />
//               </div>

//               {/* Check-out */}
//               <div className="col-md-2">
//                 <label className="form-label">Check-Out</label>
//                 <input
//                   type="date"
//                   className="form-control"
//                   value={checkOut}
//                   onChange={(e) => setCheckOut(e.target.value)}
//                 />
//               </div>

//               {/* Rooms Dropdown */}
//               <div className="col-md-4 position-relative">
//                 {/* Dropdown Trigger */}
//                 <label className="form-label">Rooms/Guests</label>
//                 <div
//                   className="form-select d-flex justify-content-between align-items-center"
//                   onClick={() => setOpen(!open)}
//                   style={{ cursor: "pointer" }}
//                 >
//                   {rooms} Room{rooms > 1 ? "s" : ""},{" "}
//                   {paxRooms.reduce((acc, r) => acc + r.Adults + r.Children, 0)}{" "}
//                   Guests
//                   <span>▼</span>
//                 </div>

//                 {/* Dropdown Content */}
//                 {open && (
//                   <div
//                     className="border rounded p-3 bg-white shadow-sm position-absolute mt-1"
//                     style={{ zIndex: 1000, width: "100%" }}
//                   >
//                     {/* Pax Rooms */}
//                     {paxRooms.map((room, idx) => (
//                       <div key={idx} className="mb-3">
//                         <h6 className="fw-bold mb-2">Room {idx + 1}</h6>

//                         {/* Adults & Children */}
//                         <div className="d-flex align-items-center gap-4 mb-2">
//                           {/* Adults */}
//                           <div>
//                             <label className="form-label">
//                               Adult (Above 12 years)
//                             </label>
//                             <div className="d-flex align-items-center">
//                               <button
//                                 type="button"
//                                 className="btn btn-outline-secondary"
//                                 onClick={() => {
//                                   const updated = [...paxRooms];
//                                   if (updated[idx].Adults > 1)
//                                     updated[idx].Adults -= 1;
//                                   setPaxRooms(updated);
//                                 }}
//                               >
//                                 -
//                               </button>
//                               <span className="px-3">{room.Adults}</span>
//                               <button
//                                 type="button"
//                                 className="btn btn-outline-secondary"
//                                 onClick={() => {
//                                   const updated = [...paxRooms];
//                                   if (updated[idx].Adults < 8)
//                                     updated[idx].Adults += 1;
//                                   setPaxRooms(updated);
//                                 }}
//                               >
//                                 +
//                               </button>
//                             </div>
//                           </div>

//                           {/* Children */}
//                           <div>
//                             <label className="form-label">
//                               Child (Below 12 years)
//                             </label>
//                             <div className="d-flex align-items-center">
//                               <button
//                                 type="button"
//                                 className="btn btn-outline-secondary"
//                                 onClick={() => {
//                                   const updated = [...paxRooms];
//                                   if (updated[idx].Children > 0) {
//                                     updated[idx].Children -= 1;
//                                     updated[idx].ChildrenAges = updated[
//                                       idx
//                                     ].ChildrenAges.slice(
//                                       0,
//                                       updated[idx].Children
//                                     );
//                                   }
//                                   setPaxRooms(updated);
//                                 }}
//                               >
//                                 -
//                               </button>
//                               <span className="px-3">{room.Children}</span>
//                               <button
//                                 type="button"
//                                 className="btn btn-outline-secondary"
//                                 onClick={() => {
//                                   const updated = [...paxRooms];
//                                   if (updated[idx].Children < 4) {
//                                     updated[idx].Children += 1;
//                                     updated[idx].ChildrenAges.push(1);
//                                   }
//                                   setPaxRooms(updated);
//                                 }}
//                               >
//                                 +
//                               </button>
//                             </div>
//                           </div>
//                         </div>

//                         {/* Children Ages */}
//                         {room.Children > 0 && (
//                           <div>
//                             <label className="form-label">
//                               Age(s) of Children
//                             </label>
//                             <div className="d-flex gap-2">
//                               {room.ChildrenAges.map((age, cIdx) => (
//                                 <select
//                                   key={cIdx}
//                                   className="form-select"
//                                   style={{ width: "80px" }}
//                                   value={age}
//                                   onChange={(e) => {
//                                     const updated = [...paxRooms];
//                                     updated[idx].ChildrenAges[cIdx] = Number(
//                                       e.target.value
//                                     );
//                                     setPaxRooms(updated);
//                                   }}
//                                 >
//                                   {Array.from(
//                                     { length: 12 },
//                                     (_, i) => i + 1
//                                   ).map((a) => (
//                                     <option key={a} value={a}>
//                                       {a}
//                                     </option>
//                                   ))}
//                                 </select>
//                               ))}
//                             </div>
//                           </div>
//                         )}
//                       </div>
//                     ))}

//                     {/* Add/Remove Room */}
//                     <div className="d-flex justify-content-between">
//                       <button
//                         className="btn btn-sm btn-outline-success"
//                         onClick={() => {
//                           if (rooms < 5) {
//                             setRooms(rooms + 1);
//                             setPaxRooms([
//                               ...paxRooms,
//                               { Adults: 2, Children: 0, ChildrenAges: [] },
//                             ]);
//                           }
//                         }}
//                       >
//                         + Add Room
//                       </button>
//                       {rooms > 1 && (
//                         <button
//                           className="btn btn-sm btn-outline-danger"
//                           onClick={() => {
//                             setRooms(rooms - 1);
//                             setPaxRooms(paxRooms.slice(0, -1));
//                           }}
//                         >
//                           Remove Room
//                         </button>
//                       )}
//                     </div>

//                     {/* Done Button */}
//                     <button
//                       className="btn btn-warning w-100 mt-3"
//                       onClick={() => setOpen(false)}
//                     >
//                       Done
//                     </button>
//                   </div>
//                 )}
//               </div>
//               {/* Search Button */}
//               <div className="col-md-2">
//                 <button
//                   className="btn btn-primary w-100"
//                   onClick={handleSearch}
//                 >
//                   Modify Search
//                 </button>
//               </div>
//             </div>

//             {/* Keyword + Sort */}
//           </div>
//         </div>

//         <div className="col-sm-3">
//           <div className="filter-box p-3 border rounded">
//             <h5 className="mb-3 fw-bold">FILTER</h5>

//             {/* Filter: Show Properties With */}
//             <div className="filter-group mb-3">
//               <div
//                 className="filter-title d-flex justify-content-between"
//                 onClick={() => handleToggle("showProperties")}
//                 style={{ cursor: "pointer" }}
//               >
//                 <span>Show Properties With</span>
//                 <span>
//                   <FontAwesomeIcon
//                     icon={toggle.showProperties ? faChevronUp : faChevronDown}
//                   />
//                 </span>
//               </div>
//               {toggle.showProperties && (
//                 <div className="filter-options mt-2">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="freeCancel"
//                       checked={filters.amenities.includes("Free Cancellation")}
//                       onChange={() =>
//                         handleFilterChange("amenities", "Free Cancellation")
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="freeCancel">
//                       Free Cancellation
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="freeBreakfast"
//                       checked={filters.mealType.includes("BreakFast")}
//                       onChange={() =>
//                         handleFilterChange("mealType", "BreakFast")
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="freeBreakfast">
//                       Free Breakfast
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       checked={isRefundable}
//                       onChange={(e) => setIsRefundable(e.target.checked)}
//                       id="refundable"
//                     />
//                     <label className="form-check-label" htmlFor="refundable">
//                       Refundable Only
//                     </label>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Filter: Price */}
//             <div className="filter-group mb-3">
//               <div
//                 className="filter-title d-flex justify-content-between"
//                 onClick={() => handleToggle("price")}
//                 style={{ cursor: "pointer" }}
//               >
//                 <span>Price (Per Night)</span>
//                 <span>
//                   <FontAwesomeIcon
//                     icon={toggle.price ? faChevronUp : faChevronDown}
//                   />
//                 </span>
//               </div>
//               {toggle.price && (
//                 <div className="filter-options mt-2">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="priceRange"
//                       id="p1"
//                       checked={filters.priceRange[1] === 2000}
//                       onChange={() =>
//                         handleFilterChange("priceRange", [0, 2000])
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="p1">
//                       Below ₹2000
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="priceRange"
//                       id="p2"
//                       checked={
//                         filters.priceRange[0] === 2001 &&
//                         filters.priceRange[1] === 4000
//                       }
//                       onChange={() =>
//                         handleFilterChange("priceRange", [2001, 4000])
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="p2">
//                       ₹2001 - ₹4000
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="priceRange"
//                       id="p3"
//                       checked={
//                         filters.priceRange[0] === 4001 &&
//                         filters.priceRange[1] === 8000
//                       }
//                       onChange={() =>
//                         handleFilterChange("priceRange", [4001, 8000])
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="p3">
//                       ₹4001 - ₹8000
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="priceRange"
//                       id="p4"
//                       checked={
//                         filters.priceRange[0] === 8001 &&
//                         filters.priceRange[1] === 20000
//                       }
//                       onChange={() =>
//                         handleFilterChange("priceRange", [8001, 20000])
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="p4">
//                       ₹8001 - ₹20000
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="priceRange"
//                       id="p5"
//                       checked={filters.priceRange[0] === 20001}
//                       onChange={() =>
//                         handleFilterChange("priceRange", [20001, 50000])
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="p5">
//                       Above ₹20000
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="radio"
//                       name="priceRange"
//                       id="pAll"
//                       checked={
//                         filters.priceRange[0] === 0 &&
//                         filters.priceRange[1] === 50000
//                       }
//                       onChange={() =>
//                         handleFilterChange("priceRange", [0, 50000])
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="pAll">
//                       All Prices
//                     </label>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Filter: Star Rating */}
//             <div className="filter-group mb-3">
//               <div
//                 className="filter-title d-flex justify-content-between"
//                 onClick={() => handleToggle("star")}
//                 style={{ cursor: "pointer" }}
//               >
//                 <span>Star Rating</span>
//                 <span>
//                   <FontAwesomeIcon
//                     icon={toggle.star ? faChevronUp : faChevronDown}
//                   />
//                 </span>
//               </div>
//               {toggle.star && (
//                 <div className="filter-options mt-2">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="s5"
//                       checked={filters.starRating.includes("5")}
//                       onChange={() => handleFilterChange("starRating", "5")}
//                     />
//                     <label className="form-check-label" htmlFor="s5">
//                       5 Star
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="s4"
//                       checked={filters.starRating.includes("4")}
//                       onChange={() => handleFilterChange("starRating", "4")}
//                     />
//                     <label className="form-check-label" htmlFor="s4">
//                       4 Star
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="s3"
//                       checked={filters.starRating.includes("3")}
//                       onChange={() => handleFilterChange("starRating", "3")}
//                     />
//                     <label className="form-check-label" htmlFor="s3">
//                       3 Star
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="s2"
//                       checked={filters.starRating.includes("2")}
//                       onChange={() => handleFilterChange("starRating", "2")}
//                     />
//                     <label className="form-check-label" htmlFor="s2">
//                       2 Star
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="s1"
//                       checked={filters.starRating.includes("1")}
//                       onChange={() => handleFilterChange("starRating", "1")}
//                     />
//                     <label className="form-check-label" htmlFor="s1">
//                       1 Star
//                     </label>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Filter: Meal Type */}
//             <div className="filter-group mb-3">
//               <div
//                 className="filter-title d-flex justify-content-between"
//                 onClick={() => handleToggle("mealType")}
//                 style={{ cursor: "pointer" }}
//               >
//                 <span>Meal Type</span>
//                 <span>
//                   <FontAwesomeIcon
//                     icon={toggle.mealType ? faChevronUp : faChevronDown}
//                   />
//                 </span>
//               </div>
//               {toggle.mealType && (
//                 <div className="filter-options mt-2">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="mBreakfast"
//                       checked={filters.mealType.includes("BreakFast")}
//                       onChange={() =>
//                         handleFilterChange("mealType", "BreakFast")
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="mBreakfast">
//                       Breakfast
//                     </label>
//                   </div>

//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="mRoomOnly"
//                       checked={filters.mealType.includes("Room_Only")}
//                       onChange={() =>
//                         handleFilterChange("mealType", "Room_Only")
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="mRoomOnly">
//                       Room Only
//                     </label>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Filter: Amenities */}
//             <div className="filter-group mb-3">
//               <div
//                 className="filter-title d-flex justify-content-between"
//                 onClick={() => handleToggle("amenities")}
//                 style={{ cursor: "pointer" }}
//               >
//                 <span>Amenities</span>
//                 <span>
//                   <FontAwesomeIcon
//                     icon={toggle.amenities ? faChevronUp : faChevronDown}
//                   />
//                 </span>
//               </div>
//               {toggle.amenities && (
//                 <div className="filter-options mt-2">
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="a1"
//                       checked={filters.amenities.includes("Free Parking")}
//                       onChange={() =>
//                         handleFilterChange("amenities", "Free Parking")
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="a1">
//                       Free Parking
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="a2"
//                       checked={filters.amenities.includes("24 Hour Front Desk")}
//                       onChange={() =>
//                         handleFilterChange("amenities", "24 Hour Front Desk")
//                       }
//                     />
//                     <label className="form-check-label" htmlFor="a2">
//                       24 Hour Front Desk
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="a3"
//                       checked={filters.amenities.includes("AC")}
//                       onChange={() => handleFilterChange("amenities", "AC")}
//                     />
//                     <label className="form-check-label" htmlFor="a3">
//                       AC
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="a4"
//                       checked={filters.amenities.includes("Wi-Fi")}
//                       onChange={() => handleFilterChange("amenities", "Wi-Fi")}
//                     />
//                     <label className="form-check-label" htmlFor="a4">
//                       Wi-Fi
//                     </label>
//                   </div>
//                   <div className="form-check">
//                     <input
//                       className="form-check-input"
//                       type="checkbox"
//                       id="a5"
//                       checked={filters.amenities.includes("Pool")}
//                       onChange={() => handleFilterChange("amenities", "Pool")}
//                     />
//                     <label className="form-check-label" htmlFor="a5">
//                       Pool
//                     </label>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Clear Filters Button */}
//             <button
//               className="btn btn-outline-secondary w-100"
//               onClick={() =>
//                 setFilters({
//                   starRating: [],
//                   priceRange: [0, 50000],
//                   amenities: [],
//                   mealType: [],
//                   propertyType: [],
//                 })
//               }
//             >
//               Clear All Filters
//             </button>
//           </div>
//         </div>

//         <div className="col-sm-9">
//           <div className="row mt-3">
//             <div className="col-sm-8 ms-auto d-flex gap-2">
//               <input
//                 type="text"
//                 className="form-control flex-fill"
//                 placeholder="Enter Hotel Name or Location"
//                 value={searchKeyword}
//                 onChange={(e) => setSearchKeyword(e.target.value)}
//               />
//               <select
//                 className="form-select flex-fill"
//                 value={sortOption}
//                 onChange={(e) => setSortOption(e.target.value)}
//               >
//                 <option value="Popularity">Popularity</option>
//                 <option value="PriceLowHigh">Price (Low to High)</option>
//                 <option value="PriceHighLow">Price (High to Low)</option>
//                 <option value="Rating">Rating</option>
//               </select>
//             </div>
//           </div>

//           {isSearching ? (
//             <div className="text-center mt-5">
//               <div className="spinner-border text-primary" role="status">
//                 <span className="visually-hidden">Loading...</span>
//               </div>
//               <p className="mt-2">Applying filters...</p>
//             </div>
//           ) : (
//             <div className="row mt-3">
//               {filteredSearchResults && filteredSearchResults.length > 0 ? (
//                 filteredSearchResults.map((hotel, idx) => (
//                   <div key={idx} className="col-md-4 mb-4">
//                     <div className="card shadow-sm border-0 h-100 rounded-3">
//                       {/* Hotel Image */}
//                       <div className="card-img-top position-relative">
//                         {hotel.ImageUrls && hotel.ImageUrls.length > 0 ? (
//                           <img
//                             src={hotel.ImageUrls[0].ImageUrl}
//                             alt={hotel.HotelName}
//                             className="img-fluid rounded-top"
//                             style={{
//                               height: "180px",
//                               objectFit: "cover",
//                               width: "100%",
//                             }}
//                           />
//                         ) : (
//                           <div
//                             className="d-flex align-items-center justify-content-center bg-light rounded-top"
//                             style={{ height: "180px" }}
//                           >
//                             <p className="text-muted mb-0">
//                               No Image Available
//                             </p>
//                           </div>
//                         )}
//                       </div>

//                       {/* Card Body */}
//                       <div className="card-body">
//                         <small className="text-primary fw-bold">
//                           {hotel.CityName || "Hotel"}
//                         </small>

//                         <h6 className="fw-bold mt-2">{hotel.HotelName}</h6>
//                         <p className="text-muted small mb-2">
//                           {hotel.Address}, {hotel.CityName}, {hotel.CountryName}
//                         </p>

//                         {/* Rating */}
//                         <div className="mb-2">
//                           {hotel.HotelRating === "FiveStar" && "⭐⭐⭐⭐⭐"}
//                           {hotel.HotelRating === "FourStar" && "⭐⭐⭐⭐"}
//                           {hotel.HotelRating === "ThreeStar" && "⭐⭐⭐"}
//                           {hotel.HotelRating === "TwoStar" && "⭐⭐"}
//                           {hotel.HotelRating === "OneStar" && "⭐"}
//                         </div>

//                         {/* Price */}
//                         <div className="mb-2">
//                           <strong className="text-primary">
//                             ₹
//                             {Math.min(
//                               ...hotel.Rooms.map((room) => room.TotalFare)
//                             ).toFixed(0)}
//                           </strong>
//                           <small className="text-muted"> per night</small>
//                         </div>

//                         {/* Expiry Tag + Button */}
//                         <div className="d-flex justify-content-between align-items-center">
//                           <span className="badge bg-dark">
//                             Expires on 31 Dec
//                           </span>
//                           <button
//                             className="btn btn-primary btn-sm detail"
//                             onClick={() => handleViewDetail(hotel.HotelCode)}
//                           >
//                             View Details
//                           </button>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 ))
//               ) : (
//                 <div className="col-12 text-center py-5">
//                   <h5>No hotels match your filters</h5>
//                   <p className="text-muted">
//                     Try adjusting your filters or search criteria
//                   </p>
//                   <button
//                     className="btn btn-primary mt-2"
//                     onClick={() =>
//                       setFilters({
//                         starRating: [],
//                         priceRange: [0, 50000],
//                         amenities: [],
//                         mealType: [],
//                         propertyType: [],
//                       })
//                     }
//                   >
//                     Clear Filters
//                   </button>
//                 </div>
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }

// export default HotelBooking;
