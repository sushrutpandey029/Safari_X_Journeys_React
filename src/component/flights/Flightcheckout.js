import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useLocation, useNavigate } from "react-router-dom";
import { fare_quote, flight_fetchSSR } from "../services/flightService";
import useCashfreePayment from "../hooks/useCashfreePayment";
import { getUserData } from "../utils/storage";
import { searchInsurance } from "../services/insuranceService";
// 07ABCDE1234F1Z5

const Flightcheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { startPayment } = useCashfreePayment();

  const [showSeatModal, setShowSeatModal] = useState(false);
  const [activeSeatPaxIndex, setActiveSeatPaxIndex] = useState(null);
  const [activeFlightIndex, setActiveFlightIndex] = useState(0);
  const [fareRules, setFareRules] = useState(null);
  const [fareExpired, setFareExpired] = useState(false);

  const [passengerConfirmed, setPassengerConfirmed] = useState(false);
  const isPassengerLocked = !passengerConfirmed;

  // ✅ Updated for multiple flights
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [selectedFares, setSelectedFares] = useState([]);
  const [searchData, setSearchData] = useState(null);
  const [fareDetailsArray, setFareDetailsArray] = useState([]);
  const [loading, setLoading] = useState(false);

  const [fareLoading, setFareLoading] = useState(false);
  const [confirmingPassengers, setConfirmingPassengers] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [priceChanged, setPriceChanged] = useState(false);
  const [oldTotal, setOldTotal] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  // SSR data for multiple flights
  const [ssrDataArray, setSSRDataArray] = useState([]);
  const [ssrLoading, setSSRLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("PASSENGER");
  const [expandedSSR, setExpandedSSR] = useState({
    baggage: false,
    meal: false,
    seat: false,
  });
  const [gstDetails, setGstDetails] = useState({
    gstNumber: "",
    companyName: "",
    companyAddress: "",
    companyEmail: "",
  });

  const isUserLoggedIn = async () => {
    const user = await getUserData("safarix_user");
    return !!user?.id;
  };

  const toggleSSR = (key) => {
    // ✅ SAVE MEALS when closing meal card
    if (expandedSSR.meal && key !== "meal") {
      const mealMap = {};
      seatEligiblePassengers.forEach((_, index) => {
        mealMap[index] = selectedMealList[index] || null;
      });

      setSelectedMeals((prev) => ({
        ...prev,
        [activeFlightIndex]: mealMap,
      }));
    }

    // ✅ SAVE BAGGAGE when:
    // 1) switching away OR
    // 2) closing baggage itself
    if (expandedSSR.baggage && (key !== "baggage" || key === "baggage")) {
      const baggageMap = {};
      seatEligiblePassengers.forEach((_, index) => {
        baggageMap[index] = selectedBaggageList[index] || null;
      });

      setSelectedBaggage((prev) => ({
        ...prev,
        [activeFlightIndex]: baggageMap,
      }));
    }

    setExpandedSSR({
      baggage: false,
      meal: false,
      seat: false,
      [key]: !expandedSSR[key],
    });
  };

  // 🔹 Selected SSR for each flight
  const [selectedMeals, setSelectedMeals] = useState({});
  const [selectedBaggage, setSelectedBaggage] = useState({});
  const [selectedSeats, setSelectedSeats] = useState({});

  // Insurance
  const [insuranceData, setInsuranceData] = useState(null);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceError, setInsuranceError] = useState(null);
  const [selectedInsurancePlan, setSelectedInsurancePlan] = useState(null);
  const [insuranceTraceId, setInsuranceTraceId] = useState("");

  // Passenger data state
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMobile, setContactMobile] = useState("");

  // ✅ Add state for validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [airlineCode, setAirlineCode] = useState("");
  const [airlineGroup, setAirlineGroup] = useState("Other");

  const [oldBaseFare, setOldBaseFare] = useState(0);
  const [newBaseFare, setNewBaseFare] = useState(0);
  const [fareDiff, setFareDiff] = useState(0);

  const state = location?.state;

  const [fareSource, setFareSource] = useState("search");

  // ✅ PRICING BREAKDOWN FROM FLIGHT DETAIL
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [isEditContact, setIsEditContact] = useState(true);

  // ✅ MakeMyTrip-style seat selection
  const seatEligiblePassengers = passengers.filter(
    (p) => p.paxType === 1 || p.paxType === 2, // Adult + Child
  );

  const requiredSeatCount = seatEligiblePassengers.length;

  // seats selected in order (modal only)
  const [selectedSeatList, setSelectedSeatList] = useState([]);
  const [selectedMealList, setSelectedMealList] = useState([]);
  const [selectedBaggageList, setSelectedBaggageList] = useState([]);

  useEffect(() => {
    if (!state) return;

    const {
      TraceId,
      tripType,
      isDomestic,
      resultIndexes,
      pricingBreakdown,
      passengers: passengerCount,
      travelClass,
    } = state;

    // 1️⃣ Save pricing breakdown
    if (pricingBreakdown) {
      setPricingBreakdown(pricingBreakdown);
    }

    // 2️⃣ Build searchData MINIMAL (required for APIs)
    setSearchData({
      TraceId,
      tripType,
      isDomestic,
      travelClass,
    });

    // 3️⃣ Normalize resultIndexes → array
    const normalizedIndexes =
      tripType === "round"
        ? [resultIndexes.outbound, resultIndexes.inbound]
        : Array.isArray(resultIndexes)
          ? resultIndexes
          : [resultIndexes];

    // 4️⃣ Build placeholder selectedFlights ONLY with ResultIndex
    const flights = normalizedIndexes.map((ri) => ({
      ResultIndex: ri,
    }));

    setSelectedFlights(flights);

    // 5️⃣ Initialize passengers (counts only)
    initializePassengers(
      passengerCount || {
        adults: 1,
        children: 0,
        infants: 0,
      },
    );
  }, []);

  useEffect(() => {
    if (state?.passengerCount) {
      initializePassengers(state.passengerCount);
    }
  }, [state?.passengerCount]);

  // 🔒 AUTO RUN FARE QUOTE ON CHECKOUT LOAD (PRICE LOCK)
  useEffect(() => {
    if (selectedFlights.length > 0 && searchData && fareSource === "search") {
      console.log("🔒 Auto running FareQuote on checkout load");
      fetchFareQuotesForAllFlights(); // LOCK PRICE
    }
  }, [selectedFlights, searchData]);

  // ✅ Fetch insurance data when flights are loaded
  useEffect(() => {
    if (fareDetailsArray.length > 0) {
      fetchInsuranceData();
    }
  }, [fareDetailsArray]);

  // ✅ Helper function to extract flight info
  const extractFlightInfo = (flight) => {
    if (!flight) return null;
    if (!flight?.Segments && fareDetailsArray.length > 0) {
      flight = fareDetailsArray.find(
        (f) => f.ResultIndex === flight.ResultIndex,
      );
    }

    // Handle both flight object formats
    const segments = flight.Segments?.[0] || [];
    const firstSegment = Array.isArray(segments) ? segments[0] : segments;
    const airline = firstSegment?.Airline || flight.Airline || {};
    const origin = firstSegment?.Origin || flight.origin || {};
    const destination = firstSegment?.Destination || flight.destination || {};

    return {
      airline: {
        code: airline.AirlineCode || flight.AirlineCode || "AI",
        name: airline.AirlineName || flight.airline?.name || "Air India",
        flightNumber:
          airline.FlightNumber || flight.airline?.flightNumber || "2993",
      },
      origin: {
        city: origin.Airport?.CityName || origin.city || "Delhi",
        code: origin.Airport?.AirportCode || origin.code || "DEL",
        time: origin.DepTime || origin.time,
        airport:
          origin.Airport?.AirportName || origin.airport || "Delhi Airport",
      },
      destination: {
        city: destination.Airport?.CityName || destination.city || "Mumbai",
        code: destination.Airport?.AirportCode || destination.code || "BOM",
        time: destination.ArrTime || destination.time,
        airport:
          destination.Airport?.AirportName ||
          destination.airport ||
          "Mumbai Airport",
      },
      flight: {
        baggage: firstSegment?.Baggage || flight.flight?.baggage || "15 KG",
        cabinBaggage:
          firstSegment?.CabinBaggage || flight.flight?.cabinBaggage || "7 KG",
        duration:
          flight.TotalJourneyTime || flight.flight?.duration || "2h 15m",
        aircraft:
          firstSegment?.AircraftType || flight.flight?.aircraft || "A320",
        stops: Array.isArray(segments) ? segments.length - 1 : 0,
      },
      fare: {
        displayPrice: flight.DisplayPrice || flight.fare?.displayPrice || 0,
        total:
          flight.Fare?.OfferedFare ||
          flight.Fare?.PublishedFare ||
          flight.fare?.total ||
          0,
        isRefundable: flight.IsRefundable || flight.fare?.isRefundable || false,
      },
      // API parameters
      ResultIndex: flight.ResultIndex,
      FlightId: flight.FlightId,
      Segments: flight.Segments,
      TotalJourneyTime: flight.TotalJourneyTime,
      Airline: flight.Airline,
      IsLCC: flight.IsLCC,
      IsRefundable: flight.IsRefundable,
      Fare: flight.Fare,
    };
  };

  // ✅ Fetch fare quotes for all flights
  const fetchFareQuotesForAllFlights = async () => {
    if (fareSource === "fareQuote") {
      console.log("Fare already locked, skipping duplicate FareQuote");
      return;
    }

    try {
      setLoading(true);
      const responses = [];

      for (let i = 0; i < selectedFlights.length; i++) {
        const flight = selectedFlights[i];
        const payload = {
          TraceId: state.TraceId,
          ResultIndex: flight.ResultIndex,
        };

        const res = await fare_quote(payload);
        console.log(`Fare quote response for flight ${i + 1}:`, res.data);
        const response = res?.data?.Response;
        if (
          !response ||
          response.ResponseStatus !== 1 ||
          response.Error?.ErrorCode !== 0
        ) {
          alert("Fare validation failed. Please search again.");
          return;
        }
        // if (res?.data?.Response?.Results) {
        const result = Array.isArray(res.data.Response.Results)
          ? res.data.Response.Results[0]
          : res.data.Response.Results;

        responses.push(result);

        // ✅ extract fare rules ONLY ONCE (first flight is enough)
        if (i === 0) {
          setFareRules({
            isLCC: result.IsLCC,

            gst: {
              allowed: result.GSTAllowed,
              mandatory: result.IsGSTMandatory,
            },

            passport: {
              requiredAtBook: result.IsPassportRequiredAtBook,
              requiredAtTicket: result.IsPassportRequiredAtTicket,
              fullDetailRequired: result.IsPassportFullDetailRequiredAtBook,
            },

            pan: {
              requiredAtBook: result.IsPanRequiredAtBook,
              requiredAtTicket: result.IsPanRequiredAtTicket,
            },

            fare: {
              refundable: result.IsRefundable,
              lastTicketDate: result.LastTicketDate,
            },
          });

          // ⏳ session expiry check
          if (
            result.LastTicketDate &&
            result.LastTicketDate !== "0001-01-01T00:00:00"
          ) {
            if (new Date() > new Date(result.LastTicketDate)) {
              setFareExpired(true);
            }
          }
        }
        // }
      }

      setFareDetailsArray(responses);
      setFareSource("fareQuote");

      // 🔒 LOCK TOTAL AFTER FARE QUOTE
      const lockedTotal = calculateTotalAmount();
      setOldTotal(lockedTotal);
      setNewTotal(lockedTotal);
      setPriceChanged(false);

      console.log("🔒 Fare locked at:", lockedTotal);

      // Fetch SSR for all flights
      await fetchSSRForAllFlights();
    } catch (error) {
      console.error("Fare quote error:", error);
      alert("Unable to confirm fares for all flights. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const recheckFareBeforePayment = async () => {
    let priceChangedByAirline = false;
    let updatedBaseFare = 0;
    const responses = [];

    for (let i = 0; i < selectedFlights.length; i++) {
      const payload = {
        TraceId: state.TraceId,
        ResultIndex: selectedFlights[i].ResultIndex,
      };

      const res = await fare_quote(payload);
      const response = res?.data?.Response;

      if (
        !response ||
        response.ResponseStatus !== 1 ||
        response.Error?.ErrorCode !== 0
      ) {
        alert("Fare validation failed. Please search again.");
        return;
      }

      if (response.IsPriceChanged === true) {
        priceChangedByAirline = true;
      }

      const result = Array.isArray(response.Results)
        ? response.Results[0]
        : response.Results;

      responses.push(result);
      updatedBaseFare += Number(result?.Fare?.BaseFare || 0);
    }

    // 🔁 update fare data
    setFareDetailsArray(responses);

    if (priceChangedByAirline) {
      const diff = updatedBaseFare - oldBaseFare;
      setNewBaseFare(updatedBaseFare);
      setFareDiff(diff);
      setPriceChanged(true);
    } else {
      setPriceChanged(false);
    }
  };

  // ✅ Fetch SSR for all flights
  const fetchSSRForAllFlights = async () => {
    try {
      setSSRLoading(true);
      const ssrResponses = [];

      for (let i = 0; i < selectedFlights.length; i++) {
        const flight = selectedFlights[i];
        const payload = {
          TraceId: searchData?.TraceId,
          ResultIndex: flight?.ResultIndex,
        };

        const res = await flight_fetchSSR(payload);
        console.log(`SSR response for flight ${i + 1}:`, res.data);

        if (res.data.success) {
          const response = res.data.data.Response;
          const normalizedSSR = {
            baggage: response?.Baggage?.[0] || [],
            meals: response?.MealDynamic?.[0] || [],
            seats: response?.SeatDynamic?.[0]?.SegmentSeat?.[0]?.RowSeats || [],
            specialServices:
              response?.SpecialServices?.[0]?.SegmentSpecialService?.[0]
                ?.SSRService || [],
          };
          ssrResponses.push(normalizedSSR);
        }
      }

      setSSRDataArray(ssrResponses);
      console.log("ssr response", ssrResponses);
    } catch (err) {
      console.error("SSR Error:", err);
    } finally {
      setSSRLoading(false);
    }
  };

  const calculateAge = (dob) => {
    const birth = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };
  const formatDateForInsurance = (isoDate) => {
    if (!isoDate) return null;

    const d = new Date(isoDate);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`; // ✅ yyyy-MM-dd
  };

  // ✅ Fetch insurance data
  const fetchInsuranceData = async () => {
    try {
      setInsuranceLoading(true);
      setInsuranceError(null);

      const firstFare = fareDetailsArray?.[0];
      const depTime = firstFare?.Segments?.[0]?.[0]?.Origin?.DepTime;

      const lastFare = fareDetailsArray[fareDetailsArray.length - 1];
      const lastSegment = lastFare?.Segments?.[0]?.slice(-1)[0];

      if (!depTime || !lastSegment?.Destination?.ArrTime) {
        setInsuranceError("Unable to fetch travel dates");
        return;
      }

      const TravelStartDate = formatDateForInsurance(depTime);
      const TravelEndDate = formatDateForInsurance(
        lastSegment.Destination.ArrTime,
      );

      const passengerCount = getPassengerCount();
      const totalPassengers = passengerCount.adults + passengerCount.children;

      const paxAges = passengers
        .filter((p) => p.paxType === 1 || p.paxType === 2) // Adult + Child
        .map((p) => {
          if (p.dateOfBirth) {
            const age = calculateAge(p.dateOfBirth);
            return age > 0 ? age.toString() : "30";
          }

          // 🔥 FALLBACK (industry standard)
          return p.paxType === 1 ? "30" : "10";
        });
      const insuredPassengers = passengers.filter(
        (p) => p.paxType === 1 || p.paxType === 2,
      );
      const payload = {
        PlanCategory: 1,
        PlanType: 1,
        PlanCoverage: 4,
        TravelStartDate,
        TravelEndDate,
        NoOfPax: insuredPassengers.length,
        PaxAge: paxAges,
      };

      console.log("insurance search payload", payload);

      const response = await searchInsurance(payload);
      console.log("Insurance API response:", response);

      if (
        response.data?.success &&
        response.data?.data?.Response?.ResponseStatus === 1
      ) {
        const insuranceResponse = response.data.data.Response;
        setInsuranceTraceId(insuranceResponse.TraceId);

        const processedInsuranceData = insuranceResponse.Results.map(
          (plan) => ({
            ResultIndex: plan.ResultIndex,
            PlanCode: plan.PlanCode,
            PlanName: plan.PlanName,
            SumInsured: plan.SumInsured,
            PlanDescription: plan.PlanDescription,
            Premium:
              plan.Price?.OfferedPrice ||
              plan.Price?.PublishedPrice ||
              plan.Price?.GrossFare ||
              0,
            // ✅ KEEP BOTH
            VendorPrice: plan.Price?.OfferedPrice || 0, // for TBO
            Pricing: plan.Pricing, // OUR pricing
            DisplayPrice: plan.DisplayPrice,
            Currency: plan.Price?.Currency || "INR",
            CoverageDetails: plan.CoverageDetails || [],
          }),
        );

        setInsuranceData(processedInsuranceData);
      } else {
        setInsuranceError("No insurance plans available");
      }
    } catch (error) {
      console.error("Error fetching insurance:", error);
      setInsuranceError("Failed to load insurance options");
    } finally {
      setInsuranceLoading(false);
    }
  };

  // ✅ Initialize passengers
  const initializePassengers = (passengerCount) => {
    if (!passengerCount) return;

    const newPassengers = [];
    let passengerIndex = 0;

    // Add adults
    for (let i = 0; i < passengerCount.adults; i++) {
      newPassengers.push({
        id: `adult-${i}`,
        type: "Adult",
        paxType: 1,
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        passportNumber: "",
        passportExpiry: "",
        nationality: "IN",
        contactNo: "",
        email: "",
        addressLine1: "",
        city: "",
        countryCode: "IN",
        isLeadPax: i === 0,
      });
      passengerIndex++;
    }

    // Add children
    for (let i = 0; i < passengerCount.children; i++) {
      newPassengers.push({
        id: `child-${i}`,
        type: "Child",
        paxType: 2,
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        passportNumber: "",
        passportExpiry: "",
        nationality: "IN",
        contactNo: "",
        email: "",
        addressLine1: "",
        city: "",
        countryCode: "IN",
        isLeadPax: false,
      });
      passengerIndex++;
    }

    // Add infants
    for (let i = 0; i < passengerCount.infants; i++) {
      newPassengers.push({
        id: `infant-${i}`,
        type: "Infant",
        paxType: 3,
        title: "",
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        passportNumber: "",
        passportExpiry: "",
        nationality: "IN",
        contactNo: "",
        email: "",
        addressLine1: "",
        city: "",
        countryCode: "IN",
        isLeadPax: false,
      });
    }

    setPassengers(newPassengers);
  };

  // ✅ Apply coupon
  const applyCoupon = () => {
    if (couponCode.trim() && couponCode.length >= 4) {
      const discount = Math.min(200, calculateTotalAmount() * 0.1);
      setAppliedCoupon({
        code: couponCode.toUpperCase(),
        discount: Math.floor(discount),
        description: "Discount applied successfully",
      });
      setCouponCode("");
    } else {
      alert("Please enter a valid coupon code (minimum 4 characters)");
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // ✅ Format time and date
  const formatTime = (timeString) => {
    if (!timeString) return "--:--";
    try {
      return new Date(timeString).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (error) {
      return "--:--";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (error) {
      return "Date not available";
    }
  };

  // ✅ Calculate fare breakdown for multiple flights USING PRICING BREAKDOWN DATA
  const calculateTotalFareBreakdown = () => {
    // ✅ If we have pricing breakdown from flight detail, use it
    if (pricingBreakdown) {
      // Use the pricing breakdown data directly
      return {
        baseFare: pricingBreakdown.netFare || 0,
        commissionAmount: pricingBreakdown.commissionAmount || 0,
        commissionPercent: pricingBreakdown.commissionPercent || 6,
        gstAmount: pricingBreakdown.gstAmount || 0,
        gstPercent: pricingBreakdown.gstPercent || 18,
        totalFare: pricingBreakdown.finalAmount || 0,
        // Calculate other taxes if any
        otherTaxes:
          (pricingBreakdown.finalAmount || 0) -
          (pricingBreakdown.netFare || 0) -
          (pricingBreakdown.commissionAmount || 0) -
          (pricingBreakdown.gstAmount || 0),
      };
    }

    // ✅ Fallback: Calculate from fareDetailsArray
    let totalBaseFare = 0;
    let totalTax = 0;
    let totalFare = 0;

    fareDetailsArray.forEach((fareDetail) => {
      if (fareDetail?.Fare) {
        totalBaseFare += Number(fareDetail.Fare.BaseFare || 0);
        totalTax += Number(fareDetail.Fare.Tax || 0);
        totalFare += Number(
          fareDetail.Fare.PublishedFare || fareDetail.Fare.OfferedFare || 0,
        );
      }
    });

    // Calculate default commission and GST if not provided
    const commissionPercent = 6;
    const gstPercent = 18;
    const commissionAmount = (totalFare * commissionPercent) / 100;
    const gstAmount = (commissionAmount * gstPercent) / 100;
    const netFare = totalFare - commissionAmount;

    return {
      baseFare: netFare,
      commissionAmount,
      commissionPercent,
      gstAmount,
      gstPercent,
      totalFare: totalFare,
      otherTaxes: totalTax - commissionAmount - gstAmount,
    };
  };

  // ✅ Calculate SSR charges total
  const calculateSSRCharges = () => {
    let ssrTotal = 0;

    Object.values(selectedMeals).forEach((flightMeals) => {
      Object.values(flightMeals || {}).forEach((meal) => {
        if (meal?.Price) ssrTotal += Number(meal.Price);
      });
    });

    Object.values(selectedBaggage).forEach((flightBags) => {
      Object.values(flightBags || {}).forEach((bag) => {
        if (bag?.Price) ssrTotal += Number(bag.Price);
      });
    });

    Object.values(selectedSeats).forEach((flightSeats) => {
      Object.values(flightSeats || {}).forEach((seat) => {
        if (seat?.Price) ssrTotal += Number(seat.Price);
      });
    });

    return ssrTotal;
  };

  // ✅ UPDATED: Calculate total amount including everything - ACTUAL PAYMENT AMOUNT
  const calculateTotalAmount = () => {
    const { baseFare, commissionAmount, gstAmount, otherTaxes } =
      calculateTotalFareBreakdown();

    // ✅ START: Payment Amount = Net Fare + Commission + GST + Other Taxes
    const flightPaymentAmount =
      baseFare + commissionAmount + gstAmount + (otherTaxes || 0);

    let finalTotal = flightPaymentAmount;

    // ✅ Add SSR charges
    const ssrCharges = calculateSSRCharges();
    finalTotal += ssrCharges;

    // ✅ Add insurance
    if (selectedInsurancePlan) {
      const passengerCount = getPassengerCount();
      const totalPassengers = passengerCount.adults + passengerCount.children;

      finalTotal +=
        (selectedInsurancePlan.Pricing?.finalAmount || 0) * totalPassengers;
    }

    // ✅ Apply coupon discount
    if (appliedCoupon) {
      finalTotal = Math.max(0, finalTotal - appliedCoupon.discount);
    }

    return finalTotal;
  };

  // ✅ NEW: Calculate Net Fare + Commission only (for display on proceed button)
  const calculateNetFarePlusCommission = () => {
    const fareBreakdown = calculateTotalFareBreakdown();
    // सिर्फ Net Fare + Commission
    return fareBreakdown.baseFare + fareBreakdown.commissionAmount;
  };

  // ✅ Get passenger count
  const getPassengerCount = () => {
    return (
      state?.passengerCount || {
        adults: 1,
        children: 0,
        infants: 0,
      }
    );
  };

  // ✅ Handle back to flights
  const handleBackToFlights = () => {
    navigate(-1);
  };

  // ✅ Handle passenger input change
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  // ✅ Handle contact details change
  const handleContactChange = (field, value) => {
    if (field === "email") {
      setContactEmail(value);
    }

    if (field === "mobile") {
      setContactMobile(value);
    }
  };

  const buildPerPassengerFare = (fareDetail) => {
    if (!fareDetail?.FareBreakdown) return [];

    return fareDetail.FareBreakdown.map((fb) => ({
      PaxType: fb.PassengerType, // 1=Adult, 2=Child, 3=Infant
      BaseFare: fb.BaseFare / fb.PassengerCount,
      Tax: fb.Tax / fb.PassengerCount,
    }));
  };

  const buildPassengersForJourney = (fareDetail) => {
    const paxFareList = buildPerPassengerFare(fareDetail);

    return passengers.map((pax) => {
      const fare = paxFareList.find((f) => f.PaxType === pax.paxType);
      const isLead = pax.isLeadPax === true;
      const shouldSendGST =
        isLead && fieldRequirements.gst && gstDetails?.gstNumber;
      return {
        Title: pax.title,
        FirstName: pax.firstName,
        LastName: pax.lastName,
        PaxType: pax.paxType,
        DateOfBirth: pax.dateOfBirth
          ? new Date(pax.dateOfBirth).toISOString()
          : null,
        Gender: Number(pax.gender),
        PassportNo: pax.passportNumber || null,
        PassportExpiry: pax.passportExpiry
          ? new Date(pax.passportExpiry).toISOString()
          : null,
        AddressLine1: pax.addressLine1,
        City: pax.city,
        CountryCode: pax.countryCode,
        ContactNo: pax.contactNo,
        Nationality: pax.nationality,
        Email: pax.email,
        IsLeadPax: pax.isLeadPax,
        Fare: {
          Currency: "INR",
          BaseFare: Number(fare?.BaseFare?.toFixed(2) || 0),
          Tax: Number(fare?.Tax?.toFixed(2) || 0),
        },
        ...(shouldSendGST
          ? {
              GSTNumber: gstDetails.gstNumber,
              GSTCompanyName: gstDetails.companyName,
              GSTCompanyAddress: gstDetails.companyAddress,
              GSTCompanyEmail: gstDetails.companyEmail,
              GSTCompanyContactNumber: pax.contactNo,
            }
          : {}),
      };
    });
  };

  const buildJourneysPayload = () => {
    return selectedFlights.map((flight, index) => {
      const fareDetail = fareDetailsArray[index];

      return {
        // journeyType: index === 0 ? "OB" : "IB",
        journeyType:
          state?.tripType === "round" ? (index === 0 ? "OB" : "IB") : "MC",
        ResultIndex: flight.ResultIndex,
        Passengers: buildPassengersForJourney(fareDetail),
      };
    });
  };

  // ✅ NEW: Build FarePerResultIndex (CRITICAL for return journey)
  const buildFarePerResultIndex = () => {
    const fareMap = {};

    fareDetailsArray.forEach((fareDetail) => {
      const resultIndex = fareDetail.ResultIndex;

      const paxTypeWise = {};
      let totalBaseFare = 0;
      let totalTax = 0;

      fareDetail.FareBreakdown?.forEach((fb) => {
        const paxType = fb.PassengerType;
        const count = fb.PassengerCount || 1;

        const baseFarePerPax = fb.BaseFare / count;
        const taxPerPax = fb.Tax / count;

        paxTypeWise[paxType] = {
          BaseFare: Number(baseFarePerPax.toFixed(2)),
          Tax: Number(taxPerPax.toFixed(2)),
        };

        totalBaseFare += fb.BaseFare;
        totalTax += fb.Tax;
      });

      fareMap[resultIndex] = {
        paxTypeWise,
        total: {
          BaseFare: Number(totalBaseFare.toFixed(2)),
          Tax: Number(totalTax.toFixed(2)),
        },
      };
    });

    return fareMap;
  };

  // ✅ Build complete booking payload for multiple flights
  const buildFlightBookingPayload = async () => {
    const fareBreakdown = calculateTotalFareBreakdown();

    const insurancePremium = selectedInsurancePlan
      ? selectedInsurancePlan.Premium *
        (getPassengerCount().adults + getPassengerCount().children)
      : 0;

    return {
      EndUserIp: "127.0.0.1",
      TraceId: searchData?.TraceId,
      Contact: {
        Email: contactEmail,
        Mobile: contactMobile,
      },
      journeys: buildJourneysPayload(),
      SSR: {
        Meal: selectedMeals,
        Baggage: selectedBaggage,
        Seat: selectedSeats,
      },
      isLCC: fareRules?.isLCC,

      InsuranceRequired: !!selectedInsurancePlan,
      // InsuranceData: selectedInsurancePlan || null,
      InsuranceData: selectedInsurancePlan
        ? {
            ResultIndex: selectedInsurancePlan.ResultIndex,
            premiumAmount: selectedInsurancePlan.VendorPrice,
            totalAmount: selectedInsurancePlan.Pricing.finalAmount,
          }
        : null,
      InsuranceTraceid: insuranceTraceId || null,
      TripType: state?.tripType || searchData?.tripType || "oneway",
      TravelClass: state?.travelClass || searchData?.travelClass || "Economy",

      PricingBreakdown: {
        ...fareBreakdown,
        insurancePremium,
        totalAmount: calculateTotalAmount(),
      },
    };
  };

  // ✅ Handle confirm passengers
  const handleConfirmPassengers = async () => {
    setConfirmingPassengers(true);

    // 🔐 LOGIN CHECK (NEW)
    const loggedIn = await isUserLoggedIn();
    if (!loggedIn) {
      setConfirmingPassengers(false);

      alert("Please login to continue booking");

      return;
    }

    const isValid = validatePassengers();
    if (!isValid) {
      setConfirmingPassengers(false); // 🔥 REQUIRED
      return;
    }

    setPassengerConfirmed(true);
    setConfirmingPassengers(false);
  };

  const handleProceedToPayment = async () => {
    // 🚫 passenger confirmation already enforced by button disable

    setShowConfirmModal(true);
    setLoading(true); // this loading is NOW modal-loading

    try {
      console.log("🔁 Rechecking fare before payment...");
      await recheckFareBeforePayment();
    } catch (error) {
      console.error(error);
      alert("Unable to recheck fare. Please try again.");
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle confirm and pay
  const handleConfirmAndPay = async () => {
    try {
      setLoading(true);
      const userdetails = await getUserData("safarix_user");

      // Build final flight booking payload
      const flightBookingPayload = await buildFlightBookingPayload();
      const startDate =
        fareDetailsArray?.[0]?.Segments?.[0]?.[0]?.Origin?.DepTime || null;
      const bookingDetails = {
        userId: userdetails?.id,
        serviceType: "flight",
        startDate,
        totalAmount: newTotal,
        serviceDetails: flightBookingPayload,

        insuranceSelected: !!selectedInsurancePlan,
        insurancePlan: selectedInsurancePlan || null,
      };
      console.log("✅ FINAL BOOKING DETAILS FOR PAYMENT:", bookingDetails);
      console.log("✅ ACTUAL PAYMENT AMOUNT (INCLUDES EVERYTHING):", newTotal);

      await startPayment(bookingDetails);
    } catch (error) {
      console.error("Confirm & Pay failed", error);
      alert("Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
      setShowConfirmModal(false);
    }
  };

  // ✅ Render flight segment card
  const renderFlightSegment = (flight, index) => {
    const flightInfo = extractFlightInfo(flight);
    const selectedFare = selectedFares[index];
    const fareDetail = fareDetailsArray[index];

    return (
      <Card key={index} className="mb-3">
        <Card.Header>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h5 className="mb-1">
                Flight {index + 1}: {flightInfo.origin.city} (
                {flightInfo.origin.code}) → {flightInfo.destination.city} (
                {flightInfo.destination.code})
              </h5>
              <small className="text-muted">
                {formatDate(flightInfo.origin.time)} • {flightInfo.airline.name}{" "}
                • Flight {flightInfo.airline.flightNumber}
              </small>
            </div>
            <Badge bg="info">Segment {index + 1}</Badge>
          </div>
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={6}>
              <div className="text-center mb-3">
                <div className="fs-4 fw-bold">
                  {formatTime(flightInfo.origin.time)}
                </div>
                <div className="fw-bold text-primary">
                  {flightInfo.origin.code}
                </div>
                <small className="text-muted">{flightInfo.origin.city}</small>
              </div>
            </Col>
            <Col md={6}>
              <div className="text-center mb-3">
                <div className="fs-4 fw-bold">
                  {formatTime(flightInfo.destination.time)}
                </div>
                <div className="fw-bold text-primary">
                  {flightInfo.destination.code}
                </div>
                <small className="text-muted">
                  {flightInfo.destination.city}
                </small>
              </div>
            </Col>
          </Row>
          <div className="text-center">
            <small className="text-muted">
              Duration: {flightInfo.flight.duration} • {flightInfo.flight.stops}{" "}
              stop(s)
            </small>
          </div>

          {selectedFare && (
            <div className="mt-3 p-2 bg-light rounded">
              <div className="d-flex justify-content-between">
                <span>Selected Fare:</span>
                <span className="fw-bold">{selectedFare.type}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span>Price per adult:</span>
                <span className="fw-bold text-success">
                  ₹{selectedFare.price || selectedFare.originalPrice}
                </span>
              </div>
              {!selectedFare.isRefundable && (
                <div className="text-danger small mt-1">🚫 Non-refundable</div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
    );
  };

  // ✅ Format price with commas
  const formatPrice = (price) => {
    return (
      price?.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) || "0.00"
    );
  };

  const renderFareBreakdown = ({ expanded = false }) => {
    const fareBreakdown = calculateTotalFareBreakdown();
    const ssrTotal = calculateSSRCharges();
    const totalAmount = calculateTotalAmount();

    const passengerCount = getPassengerCount();

    const insuranceAmount = selectedInsurancePlan
      ? selectedInsurancePlan.Pricing.finalAmount *
        (passengerCount.adults + passengerCount.children)
      : 0;

    const taxes =
      fareBreakdown.commissionAmount +
      fareBreakdown.gstAmount +
      (fareBreakdown.otherTaxes || 0);

    return (
      <div className="fare-breakdown mb-3">
        <div className="d-flex justify-content-between">
          <span>Base Fare</span>
          <span>₹ {formatPrice(fareBreakdown.baseFare)}</span>
        </div>

        <div className="d-flex justify-content-between">
          <span>Taxes & Fees</span>
          <span>₹ {formatPrice(taxes)}</span>
        </div>

        {ssrTotal > 0 && (
          <div className="d-flex justify-content-between">
            <span>Seats / Meals / Baggage</span>
            <span>₹ {formatPrice(ssrTotal)}</span>
          </div>
        )}

        {insuranceAmount > 0 && (
          <div className="d-flex justify-content-between">
            <span>Travel Insurance</span>
            <span>₹ {formatPrice(insuranceAmount)}</span>
          </div>
        )}

        {expanded && (
          <>
            <hr />
            <small className="text-muted">
              Includes airline charges, convenience fee, and GST where
              applicable.
            </small>
          </>
        )}

        <hr />

        <div className="d-flex justify-content-between fw-bold">
          <span>Total Amount</span>
          <span>₹ {formatPrice(totalAmount)}</span>
        </div>
      </div>
    );
  };

  // ✅ Helper function to get airline group based on airline code (for NDC and SpiceJet only)
  const getAirlineGroup = (airlineCode) => {
    if (!airlineCode) return "Other";

    const code = airlineCode.toUpperCase();

    // NDC Airlines list
    const ndcAirlines = [
      "AI",
      "6E",
      "SG",
      "G8",
      "UK",
      "TR",
      "SJ",
      "AK",
      "FD",
      "XJ",
      "VTI",
      "IT",
      "I5",
      "LY",
      "W9",
      "CP",
      "ST",
      "VT",
      "2T",
      "DN",
    ];

    // Spice Jet
    const spiceJetCodes = ["SG", "SPICEJET"];

    // Check if NDC airline
    if (ndcAirlines.includes(code)) {
      return "NDC";
    }

    // Check if Spice Jet
    if (spiceJetCodes.includes(code)) {
      return "SpiceJet";
    }

    // For other airlines, return Other
    return "Other";
  };

  // ✅ Helper function to get airline code from selected flight
  const getAirlineCodeFromSelectedFlight = () => {
    if (!selectedFlights || selectedFlights.length === 0) return "";

    // Get the first selected flight
    const firstFlight = selectedFlights[0];
    if (!firstFlight) return "";

    // Try different possible locations for airline code
    if (firstFlight.Airline && firstFlight.Airline.AirlineCode) {
      return firstFlight.Airline.AirlineCode;
    }

    if (firstFlight.Segments && firstFlight.Segments[0]) {
      const segment = Array.isArray(firstFlight.Segments[0])
        ? firstFlight.Segments[0][0]
        : firstFlight.Segments[0];

      if (segment && segment.Airline && segment.Airline.AirlineCode) {
        return segment.Airline.AirlineCode;
      }
    }

    return "";
  };

  const getLastTravelDate = () => {
    if (!fareDetailsArray || fareDetailsArray.length === 0) return null;

    const lastFare = fareDetailsArray[fareDetailsArray.length - 1];
    const lastSegment = lastFare?.Segments?.[0]?.slice(-1)?.[0];

    return lastSegment?.Destination?.ArrTime
      ? new Date(lastSegment.Destination.ArrTime)
      : null;
  };

  // ✅ Updated validation function with only NDC and SpiceJet rules
  const validatePassengers = () => {
    const airlineCode = getAirlineCodeFromSelectedFlight();

    // ✅ Title rules from docs
    const ALL_SOURCE_TITLES = [
      "MR",
      "MSTR",
      "MRS",
      "MS",
      "MISS",
      "MASTER",
      "DR",
      "CHD",
      "MST",
      "PROF",
      "INF",
    ];

    const TRUEJET_ADULT_TITLES = ["MR", "MRS", "MS"];
    const TRUEJET_CHILD_TITLES = ["MISS", "MSTR"];

    const isTrueJet = airlineCode === "TR" || airlineCode === "TRUEJET";

    const travelDate = getLastTravelDate();

    if (!travelDate) {
      alert("Unable to verify travel date. Please try again.");
      return false;
    }

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];

      // ✅ Basic required fields
      if (
        !p.title ||
        !p.firstName ||
        !p.lastName ||
        !p.dateOfBirth ||
        !p.gender ||
        !p.contactNo ||
        !p.addressLine1 ||
        !p.city ||
        !p.countryCode
      ) {
        alert(`Please fill all required details for ${p.type} ${i + 1}`);
        return false;
      }

      // ✅ Email validation (ONLY IF PROVIDED)
      if (p.email && !/^\S+@\S+\.\S+$/.test(p.email)) {
        alert(`Invalid email for ${p.type} ${i + 1}`);
        return false;
      }

      if (p.contactNo.length < 8) {
        alert(`Invalid contact number for ${p.type} ${i + 1}`);
        return false;
      }

      // ✅ Name validation (simple & safe)
      if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(p.firstName.trim())) {
        alert(`Invalid first name for ${p.type} ${i + 1}`);
        return false;
      }

      if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(p.lastName.trim())) {
        alert(`Invalid last name for ${p.type} ${i + 1}`);
        return false;
      }

      if (!p.firstName && p.lastName) {
        p.firstName = p.lastName;
      }

      if (fieldRequirements.passport) {
        if (!p.passportNumber || !p.passportExpiry) {
          alert(`Passport required for ${p.type} ${i + 1}`);
          return false;
        }

        const expiry = new Date(p.passportExpiry);
        if (expiry <= travelDate) {
          alert(`Passport expired for ${p.type} ${i + 1}`);
          return false;
        }
      }

      // ✅ Title validation (WITH DEFAULT CASE)
      const title = p.title.toUpperCase();
      let isValidTitle = false;

      switch (true) {
        case isTrueJet && p.paxType === 1:
          isValidTitle = TRUEJET_ADULT_TITLES.includes(title);
          break;

        case isTrueJet && p.paxType === 2:
          isValidTitle = TRUEJET_CHILD_TITLES.includes(title);
          break;

        case p.paxType === 3:
          isValidTitle = title === "INF";
          break;

        default:
          isValidTitle = ALL_SOURCE_TITLES.includes(title);
      }

      if (!isValidTitle) {
        alert(`Invalid title for ${p.type} ${i + 1}`);
        return false;
      }
      const age = calculateAge(p.dateOfBirth);
      if (p.paxType === 3 && age >= 2) {
        alert("Infant age must be below 2 years");
        return false;
      }

      if (p.paxType === 2 && (age < 2 || age >= 12)) {
        alert("Child age must be between 2 and 12 years");
        return false;
      }
    }
    if (fieldRequirements.gst.allowed && fieldRequirements.gst.mandatory) {
      if (
        !gstDetails.gstNumber ||
        !gstDetails.companyName ||
        !gstDetails.companyAddress
      ) {
        alert("GST details are mandatory for this booking");
        return false;
      }

      if (
        gstDetails.companyEmail &&
        !/^\S+@\S+\.\S+$/.test(gstDetails.companyEmail)
      ) {
        alert("Invalid GST company email");
        return false;
      }
    }

    return true;
  };

  const passengerCount = getPassengerCount();
  const totalAmount = calculateTotalAmount();
  const netFarePlusCommission = calculateNetFarePlusCommission();

  const seatRows =
    ssrDataArray?.[activeFlightIndex]?.seats?.filter(
      (row) => row.Seats?.[0]?.Code !== "NoSeat",
    ) || [];

  const seatSummaryByFlight = selectedFlights
    .map((_, flightIndex) => {
      const flightSeats = selectedSeats[flightIndex];
      if (!flightSeats) return null;

      const info = extractFlightInfo(selectedFlights[flightIndex]);

      const seatLines = seatEligiblePassengers
        .map((pax, i) => {
          const seat = flightSeats[i];
          if (!seat) return null;
          return {
            label: `${pax.type} ${i + 1}`,
            seat: seat.Code,
          };
        })
        .filter(Boolean);

      if (seatLines.length === 0) return null;

      return {
        route: `${info.origin.code} → ${info.destination.code}`,
        seats: seatLines,
      };
    })
    .filter(Boolean);

  const isSeatCompleteForFlight = (flightIndex) => {
    return (
      Object.keys(selectedSeats[flightIndex] || {}).length === requiredSeatCount
    );
  };

  const baggageSummaryByFlight = selectedFlights
    .map((_, flightIndex) => {
      const bags = selectedBaggage[flightIndex];
      if (!bags) return null;

      const info = extractFlightInfo(selectedFlights[flightIndex]);

      const lines = seatEligiblePassengers
        .map((pax, i) => {
          const bag = bags[i];
          if (!bag) return null;
          return `${pax.type} ${i + 1} → ${bag.Weight}Kg`;
        })
        .filter(Boolean);

      if (!lines.length) return null;

      return {
        route: `${info.origin.code} → ${info.destination.code}`,
        items: lines,
      };
    })
    .filter(Boolean);

  const fieldRequirements = {
    passport: Boolean(
      fareRules?.passport?.requiredAtBook ||
      fareRules?.passport?.requiredAtTicket,
    ),

    passportExpiry: Boolean(
      fareRules?.passport?.requiredAtBook ||
      fareRules?.passport?.requiredAtTicket,
    ),

    nationality: Boolean(
      fareRules?.passport?.fullDetailRequired ||
      fareRules?.passport?.requiredAtTicket,
    ),

    pan: Boolean(
      fareRules?.pan?.requiredAtBook || fareRules?.pan?.requiredAtTicket,
    ),

    gst: {
      allowed: Boolean(fareRules?.gst?.allowed),
      mandatory: Boolean(fareRules?.gst?.mandatory),
    },
  };

  return (
    <>
      {loading && (
        <Alert variant="info" className="text-center">
          <Spinner animation="border" size="sm" className="me-2" />
          Fetching accurate fare details from airline…
        </Alert>
      )}

      <Container
        className="flight-checkout-container py-4"
        style={{ marginTop: "100px" }}
      >
        <Row>
          <Col lg={8}>
            {/* Trip Summary */}
            <Card className="mb-4 shadow-sm">
              <Card.Header>
                <h4 className="mb-0">Trip Summary</h4>
              </Card.Header>
              <Card.Body>
                {selectedFlights.map((flight, index) =>
                  renderFlightSegment(flight, index),
                )}
              </Card.Body>
            </Card>

            {/* Passenger Details Section */}
            <Card className="mb-4 shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Passenger Details</h5>
                  {passengerConfirmed && (
                    <small className="text-success">✔ Details confirmed</small>
                  )}
                </div>

                {passengerConfirmed && (
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={() => {
                      setPassengerConfirmed(false);
                      setActiveSection("PASSENGER");
                    }}
                  >
                    Edit
                  </Button>
                )}
              </Card.Header>

              <Card.Body>
                {!passengerConfirmed && (
                  <>
                    {" "}
                    {passengers.map((passenger, index) => (
                      <div
                        key={passenger.id}
                        className="passenger-form-section mb-4 p-3 border rounded"
                      >
                        <h6 className="mb-3">
                          {passenger.type} {index + 1}
                          {passenger.isLeadPax && (
                            <Badge bg="info" className="ms-2">
                              Lead Passenger
                            </Badge>
                          )}
                        </h6>

                        <Row>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Title *</Form.Label>
                              <Form.Select
                                value={passenger.title}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "title",
                                    e.target.value,
                                  )
                                }
                                required
                              >
                                <option value="">Select</option>

                                {passenger.paxType === 1 && (
                                  <>
                                    <option value="Mr">Mr</option>
                                    <option value="Mrs">Mrs</option>
                                    <option value="Ms">Ms</option>
                                    <option value="DR">DR</option>
                                    <option value="PROF">PROF</option>
                                  </>
                                )}

                                {passenger.paxType === 2 && (
                                  <>
                                    <option value="Miss">Miss</option>
                                    <option value="Mstr">Mstr</option>
                                    <option value="Master">Master</option>
                                    <option value="CHD">CHD</option>
                                  </>
                                )}

                                {passenger.paxType === 3 && (
                                  <option value="Inf">Inf</option>
                                )}
                              </Form.Select>
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>First Name *</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter first name"
                                value={passenger.firstName}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "firstName",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={4}>
                            <Form.Group className="mb-3">
                              <Form.Label>Last Name *</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter last name"
                                value={passenger.lastName}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "lastName",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Date of Birth *</Form.Label>
                              <Form.Control
                                type="date"
                                value={passenger.dateOfBirth}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "dateOfBirth",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Gender *</Form.Label>
                              <Form.Select
                                value={passenger.gender}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "gender",
                                    e.target.value,
                                  )
                                }
                                required
                              >
                                <option value="">Select</option>
                                <option value="1">Male</option>
                                <option value="2">Female</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            {fieldRequirements.passport && (
                              <Form.Group className="mb-3">
                                <Form.Label>Passport Number *</Form.Label>
                                <Form.Control
                                  type="text"
                                  placeholder="Enter passport number"
                                  value={passenger.passportNumber}
                                  onChange={(e) =>
                                    handlePassengerChange(
                                      index,
                                      "passportNumber",
                                      e.target.value,
                                    )
                                  }
                                  required
                                />
                              </Form.Group>
                            )}
                          </Col>
                          <Col md={6}>
                            {fieldRequirements.passportExpiry && (
                              <Form.Group className="mb-3">
                                <Form.Label>Passport Expiry Date *</Form.Label>
                                <Form.Control
                                  type="date"
                                  value={passenger.passportExpiry}
                                  min={new Date().toISOString().split("T")[0]}
                                  onChange={(e) =>
                                    handlePassengerChange(
                                      index,
                                      "passportExpiry",
                                      e.target.value,
                                    )
                                  }
                                  required
                                />
                              </Form.Group>
                            )}
                          </Col>
                        </Row>

                        <Row>
                          {fieldRequirements.nationality && (
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Nationality *</Form.Label>
                                <Form.Select
                                  value={passenger.nationality}
                                  onChange={(e) =>
                                    handlePassengerChange(
                                      index,
                                      "nationality",
                                      e.target.value,
                                    )
                                  }
                                  required
                                >
                                  <option value="IN">India</option>
                                  <option value="US">United States</option>
                                  <option value="UK">United Kingdom</option>
                                  <option value="AE">UAE</option>
                                  <option value="SG">Singapore</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                          )}

                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Contact Number *</Form.Label>
                              <Form.Control
                                type="tel"
                                placeholder="Enter contact number"
                                value={passenger.contactNo}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "contactNo",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Address Line 1 *</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter address"
                                value={passenger.addressLine1}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "addressLine1",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>City *</Form.Label>
                              <Form.Control
                                type="text"
                                placeholder="Enter city"
                                value={passenger.city}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "city",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Country *</Form.Label>
                              <Form.Select
                                value={passenger.countryCode}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "countryCode",
                                    e.target.value,
                                  )
                                }
                                required
                              >
                                <option value="IN">India</option>
                                <option value="US">United States</option>
                                <option value="UK">United Kingdom</option>
                              </Form.Select>
                            </Form.Group>
                          </Col>
                        </Row>

                        <Row>
                          <Col md={12}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email Address *</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="Enter email address"
                                value={passenger.email}
                                onChange={(e) =>
                                  handlePassengerChange(
                                    index,
                                    "email",
                                    e.target.value,
                                  )
                                }
                                required
                              />
                            </Form.Group>
                          </Col>
                        </Row>
                      </div>
                    ))}
                    {/* Contact Details */}
                    <Card className="shadow-sm">
                      <Card.Header className="d-flex justify-content-between align-items-center">
                        <div>
                          <h5 className="mb-0">Contact Details</h5>
                          <small className="text-muted">
                            This will be used for booking confirmation
                          </small>
                        </div>
                      </Card.Header>

                      <Card.Body>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Email Address *</Form.Label>
                              <Form.Control
                                type="email"
                                placeholder="Enter email"
                                value={contactEmail}
                                onChange={(e) =>
                                  handleContactChange("email", e.target.value)
                                }
                                required
                              />
                            </Form.Group>
                          </Col>

                          {/* <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>Mobile Number *</Form.Label>
                              <Form.Control
                                type="tel"
                                placeholder="Enter mobile number"
                                value={contactMobile}
                                onChange={(e) =>
                                  handleContactChange("mobile", e.target.value)
                                }
                                required
                              />
                              <Form.Text className="text-muted">
                                Important updates will be sent via SMS
                              </Form.Text>
                            </Form.Group>
                          </Col> */}
                        </Row>
                      </Card.Body>
                    </Card>
                    {fieldRequirements.gst.allowed && (
                      <Card className="mt-4 shadow-sm">
                        <Card.Header>
                          <h5 className="mb-0">
                            GST Details{" "}
                            {!fieldRequirements.gst.mandatory && (
                              <small className="text-muted">(Optional)</small>
                            )}
                          </h5>
                        </Card.Header>

                        <Card.Body>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>
                                  GST Number{" "}
                                  {fieldRequirements.gst.mandatory && "*"}
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  value={gstDetails.gstNumber}
                                  onChange={(e) =>
                                    setGstDetails({
                                      ...gstDetails,
                                      gstNumber: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Company Name</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={gstDetails.companyName}
                                  onChange={(e) =>
                                    setGstDetails({
                                      ...gstDetails,
                                      companyName: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Company Email</Form.Label>
                                <Form.Control
                                  type="email"
                                  value={gstDetails.companyEmail}
                                  onChange={(e) =>
                                    setGstDetails({
                                      ...gstDetails,
                                      companyEmail: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label>Company Address</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={gstDetails.companyAddress}
                                  onChange={(e) =>
                                    setGstDetails({
                                      ...gstDetails,
                                      companyAddress: e.target.value,
                                    })
                                  }
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}
                    <div className="text-end mt-3">
                      <Button
                        variant="primary"
                        disabled={loading}
                        onClick={() => {
                          const isValid = validatePassengers();
                          if (!isValid) return;

                          handleConfirmPassengers(); // ✅ sirf tab chalega jab sab filled ho
                        }}
                      >
                        {confirmingPassengers
                          ? "Confirming..."
                          : "Confirm Passenger"}
                      </Button>
                    </div>
                  </>
                )}

                {/* 🔹 SHOW SUMMARY AFTER CONFIRM */}
                {passengerConfirmed && (
                  <Alert variant="success" className="mb-0">
                    <strong>Passenger details confirmed.</strong>
                    <div className="mt-2 small text-muted">
                      {passengers.map((p, i) => (
                        <div key={i}>
                          {i + 1}. {p.title} {p.firstName} {p.lastName} (
                          {p.type})
                        </div>
                      ))}
                    </div>
                  </Alert>
                )}
              </Card.Body>
            </Card>

            {/* Baggage card */}
            <Card className="mb-3">
              <Card.Header
                onClick={() => {
                  if (isPassengerLocked) {
                    alert("Please confirm passenger details first");
                    return;
                  }
                  // 🔥 ensure save before close
                  if (expandedSSR.baggage) {
                    const baggageMap = {};
                    seatEligiblePassengers.forEach((_, index) => {
                      baggageMap[index] = selectedBaggageList[index] || null;
                    });

                    setSelectedBaggage((prev) => ({
                      ...prev,
                      [activeFlightIndex]: baggageMap,
                    }));
                  }

                  if (
                    !expandedSSR.baggage &&
                    selectedBaggageList.length === 0
                  ) {
                    setSelectedBaggageList(
                      Object.values(selectedBaggage[activeFlightIndex] || {}),
                    );
                  }

                  toggleSSR("baggage");
                }}
                className="d-flex justify-content-between cursor-pointer"
              >
                <strong>Baggage</strong>
                <span className="text-end">
                  {selectedBaggageList.length > 0 ? (
                    <>
                      <Badge bg="success" className="me-2">
                        ✓
                      </Badge>

                      <small className="text-muted d-block">
                        {selectedBaggageList.length} of {requiredSeatCount}{" "}
                        selected
                      </small>

                      <div
                        className="mt-1 text-primary"
                        style={{ fontSize: "12px" }}
                      >
                        {baggageSummaryByFlight.map((f, idx) => (
                          <div key={idx}>
                            <div className="fw-semibold">{f.route}</div>
                            {f.items.map((t, i) => (
                              <div key={i} className="ms-2 text-muted">
                                • {t}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <small className="text-muted">Select</small>
                  )}
                </span>
              </Card.Header>

              {expandedSSR.baggage && (
                <Card.Body>
                  {/* 🔁 FLIGHT SWITCHER (ADD HERE) */}
                  <div className="d-flex gap-2 mb-2">
                    {selectedFlights.map((flight, index) => {
                      const info = extractFlightInfo(flight);
                      const completed =
                        Object.keys(selectedBaggage[index] || {}).length ===
                        requiredSeatCount;

                      return (
                        <Button
                          key={index}
                          size="sm"
                          variant={
                            activeFlightIndex === index
                              ? "primary"
                              : "outline-primary"
                          }
                          onClick={() => {
                            setActiveFlightIndex(index);
                            setSelectedBaggageList(
                              Object.values(selectedBaggage[index] || {}),
                            );
                          }}
                        >
                          {info.origin.code} → {info.destination.code}{" "}
                          {completed ? "✓" : "✗"}
                        </Button>
                      );
                    })}
                  </div>

                  {/* 🔹 PROGRESS INDICATOR */}
                  <div className="mb-3">
                    <small className="text-muted">
                      {selectedBaggageList.length} of {requiredSeatCount}{" "}
                      baggage selected
                    </small>

                    <div className="progress mt-1" style={{ height: "6px" }}>
                      <div
                        className="progress-bar"
                        style={{
                          width: `${
                            (selectedBaggageList.length / requiredSeatCount) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  {selectedBaggageList.length > 0 && (
                    <div className="d-flex justify-content-end mb-3">
                      <Button
                        size="sm"
                        variant="outline-danger"
                        onClick={() => setSelectedBaggageList([])}
                      >
                        Clear baggage
                      </Button>
                    </div>
                  )}

                  {ssrDataArray[activeFlightIndex]?.baggage?.map((bag, i) => {
                    const isSelected = selectedBaggageList.some(
                      (b) => b.Code === bag.Code,
                    );

                    return (
                      <div
                        key={i}
                        className={`ssr-option p-3 mb-2 rounded border ${
                          isSelected ? "border-primary bg-light" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setSelectedBaggageList((prev) => {
                            const existsIndex = prev.findIndex(
                              (b) => b.Code === bag.Code,
                            );

                            // 🔁 CASE 1: deselect if same clicked again
                            if (existsIndex !== -1) {
                              const copy = [...prev];
                              copy.splice(existsIndex, 1);
                              return copy;
                            }

                            // ➕ CASE 2: space available
                            if (prev.length < requiredSeatCount) {
                              return [...prev, bag];
                            }

                            // 🔄 CASE 3: replace (IMPORTANT FIX)
                            return [bag];
                          });
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{bag.Weight} Kg Extra</strong>
                            <div className="small text-muted">
                              For one passenger
                            </div>
                          </div>

                          <div className="text-end">
                            <strong>₹ {bag.Price}</strong>
                            {isSelected && (
                              <div className="text-success small fw-semibold">
                                ✓ Selected
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </Card.Body>
              )}
            </Card>

            {/* Meal card */}
            <Card className="mb-3">
              <Card.Header
                onClick={() => {
                  if (isPassengerLocked) {
                    alert("Please confirm passenger details first");
                    return;
                  }
                  setSelectedMealList([]);
                  toggleSSR("meal");
                }}
                className="d-flex justify-content-between cursor-pointer"
              >
                <strong>Meals</strong>
                <span>
                  {selectedMealList.length > 0 ? (
                    <>
                      <Badge bg="success" className="me-2">
                        ✓
                      </Badge>
                      <small className="text-muted">
                        {selectedMealList.length} of {requiredSeatCount}{" "}
                        selected
                      </small>
                    </>
                  ) : (
                    <small className="text-muted">Select</small>
                  )}
                </span>
              </Card.Header>

              {expandedSSR.meal && (
                <Card.Body>
                  {ssrDataArray[activeFlightIndex]?.meals?.map((meal, i) => (
                    <div
                      key={i}
                      className="ssr-option"
                      onClick={() => {
                        if (selectedMealList.length >= requiredSeatCount)
                          return;

                        setSelectedMealList((prev) => [...prev, meal]);
                      }}
                    >
                      <div className="d-flex justify-content-between">
                        <span>{meal.Description}</span>
                        <strong>₹ {meal.Price}</strong>
                      </div>
                    </div>
                  ))}
                </Card.Body>
              )}
            </Card>

            {/* Seat card */}
            <Card className="mb-3">
              <Card.Header
                onClick={() => {
                  if (isPassengerLocked) {
                    alert("Please confirm passenger details first");
                    return;
                  }
                  setSelectedSeatList(
                    Object.values(selectedSeats[activeFlightIndex] || {}),
                  );
                  setShowSeatModal(true);
                }}
                className="d-flex justify-content-between align-items-center cursor-pointer"
              >
                <strong>Seats</strong>

                <span className="text-end">
                  {Object.keys(selectedSeats[activeFlightIndex] || {}).length >
                  0 ? (
                    <>
                      <Badge bg="success" className="me-2">
                        ✓
                      </Badge>

                      <small className="text-muted d-block">
                        {
                          Object.keys(selectedSeats[activeFlightIndex] || {})
                            .length
                        }{" "}
                        seat(s) selected
                      </small>

                      <div
                        className="mt-1 text-primary"
                        style={{ fontSize: "12px" }}
                      >
                        {seatSummaryByFlight.map((flight, idx) => (
                          <div key={idx} className="mb-1">
                            <div className="fw-semibold">{flight.route}</div>

                            {flight.seats.map((s, i) => (
                              <div key={i} className="ms-2 text-muted">
                                • {s.label} → {s.seat}
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <small className="text-muted">Select</small>
                  )}
                </span>
              </Card.Header>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Fare Summary */}
            <Card className="sticky-top shadow-sm" style={{ top: "20px" }}>
              <Card.Header className="fare-summary-header">
                <h5 className="mb-0">Fare Summary</h5>

                {fareSource === "fareQuote" && (
                  <small className="text-success d-block mt-1">
                    🔒 Fare locked by airline
                  </small>
                )}
              </Card.Header>

              <Card.Body>
                {fareSource === "search" && (
                  <Alert variant="secondary" className="text-center">
                    Prices shown are <strong>estimated</strong>. Final price
                    will be confirmed before payment.
                  </Alert>
                )}

                {fareDetailsArray.length > 0 && (
                  <>
                    {renderFareBreakdown({ expanded: false })}

                    {/* Insurance Section */}
                    <div className="insurance-section mb-3 p-3 border rounded">
                      <h6 className="mb-3">Travel Insurance</h6>

                      {insuranceLoading ? (
                        <div className="text-center py-2">
                          <Spinner animation="border" size="sm" />
                          <small className="d-block mt-2">
                            Checking available insurance plans...
                          </small>
                        </div>
                      ) : insuranceError ? (
                        <Alert variant="warning" className="mb-2 py-2">
                          <small>{insuranceError}</small>
                          <div className="mt-2">
                            <Button
                              variant="outline-primary"
                              size="sm"
                              onClick={() => setSelectedInsurancePlan(null)}
                            >
                              Continue without insurance
                            </Button>
                          </div>
                        </Alert>
                      ) : null}

                      {insuranceData?.length > 0 && (
                        <>
                          <div className="insurance-plans mb-3">
                            {insuranceData.map((plan, index) => (
                              <div
                                key={index}
                                className={`insurance-plan p-2 mb-2 border rounded ${
                                  selectedInsurancePlan?.PlanCode ===
                                  plan.PlanCode
                                    ? "border-primary"
                                    : ""
                                }`}
                                onClick={() => setSelectedInsurancePlan(plan)}
                                style={{ cursor: "pointer" }}
                              >
                                <div className="d-flex justify-content-between">
                                  <div>
                                    <strong>{plan.PlanName}</strong>
                                    <small className="d-block text-muted">
                                      Coverage ₹
                                      {Number(plan.SumInsured).toLocaleString()}
                                    </small>
                                  </div>
                                  <strong className="text-primary">
                                    ₹
                                    {Math.ceil(
                                      plan.DisplayPrice.toLocaleString(),
                                    )}
                                  </strong>
                                </div>
                              </div>
                            ))}
                          </div>

                          <Form.Check
                            type="radio"
                            id="insurance-yes"
                            label="Yes, add travel insurance"
                            checked={!!selectedInsurancePlan}
                            onChange={() =>
                              !selectedInsurancePlan &&
                              setSelectedInsurancePlan(insuranceData[0])
                            }
                          />
                          <Form.Check
                            type="radio"
                            id="insurance-no"
                            label="No, I don't need insurance"
                            checked={!selectedInsurancePlan}
                            onChange={() => setSelectedInsurancePlan(null)}
                            className="mt-1"
                          />
                        </>
                      )}
                    </div>

                    {/* Proceed Button - SHOWING NET FARE + COMMISSION BUT ACTUAL PAYMENT INCLUDES EVERYTHING */}
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 mt-3"
                      onClick={handleProceedToPayment}
                      disabled={
                        !passengerConfirmed || fareSource !== "fareQuote"
                      }
                    >
                      <div className="small text-light opacity-75">
                        <span className="text-warning text-decoration-underline">
                          Total Payment: ₹ {formatPrice(totalAmount)}
                        </span>
                        <div className="small text-light">Click to proceed</div>
                      </div>
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* seat selction modal */}
      <Modal
        show={showSeatModal}
        onHide={() => setShowSeatModal(false)}
        size="xl"
        centered
        className="seat-selection-modal"
      >
        <Modal.Header closeButton className="border-0 pb-2">
          <div className="d-flex gap-2 mb-2">
            {selectedFlights.map((flight, index) => {
              const info = extractFlightInfo(flight);
              return (
                <Button
                  key={index}
                  size="sm"
                  variant={
                    activeFlightIndex === index ? "primary" : "outline-primary"
                  }
                  onClick={() => {
                    setActiveFlightIndex(index);
                    setSelectedSeatList(
                      Object.values(selectedSeats[index] || {}),
                    );
                  }}
                >
                  {info.origin.code} → {info.destination.code}{" "}
                  {isSeatCompleteForFlight(index) ? "✓" : "✗"}
                </Button>
              );
            })}
          </div>

          <Modal.Title className="w-100">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-1">
                  {
                    extractFlightInfo(selectedFlights[activeFlightIndex])
                      ?.origin?.city
                  }{" "}
                  →
                  {
                    extractFlightInfo(selectedFlights[activeFlightIndex])
                      ?.destination?.city
                  }
                </h5>

                <small className="text-muted">
                  {selectedSeatList.length} of {requiredSeatCount} Seat(s)
                  Selected
                </small>
              </div>
              <div className="text-end">
                {(() => {
                  const totalSeatPrice = selectedSeatList.reduce(
                    (sum, s) => sum + (s.Price || 0),
                    0,
                  );
                  return totalSeatPrice > 0 ? (
                    <>
                      <h5 className="mb-0 text-primary">₹ {totalSeatPrice}</h5>
                      <small className="text-muted">Added to fare</small>
                    </>
                  ) : (
                    <small className="text-muted">No seat selected</small>
                  );
                })()}
              </div>
            </div>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body
          className="px-4 py-3"
          style={{
            maxHeight: "75vh",
            overflowY: "auto",
          }}
        >
          {/* Legend */}
          <div className="seat-legend mb-4 p-3 bg-light rounded">
            <div className="row g-3">
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="seat-icon seat-free me-2"></div>
                  <small>Free</small>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="seat-icon seat-200-500 me-2"></div>
                  <small>₹ 200-500</small>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="seat-icon seat-650-2300 me-2"></div>
                  <small>₹ 650-2300</small>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="seat-icon seat-exit me-2"></div>
                  <small>Exit Row Seats</small>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="seat-icon seat-non-reclining me-2"></div>
                  <small>Non Reclining</small>
                </div>
              </div>
              <div className="col-auto">
                <div className="d-flex align-items-center">
                  <div className="seat-icon seat-extra-legroom me-2">XL</div>
                  <small>Extra Legroom</small>
                </div>
              </div>
            </div>
          </div>

          {/* Airplane Seat Layout */}
          <div className="airplane-container">
            {/* Cockpit */}
            <div className="airplane-cockpit">
              <svg viewBox="0 0 100 40" className="cockpit-svg">
                <path
                  d="M 50 5 Q 20 15 10 40 L 90 40 Q 80 15 50 5 Z"
                  fill="#e9ecef"
                />
                <rect
                  x="35"
                  y="15"
                  width="10"
                  height="15"
                  rx="2"
                  fill="#495057"
                />
                <rect
                  x="55"
                  y="15"
                  width="10"
                  height="15"
                  rx="2"
                  fill="#495057"
                />
              </svg>
            </div>

            {/* Exit markers and column headers */}
            <div className="seat-header mb-2">
              <div className="row-number"></div>
              <div className="seat-columns">
                <div className="exit-marker left">
                  <span className="exit-arrow">←</span>
                  <span className="exit-text">EXIT</span>
                </div>
                <div className="column-letter">A</div>
                <div className="column-letter">B</div>
                <div className="column-letter">C</div>
                <div className="aisle"></div>
                <div className="column-letter">D</div>
                <div className="column-letter">E</div>
                <div className="column-letter">F</div>
                <div className="exit-marker right">
                  <span className="exit-text">EXIT</span>
                  <span className="exit-arrow">→</span>
                </div>
              </div>
              <div className="row-number"></div>
            </div>

            {/* Seat Grid */}
            <div className="seat-grid-wrapper">
              {seatRows.map((row, rowIndex) => (
                <div key={rowIndex} className="seat-row">
                  <div className="row-number">{row.Seats[0].RowNo}</div>

                  <div className="seat-columns">
                    {row.Seats.map((seat, seatIndex) => {
                      const isAvailable = seat.AvailablityType === 1;
                      const isSelected = selectedSeatList.some(
                        (s) => s.Code === seat.Code,
                      );

                      const showAisle = seatIndex === 2;

                      return (
                        <React.Fragment key={`${seat.Code}-${seatIndex}`}>
                          <button
                            className={`seat-button ${
                              !isAvailable
                                ? "seat-occupied"
                                : isSelected
                                  ? "seat-selected"
                                  : seat.Price === 0
                                    ? "seat-free"
                                    : seat.Price <= 500
                                      ? "seat-200-500"
                                      : "seat-650-2300"
                            }`}
                            disabled={!isAvailable}
                            onClick={() => {
                              if (!isAvailable) return;

                              setSelectedSeatList((prev) => {
                                const alreadySelectedIndex = prev.findIndex(
                                  (s) => s.Code === seat.Code,
                                );

                                // 🔁 CASE 1: deselect if clicked again
                                if (alreadySelectedIndex !== -1) {
                                  const copy = [...prev];
                                  copy.splice(alreadySelectedIndex, 1);
                                  return copy;
                                }

                                // ➕ CASE 2: add if space available
                                if (prev.length < requiredSeatCount) {
                                  return [...prev, seat];
                                }

                                // 🔄 CASE 3: replace last selected
                                const copy = [...prev];
                                copy[copy.length - 1] = seat;
                                return copy;
                              });
                            }}
                          >
                            <span className="seat-number">{seat.SeatNo}</span>
                            {isAvailable && seat.Price > 0 && (
                              <span className="seat-price-text">
                                ₹{seat.Price}
                              </span>
                            )}
                            {isSelected && (
                              <div className="seat-checkmark">✓</div>
                            )}
                          </button>

                          {showAisle && <div className="aisle" />}
                        </React.Fragment>
                      );
                    })}
                  </div>

                  <div className="row-number">{row.Seats[0].RowNo}</div>
                </div>
              ))}
            </div>

            {/* Wing indicators */}
            <div className="wing-indicators">
              <div className="wing left-wing"></div>
              <div className="wing right-wing"></div>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer>
          {(() => {
            const areAllFlightsSeatsComplete = selectedFlights.every(
              (_, index) => isSeatCompleteForFlight(index),
            );

            return (
              <>
                <Button
                  variant="secondary"
                  disabled={!areAllFlightsSeatsComplete}
                  onClick={() => setShowSeatModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  disabled={selectedSeatList.length !== requiredSeatCount}
                  onClick={() => {
                    // assign seats to passengers AFTER modal
                    const finalSeatMap = {};

                    seatEligiblePassengers.forEach((pax, index) => {
                      finalSeatMap[index] = selectedSeatList[index];
                    });

                    setSelectedSeats((prev) => {
                      const updated = {
                        ...prev,
                        [activeFlightIndex]: finalSeatMap,
                      };

                      const nextFlightIndex = activeFlightIndex + 1;

                      if (nextFlightIndex < selectedFlights.length) {
                        setActiveFlightIndex(nextFlightIndex);
                        setSelectedSeatList(
                          Object.values(updated[nextFlightIndex] || {}),
                        );
                      } else {
                        setShowSeatModal(false);
                      }

                      return updated;
                    });

                    // 🔥 AUTO SWITCH LOGIC
                    const nextFlightIndex = activeFlightIndex + 1;

                    if (nextFlightIndex < selectedFlights.length) {
                      setActiveFlightIndex(nextFlightIndex);
                      setSelectedSeatList(
                        Object.values(selectedSeats[nextFlightIndex] || {}),
                      );
                    } else {
                      setShowSeatModal(false);
                    }
                  }}
                >
                  {selectedSeatList.length < requiredSeatCount
                    ? `Select ${
                        requiredSeatCount - selectedSeatList.length
                      } more seat(s)`
                    : "Done"}
                </Button>
              </>
            );
          })()}
        </Modal.Footer>
      </Modal>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} centered backdrop="static">
        <Modal.Header>
          <Modal.Title>Confirm Booking & Payment</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <div className="mt-2 text-muted">
                Checking latest fare from airline…
              </div>
            </div>
          ) : (
            <>
              <Alert variant="info">
                <strong>Booking Summary</strong>
                <ul className="mb-0 mt-2">
                  <li>{selectedFlights.length} Flight(s)</li>
                  <li>
                    {passengerCount.adults} Adult(s), {passengerCount.children}{" "}
                    Child(s), {passengerCount.infants} Infant(s)
                  </li>
                  <li>Trip Type: {state?.tripType || "One-way"}</li>
                  <li>Class: {state?.travelClass || "Economy"}</li>
                </ul>
              </Alert>

              {priceChanged && (
                <Alert variant="warning">
                  Fare increased by ₹ {formatPrice(fareDiff)}. Please confirm.
                </Alert>
              )}

              <div className="payment-summary p-3 bg-light rounded">
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total Amount</span>
                  <span>₹ {formatPrice(totalAmount)}</span>
                </div>
              </div>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Review Booking
          </Button>

          <Button
            variant="primary"
            disabled={loading}
            onClick={handleConfirmAndPay}
          >
            Confirm & Pay
           </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Flightcheckout;
