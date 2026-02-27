

import React, { useState, useEffect, useRef } from "react";
import "./HotelBooking.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronUp,
  faChevronDown,
  faLocationDot,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

import { getCityList, getCountryList, getHotelCodeListNew, searchHotels } from "../services/hotelService";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "../common/loading";

function HotelBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  // ─── City / Country ───────────────────────────────────────────────────────
  const [cityList, setCityList] = useState([]);
  const [countryList, setCountryList] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");

  // Country search autocomplete
  const [countrySearch, setCountrySearch] = useState("");
  const [filteredCountries, setFilteredCountries] = useState([]);
  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const countrySearchRef = useRef(null);

  // ─── Dates & Rooms ────────────────────────────────────────────────────────
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [rooms, setRooms] = useState(1);
  const [paxRooms, setPaxRooms] = useState([
    { Adults: 1, Children: 0, ChildrenAges: [] },
  ]);
  const [open, setOpen] = useState(false);
  const [guestNationality, setGuestNationality] = useState("IN");

  // ─── Search Config ────────────────────────────────────────────────────────
  const [isRefundable, setIsRefundable] = useState(false);
  const [mealType, setMealType] = useState("All");
  const [isDetailedResponse, setIsDetailedResponse] = useState(true);
  const [responseTime, setResponseTime] = useState(18);

  // ─── Results ──────────────────────────────────────────────────────────────
  const [hotelList, setHotelList] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // ─── Filters ──────────────────────────────────────────────────────────────
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState("Popularity");
  const [selectedStarRatings, setSelectedStarRatings] = useState([]);
  const [selectedUserRatings, setSelectedUserRatings] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  // NEW states for city search
  const [citySearch, setCitySearch] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const citySearchRef = useRef(null);


  const [showProperties, setShowProperties] = useState({
    bookWithZero: false,
    freeCancellation: false,
    freeBreakfast: false,
    refundable: false,
  });

  // ─── Address Search ───────────────────────────────────────────────────────
  const [addressSearch, setAddressSearch] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  // ─── Infinite Scroll ──────────────────────────────────────────────────────
  const [visibleCount, setVisibleCount] = useState(9);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // ─── Filter Toggle ────────────────────────────────────────────────────────
  const [toggle, setToggle] = useState({
    showProperties: true,
    price: true,
    star: true,
    review: true,
    amenities: true,
  });

  // =========================================================================
  // UTILITY
  // =========================================================================
  const chunkArray = (arr, size = 100) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

  // =========================================================================
  // STAR RATING MAP  ← ✅ single source of truth used everywhere
  // =========================================================================
  const starRatingMap = {
    "5 Star": "FiveStar",
    "4 Star": "FourStar",
    "3 Star": "ThreeStar",
    "2 Star": "TwoStar",
    "1 Star": "OneStar",
  };

  const getStarCount = (hotelRating) => {
    const map = {
      FiveStar: 5,
      FourStar: 4,
      ThreeStar: 3,
      TwoStar: 2,
      OneStar: 1,
    };
    return map[hotelRating] || 0;
  };

  // =========================================================================
  // ON MOUNT — default dates
  // =========================================================================
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(today.getDate() + 2);
    const fmt = (d) => d.toISOString().split("T")[0];
    setCheckIn(fmt(tomorrow));
    setCheckOut(fmt(dayAfterTomorrow));
  }, []);

  // =========================================================================
  // FETCH COUNTRIES
  // =========================================================================
  const fetchAllCountry = async () => {
    try {
      const resp = await getCountryList();
      const sorted = resp.sort((a, b) => a.Name.localeCompare(b.Name));
      setCountryList(sorted);
      setFilteredCountries(sorted);

      // If we already have a selectedCountry (from location.state), show its name
      if (selectedCountry) {
        const found = sorted.find((c) => c.Code === selectedCountry);
        if (found) setCountrySearch(found.Name);
      }
    } catch (err) {
      console.error("Error fetching countries:", err);
    }
  };

  useEffect(() => {
    fetchAllCountry();
  }, []);
  useEffect(() => {
    fetchAllCountry();
  }, []);
  // Infinite Scroll Logic

  // =========================================================================
  // COUNTRY SEARCH HANDLERS
  // =========================================================================
  const handleCountrySearch = (e) => {
    const value = e.target.value;
    setCountrySearch(value);

    const filtered = value.trim() === ""
      ? countryList
      : countryList.filter((c) =>
        c.Name.toLowerCase().includes(value.toLowerCase())
      );

    setFilteredCountries(filtered);
    setShowCountrySuggestions(true);
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country.Code);
    setCountrySearch(country.Name);
    setShowCountrySuggestions(false);
    // Reset city
    setSelectedCity("");
    setSelectedCityName("");
    setCityList([]);
    setHotelList([]);
    setSearchResults([]);
  };

  // Click outside → close country suggestions
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (countrySearchRef.current && !countrySearchRef.current.contains(e.target)) {
        setShowCountrySuggestions(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // =========================================================================
  // FETCH CITIES when selectedCountry changes
  // =========================================================================
  useEffect(() => {
    if (!selectedCountry) return;

    const loadCities = async () => {
      try {
        setLoading(true);
        const resp = await getCityList(selectedCountry);

        let cities = [];
        if (Array.isArray(resp)) cities = resp;
        else if (resp?.CityList) cities = resp.CityList;
        else if (resp?.data?.CityList) cities = resp.data.CityList;
        else if (resp?.data && Array.isArray(resp.data)) cities = resp.data;

        setCityList(cities);

        // If coming from navigation state, restore city
        if (cities.length > 0 && location.state?.city) {
          const cityCode = location.state.city.toString();
          const cityObj = cities.find(
            (c) => (c.CityCode?.toString() || c.Code?.toString()) === cityCode
          );
          if (cityObj) {
            setSelectedCity(cityObj.CityCode || cityObj.Code);
            setSelectedCityName(cityObj.CityName || cityObj.Name || cityObj.City);
          }
        } else if (cities.length > 0 && !location.state?.city) {
          // Fallback: first city
          setSelectedCity(cities[0].CityCode || cities[0].Code);
          setSelectedCityName(cities[0].CityName || cities[0].Name || cities[0].City);
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCities();
  }, [selectedCountry]);

  // =========================================================================
  // RESTORE STATE FROM NAVIGATION
  // =========================================================================
  useEffect(() => {
    if (!location.state) return;
    const { country, checkIn, checkOut, rooms, paxRooms } = location.state;

    if (country) {
      setSelectedCountry(country);
      // Also update countrySearch display name after countryList loads
    }
    if (checkIn) setCheckIn(checkIn);
    if (checkOut) setCheckOut(checkOut);
    if (rooms) setRooms(rooms);
    if (paxRooms) setPaxRooms(paxRooms);
  }, [location.state]);

  // Update countrySearch display name once countryList is loaded
  useEffect(() => {
    if (countryList.length > 0 && selectedCountry) {
      const found = countryList.find((c) => c.Code === selectedCountry);
      if (found) setCountrySearch(found.Name);
    }
  }, [countryList, selectedCountry]);

  // =========================================================================
  // AUTO-SEARCH when city is ready
  // =========================================================================
  useEffect(() => {
    if (selectedCity && checkIn && checkOut) {
      handleSearch();
    }
  }, [selectedCity]);

  // =========================================================================
  // INFINITE SCROLL
  // =========================================================================
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore) return;
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setVisibleCount((prev) => prev + 9);
          setIsLoadingMore(false);
        }, 300);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore]);

  // =========================================================================
  // ADDRESS SUGGESTIONS — derived from current hotel list
  // =========================================================================
  useEffect(() => {
    if (selectedCity && hotelList.length > 0) {
      const addresses = hotelList
        .map((h) => h.Address)
        .filter((a, i, self) => a && a.trim() !== "" && self.indexOf(a) === i);
      setAddressSuggestions(addresses);
    } else {
      setAddressSuggestions([]);
    }
  }, [selectedCity, hotelList]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        citySearchRef.current &&
        !citySearchRef.current.contains(event.target)
      ) {
        setShowCitySuggestions(false);
      }

      if (
        countrySearchRef.current &&
        !countrySearchRef.current.contains(event.target)
      ) {
        setShowCountrySuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================================================================
  // SEARCH HOTELS
  // =========================================================================
  const handleSearch = async () => {
    setIsSearching(true);
    setVisibleCount(9);
    setAddressSearch("");
    setSelectedStarRatings([]);
    setSelectedUserRatings([]);
    setShowProperties({ bookWithZero: false, freeCancellation: false, freeBreakfast: false, refundable: false });
    setSortOption("Popularity");
    setSearchKeyword("");

    try {
      const data = await getHotelCodeListNew(selectedCountry, selectedCity);

      let hotels = [];
      if (Array.isArray(data?.data)) hotels = data.data;
      else if (Array.isArray(data)) hotels = data;
      else if (Array.isArray(data?.Hotels)) hotels = data.Hotels;

      setHotelList(hotels);

      const hotelCodes = hotels.map((h) => h.HotelCode || h.Code);
      if (!hotelCodes.length) {
        setSearchResults([]);
        return;
      }

      const hotelCodeChunks = chunkArray(hotelCodes, 100).slice(0, 5);

      const basePayload = {
        CheckIn: checkIn,
        CheckOut: checkOut,
        GuestNationality: guestNationality,
        PaxRooms: paxRooms.map((p) => ({
          Adults: p.Adults,
          Children: p.Children,
          ChildrenAges: p.ChildrenAges,
        })),
        ResponseTime: responseTime,
        IsDetailedResponse: isDetailedResponse,
        Filters: {
          Refundable: isRefundable,
          MealType: mealType,
        },
      };

      const responses = await Promise.all(
        hotelCodeChunks.map((codes) =>
          searchHotels({ ...basePayload, HotelCodes: codes })
        )
      );

      // ✅ FIXED: Multiple response structures handle karo
      const mergedResults = responses.flatMap((res) => {
        return (
          res?.data?.data?.HotelResult ||
          res?.data?.HotelResult ||
          res?.HotelResult ||
          []
        );
      });

      console.log("✅ Total rooms found:", mergedResults.length);

      // ✅ Build price map
      const priceMap = {};
      mergedResults.forEach((item) => {
        if (!item?.HotelCode || !item?.Rooms?.length) return;
        const minRoomPrice = Math.min(
          ...item.Rooms.map((r) => r.TotalFare ?? r.DisplayPrice ?? Infinity)
        );
        priceMap[item.HotelCode] = {
          MinPrice: minRoomPrice,
          Currency: item.Currency,
          Rooms: item.Rooms,
        };
      });

      console.log("✅ Hotels with rooms:", Object.keys(priceMap).length);

      // ✅ FIXED: Sirf wahi hotels jo priceMap mein hain (rooms available hain)
      const mergedHotelList = hotels
        .map((hotel) => {
          const code = hotel.HotelCode || hotel.Code;
          return {
            ...hotel,
            MinPrice: priceMap[code]?.MinPrice ?? null,
            Currency: priceMap[code]?.Currency ?? "INR",
            Rooms: priceMap[code]?.Rooms ?? [],
          };
        })
        .filter((hotel) =>
          hotel.MinPrice !== null &&
          hotel.MinPrice !== Infinity &&
          hotel.Rooms.length > 0
        ); // ✅ Bina rooms wale hotels OUT

      console.log("✅ Final filtered hotels:", mergedHotelList.length);

      setSearchResults(mergedHotelList);

    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (!selectedCountry) return;

    const loadCities = async () => {
      try {
        const resp = await getCityList(selectedCountry);

        let cities = [];
        if (Array.isArray(resp)) cities = resp;
        else if (resp?.CityList) cities = resp.CityList;
        else if (resp?.data?.CityList) cities = resp.data.CityList;
        else if (resp?.data && Array.isArray(resp.data)) cities = resp.data;

        setCityList(cities);

        // ✅ If coming from previous page
        if (cities.length > 0 && location.state?.city) {
          const cityCode = location.state.city.toString();
          const cityObj = cities.find(
            (c) => (c.CityCode?.toString() || c.Code?.toString()) === cityCode,
          );



          if (cityObj) {
            const cityName = cityObj.CityName || cityObj.Name || cityObj.City;

            setSelectedCity(cityObj.CityCode || cityObj.Code);
            setSelectedCityName(cityName);

            // ✅ ADD THIS LINE
            setCitySearch(cityName);
          }
        }


        if (cities.length > 0 && !location.state?.city) {
          const defaultCityName =
            cities[0].CityName || cities[0].Name || cities[0].City;

          setSelectedCity(cities[0].CityCode || cities[0].Code);
          setSelectedCityName(defaultCityName);

          // ✅ ADD THIS LINE
          setCitySearch(defaultCityName);
        }
      } catch (err) {
        console.error("❌ Error fetching cities:", err);
      }
    };

    loadCities();
  }, [selectedCountry, location.state]);

  // Handle address search
  // =========================================================================
  // ADDRESS SEARCH HANDLERS
  // =========================================================================
  const handleAddressSearch = (e) => {
    const value = e.target.value;
    setAddressSearch(value);

    const source = searchResults.length > 0 ? searchResults : hotelList;
    const filtered = source
      .filter((h) => h.Address && (
        value.trim() === "" || h.Address.toLowerCase().includes(value.toLowerCase())
      ))
      .map((h) => h.Address)
      .filter((a, i, self) => self.indexOf(a) === i);

    setAddressSuggestions(filtered);
    setShowSuggestions(true);
  };

  const handleAddressSelect = (address) => {
    setAddressSearch(address);
    setShowSuggestions(false);
    setVisibleCount(9);
  };

  // =========================================================================
  // FILTER HANDLERS
  // =========================================================================
  const handleToggle = (section) =>
    setToggle((prev) => ({ ...prev, [section]: !prev[section] }));

  const handleStarRatingChange = (rating) => {
    setSelectedStarRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const handleUserRatingChange = (rating) => {
    setSelectedUserRatings((prev) =>
      prev.includes(rating) ? prev.filter((r) => r !== rating) : [...prev, rating]
    );
  };

  const handleShowPropertyChange = (property) => {
    setShowProperties((prev) => ({ ...prev, [property]: !prev[property] }));
  };

  const handleCitySearch = (e) => {
    const value = e.target.value;
    setCitySearch(value);

    if (value.trim() === "") {
      setFilteredCities(cityList);
    } else {
      const filtered = cityList.filter((city) =>
        (city.CityName || city.Name || city.City || "")
          .toLowerCase()
          .includes(value.toLowerCase()),
      );
      setFilteredCities(filtered);
    }

    setShowCitySuggestions(true);
  };

  const handleCitySelect = (city) => {
    const cityCode = city.CityCode || city.Code;
    const cityName = city.CityName || city.Name || city.City;

    setSelectedCity(cityCode);
    setSelectedCityName(cityName);

    setCitySearch(cityName);
    setShowCitySuggestions(false);

    // reset address search
    setAddressSearch("");
    setAddressSuggestions([]);
  };

  // =========================================================================
  // ✅ FIXED FILTER LOGIC
  // =========================================================================
  const getFilteredHotels = () => {
    // Source: use searchResults if available, else hotelList
    let filtered = searchResults.length > 0 ? searchResults : hotelList;

    // 1. Keyword filter (name / address)
    if (searchKeyword.trim() !== "") {
      const kw = searchKeyword.toLowerCase();
      filtered = filtered.filter(
        (h) =>
          h.HotelName?.toLowerCase().includes(kw) ||
          h.Address?.toLowerCase().includes(kw) ||
          h.CityName?.toLowerCase().includes(kw)
      );
    }

    // 2. Address search filter
    if (addressSearch.trim() !== "") {
      const addr = addressSearch.toLowerCase();
      filtered = filtered.filter(
        (h) => h.Address && h.Address.toLowerCase().includes(addr)
      );
    }

    // 3. ✅ Star rating filter — compare using starRatingMap
    if (selectedStarRatings.length > 0) {
      filtered = filtered.filter((h) => {
        const hotelRating = h.HotelRating || ""; // e.g. "FiveStar"
        return selectedStarRatings.some(
          (selected) => starRatingMap[selected] === hotelRating
        );
      });
    }

    // 4. ✅ User review rating filter
    if (selectedUserRatings.length > 0) {
      filtered = filtered.filter((h) => {
        const userRating = parseFloat(h.UserRating) || 0;
        return selectedUserRatings.some((rating) => {
          if (rating.startsWith("4.5")) return userRating >= 4.5;
          if (rating.startsWith("4 ")) return userRating >= 4;
          if (rating.startsWith("3 ")) return userRating >= 3;
          return false;
        });
      });
    }

    // 5. ✅ Show properties filter
    if (showProperties.refundable) {
      filtered = filtered.filter((h) => h.IsRefundable === true || h.Refundable === true);
    }

    if (showProperties.freeBreakfast) {
      filtered = filtered.filter(
        (h) =>
          h.MealType === "WithMeal" ||
          h.MealType === "Breakfast" ||
          (h.HotelFacilities &&
            h.HotelFacilities.some((f) =>
              f.toLowerCase().includes("breakfast")
            ))
      );
    }

    // 6. ✅ Sort
    if (sortOption === "PriceLowHigh") {
      filtered = [...filtered].sort((a, b) => (a.MinPrice ?? Infinity) - (b.MinPrice ?? Infinity));
    } else if (sortOption === "PriceHighLow") {
      filtered = [...filtered].sort((a, b) => (b.MinPrice ?? 0) - (a.MinPrice ?? 0));
    } else if (sortOption === "Rating") {
      filtered = [...filtered].sort(
        (a, b) => getStarCount(b.HotelRating) - getStarCount(a.HotelRating)
      );
    }
    // "Popularity" = default API order, no sort needed

    return filtered;
  };

  // =========================================================================
  // VIEW DETAIL
  // =========================================================================
  const handleViewDetail = (hotelCode) => {
    navigate(`/hotel-detail/${hotelCode}`, {
      state: {
        checkIn,
        checkOut,
        GuestNationality: guestNationality,
        NoOfRooms: rooms,
        PaxRooms: paxRooms.map((p) => ({
          Adults: p.Adults,
          Children: p.Children,
          ChildrenAges: p.ChildrenAges,
        })),
        ResponseTime: responseTime,
        IsDetailedResponse: isDetailedResponse,
        Filters: { Refundable: "false", MealType: "All" },
      },
    });
  };

  // =========================================================================
  // DERIVED DISPLAY DATA
  // =========================================================================
  const filteredHotels = getFilteredHotels();
  const visibleHotels = filteredHotels.slice(0, visibleCount);

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div>
      {/* ── SEARCH BOX ── */}
      <div className="search-box listing-search-form" style={{ marginTop: "200px" }}>
        <div className="container">
          <div className="row g-3 align-items-end">

            {/* ✅ Country — Searchable Autocomplete */}
      


            <div className="col-md-2 position-relative" ref={countrySearchRef}>
              <label className="form-label">Country</label>

              <input
                type="text"
                className="form-control"
                placeholder="Search or select country"
                value={countrySearch}
                onChange={handleCountrySearch}
                onFocus={() => {
                  setFilteredCountries(countryList);
                  setShowCountrySuggestions(true);
                }}
              />

              {showCountrySuggestions && filteredCountries.length > 0 && (
                <div
                  className="position-absolute bg-white border w-100 shadow-sm"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                  }}
                >
                  {filteredCountries.map((country, index) => (
                    <div
                      key={index}
                      className="p-2 suggestion-item"
                      style={{ cursor: "pointer" }}
                      onClick={() => handleCountrySelect(country)}
                    >
                      {country.Name}
                    </div>
                  ))}
                </div>
              )}
           

             
            </div>

            {/* City */}
            <div className="col-md-2">
              <label className="form-label">City</label>
              {/* <select
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
                  setSelectedCityName(
                    cityObj?.CityName || cityObj?.Name || cityObj?.City || ""
                  );
                  setAddressSearch("");
                  setAddressSuggestions([]);
                }}
                disabled={!selectedCountry || loading}
              >
                <option value="">-- Select City --</option>
                {cityList.map((city, idx) => (
                  <option key={idx} value={city.CityCode || city.Code}>
                    {city.CityName || city.Name || city.City}
                  </option>
                ))}
              </select> */}
              <div className="position-relative" ref={citySearchRef}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search or select city"
                  value={citySearch}
                  onChange={handleCitySearch}
                  onFocus={() => {
                    setFilteredCities(cityList);
                    setShowCitySuggestions(true);
                  }}
                  disabled={!selectedCountry}
                />

                {/* Suggestions */}
                {showCitySuggestions && filteredCities.length > 0 && (
                  <div
                    className="position-absolute bg-white border w-100 shadow-sm"
                    style={{
                      maxHeight: "200px",
                      overflowY: "auto",
                      zIndex: 1000,
                    }}
                  >
                    {filteredCities.map((city, index) => (
                      <div
                        key={index}
                        className="p-2 suggestion-item"
                        style={{ cursor: "pointer" }}
                        onClick={() => handleCitySelect(city)}
                      >
                        {city.CityName || city.Name || city.City}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Check-In */}
            <div className="col-md-2">
              <label className="form-label">Check-In</label>
              <DatePicker
                selected={checkIn ? new Date(checkIn) : null}
                onChange={(date) => {
                  if (!date) return;
                  const checkInDate = date.toISOString().split("T")[0];
                  setCheckIn(checkInDate);
                  const nextDay = new Date(date);
                  nextDay.setDate(nextDay.getDate() + 1);
                  setCheckOut(nextDay.toISOString().split("T")[0]);
                }}
                className="form-control"
                dateFormat="yyyy-MM-dd"
                minDate={new Date()}
                placeholderText="Select Check-In"
              />
            </div>

            {/* Check-Out */}
            <div className="col-md-2">
              <label className="form-label">Check-Out</label>
              <DatePicker
                selected={checkOut ? new Date(checkOut) : null}
                onChange={(date) =>
                  setCheckOut(date ? date.toISOString().split("T")[0] : "")
                }
                className="form-control"
                dateFormat="yyyy-MM-dd"
                minDate={checkIn ? new Date(checkIn) : new Date()}
                excludeDates={checkIn ? [new Date(checkIn)] : []}
                placeholderText="Select Check-Out"
              />
            </div>

            {/* Rooms/Guests */}
            <div className="col-md-4 position-relative">
              <label className="form-label">Rooms/Guests</label>
              <div
                className="form-control d-flex justify-content-between align-items-center"
                onClick={() => setOpen(!open)}
                style={{ cursor: "pointer" }}
              >
                {rooms} Room{rooms > 1 ? "s" : ""},{" "}
                {paxRooms.reduce((acc, r) => acc + r.Adults + r.Children, 0)} Guests
                <span>▼</span>
              </div>

              {open && (
                <div
                  className="border rounded p-3 bg-white shadow-sm position-absolute mt-1"
                  style={{ zIndex: 1000, width: "100%" }}
                >
                  {paxRooms.map((room, idx) => (
                    <div key={idx} className="mb-3">
                      <h6 className="fw-bold mb-2">Room {idx + 1}</h6>
                      <div className="d-flex align-items-center gap-4 mb-2">
                        {/* Adults */}
                        <div>
                          <label className="form-label">Adult (Above 12 years)</label>
                          <div className="d-flex align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const updated = [...paxRooms];
                                if (updated[idx].Adults > 1) updated[idx].Adults -= 1;
                                setPaxRooms(updated);
                              }}
                            >-</button>
                            <span className="px-3">{room.Adults}</span>
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const updated = [...paxRooms];
                                if (updated[idx].Adults < 8) updated[idx].Adults += 1;
                                setPaxRooms(updated);
                              }}
                            >+</button>
                          </div>
                        </div>

                        {/* Children */}
                        <div>
                          <label className="form-label">Child (Below 12 years)</label>
                          <div className="d-flex align-items-center">
                            <button
                              type="button"
                              className="btn btn-outline-secondary"
                              onClick={() => {
                                const updated = [...paxRooms];
                                if (updated[idx].Children > 0) {
                                  updated[idx].Children -= 1;
                                  updated[idx].ChildrenAges = updated[idx].ChildrenAges.slice(0, updated[idx].Children);
                                }
                                setPaxRooms(updated);
                              }}
                            >-</button>
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
                            >+</button>
                          </div>
                        </div>
                      </div>

                      {room.Children > 0 && (
                        <div>
                          <label className="form-label">Age(s) of Children</label>
                          <div className="d-flex gap-2">
                            {room.ChildrenAges.map((age, cIdx) => (
                              <select
                                key={cIdx}
                                className="form-control"
                                style={{ width: "80px" }}
                                value={age}
                                onChange={(e) => {
                                  const updated = [...paxRooms];
                                  updated[idx].ChildrenAges[cIdx] = Number(e.target.value);
                                  setPaxRooms(updated);
                                }}
                              >
                                {Array.from({ length: 12 }, (_, i) => i + 1).map((a) => (
                                  <option key={a} value={a}>{a}</option>
                                ))}
                              </select>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-outline-success"
                      onClick={() => {
                        if (rooms < 5) {
                          setRooms(rooms + 1);
                          setPaxRooms([...paxRooms, { Adults: 1, Children: 0, ChildrenAges: [] }]);
                        }
                      }}
                    >+ Add Room</button>
                    {rooms > 1 && (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => {
                          setRooms(rooms - 1);
                          setPaxRooms(paxRooms.slice(0, -1));
                        }}
                      >Remove Room</button>
                    )}
                  </div>

                  <button className="btn btn-warning w-100 mt-3" onClick={() => setOpen(false)}>
                    Done
                  </button>
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="col-md-2">
              <button
                className="form-control explore-btn w-100"
                onClick={handleSearch}
                disabled={!selectedCity}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── HOTEL LISTING ── */}
      <div className="container hotel-listing">
        <div className="row align-items-end pt-5 pb-3 border-bottom mb-4">
          {/* Breadcrumb */}
          <div className="col-md-5 col-sm-12">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item"><a href="/">Home</a></li>
                <li className="breadcrumb-item active">Hotels</li>
              </ol>
            </nav>
          </div>

          {/* Address Search */}
          <div className="col-md-7 col-sm-12 d-flex justify-content-end">
            <div className="address-search-container" ref={searchRef}>
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search hotels by address in ${selectedCityName || "selected city"}...`}
                  value={addressSearch}
                  onChange={handleAddressSearch}
                  onFocus={() => setShowSuggestions(true)}
                  disabled={!selectedCity || hotelList.length === 0}
                />
              </div>

              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="address-suggestions-dropdown">
                  <div className="dropdown-header">
                    <small className="text-muted">
                      <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                      Address recommendations for {selectedCityName}
                    </small>
                  </div>
                  {addressSuggestions.slice(0, 10).map((address, idx) => (
                    <div
                      key={idx}
                      className="suggestion-item"
                      onClick={() => handleAddressSelect(address)}
                    >
                      <FontAwesomeIcon icon={faLocationDot} className="text-primary me-2" />
                      <span>{address}</span>
                    </div>
                  ))}
                </div>
              )}

              {showSuggestions && addressSearch && addressSuggestions.length === 0 && (
                <div className="address-suggestions-dropdown">
                  <div className="suggestion-item text-muted">
                    No addresses found matching "{addressSearch}"
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="row">
          {/* ── FILTER SIDEBAR ── */}
          <div className="col-sm-3">
            <div className="filter-box p-3 border rounded">
              <h5 className="mb-3 fw-bold">FILTER</h5>

              {/* Sort */}
              <div className="filter-group mb-3">
                <label className="form-label fw-semibold">Sort By</label>
                <select
                  className="form-control"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                >
                  <option value="Popularity">Popularity</option>
                  <option value="PriceLowHigh">Price: Low to High</option>
                  <option value="PriceHighLow">Price: High to Low</option>
                  <option value="Rating">Star Rating</option>
                </select>
              </div>

              {/* Show Properties With */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("showProperties")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Show Properties With</span>
                  <FontAwesomeIcon icon={toggle.showProperties ? faChevronUp : faChevronDown} />
                </div>
                {toggle.showProperties && (
                  <div className="filter-options mt-2">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="freeBreakfast"
                        checked={showProperties.freeBreakfast}
                        onChange={() => handleShowPropertyChange("freeBreakfast")}
                      />
                      <label className="form-check-label" htmlFor="freeBreakfast">
                        Free Breakfast
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="refundable"
                        checked={showProperties.refundable}
                        onChange={() => handleShowPropertyChange("refundable")}
                      />
                      <label className="form-check-label" htmlFor="refundable">
                        Refundable Only
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Star Rating */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("star")}
                  style={{ cursor: "pointer" }}
                >
                  <span>Star Rating</span>
                  <FontAwesomeIcon icon={toggle.star ? faChevronUp : faChevronDown} />
                </div>
                {toggle.star && (
                  <div className="filter-options mt-2">
                    {["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"].map((rating) => (
                      <div className="form-check" key={rating}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`star-${rating}`}
                          checked={selectedStarRatings.includes(rating)}
                          onChange={() => handleStarRatingChange(rating)}
                        />
                        <label className="form-check-label" htmlFor={`star-${rating}`}>
                          {rating}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Review Rating */}
              <div className="filter-group mb-3">
                <div
                  className="filter-title d-flex justify-content-between"
                  onClick={() => handleToggle("review")}
                  style={{ cursor: "pointer" }}
                >
                  <span>User Review Rating</span>
                  <FontAwesomeIcon icon={toggle.review ? faChevronUp : faChevronDown} />
                </div>
                {toggle.review && (
                  <div className="filter-options mt-2">
                    {[
                      "4.5 & Above (Excellent)",
                      "4 & Above (Very Good)",
                      "3 & Above (Good)",
                    ].map((rating) => (
                      <div className="form-check" key={rating}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id={`review-${rating}`}
                          checked={selectedUserRatings.includes(rating)}
                          onChange={() => handleUserRatingChange(rating)}
                        />
                        <label className="form-check-label" htmlFor={`review-${rating}`}>
                          {rating}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active filter count badge */}
              {(selectedStarRatings.length > 0 ||
                selectedUserRatings.length > 0 ||
                showProperties.refundable ||
                showProperties.freeBreakfast) && (
                  <button
                    className="btn btn-sm btn-outline-danger w-100 mt-2"
                    onClick={() => {
                      setSelectedStarRatings([]);
                      setSelectedUserRatings([]);
                      setShowProperties({
                        bookWithZero: false,
                        freeCancellation: false,
                        freeBreakfast: false,
                        refundable: false,
                      });
                      setSortOption("Popularity");
                      setAddressSearch("");
                    }}
                  >
                    Clear All Filters
                  </button>
                )}
            </div>
          </div>

          {/* ── HOTEL CARDS ── */}
          <div className="col-sm-9">
            {/* Result count */}
            {!isSearching && filteredHotels.length > 0 && (
              <p className="text-muted mb-3">
                Showing <strong>{Math.min(visibleCount, filteredHotels.length)}</strong> of{" "}
                <strong>{filteredHotels.length}</strong> hotels
                {selectedCityName ? ` in ${selectedCityName}` : ""}
              </p>
            )}

            {isSearching ? (
              <div className="text-center mt-5">
                <Loading />
                <p className="mt-2">Searching hotels in {selectedCityName}...</p>
              </div>
            ) : (
              <div className="row">
                {visibleHotels.length > 0 ? (
                  visibleHotels.map((hotel, idx) => (
                    <div key={idx} className="col-md-4 mb-4">
                      <div className="card shadow-sm border-0 h-100 rounded-3">
                        {/* Image */}
                        <div className="card-img-top position-relative">
                          {hotel.ImageUrls && hotel.ImageUrls.length > 0 ? (
                            <img
                              src={hotel.ImageUrls[0].ImageUrl}
                              alt={hotel.HotelName}
                              className="img-fluid rounded-top"
                              style={{ height: "180px", objectFit: "cover", width: "100%" }}
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

                        {/* Body */}
                        <div className="card-body">
                          <small className="hotel-place">{hotel.CityName || "Hotel"}</small>
                          <h6 className="hotel-name">{hotel.HotelName}</h6>
                          <p className="text-muted small mb-2">
                            {hotel.Address}, {hotel.CityName}, {hotel.CountryName}
                          </p>

                          {/* Stars */}
                          <div className="rating">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                style={{
                                  color: i < getStarCount(hotel.HotelRating) ? "#6665ae" : "#ccc",
                                  fontSize: "20px",
                                }}
                              >★</span>
                            ))}
                          </div>

                          {/* Price */}
                          {hotel.MinPrice && (
                            <p className="text-success fw-bold mt-1 mb-1">
                              {hotel.Currency} {hotel.MinPrice.toLocaleString()}
                            </p>
                          )}

                          <button
                            className="btn btn-primary btn-sm detail"
                            onClick={() => handleViewDetail(hotel.HotelCode)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-12 text-center py-5">
                    {selectedCity ? (
                      <>
                        <h5>No hotels found</h5>
                        <p className="text-muted">
                          {addressSearch
                            ? `No hotels with address "${addressSearch}"`
                            : selectedStarRatings.length > 0 || selectedUserRatings.length > 0 || showProperties.refundable
                              ? "No hotels match the selected filters. Try clearing some filters."
                              : `No hotels found in ${selectedCityName}`}
                        </p>
                      </>
                    ) : (
                      <h5>Please select a city</h5>
                    )}
                  </div>
                )}

                {isLoadingMore && (
                  <div className="col-12 text-center my-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading more...</span>
                    </div>
                    <p className="mt-2">Loading more hotels...</p>
                  </div>
                )}

                {visibleCount >= filteredHotels.length && filteredHotels.length > 0 && (
                  <div className="col-12 text-center my-4 text-muted">
                    <small>All {filteredHotels.length} hotels loaded</small>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
export default HotelBooking;