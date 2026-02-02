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

const Flightcheckout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { startPayment } = useCashfreePayment();

  const [showSeatModal, setShowSeatModal] = useState(false);
  const [activeSeatPaxIndex, setActiveSeatPaxIndex] = useState(null);
  const [activeFlightIndex, setActiveFlightIndex] = useState(0);

  // ✅ Updated for multiple flights
  const [selectedFlights, setSelectedFlights] = useState([]);
  const [selectedFares, setSelectedFares] = useState([]);
  const [searchData, setSearchData] = useState(null);
  const [fareDetailsArray, setFareDetailsArray] = useState([]);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fareQuoteResponses, setFareQuoteResponses] = useState([]);
  const [priceChanged, setPriceChanged] = useState(false);
  const [oldTotal, setOldTotal] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  // SSR data for multiple flights
  const [ssrDataArray, setSSRDataArray] = useState([]);
  const [ssrLoading, setSSRLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("PASSENGER");

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
  const [contactAddress, setContactAddress] = useState("");

  // ✅ Add state for validation errors
  const [fieldErrors, setFieldErrors] = useState({});
  const [airlineCode, setAirlineCode] = useState("");
  const [airlineGroup, setAirlineGroup] = useState("Other");

  const state = location?.state;
  console.log("✅ Checkout received state:", state);

  const [fareSource, setFareSource] = useState("search");

  // ✅ PRICING BREAKDOWN FROM FLIGHT DETAIL
  const [pricingBreakdown, setPricingBreakdown] = useState(null);
  const [isEditContact, setIsEditContact] = useState(true);

  // ✅ Initialize from flight detail modal data
  useEffect(() => {
    if (!state) return;

    const {
      TraceId,
      tripType,
      isDomestic,
      resultIndexes,
      passengerCount,
      pricingBreakdown,
      travelClass,
    } = state;

    // 1️⃣ Set pricing breakdown
    if (pricingBreakdown) {
      setPricingBreakdown(pricingBreakdown);
    }

    // 2️⃣ Build MINIMAL searchData (needed everywhere)
    setSearchData({
      TraceId,
      tripType,
      isDomestic,
      travelClass,
      passengers: passengerCount,
    });

    // 3️⃣ Normalize ResultIndex → array
    const normalizedFlights =
      tripType === "round" && isDomestic
        ? [
            { ResultIndex: resultIndexes.outbound },
            { ResultIndex: resultIndexes.inbound },
          ]
        : Array.isArray(resultIndexes)
        ? resultIndexes.map((ri) => ({ ResultIndex: ri }))
        : [{ ResultIndex: resultIndexes }];

    setSelectedFlights(normalizedFlights);

    // 4️⃣ Initialize passenger forms ✅
    initializePassengers(passengerCount);
  }, []);

  // ✅ Fetch insurance data when flights are loaded
  useEffect(() => {
    if (fareDetailsArray.length > 0) {
      fetchInsuranceData();
    }
  }, [fareDetailsArray]);

  // ✅ Helper function to extract flight info
  const extractFlightInfo = (flight) => {
    if (!flight) return null;

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
    try {
      setLoading(true);
      const responses = [];

      for (let i = 0; i < selectedFlights.length; i++) {
        const flight = selectedFlights[i];
        const payload = {
          TraceId: state?.TraceId,
          ResultIndex: flight?.ResultIndex,
        };

        console.log(`Fetching fare quote for flight ${i + 1}:`, payload);
        const res = await fare_quote(payload);
        console.log(`Fare quote response for flight ${i + 1}:`, res.data);

        if (res?.data?.Response?.Results) {
          const result = Array.isArray(res.data.Response.Results)
            ? res.data.Response.Results[0]
            : res.data.Response.Results;

          responses.push(result);
        }
      }

      setFareQuoteResponses(responses);
      setFareDetailsArray(responses);
      setFareSource("fareQuote");

      // Fetch SSR for all flights
      await fetchSSRForAllFlights();
    } catch (error) {
      console.error("Fare quote error:", error);
      alert("Unable to confirm fares for all flights. Please try again.");
    } finally {
      setLoading(false);
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
          TraceId: state?.TraceId,
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
      setActiveSection("SSR");
    } catch (err) {
      console.error("SSR Error:", err);
    } finally {
      setSSRLoading(false);
    }
  };

  // ✅ Fetch insurance data
  const fetchInsuranceData = async () => {
    try {
      setInsuranceLoading(true);
      setInsuranceError(null);

      // Use first flight for travel date
      const firstFare = fareDetailsArray?.[0];
      const travelStartDate = firstFare?.Segments?.[0]?.[0]?.Origin?.DepTime;

      if (!travelStartDate) {
        setInsuranceError("Unable to fetch travel date");
        setInsuranceLoading(false);
        return;
      }

      const passengerCount = getPassengerCount();
      const totalPassengers = passengerCount.adults + passengerCount.children;

      // Calculate ages
      const paxAges = [];
      for (let i = 0; i < passengerCount.adults; i++) {
        paxAges.push("30"); // Default adult age
      }
      for (let i = 0; i < passengerCount.children; i++) {
        paxAges.push("10"); // Default child age
      }

      const payload = {
        PlanCategory: 1,
        PlanType: 1,
        PlanCoverage: 4,
        TravelStartDate: travelStartDate,
        NoOfPax: totalPassengers,
        PaxAge: paxAges,
      };

      const response = await searchInsurance(payload);
      console.log("Insurance API response:", response);

      if (response.data?.success && response.data?.data?.Response) {
        const insuranceResponse = response.data.data.Response;

        if (
          insuranceResponse.ResponseStatus === 1 &&
          insuranceResponse.Results
        ) {
          setInsuranceTraceId(insuranceResponse.TraceId);
          const processedInsuranceData = insuranceResponse.Results.map(
            (plan) => ({
              PlanCode: plan.PlanCode,
              PlanName: plan.PlanName,
              SumInsured: plan.SumInsured,
              PlanDescription: plan.PlanDescription,
              Premium:
                plan.Price?.OfferedPrice ||
                plan.Price?.PublishedPrice ||
                plan.Price?.GrossFare ||
                0,
              Currency: plan.Price?.Currency || "INR",
              CoverageDetails: plan.CoverageDetails || [],
            })
          );

          setInsuranceData(processedInsuranceData);
          setInsuranceError(null);
        } else {
          setInsuranceError(
            insuranceResponse.Error?.ErrorMessage ||
              "No insurance plans available"
          );
        }
      } else {
        setInsuranceError("Unable to fetch insurance options");
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
      console.log(
        "✅ Using pricing breakdown for fare calculation:",
        pricingBreakdown
      );

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
          fareDetail.Fare.PublishedFare || fareDetail.Fare.OfferedFare || 0
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

    // Meals
    Object.values(selectedMeals).forEach((meal) => {
      if (meal?.Price) ssrTotal += Number(meal.Price);
    });

    // Baggage
    Object.values(selectedBaggage).forEach((bag) => {
      if (bag?.Price) ssrTotal += Number(bag.Price);
    });

    // Seats
    Object.values(selectedSeats).forEach((seat) => {
      if (seat?.Price) ssrTotal += Number(seat.Price);
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
      finalTotal += (selectedInsurancePlan.Premium || 0) * totalPassengers;
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
    if (state?.passengerCount) {
      return state.passengerCount;
    }
    return {
      adults: searchData?.passengers?.adults || 0,
      children: searchData?.passengers?.children || 0,
      infants: searchData?.passengers?.infants || 0,
    };
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
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        email: value,
      }));
      setPassengers(updatedPassengers);
    } else if (field === "mobile") {
      setContactMobile(value);
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        contactNo: value,
      }));
      setPassengers(updatedPassengers);
    } else if (field === "address") {
      setContactAddress(value);
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        addressLine1: value,
      }));
      setPassengers(updatedPassengers);
    }
  };

  // ✅ Build complete booking payload for multiple flights
  const buildFlightBookingPayload = async () => {
    const fareBreakdown = calculateTotalFareBreakdown();
    const passengerCount = getPassengerCount();
    const totalPassengers =
      passengerCount.adults + passengerCount.children + passengerCount.infants;
    const ssrCharges = calculateSSRCharges();

    // ✅ Calculate flight payment amount (Net Fare + Commission + GST + Other Taxes)
    const flightPaymentAmount =
      fareBreakdown.baseFare +
      fareBreakdown.commissionAmount +
      fareBreakdown.gstAmount +
      (fareBreakdown.otherTaxes || 0);

    const insurancePremium = selectedInsurancePlan
      ? selectedInsurancePlan.Premium *
        (passengerCount.adults + passengerCount.children)
      : 0;
    const couponDiscount = appliedCoupon?.discount || 0;

    // ✅ FINAL PAYMENT AMOUNT (EVERYTHING INCLUDED)
    const finalPaymentAmount = calculateTotalAmount();

    // Build passengers array with fare breakdown
    const Passengers = passengers.map((pax, paxIndex) => {
      let baseFarePerPax = 0;
      let taxPerPax = 0;

      // Calculate fare per passenger from selected fares
      selectedFares.forEach((fare, flightIndex) => {
        if (fare) {
          const fareDetail = fareDetailsArray[flightIndex];
          if (fareDetail?.Fare) {
            const totalFare = Number(
              fareDetail.Fare.PublishedFare || fareDetail.Fare.OfferedFare || 0
            );
            const totalBaseFare = Number(fareDetail.Fare.BaseFare || 0);
            const totalTax = Number(fareDetail.Fare.Tax || 0);

            // Distribute fare proportionally
            baseFarePerPax += totalBaseFare / totalPassengers;
            taxPerPax += totalTax / totalPassengers;
          }
        }
      });

      return {
        Title: pax.title,
        FirstName: pax.firstName,
        LastName: pax.lastName,
        PaxType: pax.paxType,
        DateOfBirth: new Date(pax.dateOfBirth).toISOString(),
        Gender: Number(pax.gender),
        PassportNo: pax.passportNumber,
        PassportExpiry: new Date(pax.passportExpiry).toISOString(),
        AddressLine1: pax.addressLine1,
        City: pax.city,
        CountryCode: pax.countryCode,
        ContactNo: pax.contactNo,
        Nationality: pax.nationality,
        Email: pax.email,
        IsLeadPax: pax.isLeadPax,
        Fare: {
          Currency: "INR",
          BaseFare: baseFarePerPax,
          Tax: taxPerPax,
          PublishedFare: baseFarePerPax + taxPerPax,
          OfferedFare: baseFarePerPax + taxPerPax,
        },
      };
    });

    // Build flight segments for each flight
    const FlightSegments = selectedFlights.map((flight, flightIndex) => {
      const flightInfo = extractFlightInfo(flight);
      const selectedFare = selectedFares[flightIndex];
      const fareDetail = fareDetailsArray[flightIndex];

      return {
        FlightIndex: flightIndex + 1,
        Airline: {
          Code: flightInfo.airline.code,
          Name: flightInfo.airline.name,
          FlightNumber: flightInfo.airline.flightNumber,
        },
        Origin: {
          City: flightInfo.origin.city,
          Code: flightInfo.origin.code,
          Airport: flightInfo.origin.airport,
          DateTime: flightInfo.origin.time,
        },
        Destination: {
          City: flightInfo.destination.city,
          Code: flightInfo.destination.code,
          Airport: flightInfo.destination.airport,
          DateTime: flightInfo.destination.time,
        },
        FlightDetails: {
          Duration: flightInfo.flight.duration,
          Aircraft: flightInfo.flight.aircraft,
          Stops: flightInfo.flight.stops,
          CabinBaggage: flightInfo.flight.cabinBaggage,
          CheckinBaggage: flightInfo.flight.baggage,
        },
        FareDetails: {
          FareType: selectedFare?.type || "Standard Fare",
          BaseFare: fareDetail?.Fare?.BaseFare || 0,
          Tax: fareDetail?.Fare?.Tax || 0,
          TotalFare:
            fareDetail?.Fare?.PublishedFare ||
            fareDetail?.Fare?.OfferedFare ||
            0,
          IsRefundable: fareDetail?.IsRefundable || false,
        },
        // API parameters
        ResultIndex: flight.ResultIndex,
        FlightId: flight.FlightId,
        TraceId: state?.TraceId,
      };
    });

    return {
      TraceId: state?.TraceId,
      // For multiple flights, we might need to pass array of ResultIndex
      ResultIndex: selectedFlights.map((flight) => flight.ResultIndex),
      EndUserIp: "127.0.0.1",
      Passengers,
      FlightSegments,
      FlightPaymentAmount: flightPaymentAmount, // ✅ Flight payment (Net Fare + Commission + GST + Other Taxes)
      SSRAmount: ssrCharges,
      InsuranceAmount: insurancePremium,
      CouponDiscount: couponDiscount,
      TotalAmount: finalPaymentAmount, // ✅ FINAL PAYMENT AMOUNT (EVERYTHING INCLUDED)
      InsuranceRequired: !!selectedInsurancePlan,
      InsuranceData: selectedInsurancePlan || null,
      TripType: state?.tripType || searchData?.tripType || "oneway",
      TravelClass: state?.travelClass || searchData?.travelClass || "Economy",
      SSR: {
        Meal: selectedMeals,
        Baggage: selectedBaggage,
        Seat: selectedSeats,
      },
      PricingBreakdown: {
        ...fareBreakdown,
        flightPaymentAmount: flightPaymentAmount, // ✅ Flight payment amount
        ssrCharges: ssrCharges,
        insurancePremium: insurancePremium,
        couponDiscount: couponDiscount,
        totalAmount: finalPaymentAmount, // ✅ Final total
      },
    };
  };

  // ✅ Handle confirm passengers
  const handleConfirmPassengers = async () => {
    setLoading(true);
    try {
      await fetchFareQuotesForAllFlights();
    } catch (error) {
      alert("Unable to confirm fares. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle proceed to payment
  const handleProceedToPayment = async () => {
    // Validate passengers
    const requiredFields = [
      "title",
      "firstName",
      "lastName",
      "dateOfBirth",
      "gender",
    ];
    for (const passenger of passengers) {
      for (const field of requiredFields) {
        if (!passenger[field]) {
          alert(`Please fill all required fields for ${passenger.type}`);
          return;
        }
      }
    }

    // Validate contact
    if (!contactEmail || !contactMobile) {
      alert("Please fill contact details");
      return;
    }

    // Validate all fares are confirmed
    if (fareDetailsArray.length !== selectedFlights.length) {
      alert("Please confirm fares for all flights");
      return;
    }

    // Lock totals for confirmation
    const total = calculateTotalAmount();
    setOldTotal(total);
    setNewTotal(total);
    setShowConfirmModal(true);
  };

  // ✅ Handle confirm and pay
  const handleConfirmAndPay = async () => {
    try {
      setLoading(true);
      const userdetails = await getUserData("safarix_user");

      // Build final flight booking payload
      const flightBookingPayload = await buildFlightBookingPayload();

      // Build final booking object
      const bookingDetails = {
        userId: userdetails?.id,
        serviceType: "flight",
        vendorType: "flight",
        startDate:
          selectedFlights[0]?.origin?.time ||
          selectedFlights[0]?.origin?.DepartureTime,
        totalAmount: newTotal,
        serviceDetails: flightBookingPayload,
        SSR: {
          Meal: selectedMeals,
          Baggage: selectedBaggage,
          Seat: selectedSeats,
        },
        insuranceSelected: !!selectedInsurancePlan,
        insurancePlan: selectedInsurancePlan || null,
        // Additional metadata
        tripDetails: {
          totalFlights: selectedFlights.length,
          passengerCount: getPassengerCount(),
          tripType: state?.tripType || searchData?.tripType,
          travelClass: state?.travelClass || searchData?.travelClass,
        },
      };

      console.log("✅ FINAL BOOKING DETAILS FOR PAYMENT:", bookingDetails);
      console.log("✅ ACTUAL PAYMENT AMOUNT (INCLUDES EVERYTHING):", newTotal);

      // Start payment
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

  // ✅ UPDATED: Render pricing breakdown in fare summary - SHOWING ACTUAL PAYMENT INCLUDING EVERYTHING
  const renderPricingBreakdown = () => {
    const fareBreakdown = calculateTotalFareBreakdown();
    const ssrCharges = calculateSSRCharges();
    const passengerCount = getPassengerCount();
    const insurancePremium = selectedInsurancePlan
      ? selectedInsurancePlan.Premium *
        (passengerCount.adults + passengerCount.children)
      : 0;
    const couponDiscount = appliedCoupon?.discount || 0;
    const totalAmount = calculateTotalAmount();

    // ✅ Calculate flight payment amount (Net Fare + Commission + GST + Other Taxes)
    const flightPaymentAmount =
      fareBreakdown.baseFare +
      fareBreakdown.commissionAmount +
      fareBreakdown.gstAmount +
      (fareBreakdown.otherTaxes || 0);

    return (
      <div className="fare-breakdown mb-3">
        {/* ✅ 1. FLIGHT PAYMENT SECTION */}
        <div className="flight-payment-section mb-3 p-3 bg-light rounded">
          <h6 className="section-title mb-2">Flight Payment</h6>

          <div className="d-flex justify-content-between mb-2">
            <span>Net Fare</span>
            <span>₹ {formatPrice(fareBreakdown.baseFare)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>Commission ({fareBreakdown.commissionPercent || 6}%)</span>
            <span>+ ₹ {formatPrice(fareBreakdown.commissionAmount)}</span>
          </div>

          <div className="d-flex justify-content-between mb-2">
            <span>GST on Commission ({fareBreakdown.gstPercent || 18}%)</span>
            <span>+ ₹ {formatPrice(fareBreakdown.gstAmount)}</span>
          </div>

          {fareBreakdown.otherTaxes > 0 && (
            <div className="d-flex justify-content-between mb-2">
              <span>Other Taxes & Fees</span>
              <span>+ ₹ {formatPrice(fareBreakdown.otherTaxes)}</span>
            </div>
          )}

          <div className="d-flex justify-content-between mt-2 border-top pt-2 fw-bold">
            <span>Total Flight Payment</span>
            <span>₹ {formatPrice(flightPaymentAmount)}</span>
          </div>
        </div>

        {/* ✅ 2. ADDITIONAL SERVICES SECTION */}
        <div className="additional-services-section mb-3">
          <h6 className="section-title mb-2">Additional Services</h6>

          {/* SSR Charges */}
          {ssrCharges > 0 && (
            <div className="d-flex justify-content-between mb-1">
              <span>Seats, Meals & Baggage</span>
              <span className="text-success">
                + ₹ {formatPrice(ssrCharges)}
              </span>
            </div>
          )}

          {/* Insurance */}
          {selectedInsurancePlan && (
            <div className="d-flex justify-content-between mb-1">
              <span>Travel Insurance</span>
              <span className="text-success">
                + ₹ {formatPrice(insurancePremium)}
              </span>
            </div>
          )}

          {/* Coupon Discount */}
          {appliedCoupon && (
            <div className="d-flex justify-content-between mb-1 text-success">
              <span>
                Coupon Discount ({appliedCoupon.code})
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 ms-1 text-danger"
                  onClick={removeCoupon}
                >
                  ✕
                </Button>
              </span>
              <span>- ₹ {formatPrice(appliedCoupon.discount)}</span>
            </div>
          )}
        </div>

        <hr />

        {/* ✅ 3. ACTUAL PAYMENT AMOUNT SECTION */}
        <div className="actual-payment-section p-3 bg-primary text-white rounded">
          <h6 className="section-title mb-2">Actual Payment Amount</h6>

          <div className="d-flex justify-content-between mb-1">
            <span>Flight Payment</span>
            <span>₹ {formatPrice(flightPaymentAmount)}</span>
          </div>

          {ssrCharges > 0 && (
            <div className="d-flex justify-content-between mb-1">
              <span>SSR Charges</span>
              <span>+ ₹ {formatPrice(ssrCharges)}</span>
            </div>
          )}

          {selectedInsurancePlan && (
            <div className="d-flex justify-content-between mb-1">
              <span>Travel Insurance</span>
              <span>+ ₹ {formatPrice(insurancePremium)}</span>
            </div>
          )}

          {appliedCoupon && (
            <div className="d-flex justify-content-between mb-1">
              <span>Coupon Discount</span>
              <span>- ₹ {formatPrice(couponDiscount)}</span>
            </div>
          )}

          <div className="d-flex justify-content-between mt-2 border-top pt-2 fw-bold fs-5">
            <span>Total Payment Amount</span>
            <span>₹ {formatPrice(totalAmount)}</span>
          </div>

          <small className="d-block mt-1">
            This is the actual amount you will pay
          </small>
        </div>

        {/* ✅ 4. BREAKDOWN SUMMARY */}
        <div className="breakdown-summary mt-3">
          <h6 className="section-title mb-2">Breakdown Summary</h6>
          <div className="small text-muted">
            <div className="d-flex justify-content-between">
              <span>Total Breakdown:</span>
              <span className="text-end">
                <div>Net Fare: ₹{formatPrice(fareBreakdown.baseFare)}</div>
                <div>
                  + Commission ({fareBreakdown.commissionPercent || 6}%): ₹
                  {formatPrice(fareBreakdown.commissionAmount)}
                </div>
                <div>
                  + GST ({fareBreakdown.gstPercent || 18}%): ₹
                  {formatPrice(fareBreakdown.gstAmount)}
                </div>
                {fareBreakdown.otherTaxes > 0 && (
                  <div>
                    + Other Taxes: ₹{formatPrice(fareBreakdown.otherTaxes)}
                  </div>
                )}
                {ssrCharges > 0 && (
                  <div>+ SSR Services: ₹{formatPrice(ssrCharges)}</div>
                )}
                {insurancePremium > 0 && (
                  <div>+ Insurance: ₹{formatPrice(insurancePremium)}</div>
                )}
                {couponDiscount > 0 && (
                  <div>- Discount: ₹{formatPrice(couponDiscount)}</div>
                )}
                <div className="fw-bold mt-1">
                  = Total: ₹{formatPrice(totalAmount)}
                </div>
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ✅ Render pricing details in a separate section
  const renderDetailedPricing = () => {
    if (!pricingBreakdown) return null;

    return (
      <div className="pricing-details mt-3 p-3 bg-light rounded">
        <h6 className="mb-2">Commission & Tax Breakdown</h6>
        <table className="table table-sm mb-0">
          <tbody>
            <tr>
              <td>Net Fare (Base Price)</td>
              <td className="text-end">
                ₹ {formatPrice(pricingBreakdown.netFare)}
              </td>
            </tr>
            <tr>
              <td>Commission ({pricingBreakdown.commissionPercent || 6}%)</td>
              <td className="text-end">
                + ₹ {formatPrice(pricingBreakdown.commissionAmount)}
              </td>
            </tr>
            <tr>
              <td>GST ({pricingBreakdown.gstPercent || 18}%)</td>
              <td className="text-end">
                + ₹ {formatPrice(pricingBreakdown.gstAmount)}
              </td>
            </tr>
            {pricingBreakdown.otherTaxes > 0 && (
              <tr>
                <td>Other Taxes & Fees</td>
                <td className="text-end">
                  + ₹ {formatPrice(pricingBreakdown.otherTaxes)}
                </td>
              </tr>
            )}
            <tr className="fw-bold border-top">
              <td>Flight Payment Amount</td>
              <td className="text-end">
                ₹{" "}
                {formatPrice(
                  (pricingBreakdown.netFare || 0) +
                    (pricingBreakdown.commissionAmount || 0) +
                    (pricingBreakdown.gstAmount || 0) +
                    (pricingBreakdown.otherTaxes || 0)
                )}
              </td>
            </tr>
          </tbody>
        </table>
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

  // ✅ Updated validation function with only NDC and SpiceJet rules
  const validatePassengers = () => {
    // Get airline code and group
    const airlineCode = getAirlineCodeFromSelectedFlight();
    const airlineGroup = getAirlineGroup(airlineCode);

    console.log("Current Airline Code:", airlineCode);
    console.log("Current Airline Group:", airlineGroup);

    for (let i = 0; i < passengers.length; i++) {
      const p = passengers[i];

      // Basic required field checks
      if (
        !p.title ||
        !p.firstName ||
        !p.lastName ||
        !p.dateOfBirth ||
        !p.gender ||
        !p.passportNumber ||
        !p.passportExpiry ||
        !p.nationality ||
        !p.contactNo ||
        !p.addressLine1 ||
        !p.city ||
        !p.countryCode ||
        !p.email
      ) {
        alert(`Please fill all required details for ${p.type} ${i + 1}`);
        return false;
      }

      // Email format check
      if (!/^\S+@\S+\.\S+$/.test(p.email)) {
        alert(`Invalid email for ${p.type} ${i + 1}`);
        return false;
      }

      // Mobile number check
      if (p.contactNo.length < 8) {
        alert(`Invalid contact number for ${p.type} ${i + 1}`);
        return false;
      }

      // ✅ First Name Validation (based on image rules)
      const firstName = p.firstName.trim();

      // Min length 1 for all airlines
      if (firstName.length < 1) {
        alert(`First name must be at least 1 character for ${p.type} ${i + 1}`);
        return false;
      }

      // Check if starts with dot (not allowed for any airline according to image)
      if (firstName.startsWith(".")) {
        alert(`First name cannot start with dot (.) for ${p.type} ${i + 1}`);
        return false;
      }

      // Airline-specific first name validation
      switch (airlineGroup) {
        case "NDC":
          // NDC: Only A-Z allowed, no spaces, no dots in between
          if (!/^[A-Za-z]+$/.test(firstName)) {
            alert(
              `For ${airlineCode} (NDC airline): First name must contain only alphabets (A-Z) without spaces or dots`
            );
            return false;
          }
          break;

        case "SpiceJet":
          // SpiceJet: A-Z and spaces allowed, but no starting dot
          // SpiceJet allows titles but since we have separate title field, we just check basic format
          if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(firstName)) {
            alert(
              `For ${airlineCode} (SpiceJet): First name must contain only alphabets and spaces`
            );
            return false;
          }
          break;

        case "Other":
          // Other airlines: A-Z and spaces allowed
          if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(firstName)) {
            alert(`First name must contain only alphabets and spaces`);
            return false;
          }
          break;
      }

      // ✅ Last Name Validation (based on image rules)
      const lastName = p.lastName.trim();

      // Min length 2 for all airlines
      if (lastName.length < 2) {
        alert(`Last name must be at least 2 characters for ${p.type} ${i + 1}`);
        return false;
      }

      // Check if starts with dot (not allowed for any airline)
      if (lastName.startsWith(".")) {
        alert(`Last name cannot start with dot (.) for ${p.type} ${i + 1}`);
        return false;
      }

      // Airline-specific last name validation
      switch (airlineGroup) {
        case "NDC":
          // NDC: A-Z and space(.) allowed
          // Check for valid format: A-Z with optional spaces
          if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(lastName)) {
            alert(
              `For ${airlineCode} (NDC airline): Last name must contain only alphabets and spaces`
            );
            return false;
          }
          break;

        case "SpiceJet":
          // SpiceJet: A-Z and space(.) allowed, title allowed
          if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(lastName)) {
            alert(
              `For ${airlineCode} (SpiceJet): Last name must contain only alphabets and spaces`
            );
            return false;
          }
          break;

        case "Other":
          // Other airlines: A-Z and space(.) allowed, title allowed
          if (!/^[A-Za-z]+( [A-Za-z]+)*$/.test(lastName)) {
            alert(`Last name must contain only alphabets and spaces`);
            return false;
          }
          break;
      }

      // ✅ Title Validation according to image
      // All allowed titles from image
      const allAllowedTitles = [
        "Mr",
        "Mstr",
        "Ms",
        "Mrs",
        "Mss",
        "Master",
        "DR",
        "CID",
        "MST",
        "PROF",
        "Inf",
      ];

      // For transfer/flight booking, use these:
      const transferAdultTitles = ["MR", "MRS", "MS"];
      const transferChildTitles = ["MISS", "MSTR"];

      // Check if title is in allowed list
      let isValidTitle = false;

      if (p.paxType === 1) {
        // Adult
        // Check in both all titles and transfer adult titles
        isValidTitle =
          allAllowedTitles
            .map((t) => t.toLowerCase())
            .includes(p.title.toLowerCase()) ||
          transferAdultTitles
            .map((t) => t.toLowerCase())
            .includes(p.title.toLowerCase());
      } else if (p.paxType === 2) {
        // Child
        // Check in all titles and transfer child titles
        isValidTitle =
          allAllowedTitles
            .map((t) => t.toLowerCase())
            .includes(p.title.toLowerCase()) ||
          transferChildTitles
            .map((t) => t.toLowerCase())
            .includes(p.title.toLowerCase());
      } else if (p.paxType === 3) {
        // Infant
        // Only "Inf" for infant
        isValidTitle = p.title.toLowerCase() === "inf";
      }

      if (!isValidTitle) {
        if (p.paxType === 1) {
          alert(
            `Invalid title for Adult passenger. Allowed titles: ${[
              ...allAllowedTitles,
              ...transferAdultTitles,
            ].join(", ")}`
          );
        } else if (p.paxType === 2) {
          alert(
            `Invalid title for Child passenger. Allowed titles: ${[
              ...allAllowedTitles,
              ...transferChildTitles,
            ].join(", ")}`
          );
        } else if (p.paxType === 3) {
          alert(`Invalid title for Infant passenger. Allowed title: Inf`);
        }
        return false;
      }
    }

    return true;
  };

  // Loading state
  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "400px", marginTop: "100px" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Fetching accurate fare details from airline...</p>
        </div>
      </Container>
    );
  }

  // No flights selected
  if (!selectedFlights || selectedFlights.length === 0) {
    return (
      <Container>
        <div className="text-center py-5" style={{ marginTop: "100px" }}>
          <Alert variant="warning">
            <h4>Flight Selection Required</h4>
            <p>Please select a flight and fare to proceed with booking</p>
            <Button variant="primary" onClick={handleBackToFlights}>
              Back to Flight Selection
            </Button>
          </Alert>
        </div>
      </Container>
    );
  }

  const passengerCount = getPassengerCount();
  const totalAmount = calculateTotalAmount();
  const netFarePlusCommission = calculateNetFarePlusCommission();

  return (
    <>
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
                <small className="text-muted">
                  {selectedFlights.length} Flight(s) • {passengerCount.adults}{" "}
                  Adult(s), {passengerCount.children} Child(s),{" "}
                  {passengerCount.infants} Infant(s)
                </small>
              </Card.Header>
              <Card.Body>
                {selectedFlights.map((flight, index) =>
                  renderFlightSegment(flight, index)
                )}
              </Card.Body>
            </Card>

            {/* Passenger Details Section */}
            {activeSection === "PASSENGER" && (
              <Card className="mb-4 shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Passenger Details</h5>
                  <small className="text-muted">
                    {passengerCount.adults} Adult(s), {passengerCount.children}{" "}
                    Child(s), {passengerCount.infants} Infant(s)
                  </small>
                </Card.Header>
                <Card.Body>
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
                                  e.target.value
                                )
                              }
                              required
                            >
                              <option value="">Select</option>
                              {passenger.paxType === 1 && (
                                <>
                                  <option value="Mr">Mr</option>
                                  <option value="Ms">Ms</option>
                                  <option value="Mrs">Mrs</option>
                                </>
                              )}
                              {passenger.paxType === 2 && (
                                <>
                                  <option value="Master">Master</option>
                                  <option value="Miss">Miss</option>
                                </>
                              )}
                              {passenger.paxType === 3 && (
                                <>
                                  <option value="Master">Master</option>
                                  <option value="Miss">Miss</option>
                                </>
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
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
                                )
                              }
                              required
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
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
                                  e.target.value
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
                            <Form.Label>Nationality *</Form.Label>
                            <Form.Select
                              value={passenger.nationality}
                              onChange={(e) =>
                                handlePassengerChange(
                                  index,
                                  "nationality",
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
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
                                  e.target.value
                                )
                              }
                              required
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  ))}

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
                      {loading ? "Confirming..." : "Confirm Passenger Details"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Contact Details */}
            <Card className="shadow-sm">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-0">Contact Details</h5>
                  <small className="text-muted">
                    This will be used for booking confirmation
                  </small>
                </div>

                <Button size="sm" variant="outline-primary">
                  Edit
                </Button>
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
                      <Form.Text className="text-muted">
                        Booking confirmation will be sent here
                      </Form.Text>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
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
                  </Col>
                </Row>

                <Row>
                  <Col md={12}>
                    <Form.Group className="mb-3">
                      <Form.Label>Address *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter your complete address"
                        value={contactAddress}
                        onChange={(e) =>
                          handleContactChange("address", e.target.value)
                        }
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={4}>
            {/* Fare Summary */}
            <Card className="sticky-top shadow-sm" style={{ top: "20px" }}>
              <Card.Header className="fare-summary-header">
                <h5 className="mb-0">Fare Summary</h5>
                {fareDetailsArray.length > 0 && (
                  <small>Live prices from airline</small>
                )}
              </Card.Header>

              <Card.Body>
                {fareSource === "search" && (
                  <Alert variant="secondary" className="text-center">
                    Prices shown are <strong>estimated</strong>. Final price
                    will be confirmed before payment.
                  </Alert>
                )}

                {fareSource === "fareQuote" && (
                  <Alert variant="success" className="text-center">
                    ✅ Live fare confirmed by airline
                  </Alert>
                )}

                {fareDetailsArray.length > 0 && (
                  <>
                    <div className="passenger-count mb-3 p-2 bg-light rounded">
                      <small className="text-muted">
                        <strong>Passengers:</strong> {passengerCount.adults}{" "}
                        Adult(s), {passengerCount.children} Child(s),{" "}
                        {passengerCount.infants} Infant(s)
                        <br />
                        <strong>Flights:</strong> {selectedFlights.length}{" "}
                        Segment(s)
                      </small>
                    </div>

                    {/* ✅ UPDATED PRICING BREAKDOWN SHOWING ACTUAL PAYMENT INCLUDING EVERYTHING */}
                    {renderPricingBreakdown()}

                    {/* ✅ Detailed pricing breakdown */}
                    {renderDetailedPricing()}

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
                                    ₹{plan.Premium.toLocaleString()}
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
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            className="me-2"
                          />
                          PROCESSING...
                        </>
                      ) : (
                        <>
                          <div className="small text-light opacity-75">
                            <span className="text-warning">
                              Total Payment: ₹ {formatPrice(totalAmount)}
                            </span>
                          </div>
                        </>
                      )}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* Confirmation Modal */}
      <Modal show={showConfirmModal} centered>
        <Modal.Header>
          <Modal.Title>Confirm Booking Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="info">
            <strong>Booking Summary:</strong>
            <ul className="mb-0 mt-2">
              <li>{selectedFlights.length} Flight(s)</li>
              <li>
                {passengerCount.adults} Adult(s), {passengerCount.children}{" "}
                Child(s), {passengerCount.infants} Infant(s)
              </li>
              <li>
                Trip Type:{" "}
                {state?.tripType || searchData?.tripType || "One-way"}
              </li>
              <li>
                Travel Class:{" "}
                {state?.travelClass || searchData?.travelClass || "Economy"}
              </li>
            </ul>
          </Alert>

          {priceChanged && (
            <Alert variant="warning">
              Fare has changed from ₹{oldTotal} to ₹{newTotal}
            </Alert>
          )}

          <div className="payment-summary p-3 bg-light rounded">
            <h5 className="text-center mb-3">Payment Summary</h5>
            <div className="d-flex justify-content-between">
              <span>Net Fare + Commission:</span>
              <span className="fw-bold">
                ₹ {formatPrice(netFarePlusCommission)}
              </span>
            </div>
            <div className="d-flex justify-content-between mt-2">
              <span>+ GST, SSR, Insurance, Discounts:</span>
              <span className="fw-bold">
                ₹ {formatPrice(totalAmount - netFarePlusCommission)}
              </span>
            </div>
            <hr />
            <div className="d-flex justify-content-between fw-bold fs-4">
              <span>Final Payable Amount:</span>
              <span className="text-primary">₹ {formatPrice(newTotal)}</span>
            </div>
            <small className="text-muted d-block text-center mt-2">
              This is the actual amount that will be charged
            </small>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmAndPay}>
            Confirm & Pay ₹ {formatPrice(newTotal)}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Flightcheckout;
