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

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedFare, setSelectedFare] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [fareDetails, setFareDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);

  const [ssrReady, setSSRReady] = useState(false);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [fareQuoteResponse, setFareQuoteResponse] = useState(null);
  const [priceChanged, setPriceChanged] = useState(false);
  const [oldTotal, setOldTotal] = useState(0);
  const [newTotal, setNewTotal] = useState(0);

  //ssr data
  const [ssrData, setSSRData] = useState(null);
  const [ssrLoading, setSSRLoading] = useState(false);
  const [activeSection, setActiveSection] = useState("PASSENGER");

  // 🔹 Selected SSR
  const [selectedMeals, setSelectedMeals] = useState({
    // paxIndex: mealObject
    0: { Code: "AVML", Price: 0 },
    1: { Code: "VGML", Price: 250 },
  });

  const [selectedBaggage, setSelectedBaggage] = useState({
    0: { Code: "BG10", Weight: 10, Price: 1500 },
  });

  const [selectedSeats, setSelectedSeats] = useState({
    0: { Code: "7A", SeatNo: "A", Price: 1200 },
    1: { Code: "7B", SeatNo: "B", Price: 1100 },
  });

  //insurance
  // Add near other state variables (around line 38)
  const [insuranceData, setInsuranceData] = useState(null);
  // const [insuranceSelected, setInsuranceSelected] = useState(false);
  const [insuranceLoading, setInsuranceLoading] = useState(false);
  const [insuranceError, setInsuranceError] = useState(null);
  const [selectedInsurancePlan, setSelectedInsurancePlan] = useState(null);
  const [insuranceTraceId, setInsuranceTraceId] = useState("");
  // Passenger data state
  const [passengers, setPassengers] = useState([]);
  const [contactEmail, setContactEmail] = useState("");
  const [contactMobile, setContactMobile] = useState("");
  const [contactAddress, setContactAddress] = useState("");

  const state = location?.state;
  const { totalPrice } = state;
  console.log("Checkout received", state);

  const [fareSource, setFareSource] = useState("search");

  const cancellationRule = fareDetails?.MiniFareRules?.[0]?.find(
    (r) => r.Type === "Cancellation"
  );

  const reissueRule = fareDetails?.MiniFareRules?.[0]?.find(
    (r) => r.Type === "Reissue"
  );

  const fetchFareQuote = async () => {
    try {
      setLoading(true);

      const payload = {
        TraceId: searchData?.TraceId,
        ResultIndex: selectedFlight?.ResultIndex,
      };

      console.log("FareQuote Payload:", payload);

      const res = await fare_quote(payload);
      console.log("farequote full:", res.data);
      setFareDetails(res?.data?.Response?.Results || null);
    } catch (err) {
      console.error("FareQuote Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSSR = async () => {
    try {
      setSSRLoading(true);

      const payload = {
        TraceId: searchData?.TraceId,
        ResultIndex: selectedFlight?.ResultIndex,
      };

      const res = await flight_fetchSSR(payload);
      console.log("resp of flight ssr", res.data);

      if (res.data.success) {
        const response = res.data.data.Response;
        console.log("resp inside", response);

        const normalizedSSR = {
          baggage: response?.Baggage?.[0] || [],
          meals: response?.MealDynamic?.[0] || [],
          seats: response?.SeatDynamic?.[0]?.SegmentSeat?.[0]?.RowSeats || [],
          specialServices:
            response?.SpecialServices?.[0]?.SegmentSpecialService?.[0]
              ?.SSRService || [],
        };

        console.log("Normalized SSR:", normalizedSSR);

        setSSRData(normalizedSSR);
      }
    } catch (err) {
      console.error("SSR Error:", err);
    } finally {
      setSSRLoading(false);
    }
  };
  useEffect(() => {
    if (state?.selectedFlight?.originalData?.Fare) {
      setFareDetails({
        Fare: state.selectedFlight.originalData.Fare,
        Segments: state.selectedFlight.originalData.Segments,
        MiniFareRules: state.selectedFlight.originalData.MiniFareRules || [],
        IsRefundable: state.selectedFlight.isRefundable,
      });

      setFareSource("search");
    }
  }, [state]);

  // Get data from flight detail page
  useEffect(() => {
    if (state) {
      const { selectedFlight, selectedFare, searchData } = state;

      setSelectedFlight(selectedFlight);
      setSelectedFare(selectedFare);
      setSearchData(searchData);

      // Initialize passengers based on search data
      initializePassengers(searchData?.passengers);

      localStorage.setItem("checkoutFlight", JSON.stringify(selectedFlight));
      localStorage.setItem("checkoutFare", JSON.stringify(selectedFare));
      localStorage.setItem("checkoutSearch", JSON.stringify(searchData));
    } else {
      // LocalStorage fallback
      const savedFlight = localStorage.getItem("checkoutFlight");
      const savedFare = localStorage.getItem("checkoutFare");
      const savedSearch = localStorage.getItem("checkoutSearch");

      if (savedFlight && savedFare) {
        const flightData = JSON.parse(savedFlight);
        const fareData = JSON.parse(savedFare);
        const searchData = JSON.parse(savedSearch);

        setSelectedFlight(flightData);
        setSelectedFare(fareData);
        setSearchData(searchData);

        // Initialize passengers based on saved search data
        initializePassengers(searchData?.passengers);
      }
    }
  }, []);

  useEffect(() => {
    if (selectedFlight && searchData) {
      fetchInsuranceData(); // ✅ OK on page load
    }
  }, [selectedFlight, searchData]);

  // useEffect(() => {
  //   if (passengers.length > 0) {
  //     fetchInsuranceData();
  //   }
  // }, [passengers]);

  const fetchInsuranceData = async () => {
    try {
      setInsuranceLoading(true);
      setInsuranceError(null);

      // Get travel start date from flight details
      const travelStartDate =
        selectedFlight?.origin?.time ||
        selectedFlight?.origin?.DepartureTime ||
        selectedFlight?.flight?.departureTime;

      if (!travelStartDate) {
        setInsuranceError("Unable to fetch travel date");
        setInsuranceLoading(false);
        return;
      }

      const passengerCount = getPassengerCount();
      const totalPassengers = passengerCount.adults + passengerCount.children;

      // Calculate ages properly
      const paxAges = [];

      // For adults
      for (let i = 0; i < passengerCount.adults; i++) {
        if (passengers[i]?.dateOfBirth) {
          const birthDate = new Date(passengers[i].dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          paxAges.push(Math.max(18, age).toString());
        } else {
          paxAges.push("30"); // Default adult age
        }
      }

      // For children
      for (let i = 0; i < passengerCount.children; i++) {
        const childIndex = passengerCount.adults + i;
        if (passengers[childIndex]?.dateOfBirth) {
          const birthDate = new Date(passengers[childIndex].dateOfBirth);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (
            monthDiff < 0 ||
            (monthDiff === 0 && today.getDate() < birthDate.getDate())
          ) {
            age--;
          }
          paxAges.push(Math.max(1, Math.min(17, age)).toString());
        } else {
          paxAges.push("10"); // Default child age
        }
      }

      const payload = {
        PlanCategory: 1,
        PlanType: 1,
        PlanCoverage: 4,
        TravelStartDate: travelStartDate,
        NoOfPax: totalPassengers,
        PaxAge: paxAges,
      };

      console.log("Insurance request payload:", payload);

      const response = await searchInsurance(payload);
      console.log("Insurance API response:", response);

      // Check if we have data in the response
      if (response.data?.success && response.data?.data?.Response) {
        const insuranceResponse = response.data.data.Response;

        // Check if there are results
        if (
          insuranceResponse.ResponseStatus === 1 &&
          insuranceResponse.Results
        ) {
          // Success with results
          // Process the insurance data to make it easier to use
          setInsuranceTraceId(insuranceResponse.TraceId);
          const processedInsuranceData = insuranceResponse.Results.map(
            (plan) => ({
              PlanCode: plan.PlanCode,
              PlanName: plan.PlanName,
              SumInsured: plan.SumInsured,
              PlanDescription: plan.PlanDescription,
              // Extract price from the Price object
              Premium:
                plan.Price?.OfferedPrice ||
                plan.Price?.PublishedPrice ||
                plan.Price?.GrossFare ||
                0,
              Currency: plan.Price?.Currency || "INR",
              CoverageDetails: plan.CoverageDetails || [],
              PlanCategory: plan.PlanCategory,
              PlanType: plan.PlanType,
              PlanCoverage: plan.PlanCoverage,
              ResultIndex: plan.ResultIndex,
              SumInsuredCurrency: plan.SumInsuredCurrency,
              PoweredBy: plan.PoweredBy,
            })
          );

          setInsuranceData(processedInsuranceData);
          setInsuranceError(null);
        } else if (insuranceResponse.ResponseStatus === 2) {
          // No results found
          setInsuranceError(
            insuranceResponse.Error?.ErrorMessage ||
              "No insurance plans available for this trip"
          );
          setInsuranceData(null);
        } else if (insuranceResponse.ResponseStatus === 3) {
          // Error status
          setInsuranceError(
            insuranceResponse.Error?.ErrorMessage || "Insurance service error"
          );
          setInsuranceData(null);
        }
      } else {
        setInsuranceError("Unable to fetch insurance options");
        setInsuranceData(null);
      }
    } catch (error) {
      console.error("Error fetching insurance:", error);
      setInsuranceError("Failed to load insurance options");
      setInsuranceData(null);
    } finally {
      setInsuranceLoading(false);
    }
  };

  // 🔹 Auto-select insurance when plans are loaded
  useEffect(() => {
    if (
      insuranceData &&
      insuranceData.length > 0 &&
      selectedInsurancePlan === null
    ) {
      setSelectedInsurancePlan(insuranceData[0]); // auto select first plan
    }
  }, [insuranceData]);

  // Initialize passengers based on passenger count
  const initializePassengers = (passengerCount) => {
    if (!passengerCount) return;

    const newPassengers = [];
    let passengerIndex = 0;

    // Add adults
    for (let i = 0; i < passengerCount.adults; i++) {
      newPassengers.push({
        id: `adult-${i}`,
        type: "Adult",
        paxType: 1, // 1 = Adult
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
        paxType: 2, // 2 = Child
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
        paxType: 3, // 3 = Infant
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
  const ssrEligiblePassengers = passengers.filter(
    (p) => p.paxType !== 3 // exclude infants
  );

  const handleSeatSelect = (seat, passengerIndex) => {
    if (seat.AvailablityType !== 1) return;

    setSelectedSeats((prev) => ({
      ...prev,
      [passengerIndex]: seat,
    }));
  };

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

  const calculateFareBreakdown = () => {
    if (!fareDetails?.Fare) {
      return { baseFare: 0, tax: 0, total: 0 };
    }

    // const { BaseFare, Tax, PublishedFare } = fareDetails.Fare;
    const paxCount =
      getPassengerCount().adults +
      getPassengerCount().children +
      getPassengerCount().infants;

    const baseFare = Number(fareDetails.Fare.BaseFare || 0);
    const tax = Number(fareDetails.Fare.Tax || 0);

    return {
      baseFare,
      tax,
      total: Number(fareDetails.Fare.PublishedFare || baseFare + tax),
    };
  };
  const calculateFareBreakdownFromResponse = (fareResponse) => {
    const fare = fareResponse?.Fare;
    if (!fare) {
      return { baseFare: 0, tax: 0, total: 0 };
    }

    const baseFare = Number(fare.BaseFare || 0);
    const tax = Number(fare.Tax || 0);
    const total =
      Number(fare.PublishedFare) || Number(fare.OfferedFare) || baseFare + tax;

    return { baseFare, tax, total };
  };

  const calculateTotalAmount = () => {
    const { total } = calculateFareBreakdown();
    let finalTotal = appliedCoupon
      ? Math.max(0, total - appliedCoupon.discount)
      : total;

    if (!!selectedInsurancePlan && selectedInsurancePlan) {
      const passengerCount = getPassengerCount();
      const totalPassengers = passengerCount.adults + passengerCount.children;

      finalTotal += selectedInsurancePlan.Premium * totalPassengers;
    }
    // 🔹 Add SSR charges
    Object.values(selectedMeals).forEach((meal) => {
      if (meal?.Price) finalTotal += meal.Price;
    });

    Object.values(selectedBaggage).forEach((bag) => {
      if (bag?.Price) finalTotal += bag.Price;
    });

    Object.values(selectedSeats || {}).forEach((s) => {
      if (s?.Price) finalTotal += s.Price;
    });

    return finalTotal;
  };

  const getBaggageInfo = () => {
    const segment = fareDetails?.Segments?.[0]?.[0];

    if (segment) {
      return {
        cabin: segment.CabinBaggage || "N/A",
        checkin: segment.Baggage || "N/A",
      };
    }

    return { cabin: "N/A", checkin: "N/A" };
  };

  const getPassengerCount = () => {
    return {
      adults: searchData?.passengers?.adults || 0,
      children: searchData?.passengers?.children || 0,
      infants: searchData?.passengers?.infants || 0,
    };
  };

  const handleBackToFlights = () => {
    navigate(-1);
  };

  // Handle passenger input change
  const handlePassengerChange = (index, field, value) => {
    const updatedPassengers = [...passengers];
    updatedPassengers[index][field] = value;
    setPassengers(updatedPassengers);
  };

  // Handle contact details change
  const handleContactChange = (field, value) => {
    if (field === "email") {
      setContactEmail(value);
      // Also update email for all passengers
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        email: value,
      }));
      setPassengers(updatedPassengers);
    } else if (field === "mobile") {
      setContactMobile(value);
      // Also update contact number for all passengers
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        contactNo: value,
      }));
      setPassengers(updatedPassengers);
    } else if (field === "address") {
      setContactAddress(value);
      // Also update address for all passengers
      const updatedPassengers = passengers.map((passenger) => ({
        ...passenger,
        addressLine1: value,
      }));
      setPassengers(updatedPassengers);
    }
  };

  // Build the complete booking payload
  const buildFlightBookingPayload = async () => {
    const fareBreakdowns = fareDetails?.FareBreakdown || [];

    const Passengers = passengers.map((pax, index) => {
      const fb = fareBreakdowns.find((f) => f.PassengerType === pax.paxType);

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
          Currency: fb?.Currency || "INR",
          BaseFare: fb?.BaseFare || 0,
          Tax: fb?.Tax || 0,
          PublishedFare: (fb?.BaseFare || 0) + (fb?.Tax || 0),
          OfferedFare: (fb?.BaseFare || 0) + (fb?.Tax || 0),
        },
      };
    });

    return {
      TraceId: searchData.TraceId,
      ResultIndex: selectedFlight.ResultIndex,
      EndUserIp: "127.0.0.1",
      Passengers,
      InsuranceRequired: !!selectedInsurancePlan,
      // InsuranceData: selectedInsurancePlan || null,
      InsuranceData: selectedInsurancePlan
        ? {
            ...selectedInsurancePlan,
            insuranceTraceid: insuranceTraceId,
          }
        : null,
    };
  };

  const calculateFareFromResponse = (fareResponse) => {
    const fare = fareResponse?.Fare;

    if (!fare) {
      return { baseFare: 0, tax: 0, total: 0 };
    }

    const baseFare = Number(fare.BaseFare || 0);
    const tax = Number(fare.Tax || 0);
    const total =
      Number(fare.PublishedFare) || Number(fare.OfferedFare) || baseFare + tax;

    return { baseFare, tax, total };
  };

  const handleConfirmPassengers = async () => {
    setLoading(true);

    try {
      const payload = {
        TraceId: searchData.TraceId,
        ResultIndex: selectedFlight.ResultIndex,
      };

      // 1️⃣ FareQuote
      const res = await fare_quote(payload);
      const results = res?.data?.Response?.Results;
      const normalizedFare = Array.isArray(results) ? results[0] : results;

      setFareDetails(normalizedFare);
      setFareSource("fareQuote");

      // 2️⃣ SSR
      await fetchSSR();
      setSSRReady(true);

      // 3️⃣ Move to SSR section
      setActiveSection("SSR");
    } catch (error) {
      alert("Unable to confirm fare. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToPayment = async () => {
    // 1️⃣ Validate passengers
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

    // 2️⃣ Validate contact
    if (!contactEmail || !contactMobile) {
      alert("Please fill contact details");
      return;
    }

    // 3️⃣ Lock totals for confirmation
    const total = calculateTotalAmount();
    setOldTotal(total);
    setNewTotal(total);

    // 4️⃣ Just open confirm modal
    setShowConfirmModal(true);
  };

  const handleConfirmAndPay = async () => {
    try {
      setLoading(true);

      const userdetails = await getUserData("safarix_user");

      // 1️⃣ Build final flight booking payload (TBO-ready)
      const flightBookingPayload = await buildFlightBookingPayload();

      // 2️⃣ Build ONE final booking object for backend + payment
      const bookingDetails = {
        userId: userdetails?.id,
        serviceType: "flight",
        vendorType: "flight",
        vendorId: selectedFlight?.airline?.flightNumber || null,

        startDate:
          selectedFlight?.origin?.time || selectedFlight?.origin?.DepartureTime,

        totalAmount: newTotal, // 🔒 locked amount from modal

        serviceDetails: flightBookingPayload,

        SSR: {
          Meal: selectedMeals,
          Baggage: selectedBaggage,
          Seat: selectedSeats,
          SpecialServices: ssrData?.specialServices || [],
        },

        insuranceSelected: !!selectedInsurancePlan,
        insurancePlan: selectedInsurancePlan || null,
      };

      console.log("FINAL BOOKING DETAILS", bookingDetails);

      // 3️⃣ Start payment
      await startPayment(bookingDetails);
    } catch (error) {
      console.error("Confirm & Pay failed", error);
      alert("Unable to start payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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

  if (!selectedFlight || !selectedFare) {
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

  const isFareReady = !!fareDetails?.Fare;

  const { baseFare, tax, total } = isFareReady
    ? calculateFareBreakdown()
    : { baseFare: 0, tax: 0, total: 0 };

  const totalAmount = isFareReady ? calculateTotalAmount() : 0;

  const baggageInfo = getBaggageInfo();
  const passengerCount = getPassengerCount();

  // Extract flight details for display
  const flightInfo = selectedFlight;
  const airlineInfo = flightInfo?.airline || flightInfo?.Airline || {};
  const originInfo = flightInfo?.origin || flightInfo?.Origin || {};
  const destinationInfo =
    flightInfo?.destination || flightInfo?.Destination || {};
  const flightDetails = flightInfo?.flight || {};

  return (
    <>
      <Container
        className="flight-checkout-container py-4"
        style={{ marginTop: "100px" }}
      >
        <Row>
          <Col lg={8}>
            {/* Flight Details Card */}
            <Card className="mb-4 shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <h4 className="mb-1">
                      {originInfo.city || originInfo.City || "N/A"} →
                      {destinationInfo.city || destinationInfo.City || "N/A"}
                    </h4>
                    <p className="text-muted mb-2">
                      <strong>
                        {formatDate(
                          originInfo.time || originInfo.DepartureTime
                        )}
                      </strong>{" "}
                      ·
                      {flightDetails.stops === 0
                        ? "Non Stop"
                        : `${flightDetails.stops} Stop(s)`}{" "}
                      -{flightDetails.duration || "N/A"}
                    </p>
                  </div>
                  <Badge bg="primary">
                    {selectedFare.type || selectedFare.FareType || "Standard"}
                  </Badge>
                </div>

                {/* Airline Info */}
                <div className="airline-info mb-4 p-3 bg-light rounded">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-1">
                        {airlineInfo.name ||
                          airlineInfo.AirlineName ||
                          "Airline"}
                      </h6>
                      <small className="text-muted">
                        {airlineInfo.flightNumber || "N/A"} · (
                        {flightDetails.aircraft || "A320"})
                      </small>
                    </div>
                    <div className="text-end">
                      <div className="fare-type-badge">
                        {selectedFare.type || selectedFare.FareType}
                      </div>
                      {fareDetails?.IsRefundable === false && (
                        <Badge bg="danger" className="ms-2">
                          Non-Refundable
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Flight Timeline */}
                <div className="flight-timeline mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="text-center">
                      <div className="time-display fs-4 fw-bold text-primary">
                        {formatTime(
                          originInfo.time || originInfo.DepartureTime
                        )}
                      </div>
                      <div className="airport-info">
                        <div>{originInfo.city || originInfo.City || "N/A"}</div>
                        <small className="text-muted">
                          {originInfo.airport ||
                            originInfo.Airport?.AirportName ||
                            "N/A"}
                        </small>
                      </div>
                    </div>

                    <div className="flight-duration text-center mx-3">
                      <div className="duration-text text-muted">
                        {flightDetails.duration || "N/A"}
                      </div>
                      <div className="flight-path">
                        <div className="line"></div>
                        <div className="plane">✈</div>
                      </div>
                      <div className="stops-text">
                        {flightDetails.stops === 0
                          ? "Non Stop"
                          : `${flightDetails.stops} Stop(s)`}
                      </div>
                    </div>

                    <div className="text-center">
                      <div className="time-display fs-4 fw-bold text-primary">
                        {formatTime(
                          destinationInfo.time || destinationInfo.ArrivalTime
                        )}
                      </div>
                      <div className="airport-info">
                        <div>
                          {destinationInfo.city ||
                            destinationInfo.City ||
                            "N/A"}
                        </div>
                        <small className="text-muted">
                          {destinationInfo.airport ||
                            destinationInfo.Airport?.AirportName ||
                            "N/A"}
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Baggage Information */}
                <div className="baggage-info mb-4">
                  <Row>
                    <Col md={6}>
                      <div className="baggage-item p-3 border rounded">
                        <h6 className="mb-1">Cabin Baggage</h6>
                        <p className="mb-0 text-success">{baggageInfo.cabin}</p>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="baggage-item p-3 border rounded">
                        <h6 className="mb-1">Check-in Baggage</h6>
                        <p className="mb-0 text-success">
                          {baggageInfo.checkin}
                        </p>
                      </div>
                    </Col>
                  </Row>
                </div>

                {/* Selected Fare Benefits */}
                {selectedFare.benefits && (
                  <div className="fare-benefits mb-4 p-3 bg-warning bg-opacity-10 rounded">
                    <h6 className="mb-2">🎁 Included Benefits</h6>
                    <p className="mb-0">{selectedFare.benefits}</p>
                  </div>
                )}
              </Card.Body>
            </Card>

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
                      onClick={handleConfirmPassengers}
                      disabled={loading}
                    >
                      {loading ? "Confirming..." : "Confirm Passenger Details"}
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* Contact Details */}
            <Card className="shadow-sm">
              <Card.Header>
                <h5 className="mb-0">Contact Details</h5>
                <small className="text-muted">
                  This will be used for booking confirmation
                </small>
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

            {/* ================= SSR SECTION ================= */}
            {activeSection === "SSR" && (
              <Card className="mb-4 shadow-sm">
                <Card.Header>
                  <h5 className="mb-0">Additional Services</h5>
                  <small className="text-muted">
                    Meals, baggage and seat selection
                  </small>
                  <Button
                    size="sm"
                    variant="outline-secondary"
                    onClick={() => setActiveSection("PASSENGER")}
                  >
                    Edit Passenger Details
                  </Button>
                </Card.Header>

                <Card.Body>
                  {ssrLoading ? (
                    <div className="text-center py-3">
                      <Spinner animation="border" size="sm" />
                      <p className="mt-2 mb-0">Loading available services…</p>
                    </div>
                  ) : (
                    <Row>
                      {/* ================= MEALS ================= */}
                      {ssrData?.meals?.length > 0 && (
                        <Col md={12} className="mb-4">
                          <h6 className="mb-3">🍽️ Meals</h6>

                          {passengers.map((pax, index) => (
                            <Form.Group key={index} className="mb-2">
                              <Form.Label>
                                {pax.type} {index + 1}
                              </Form.Label>

                              <Form.Select
                                value={selectedMeals[index]?.Code || ""}
                                onChange={(e) => {
                                  const meal = ssrData.meals.find(
                                    (m) => m.Code === e.target.value
                                  );

                                  setSelectedMeals((prev) => ({
                                    ...prev,
                                    [index]: meal || null,
                                  }));
                                }}
                              >
                                <option value="">No meal</option>
                                {ssrData.meals.map((meal) => (
                                  <option key={meal.Code} value={meal.Code}>
                                    {meal.AirlineDescription || meal.Code}
                                    {meal.Price > 0 && ` (+₹${meal.Price})`}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          ))}
                        </Col>
                      )}

                      {/* ================= BAGGAGE ================= */}
                      {ssrData?.baggage?.length > 0 && (
                        <Col md={12} className="mb-4">
                          <h6 className="mb-3">🧳 Extra Baggage</h6>

                          {passengers.map((pax, index) => (
                            <Form.Group key={index} className="mb-2">
                              <Form.Label>
                                {pax.type} {index + 1}
                              </Form.Label>

                              <Form.Select
                                value={selectedBaggage[index]?.Code || ""}
                                onChange={(e) => {
                                  const bag = ssrData.baggage.find(
                                    (b) => b.Code === e.target.value
                                  );

                                  setSelectedBaggage((prev) => ({
                                    ...prev,
                                    [index]: bag || null,
                                  }));
                                }}
                              >
                                <option value="">No extra baggage</option>

                                {ssrData.baggage.map((bag) => (
                                  <option key={bag.Code} value={bag.Code}>
                                    {bag.Text || `${bag.Weight} KG`}
                                    {bag.Price > 0 && ` (+₹${bag.Price})`}
                                  </option>
                                ))}
                              </Form.Select>
                            </Form.Group>
                          ))}
                        </Col>
                      )}

                      {/* ================= SEAT SELECTION (PLACEHOLDER) ================= */}
                      {ssrData?.seats?.length > 0 && (
                        <Col md={12}>
                          <h6 className="mb-2">💺 Seat Selection</h6>

                          {ssrEligiblePassengers.map((pax, index) => (
                            <div
                              key={pax.id}
                              className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                            >
                              <div>
                                <strong>
                                  {pax.type} {index + 1}
                                </strong>
                                <div className="text-muted small">
                                  {selectedSeats[index]
                                    ? `Seat ${selectedSeats[index].SeatNo} (₹${selectedSeats[index].Price})`
                                    : "No seat selected"}
                                </div>
                              </div>

                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => {
                                  setActiveSeatPaxIndex(index);
                                  setShowSeatModal(true);
                                }}
                              >
                                {selectedSeats[index]
                                  ? "Change Seat"
                                  : "Select Seat"}
                              </Button>
                            </div>
                          ))}
                        </Col>
                      )}
                    </Row>
                  )}
                </Card.Body>
              </Card>
            )}
            {/* ================= END SSR SECTION ================= */}
          </Col>

          <Col lg={4}>
            {/* Fare Summary */}
            <Card className="sticky-top shadow-sm" style={{ top: "20px" }}>
              <Card.Header className="bg-primary text-white">
                <h5 className="mb-0">Fare Summary</h5>
                {fareDetails && <small>Live prices from airline</small>}
              </Card.Header>

              <Card.Body>
                {/* ================= FARE SOURCE MESSAGE ================= */}
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

                {/* ================= FARE SUMMARY ================= */}
                {fareDetails && (
                  <>
                    {/* Passenger Count */}
                    <div className="passenger-count mb-3 p-2 bg-light rounded">
                      <small className="text-muted">
                        <strong>Passengers:</strong> {passengerCount.adults}{" "}
                        Adult(s), {passengerCount.children} Child(s),{" "}
                        {passengerCount.infants} Infant(s)
                      </small>
                    </div>

                    {/* Base Fare & Taxes */}
                    <div className="fare-breakdown mb-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span>Base Fare</span>
                        <span>₹ {baseFare.toLocaleString()}</span>
                      </div>

                      <div className="d-flex justify-content-between mb-2">
                        <span>Taxes and Surcharges</span>
                        <span>₹ {tax.toLocaleString()}</span>
                      </div>

                      {/* Insurance */}
                      {selectedInsurancePlan && (
                        <div className="d-flex justify-content-between mb-2">
                          <span>Travel Insurance</span>
                          <span className="text-success">
                            + ₹{selectedInsurancePlan.Premium.toLocaleString()}
                          </span>
                        </div>
                      )}

                      {/* Coupon */}
                      {appliedCoupon && (
                        <div className="d-flex justify-content-between mb-2 text-success">
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
                          <span>
                            - ₹ {appliedCoupon.discount.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <hr />

                      {/* Total */}
                      <div className="d-flex justify-content-between fw-bold fs-5">
                        <span>Total Amount</span>
                        <span className="text-primary">
                          ₹ {totalAmount.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* ================= INSURANCE SECTION ================= */}
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
                              onClick={() => {
                                setSelectedInsurancePlan(null);
                                setInsuranceError(null);
                              }}
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

                          {/* Insurance Yes / No */}
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

                    {/* ================= PROCEED BUTTON ================= */}
                    <Button
                      variant="primary"
                      size="lg"
                      className="w-100 mt-3"
                      onClick={handleProceedToPayment}
                      disabled={!ssrReady || loading}
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
                      ) : ssrReady ? (
                        `PROCEED TO PAY ₹ ${totalAmount.toLocaleString()}`
                      ) : (
                        "CONFIRM FARE & ADD SERVICES"
                      )}
                    </Button>
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Modal
        show={showSeatModal}
        onHide={() => setShowSeatModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Select Seat – {passengers[activeSeatPaxIndex]?.type}{" "}
            {activeSeatPaxIndex + 1}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <div className="seat-grid">
            {ssrData?.seats?.map((row, rowIndex) => (
              <div key={rowIndex} className="d-flex mb-2 align-items-center">
                <div style={{ width: 30 }} className="text-muted">
                  {row.Seats?.[0]?.RowNo}
                </div>

                {row.Seats.map((seat) => {
                  const isAvailable = seat.AvailablityType === 1;
                  const isSelected =
                    selectedSeats?.[activeSeatPaxIndex]?.Code === seat.Code;

                  return (
                    <Button
                      key={seat.Code}
                      size="sm"
                      className="me-2"
                      variant={
                        !isAvailable
                          ? "secondary"
                          : isSelected
                          ? "success"
                          : "outline-primary"
                      }
                      disabled={!isAvailable}
                      onClick={() => {
                        setSelectedSeats((prev) => ({
                          ...prev,
                          [activeSeatPaxIndex]: seat,
                        }));
                        setShowSeatModal(false);
                      }}
                    >
                      {seat.SeatNo || "—"}
                      {seat.Price > 0 && (
                        <small className="d-block">₹{seat.Price}</small>
                      )}
                    </Button>
                  );
                })}
              </div>
            ))}
          </div>
        </Modal.Body>
      </Modal>

      <Modal show={showConfirmModal} centered>
        <Modal.Header>
          <Modal.Title>Confirm Fare & Details</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {priceChanged && (
            <Alert variant="warning">
              Fare has changed from ₹{oldTotal} to ₹{newTotal}
            </Alert>
          )}

          <h6>Selected Services</h6>
          <ul>
            <li>Seats: {Object.values(selectedSeats).length}</li>
            <li>Meals: {Object.values(selectedMeals).length}</li>
            <li>Baggage: {Object.values(selectedBaggage).length}</li>
            <li>
              Insurance:{" "}
              {selectedInsurancePlan
                ? selectedInsurancePlan.PlanName
                : "Not Selected"}
            </li>
          </ul>

          <h5 className="mt-3">Final Payable Amount: ₹{newTotal}</h5>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>

          <Button variant="primary" onClick={handleConfirmAndPay}>
            Confirm & Pay
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Flightcheckout;
