import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import { useNavigate, useLocation } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./Bus.css";
import {
  Bus_getCityList,
  Bus_busSearch,
  Bus_busLayout,
} from "../services/busservice";
import Loading from "../common/loading";
import BusSeatLayout from "./BusSeatLayout";
 
function BusList() {
  const location = useLocation();
  const [busData, setBusData] = useState([]);
  const [filteredBusData, setFilteredBusData] = useState([]);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [cities, setCities] = useState([]);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);
  const [showFromSuggestions, setShowFromSuggestions] = useState(false);
  const [showToSuggestions, setShowToSuggestions] = useState(false);
  const [seatLayoutData, setSeatLayoutData] = useState(null);
  const [loadingSeats, setIsSearchingSeats] = useState(false);
  const [seatPrices, setSeatPrices] = useState({});
  const [traceId, setTraceId] = useState(null);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [pricing, setPricing] = useState(null);

  const [toggle, setToggle] = useState({
    busType: true,
    busTypeCategory: true,
    seatType: true,
    amenities: true,
    operator: true,
  });

  const [filters, setFilters] = useState({
    busType: [],
    busTypeCategory: [],
    seatType: [],
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
  const loadAmount = 6;
  const maxLoad = filteredBusData.length;

  const [isSearchingBuses, setIsSearchingBuses] = useState(false);
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (isScrolling) return;

      setIsScrolling(true);
      setTimeout(() => {
        setVisibleCount((prev) =>
          prev + loadAmount > maxLoad ? maxLoad : prev + loadAmount,
        );
        setIsScrolling(false);
      }, 600);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSearchingBuses, filteredBusData]);

  const navigate = useNavigate();

  // 🚀 INITIALIZATION - Sequential flow: Auth → Cities → Defaults
  useEffect(() => {
    const initializeApp = async () => {
      try {
        setInitializing(true);
        setError(null);

        console.log("🔄 Fetching city list...");
        const cityResponse = await Bus_getCityList();
        console.log("✅ City Response:", cityResponse);

        const cityData =
          cityResponse?.resposnse?.BusCities ||
          cityResponse?.BusCities ||
          cityResponse;

        if (Array.isArray(cityData) && cityData.length > 0) {
          setCities(cityData);
          console.log(`✅ ${cityData.length} cities loaded`);
        } else {
          throw new Error("Invalid cities response format");
        }

        const today = new Date().toISOString().split("T")[0];
        setSearchParams((prev) => ({ ...prev, travelDate: today }));

        console.log("✅ Bus initialization complete: City list ready");
      } catch (error) {
        console.error("🔥 Bus initialization error:", error);
        setError(`Initialization failed: ${error.message}`);
      } finally {
        setInitializing(false);
      }
    };

    initializeApp();
  }, []);

  // FIXED: Auto-load Bangalore to Hyderabad buses when cities are loaded

  useEffect(() => {
    const performInitialBusSearch = async () => {
      if (!cities.length) return;

      const passedData = location.state;

      // ✅ If coming from previous page
      if (passedData?.fromCityId && passedData?.toCityId) {
        console.log("📥 Received search data:", passedData);

        setSearchParams({
          fromCity: passedData.fromCityName,
          fromCityId: passedData.fromCityId,
          toCity: passedData.toCityName,
          toCityId: passedData.toCityId,
          travelDate: passedData.travelDate,
        });

        setAutoLoaded(true);

        await performBusSearch(
          passedData.fromCityId,
          passedData.toCityId,
          passedData.travelDate,
        );
      }
    };

    performInitialBusSearch();
  }, [cities, location.state]);

  const getSeatFare = (seat) => {
    return (
      seat.SeatFare ?? seat.Price?.BasePrice ?? seat.Price?.PublishedPrice ?? 0
    );
  };

  // 🚌 GET BUS LAYOUT
  const fetchBusLayout = async (bus) => {
    try {
      setIsSearchingSeats(true);
      setError(null);
      setSeatPrices({});

      console.log("🔄 Fetching Seat Layout for bus:", bus);

      const TraceId = bus?.traceId || bus?.TraceId;
      const ResultIndex = bus?.resultIndex ?? bus?.ResultIndex;

      if (!TraceId || ResultIndex == null) {
        throw new Error("Missing required parameters for seat layout");
      }

      console.log("📤 Layout API Payload:", {
        TraceId,
        ResultIndex,
      });

      const payload = { TraceId, ResultIndex };
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

      extractSeatPrices(layout);
      let seatDetailsRaw =
        layout?.SeatDetails ||
        layout?.SeatLayoutDetails?.SeatDetails ||
        layout?.SeatLayout?.SeatDetails ||
        layout?.Seats ||
        [];

      console.log("RAW SEAT DETAILS:", seatDetailsRaw);

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
                  }')">S${i + 1}</div>`,
              ).join("")}
            </div></div>
          </div>
        </div>`,
      };

      setSeatLayoutData(mockLayout);
      extractSeatPrices(mockLayout);
      return mockLayout;
    } finally {
      setIsSearchingSeats(false);
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
          const seatMatch = onclickAttr.match(
            /AddRemoveSeat\(['"]([^'"]*)['"],\s*['"]([^'"]*)['"]\)/,
          );

          if (seatMatch) {
            const seatNumber = seatMatch[1];
            const price = parseFloat(seatMatch[2]);
            prices[seatNumber] = price;
          }
        }
      });
    }

    if (Object.keys(prices).length === 0 && selectedBus) {
      prices["default"] = selectedBus.price;
    }

    setSeatPrices(prices);
    console.log("💰 Extracted Seat Prices:", prices);
  };

  // Shared search implementation used by both auto-search and manual search
  const performBusSearch = async (fromCityId, toCityId, travelDate) => {
    if (!fromCityId || !toCityId || !travelDate) {
      console.log("❌ Missing parameters for bus search");
      return;
    }

    setIsSearchingBuses(true);

    setError(null);

    try {
      console.log("🔍 Starting bus search...");

      const searchData = {
        DateOfJourney: travelDate,
        OriginId: fromCityId,
        DestinationId: toCityId,
        PreferredCurrency: "INR",
      };

      console.log("📦 Bus Search Payload:", {
        fromCityId,
        toCityId,
        travelDate,
      });

      const searchResponse = await Bus_busSearch(searchData);
      console.log("📨 Bus Search API Response:", searchResponse);

      const searchResult =
        searchResponse?.data?.BusSearchResult ||
        searchResponse?.BusSearchResult ||
        searchResponse;

      if (
        searchResult?.ResponseStatus === 1 &&
        Array.isArray(searchResult?.BusResults)
      ) {
        const { Origin, Destination, TraceId, BusResults } = searchResult;

        if (TraceId) {
          setTraceId(TraceId);
          localStorage.setItem("Bus_Trace_Id", TraceId);
          console.log("🔍 TraceId saved:", TraceId);
        }

        const transformedBuses = BusResults.map((bus, index) => {
          console.log("bus", bus);
          const busName = bus.ServiceName || bus.TravelName || "";
          const busType = bus.BusType || "";
          const pricing = bus.Pricing;
          const busTypeLower =
            busName.toLowerCase() + " " + busType.toLowerCase();

          let busTypeCategory = "";
          if (
            busTypeLower.includes("ac") ||
            busName.includes("AC") ||
            busType.includes("AC")
          ) {
            busTypeCategory = "AC";
          } else {
            busTypeCategory = "Non-AC";
          }

          let seatType = "";
          if (busTypeLower.includes("sleeper") || busName.includes("Sleeper")) {
            seatType = "Sleeper";
          } else if (
            busTypeLower.includes("seater") ||
            busName.includes("Seater")
          ) {
            seatType = "Seater";
          } else {
            seatType = busType.includes("SLEEPER") ? "Sleeper" : "Seater";
          }

          return {
            busId: bus.ResultIndex || index,
            resultIndex: bus.ResultIndex,
            routeId: bus.RouteId,
            operatorId: bus.OperatorId,
            busName: bus.ServiceName,
            pricing,
            travelName: bus.TravelName,
            operator: bus.TravelName,
            busType: bus.BusType,
            busTypeCategory,
            seatType,
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
          "No buses found for this route. Please try different cities or date.",
        );
      }
    } catch (error) {
      console.error("💥 Bus Search Error:", error);
      setError(error.message || "Failed to search buses");
      setBusData([]);
      setFilteredBusData([]);
    } finally {
      setIsSearchingBuses(false);
    }
  };

  // Manual search: uses current searchParams with shared search implementation
  const searchBuses = async () => {
    if (
      !searchParams.fromCityId ||
      !searchParams.toCityId ||
      !searchParams.travelDate
    ) {
      setError("Please select both source, destination, and travel date");
      return;
    }

    await performBusSearch(
      searchParams.fromCityId,
      searchParams.toCityId,
      searchParams.travelDate,
    );
  };

  // 🪑 MODAL FUNCTIONS
  const handleOpenSeats = async (bus) => {
    console.log("🚌 Opening seat selection for bus:", bus);

    const TraceId = bus?.traceId || traceId;
    const ResultIndex = bus?.resultIndex ?? bus?.ResultIndex;

    if (!TraceId || ResultIndex == null) {
      console.error("❌ Missing required layout parameters:", {
        TraceId,
        ResultIndex,
      });
      setError("Cannot load seat layout. Missing required parameters.");
      return;
    }

    setSelectedBus(bus);
    setSelectedSeats([]);
    setSeatLayoutData(null);
    setShowModal(true);

    await fetchBusLayout(bus);
  };
  const isBusListLoading = initializing || isSearchingBuses || isInitialLoading;
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedBus(null);
    setSeatLayoutData(null);
    setSeatPrices({});
  };

  const handleSeatSelect = (seat) => {
    console.log("seat in handleSeatSelect ", seat);
    setSelectedSeats((prev) => {
      const seatIndex = seat.SeatIndex;
      if (!seatIndex) return prev;

      const exists = prev.some((s) => s.SeatIndex === seatIndex);

      if (exists) {
        return prev.filter((s) => s.SeatIndex !== seatIndex);
      }
      console.log("selected seats after select", selectedSeats);

      return [...prev, seat];
    });
  };

  // const handleConfirmSeats = async () => {
  //   if (selectedSeats.length === 0) return;

  //   try {
  //     console.log("🚀 Starting seat confirmation process...");

  //     const TraceId = selectedBus?.traceId || selectedBus?.TraceId;
  //     const ResultIndex = selectedBus?.resultIndex ?? selectedBus?.ResultIndex;

  //     // ✅ Seat-wise pricing
  //     const seatCharges = selectedSeats.map((seat) => ({
  //       SeatIndex: seat.SeatIndex,
  //       SeatName: seat.SeatName,
  //       BaseFare: seat.Pricing?.baseFare ?? 0,
  //       Tax: seat.Pricing?.taxAmount ?? 0,
  //       FinalAmount: seat.Pricing?.finalAmount ?? 0,
  //     }));

  //     // ✅ Total amount
  //     const totalPayableAmount = selectedSeats.reduce(
  //       (sum, seat) => sum + (seat.Pricing?.finalAmount ?? 0),
  //       0,
  //     );

  //     // ✅ Pricing summary (like hotelCharges)
  //     const pricing = {
  //       currency: "INR",
  //       seatsCount: selectedSeats.length,
  //       seatCharges,
  //       totalAmount: totalPayableAmount,
  //     };

  //     if (!TraceId || ResultIndex == null) {
  //       console.error("❌ CRITICAL: Missing API parameters in BusList");
  //       throw new Error("Required parameters missing for boarding points");
  //     }

  //      const boardingResponse = await fetchBoardingPoints(TraceId, ResultIndex);
  //     console.log("📥 Boarding API Response:", boardingResponse);

  //     const boardingData = boardingResponse?.data?.BoardingPointsDetails || [];
  //     const droppingData = boardingResponse?.data?.DroppingPointsDetails || [];

  //     const completeBusData = {
  //       ...selectedBus,
  //       TraceId: TraceId,
  //       ResultIndex: ResultIndex,
  //       boardingPoints: boardingData,
  //       droppingPoints: droppingData,
  //     };

    
 
  //     const navigationState = {
  //       bus: completeBusData,
  //       seats: selectedSeats,
  //       pricing,
  //       traceId: TraceId,
  //       resultIndex: ResultIndex,
  //     };

  //     console.log("🚀 Navigating to checkout with complete data...");

  //     navigate("/Bus-checkout", { state: navigationState });
  //   } catch (error) {
  //     console.error("❌ Error in seat confirmation:", error);

  //     const fallbackBusData = {
  //       ...selectedBus,
  //       TraceId: selectedBus?.traceId || selectedBus?.TraceId,
  //       ResultIndex: selectedBus?.resultIndex ?? selectedBus?.ResultIndex,
  //     };

  //     localStorage.setItem("selectedBus", JSON.stringify(fallbackBusData));
  //     localStorage.setItem("selectedSeats", JSON.stringify(selectedSeats));

  //     navigate("/Bus-checkout", {
  //       state: {
  //         bus: fallbackBusData,
  //         seats: selectedSeats,
  //       },
  //     });
  //   }

  //   handleCloseModal();
  // };

  // Calculate total price

const handleConfirmSeats = async () => {
  if (selectedSeats.length === 0) return;

    try {
      const TraceId = selectedBus?.traceId || selectedBus?.TraceId;
      const ResultIndex = selectedBus?.resultIndex ?? selectedBus?.ResultIndex;

      const seatCharges = selectedSeats.map((seat) => ({
        SeatIndex: seat.SeatIndex,
        SeatName: seat.SeatName,
        BaseFare: seat.Pricing?.baseFare ?? 0,
        Tax: seat.Pricing?.taxAmount ?? 0,
        FinalAmount: seat.Pricing?.finalAmount ?? 0,
      }));

      const totalPayableAmount = selectedSeats.reduce(
        (sum, seat) => sum + (seat.Pricing?.finalAmount ?? 0),
        0,
      );

      const pricing = {
        currency: "INR",
        seatsCount: selectedSeats.length,
        seatCharges,
        totalAmount: totalPayableAmount,
      };

      navigate("/Bus-checkout", {
        state: {
          bus: selectedBus,
          seats: selectedSeats,
          pricing,
          traceId: TraceId,
          resultIndex: ResultIndex,
        },
      });
    } catch (error) {
      console.error(error);
    }

    handleCloseModal();
  };

  const calculateDisplayTotal = () => {
    const exactTotal = selectedSeats.reduce(
      (total, seat) => total + (seat.Pricing?.finalAmount ?? 0),
      0,
    );

    return Math.round(exactTotal); // Rounds to the nearest whole number
  };

  // const renderSeatsFromAPI = () => {
  //   console.log("seatlayout data in renderSeatsFromAPI", seatLayoutData);
  //   if (!seatLayoutData) return <div>Loading seat layout...</div>;

  //   const seats =
  //     seatLayoutData.seats ||
  //     seatLayoutData.SeatDetails ||
  //     seatLayoutData.SeatLayoutDetails?.SeatDetails ||
  //     seatLayoutData.SeatLayout?.SeatDetails ||
  //     [];

  //   if (seats.length === 0) return <div>No seat layout available</div>;
  //   console.log("seats ", seats);
  //   return (
  //     <div
  //       className="bus-layout-api"
  //       style={{ position: "relative", height: "500px", overflow: "auto" }}
  //     >
  //       {seats.map((seat) => {
  //         const isSelected = selectedSeats.some(
  //           (s) => s.SeatIndex === seat.SeatIndex,
  //         );

  //         const row = Number(seat.RowNo) || 0;
  //         const col = Number(seat.ColumnNo) || 0;

  //         return (
  //           <div
  //             key={seat.SeatIndex}
  //             className={`seat-api ${isSelected ? "selected" : ""}`}
  //             style={{
  //               position: "absolute",
  //               top: row * 45,
  //               left: col * 45,
  //             }}
  //             onClick={() => seat.SeatStatus && handleSeatSelect(seat)}
  //           >
  //             <div className="seat-icon">{seat.SeatName}</div>
  //             <span>₹{seat.DisplayPrice}</span>
  //             {/* <span>₹{getSeatFare(seat)}</span> */}
  //           </div>
  //         );
  //       })}
  //     </div>
  //   );
  // };

  const renderSeatsFromAPI = () => {
    return (
      <BusSeatLayout
        seatLayoutData={seatLayoutData}
        selectedSeats={selectedSeats}
        onSeatSelect={handleSeatSelect}
      />
    );
  };

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

  // FIXED: Handle city selection properly
  const handleSearchParamChange = async (field, value) => {
    const newSearchParams = {
      ...searchParams,
      [field]: value,
    };

    // Remove any extra text like "Agara, " from city names
    let cleanValue = value;
    if (field === "fromCity" || field === "toCity") {
      // Remove any prefix like "Agara, " from the city name
      if (value.includes(",")) {
        const parts = value.split(",");
        cleanValue = parts[parts.length - 1].trim();
        newSearchParams[field] = cleanValue;
      }
    }

    // Find city and get its ID
    if (field === "fromCity" && cleanValue) {
      const city = cities.find((c) => {
        const cityName = c.CityName?.toLowerCase();
        const searchName = cleanValue.toLowerCase();
        return (
          cityName === searchName ||
          cityName?.includes(searchName) ||
          searchName.includes(cityName)
        );
      });
      newSearchParams.fromCityId = city ? city.CityId || city.CityCode : "";
    } else if (field === "toCity" && cleanValue) {
      const city = cities.find((c) => {
        const cityName = c.CityName?.toLowerCase();
        const searchName = cleanValue.toLowerCase();
        return (
          cityName === searchName ||
          cityName?.includes(searchName) ||
          searchName.includes(cityName)
        );
      });
      newSearchParams.toCityId = city ? city.CityId || city.CityCode : "";
    }

    setSearchParams(newSearchParams);
  };

  const filterCities = (searchText) => {
    if (!searchText) return cities;

    const text = searchText.toLowerCase().trim();

    return [
      // Exact startsWith match first
      ...cities.filter((c) => c.CityName.toLowerCase().startsWith(text)),

      // Then includes match
      ...cities.filter(
        (c) =>
          !c.CityName.toLowerCase().startsWith(text) &&
          c.CityName.toLowerCase().includes(text),
      ),
    ];
  };

  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (newFilters[filterType].includes(value)) {
        newFilters[filterType] = newFilters[filterType].filter(
          (item) => item !== value,
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
    const busTypeCategories = ["AC", "Non-AC"];
    const seatTypes = ["Sleeper", "Seater"];
    const operators = [
      ...new Set(busData.map((bus) => bus.operator).filter(Boolean)),
    ];
    const allAmenities = busData.flatMap((bus) => bus.amenities || []);
    const amenities = [...new Set(allAmenities)].filter(Boolean);

    return { busTypes, busTypeCategories, seatTypes, operators, amenities };
  };

  const { busTypes, busTypeCategories, seatTypes, operators, amenities } =
    getDynamicFilterOptions();

  // FIXED: Get city options with simple names
  const getCityOptions = () => {
    const fromCities = cities
      .map((city) => {
        // Extract only the city name (remove "Agara, " prefix)
        const cityName = city.CityName;
        if (cityName && cityName.includes(",")) {
          return cityName.split(",")[1]?.trim() || cityName;
        }
        return cityName;
      })
      .filter(Boolean);

    const toCities = [...fromCities]; // Same list for both

    return { fromCities, toCities };
  };

  const { fromCities, toCities } = getCityOptions();

  useEffect(() => {
    if (!busData || busData.length === 0) return;

    let filteredData = [...busData];

    if (filters.busType.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.busType.includes(bus.busType),
      );
    }

    if (filters.busTypeCategory.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.busTypeCategory.includes(bus.busTypeCategory),
      );
    }

    if (filters.seatType.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.seatType.includes(bus.seatType),
      );
    }

    if (filters.amenities.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.amenities.every((amenity) =>
          (bus.amenities || []).includes(amenity),
        ),
      );
    }

    if (filters.operator.length > 0) {
      filteredData = filteredData.filter((bus) =>
        filters.operator.includes(bus.operator),
      );
    }

    console.log("filtered data", filteredData);

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

  const Legend = ({ color, label }) => (
    <div className="legend-item">
      <div className={`legend-box ${color}`} />

      <span>{label}</span>
    </div>
  );

  return (
    <div>
      {/* Search Section */}
      <div className="bus-section" style={{ marginTop: "100px" }}>
        <div className="search-bus">
          <div className="container">
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
              {/* From City - Will show Bangalore by default */}
              <div className="col-md-3">
                <label className="text-muted small mb-1">From</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control fw-bold"
                    placeholder="Select City"
                    value={searchParams.fromCity}
                    onChange={(e) => {
                      handleSearchParamChange("fromCity", e.target.value);
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
                        return filterCities(searchParams.fromCity)
                          .slice(0, 15)
                          .map((city) => (
                            <div
                              key={city.CityId}
                              className="p-2 border-bottom hover-bg-light"
                              style={{ cursor: "pointer" }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                handleSearchParamChange(
                                  "fromCity",
                                  city.CityName,
                                );
                                setSearchParams((prev) => ({
                                  ...prev,
                                  fromCityId: city.CityId,
                                }));
                                setShowFromSuggestions(false);
                              }}
                            >
                              {city.CityName}
                            </div>
                          ));
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* To City - Will show Hyderabad by default */}
              <div className="col-md-3">
                <label className="text-muted small mb-1">To</label>
                <div className="position-relative">
                  <input
                    type="text"
                    className="form-control fw-bold"
                    placeholder="Select City"
                    value={searchParams.toCity}
                    onChange={(e) => {
                      handleSearchParamChange("toCity", e.target.value);
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

                        return filterCities(searchParams.toCity)
                          .slice(0, 15)
                          .map((city) => (
                            <div
                              key={city.CityId}
                              className="p-2 border-bottom hover-bg-light"
                              style={{ cursor: "pointer" }}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => {
                                handleSearchParamChange(
                                  "toCity",
                                  city.CityName,
                                );
                                setSearchParams((prev) => ({
                                  ...prev,
                                  toCityId: city.CityId,
                                }));
                                setShowToSuggestions(false);
                              }}
                            >
                              {city.CityName}
                            </div>
                          ));
                      })()}
                    </div>
                  )}
                </div>
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
                  className="explore-btn"
                  onClick={handleSearch}
                  disabled={
                    isSearchingBuses ||
                    !searchParams.fromCityId ||
                    !searchParams.toCityId
                  }
                >
                  {isSearchingBuses ? (
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

      <div className="container py-5">
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item">
              <a href="/">Home</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Buses from {searchParams.fromCity} to {searchParams.toCity}
            </li>
          </ol>
        </nav>
        <div className="row">
          {/* FILTER COLUMN */}
          <div
            className="col-sm-3 mb-4"
            style={{
              opacity: isBusListLoading ? 0.5 : 1,
              pointerEvents: isBusListLoading ? "none" : "auto",
            }}
          >
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
                          onChange={() =>
                            handleFilterChange("busTypeCategory", category)
                          }
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
                    busType: [],
                    busTypeCategory: [],
                    seatType: [],
                    amenities: [],
                    operator: [],
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
              <h4 className=" mb-0">
                {isBusListLoading
                  ? "Searching available buses..."
                  : `Available Buses from ${searchParams.fromCity} to ${searchParams.toCity} (${filteredBusData.length})`}
              </h4>

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
              {isBusListLoading ? (
                <div className="col-12 text-center py-5">
                  <Loading />
                  <p className="mt-2">Searching buses for you...</p>
                </div>
              ) : filteredBusData.length > 0 ? (
                filteredBusData.slice(0, visibleCount).map((bus) => (
                  <div className="col-sm-12 mb-4" key={bus.busId}>
                    <div className="bus-card rounded-4 border shadow-sm overflow-hidden h-100">
                      <div className="bus-body p-3">
                        <div className="row align-items-center">
                          {/* ==== Left Image ==== */}
                          <div className="col-sm-2">
                            <img
                              src={"/Images/busdemo.png"}
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
                              {bus.busType} • {bus.operator} •{" "}
                              {bus.busTypeCategory} • {bus.seatType}
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
                                    <strong>Route:</strong>{" "}
                                    {searchParams.fromCity} →{" "}
                                    {searchParams.toCity}
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

                                <h5 className="fw-bold mb-1">
                                  ₹{bus?.pricing?.finalAmount || 0}
                                </h5>
                                {/* <h5 className="fw-bold mb-1">₹{bus.price}</h5> */}
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
                  <p>Try searching for different cities or date</p>
                </div>
              )}
            </div>

            {/* Load More Spinner */}
            {isSearchingBuses && visibleCount < filteredBusData.length && (
              <div className="text-center my-3">
                <div className="spinner-border text-primary"></div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Seat Selection Modal */}
      {/* {showModal && (
        <div
          className="modal-overlay make-mytrip-style"
          style={{ marginTop: "100px" }}
        >
          <div className="modal-content make-mytrip-modal">
             <div className="modal-header make-mytrip-header">
              <div className="header-content">
                <h2>Select Seats</h2>
                <div className="bus-info">
                  <strong>{selectedBus?.busName}</strong>
                  <span>
                    {searchParams.fromCity} → {searchParams.toCity}
                  </span>
                  <span>
                    {selectedBus?.departureTime} • {searchParams.travelDate}
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
                        <span className="seat-price">
                          ₹{seat?.Pricing?.finalAmount || 0}
                        </span>
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
                  <span className="amount">₹{calculateDisplayTotal()}</span>
                </div>
              </div>
            </div>

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
      )} */}
      {/* PROFESSIONAL SEAT MODAL */}
{showModal && (
  <div className="bus-modal-overlay">

    <div className="bus-modal">

      {/* HEADER */}
      <div className="bus-modal-header">

        <div className="bus-modal-header-left">

          <h3 className="bus-modal-title">
            Select Seats
          </h3>

          <div className="bus-modal-subtitle">

            <span className="bus-name">
              {selectedBus?.busName}
            </span>

            <span className="bus-route">
              {searchParams.fromCity} → {searchParams.toCity}
            </span>

            <span className="bus-time">
              {selectedBus?.departureTime} • {searchParams.travelDate}
            </span>

          </div>

        </div>

        <button
          className="bus-modal-close"
          onClick={handleCloseModal}
        >
          ✕
        </button>

      </div>


      {/* LEGEND */}
      <div className="bus-seat-legend">

        <Legend color="available" label="Available" />

        <Legend color="selected" label="Selected" />

        <Legend color="booked" label="Booked" />

        <Legend color="ladies" label="Ladies" />

      </div>


      {/* BODY */}
      <div className="bus-modal-body">

        {loadingSeats ? (

          <div className="bus-seat-loading">
            Loading seat layout...
          </div>

        ) : (

          <BusSeatLayout
            seatLayoutData={seatLayoutData}
            selectedSeats={selectedSeats}
            onSeatSelect={handleSeatSelect}
          />

        )}

      </div>


      {/* FOOTER */}
      <div className="bus-modal-footer">

        <div className="bus-footer-left">

          <div className="selected-seats">
            {selectedSeats.length > 0
              ? selectedSeats.map(seat => seat.SeatName).join(", ")
              : "No seats selected"}
          </div>

          <div className="total-amount">
            ₹{calculateDisplayTotal()}
          </div>

        </div>


        <div className="bus-footer-right">

          <button
            className="bus-btn-cancel"
            onClick={handleCloseModal}
          >
            Cancel
          </button>

          <button
            className="bus-btn-proceed"
            onClick={handleConfirmSeats}
            disabled={selectedSeats.length === 0}
          >
            Proceed
          </button>

        </div>

      </div>

    </div>

  </div>
)}

    </div>
  );
}

export default BusList;
