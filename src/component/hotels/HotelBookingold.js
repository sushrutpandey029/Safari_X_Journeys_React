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

import { getCityList, getHotelCodeListNew } from "../services/hotelService";
import { searchHotels } from "../services/hotelService";
import { useNavigate, useLocation } from "react-router-dom";
import Loading from "../common/loading";

function HotelBooking() {
  // Location
  const location = useLocation();
  const [cityList, setCityList] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCityName, setSelectedCityName] = useState("");

  // Date & Rooms
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");

  const [rooms, setRooms] = useState(0);
  const [paxRooms, setPaxRooms] = useState([
    { Adults: 1, Children: 0, ChildrenAges: [] },
  ]);
  const [open, setOpen] = useState(false);
  // Guest nationality
  const [guestNationality, setGuestNationality] = useState("IN");

  // Filters
  const [isRefundable, setIsRefundable] = useState(false);
  const [mealType, setMealType] = useState("All");
  const [isDetailedResponse, setIsDetailedResponse] = useState(false);
  const [responseTime, setResponseTime] = useState(18);

  // Results
  const [hotelList, setHotelList] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Extra UI filters - NEW FILTER STATES ADDED
  const [searchKeyword, setSearchKeyword] = useState("");
  const [sortOption, setSortOption] = useState("Popularity");

  // NEW FILTER STATES
  const [selectedStarRatings, setSelectedStarRatings] = useState([]);
  const [selectedUserRatings, setSelectedUserRatings] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 50000]);

  const [showProperties, setShowProperties] = useState({
    bookWithZero: false,
    freeCancellation: false,
    freeBreakfast: false,
    refundable: false,
  });
  const countryOptions = [
    { label: "India", code: "IN" },
    { label: "UAE", code: "AE" },
  ];

  // Infinite scroll states
  const [visibleCount, setVisibleCount] = useState(9); // Show 9 cards initially
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // NEW STATE FOR ADDRESS SEARCH AND RECOMMENDATIONS
  const [addressSearch, setAddressSearch] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);

  const navigate = useNavigate();

  const chunkArray = (arr, size = 100) => {
    const chunks = [];
    for (let i = 0; i < arr.length; i += size) {
      chunks.push(arr.slice(i, i + size));
    }
    return chunks;
  };

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

  // Infinite Scroll Logic
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMore) return;

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        setIsLoadingMore(true);
        // Load more hotels after a small delay to show loading indicator
        setTimeout(() => {
          setVisibleCount((prev) => prev + 9); // Load next 9 cards
          setIsLoadingMore(false);
        }, 300);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isLoadingMore]);

  // Fetch addresses for the selected city
  useEffect(() => {
    if (selectedCity && hotelList.length > 0) {
      // Extract unique addresses from hotelList
      const addresses = hotelList
        .map((hotel) => hotel.Address)
        .filter(
          (address, index, self) =>
            address && address.trim() !== "" && self.indexOf(address) === index,
        );
      setAddressSuggestions(addresses);
    } else {
      setAddressSuggestions([]);
    }
  }, [selectedCity, hotelList]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // const handleSearch = async () => {
  //   setIsSearching(true);
  //   setVisibleCount(9); // Reset to 9 cards on new search
  //   setAddressSearch(""); // Reset address search on new search
  //   setAddressSuggestions([]); // Reset suggestions

  //   try {
  //     // 🔹 Step 1: Get hotel codes for selected city
  //     const data = await getHotelCodeListNew(selectedCountry, selectedCity);
  //     console.log("Search List API Full Response:", data);

  //     let hotels = [];
  //     if (Array.isArray(data)) {
  //       hotels = data;
  //     } else if (data?.Hotels && Array.isArray(data.Hotels)) {
  //       hotels = data.Hotels;
  //     } else if (data?.data?.Hotels && Array.isArray(data.data.Hotels)) {
  //       hotels = data.data.Hotels;
  //     } else if (data?.data && Array.isArray(data.data)) {
  //       hotels = data.data;
  //     }

  //     console.log("✅ Final Filtered Hotels:", hotels);
  //     setHotelList(hotels);

  //     // 🔹 Step 2: Extract hotel codes
  //     const hotelCodes = hotels.map((h) => h.HotelCode || h.Code);
  //     if (hotelCodes.length === 0) {
  //       setSearchResults([]);
  //       setIsSearching(false);
  //       return;
  //     }

  //     // 🔹 Step 3: Build payload according to TBO Docs
  //     const payload = {
  //       CheckIn: checkIn,
  //       CheckOut: checkOut,
  //       HotelCodes: hotelCodes.slice(0, 100), // ⚡ in chunks of 100
  //       GuestNationality: guestNationality,
  //       PaxRooms: paxRooms.map((p) => ({
  //         Adults: p.Adults,
  //         Children: p.Children,
  //         ChildrenAges: p.ChildrenAges,
  //       })),
  //       ResponseTime: responseTime,
  //       IsDetailedResponse: isDetailedResponse, // true/false
  //       Filters: {
  //         NoOfRooms: 0,
  //         Refundable: isRefundable,
  //         MealType: mealType, // All | WithMeal | RoomOnly
  //       },
  //     };

  //     console.log("🔹 Final Payload:", payload);

  //     // 🔹 Step 4: Call Search API
  //     const res = await searchHotels(payload);
  //     console.log("Hotel Search Response:", res);
  //     if (res?.data?.HotelResult) {
  //       setSearchResults(res.data.HotelResult);
  //     } else {
  //       setSearchResults([]);
  //     }
  //   } catch (err) {
  //     console.error("❌ Error in search:", err);
  //     setSearchResults([]);
  //   } finally {
  //     setIsSearching(false);
  //   }
  // };

  const handleSearch = async () => {
    setIsSearching(true);
    setVisibleCount(9);
    setAddressSearch("");
    setAddressSuggestions([]);

    try {
      // 🔹 STEP 1: Get hotel codes
      const data = await getHotelCodeListNew(selectedCountry, selectedCity);
      console.log("daa of getHotelCodeListNew", data);
      let hotels = [];

      if (Array.isArray(data?.data)) {
        hotels = data.data;
      } else if (Array.isArray(data)) {
        hotels = data;
      } else if (Array.isArray(data?.Hotels)) {
        hotels = data.Hotels;
      }

      setHotelList(hotels);

      const hotelCodes = hotels.map((h) => h.HotelCode || h.Code);
      if (!hotelCodes.length) {
        setSearchResults([]);
        return;
      }
      console.log("hotels", hotels);
      const mergedHotelList = hotels.map((hotel) => {
        const code = hotel.HotelCode || hotel.Code;
        return {
          ...hotel,
          MinPrice: priceMap[code]?.MinPrice ?? null,
          Currency: priceMap[code]?.Currency ?? "INR",
          Rooms: priceMap[code]?.Rooms ?? [],
        };
      });

      // 🔹 STEP 2: Split hotel codes into chunks (100 max)
      const hotelCodeChunks = chunkArray(hotelCodes, 100);
      console.log("hotelcodechunks", hotelCodeChunks);
      const safeChunks = hotelCodeChunks.slice(0, 5);
      console.log("safechunk", safeChunks);

      // 🔹 STEP 3: Base payload (common)
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

      // 🔹 STEP 4: Parallel search calls
      const searchPromises = safeChunks.map((codes) =>
        searchHotels({
          ...basePayload,
          HotelCodes: codes,
        }),
      );

      const responses = await Promise.all(searchPromises);
      console.log("response of parallel search", responses);

      // 🔹 STEP 5: Merge all results
      const mergedResults = responses.flatMap(
        (res) => res?.data?.data?.HotelResult || [],
      );
      // STEP 6: Create price map (HotelCode → MinPrice)
      const priceMap = {};

      mergedResults.forEach((item) => {
        if (!item?.HotelCode || !item?.Rooms?.length) return;

        const minRoomPrice = Math.min(
          ...item.Rooms.map((r) => r.TotalFare || r.DisplayPrice || Infinity),
        );

        priceMap[item.HotelCode] = {
          MinPrice: minRoomPrice,
          Currency: item.Currency,
          Rooms: item.Rooms,
        };
      });

      // setSearchResults(mergedResults);
      setSearchResults(mergedHotelList);
    } catch (err) {
      console.error("❌ Parallel search failed:", err);
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
        console.log("Cities API Raw Response:", resp);

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
            setSelectedCity(cityObj.CityCode || cityObj.Code);
            setSelectedCityName(
              cityObj.CityName || cityObj.Name || cityObj.City,
            );
          }
        }

        // ✅ Fallback to first city
        if (cities.length > 0 && !location.state?.city) {
          setSelectedCity(cities[0].CityCode || cities[0].Code);
          setSelectedCityName(
            cities[0].CityName || cities[0].Name || cities[0].City,
          );
        }
      } catch (err) {
        console.error("❌ Error fetching cities:", err);
      }
    };

    loadCities();
  }, [selectedCountry, location.state]);

  // Handle address search
  const handleAddressSearch = (e) => {
    const value = e.target.value;
    setAddressSearch(value);

    if (value.trim() === "") {
      // Show all addresses when search is empty
      const allAddresses = searchResults.length > 0 ? searchResults : hotelList;
      const addresses = allAddresses
        .filter((hotel) => hotel.Address && hotel.Address.trim() !== "")
        .map((hotel) => hotel.Address)
        .filter((address, index, self) => self.indexOf(address) === index);
      setAddressSuggestions(addresses);
    } else {
      // Filter addresses based on search
      const sourceArray = searchResults.length > 0 ? searchResults : hotelList;
      const filtered = sourceArray
        .filter(
          (hotel) =>
            hotel.Address &&
            hotel.Address.toLowerCase().includes(value.toLowerCase()),
        )
        .map((hotel) => hotel.Address)
        .filter((address, index, self) => self.indexOf(address) === index);
      setAddressSuggestions(filtered);
    }

    setShowSuggestions(true);
  };

  // Handle address selection from suggestions
  const handleAddressSelect = (address) => {
    setAddressSearch(address);
    setShowSuggestions(false);

    // Filter hotels by selected address
    if (address.trim() === "") {
      // If address is empty, show all hotels
      const sourceArray = searchResults.length > 0 ? searchResults : hotelList;
      setSearchResults(sourceArray);
    } else {
      // Filter hotels by address
      const sourceArray = searchResults.length > 0 ? searchResults : hotelList;
      const filteredHotels = sourceArray.filter(
        (hotel) =>
          hotel.Address &&
          hotel.Address.toLowerCase().includes(address.toLowerCase()),
      );
      setSearchResults(filteredHotels);
      setVisibleCount(9); // Reset visible count
    }
  };

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

  // NEW FILTER HANDLERS
  const handleStarRatingChange = (rating) => {
    setSelectedStarRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  const handleUserRatingChange = (rating) => {
    setSelectedUserRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  };

  const handleAmenityChange = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  };

  const handleShowPropertyChange = (property) => {
    setShowProperties((prev) => ({
      ...prev,
      [property]: !prev[property],
    }));
  };

  // FILTERED HOTELS LOGIC
  const getFilteredHotels = () => {
    let filtered = displayedHotels;

    // Search keyword filter
    if (searchKeyword) {
      filtered = filtered.filter(
        (hotel) =>
          hotel.HotelName?.toLowerCase().includes(
            searchKeyword.toLowerCase(),
          ) ||
          hotel.CityName?.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          hotel.Address?.toLowerCase().includes(searchKeyword.toLowerCase()),
      );
    }

    // Star rating filter
    if (selectedStarRatings.length > 0) {
      const ratingMap = {
        "5 Star": "FiveStar",
        "4 Star": "FourStar",
        "3 Star": "ThreeStar",
        "2 Star": "TwoStar",
        "1 Star": "OneStar",
        Budget: "Budget",
        Unrated: "Unrated",
      };

      filtered = filtered.filter((hotel) => {
        const hotelRating = hotel.HotelRating || "Unrated";
        return selectedStarRatings.some(
          (rating) =>
            hotelRating === ratingMap[rating] ||
            (rating === "Unrated" && !hotel.HotelRating),
        );
      });
    }

    // User rating filter (assuming we have a UserRating field)
    if (selectedUserRatings.length > 0) {
      filtered = filtered.filter((hotel) => {
        const userRating = hotel.UserRating || 0;
        return selectedUserRatings.some((rating) => {
          if (rating === "4.5 & Above") return userRating >= 4.5;
          if (rating === "4 & Above") return userRating >= 4;
          if (rating === "3 & Above") return userRating >= 3;
          return false;
        });
      });
    }

    // Show properties filter
    if (showProperties.refundable) {
      filtered = filtered.filter((hotel) => hotel.Refundable === true);
    }

    // Address search filter
    if (addressSearch.trim() !== "") {
      filtered = filtered.filter(
        (hotel) =>
          hotel.Address &&
          hotel.Address.toLowerCase().includes(addressSearch.toLowerCase()),
      );
    }

    // Sort logic
    if (sortOption === "PriceLowHigh") {
      filtered = [...filtered].sort(
        (a, b) => (a.MinPrice || 0) - (b.MinPrice || 0),
      );
    } else if (sortOption === "PriceHighLow") {
      filtered = [...filtered].sort(
        (a, b) => (b.MinPrice || 0) - (a.MinPrice || 0),
      );
    } else if (sortOption === "Rating") {
      filtered = [...filtered].sort(
        (a, b) => (b.HotelRating || 0) - (a.HotelRating || 0),
      );
    }
    // Popularity is default

    return filtered;
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
          Refundable: "false",
          MealType: "All", // All | WithMeal | RoomOnly
        },
      },
    });
  };

  // Determine which hotels to display
  const displayedHotels = isSearching ? searchResults : hotelList;
  const filteredHotels = getFilteredHotels();

  // Get only visible hotels for infinite scroll
  const visibleHotels = filteredHotels.slice(0, visibleCount);

  // ✅ Run only once on first load if data exists
  // useEffect(() => {
  //   if (location.state) {
  //     const { country, city, cityName, checkIn, checkOut, rooms, paxRooms } =
  //       location.state;

  //     // ✅ handle when coming from HotelPopularDestination
  //     if (city && cityName) {
  //       setSelectedCity(city);
  //       setSelectedCityName(cityName);

  //       // optional: set default dates if none provided
  //       if (!checkIn) setCheckIn(new Date().toISOString().split("T")[0]);
  //       if (!checkOut) {
  //         const tomorrow = new Date();
  //         tomorrow.setDate(tomorrow.getDate() + 1);
  //         setCheckOut(tomorrow.toISOString().split("T")[0]);
  //       }
  //     }

  //     // ✅ handle when coming from your other component
  //     if (country) setSelectedCountry(country);
  //     if (checkIn) setCheckIn(checkIn);
  //     if (checkOut) setCheckOut(checkOut);
  //     if (rooms) setRooms(rooms);
  //     if (paxRooms) setPaxRooms(paxRooms);
  //   }
  // }, [location.state]);
  useEffect(() => {
    if (!location.state) return;

    const { country, city, cityName, checkIn, checkOut, rooms, paxRooms } =
      location.state;

    // ✅ COUNTRY FIRST (important)
    if (country) {
      setSelectedCountry(country);
    }

    if (checkIn) setCheckIn(checkIn);
    if (checkOut) setCheckOut(checkOut);
    if (rooms) setRooms(rooms);
    if (paxRooms) setPaxRooms(paxRooms);

    // city & cityName handled after city list loads
  }, [location.state]);

  // sirf jab navigation se data aaye

  // Trigger search when all relevant state values are ready
  useEffect(() => {
    if (selectedCity && checkIn && checkOut) {
      handleSearch();
    }
  }, [selectedCity]);

  return (
    <div>
      {/* search hotel box filter */}
      <div
        className="search-box listing-search-form"
        style={{ marginTop: "200px" }}
      >
        <div className="container">
          <div className="row g-3 align-items-end">
            {/* Country */}
            <div className="col-md-2">
              <label className="form-label">Country</label>
              <select
                className="form-control"
                value={selectedCountry}
                onChange={(e) => {
                  const countryCode = e.target.value;
                  setSelectedCountry(countryCode);

                  // 🔁 reset city when country changes
                  setSelectedCity("");
                  setSelectedCityName("");
                  setCityList([]);

                  // optional: reset results
                  setHotelList([]);
                  setSearchResults([]);
                }}
              >
                <option value="">-- Select Country --</option>
                {countryOptions.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

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
                      cityCode.toString(),
                  );

                  const cityName =
                    cityObj?.CityName || cityObj?.Name || cityObj?.City || "";

                  setSelectedCityName(cityName);

                  // Reset address search when city changes
                  setAddressSearch("");
                  setAddressSuggestions([]);
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

            <div className="col-md-2 col-6">
              <label className="form-label">Check-In</label>
              <DatePicker
                selected={checkIn ? new Date(checkIn) : null}
                onChange={(date) => {
                  if (!date) return;

                  const checkInDate = date.toISOString().split("T")[0];
                  setCheckIn(checkInDate);

                  // ⭐ Automatically set Check-Out = tomorrow date
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
            <div className="col-md-2 col-6">
              <label className="form-label">Check-Out</label>
              <DatePicker
                selected={checkOut ? new Date(checkOut) : null}
                onChange={(date) =>
                  setCheckOut(date ? date.toISOString().split("T")[0] : "")
                }
                className="form-control"
                dateFormat="yyyy-MM-dd"
                minDate={checkIn ? new Date(checkIn) : new Date()}
                excludeDates={checkIn ? [new Date(checkIn)] : []} // ⭐ Hide check-in date
                placeholderText="Select Check-Out"
              />
            </div>

            {/* Rooms Dropdown */}
            <div className="col-md-4 col-6 position-relative">
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
                                    updated[idx].Children,
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
                                    e.target.value,
                                  );
                                  setPaxRooms(updated);
                                }}
                              >
                                {Array.from(
                                  { length: 12 },
                                  (_, i) => i + 1,
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
                            { Adults: 1, Children: 0, ChildrenAges: [] },
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
                disabled={!selectedCity}
              >
                Search
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* searchbox */}

      <div className="container"></div>
      {/* Hotel Listing */}
      <div className="container hotel-listing">
        <div className="row align-items-end pt-5 pb-3 border-bottom mb-4">
          {/* LEFT SIDE → Breadcrumb */}
          <div className="col-md-5 col-4">
            <nav aria-label="breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item active" aria-current="page">
                  Hotels
                </li>
              </ol>
            </nav>
          </div>

          {/* RIGHT SIDE → Hotel Address Search */}
          <div className="col-md-7 col-sm-12 d-flex justify-content-end">
            <div className="address-search-container" ref={searchRef}>
              <div className="input-group">
                <span className="input-group-text">
                  <FontAwesomeIcon icon={faSearch} />
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder={`Search hotels by address in ${
                    selectedCityName || "selected city"
                  }...`}
                  value={addressSearch}
                  onChange={handleAddressSearch}
                  onFocus={() => setShowSuggestions(true)}
                  disabled={!selectedCity || hotelList.length === 0}
                />
              </div>

              {/* Address Suggestions Dropdown */}
              {showSuggestions && addressSuggestions.length > 0 && (
                <div className="address-suggestions-dropdown">
                  <div className="dropdown-header">
                    <small className="text-muted">
                      <FontAwesomeIcon icon={faLocationDot} className="me-1" />
                      Address recommendations for {selectedCityName}
                    </small>
                  </div>

                  {addressSuggestions.slice(0, 10).map((address, index) => (
                    <div
                      key={index}
                      className="suggestion-item"
                      onClick={() => handleAddressSelect(address)}
                    >
                      <FontAwesomeIcon
                        icon={faLocationDot}
                        className="text-primary me-2"
                      />
                      <span>{address}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* No Suggestions */}
              {showSuggestions &&
                addressSearch &&
                addressSuggestions.length === 0 && (
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
                        id="freeBreakfast"
                        checked={showProperties.freeBreakfast}
                        onChange={() =>
                          handleShowPropertyChange("freeBreakfast")
                        }
                      />
                      <label
                        className="form-check-label"
                        htmlFor="freeBreakfast"
                      >
                        Free Breakfast
                      </label>
                    </div>
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={showProperties.refundable}
                        onChange={() => handleShowPropertyChange("refundable")}
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
                    {["5 Star", "4 Star", "3 Star", "2 Star", "1 Star"].map(
                      (rating) => (
                        <div className="form-check" key={rating}>
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id={`star-${rating}`}
                            checked={selectedStarRatings.includes(rating)}
                            onChange={() => handleStarRatingChange(rating)}
                          />
                          <label
                            className="form-check-label"
                            htmlFor={`star-${rating}`}
                          >
                            {rating}
                          </label>
                        </div>
                      ),
                    )}
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
                        <label
                          className="form-check-label"
                          htmlFor={`review-${rating}`}
                        >
                          {rating}
                        </label>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-sm-9">
            {isSearching ? (
              <div className="text-center mt-5">
                <div>
                  <Loading />
                </div>
                <p className="mt-2">
                  Searching hotels in {selectedCityName}...
                </p>
              </div>
            ) : (
              <div className="row">
                {visibleHotels && visibleHotels.length > 0 ? (
                  visibleHotels.map((hotel, idx) => (
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
                              <p className="text-muted mb-0">
                                No Image Available
                              </p>
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
                            {hotel.Address}, {hotel.CityName},{" "}
                            {hotel.CountryName}
                          </p>

                          {/* Rating */}
                          <div className="rating">
                            {[...Array(5)].map((_, i) => {
                              const rating =
                                hotel.HotelRating === "FiveStar"
                                  ? 5
                                  : hotel.HotelRating === "FourStar"
                                    ? 4
                                    : hotel.HotelRating === "ThreeStar"
                                      ? 3
                                      : hotel.HotelRating === "TwoStar"
                                        ? 2
                                        : hotel.HotelRating === "OneStar"
                                          ? 1
                                          : 0;

                              return (
                                <span
                                  key={i}
                                  style={{
                                    color: i < rating ? "#6665ae" : "#ccc",
                                    fontSize: "20px",
                                  }}
                                >
                                  ★
                                </span>
                              );
                            })}
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
                    {selectedCity ? (
                      <>
                        <h5>No hotels available</h5>
                        <p className="text-muted">
                          {addressSearch
                            ? `No hotels found with address containing "${addressSearch}"`
                            : `No hotels found in ${selectedCityName}`}
                        </p>
                        <img
                          src="/images/Safarix-Logo1.png"
                          alt="Try changing search"
                          style={{ maxWidth: "200px", height: "auto" }}
                        />
                      </>
                    ) : (
                      <>
                        <h5>Please select a city</h5>
                        <img
                          src="/images/select-city.png"
                          alt="Select city"
                          style={{ maxWidth: "200px", height: "auto" }}
                        />
                      </>
                    )}
                  </div>
                )}

                {/* Loading indicator for infinite scroll */}
                {isLoadingMore && (
                  <div className="col-12 text-center my-3">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">
                        Loading more hotels...
                      </span>
                    </div>
                    <p className="mt-2">Loading more hotels...</p>
                  </div>
                )}

                {/* Show message if all hotels are loaded */}
                {visibleCount >= filteredHotels.length &&
                  filteredHotels.length > 0 && (
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
