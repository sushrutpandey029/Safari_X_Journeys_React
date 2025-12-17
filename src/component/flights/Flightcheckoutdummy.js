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

  const [selectedFlight, setSelectedFlight] = useState(null);
  const [selectedFare, setSelectedFare] = useState(null);
  const [searchData, setSearchData] = useState(null);
  const [fareDetails, setFareDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [error, setError] = useState(null);

  //ssr data
  const [ssrData, setSSRData] = useState(null);
  const [ssrLoading, setSSRLoading] = useState(false);

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

  const fetchFareQuote = async () => {
    try {
      setLoading(true);

      const payload = {
        TraceId: searchData?.TraceId,
        ResultIndex: selectedFlight?.ResultIndex,
        // EndUserIp: searchData?.EndUserIp,
        // TokenId: searchData?.TokenId,
      };

      console.log("FareQuote Payload:", payload);

      const res = await fare_quote(payload);
      console.log("farequote resp", res.data);
      if (res.data.success) {
        const response = res.data.data?.Response;

        // Store updated live fare
        setFareDetails(response?.Results?.Fare || null);

        // 🔥 CRITICAL: Update TraceId (FareQuote returns a NEW TraceId)
        if (response?.TraceId) {
          setSearchData((prev) => ({
            ...prev,
            TraceId: response.TraceId,
          }));
        }

        // Sometimes ResultIndex changes — update it.
        if (response?.Results?.ResultIndex) {
          setSelectedFlight((prev) => ({
            ...prev,
            ResultIndex: response.Results.ResultIndex,
          }));
        }

        console.log("FareQuote Success:", response);
      } else {
        console.log("FareQuote API returned error:", res.data);
      }
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
        EndUserIp: searchData?.EndUserIp,
        TokenId: searchData?.TokenId,
        TraceId: searchData?.TraceId,
        ResultIndex: selectedFlight?.ResultIndex,
      };

      console.log("SSR Payload:", payload);

      const res = await flight_fetchSSR(payload);
      console.log("resp of flight ssr", res.data);
      if (res.data.success) {
        setSSRData(res.data.data?.Response);
      }
    } catch (err) {
      console.error("SSR Error:", err);
    } finally {
      setSSRLoading(false);
    }
  };

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

  // Replace the existing useEffect for fetchInsuranceData
  useEffect(() => {
    const init = async () => {
      if (selectedFlight && selectedFare && searchData) {
        await fetchFareQuote(); // 1️⃣ MUST RUN FIRST
        await fetchSSR(); // 2️⃣ SSR AFTER FareQuote
        await fetchInsuranceData(); // 3️⃣ Insurance last
      }
    };

    init();
  }, [selectedFlight, selectedFare, searchData]);

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
    if (!fareDetails) {
      return {
        baseFare: selectedFare?.originalPrice || selectedFare?.price || 0,
        tax: selectedFare?.tax || 913,
        total:
          (selectedFare?.originalPrice || selectedFare?.price || 0) +
          (selectedFare?.tax || 913),
      };
    }

    const baseFare = fareDetails.BaseFare || 0;
    const tax = fareDetails.Tax || 0;
    const total = fareDetails.TotalAmount || baseFare + tax;

    return { baseFare, tax, total };
  };

  // const calculateTotalAmount = () => {
  //   const { total } = calculateFareBreakdown();
  //   return appliedCoupon ? Math.max(0, total - appliedCoupon.discount) : total;
  // };

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

    return finalTotal;
  };

  const getBaggageInfo = () => {
    if (fareDetails?.BaggageInformation) {
      return fareDetails.BaggageInformation;
    }

    if (selectedFlight?.flight) {
      return {
        cabin: selectedFlight.flight.cabinBaggage || "7 Kgs / Adult",
        checkin: selectedFlight.flight.baggage || "15 Kgs / Adult",
      };
    }

    return {
      cabin: "7 Kgs / Adult",
      checkin: "15 Kgs / Adult",
    };
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

  // Get fare breakdown per passenger type
  const getFareForPassengerType = (paxType) => {
    if (!selectedFlight?.originalData?.FareBreakdown) {
      // Return default fare based on passenger type
      switch (paxType) {
        case 1:
          return { BaseFare: 8292, Tax: 1071 }; // Adult
        case 2:
          return { BaseFare: 2500, Tax: 1000 }; // Child (example)
        case 3:
          return { BaseFare: 500, Tax: 50 }; // Infant (example)
        default:
          return { BaseFare: 0, Tax: 0 };
      }
    }

    const fareBreakdown = selectedFlight.originalData.FareBreakdown.find(
      (item) => item.PassengerType === paxType
    );

    if (fareBreakdown) {
      return {
        BaseFare: fareBreakdown.BaseFare || 0,
        Tax: fareBreakdown.Tax || 0,
      };
    }

    // Fallback if not found
    return { BaseFare: 0, Tax: 0 };
  };

  // Build the complete booking payload
  const buildFlightBookingPayload = async () => {
    const passengerCount = getPassengerCount();

    const Passengers = passengers.map((pax, index) => {
      const fareData = getFareForPassengerType(pax.paxType);
      const publishedFare = (fareData.BaseFare || 0) + (fareData.Tax || 0);

      // Get YQTax and OtherTaxes from tax breakdown if available
      const taxBreakup = selectedFlight?.originalData?.Fare?.TaxBreakup || [];
      const yqTax = taxBreakup.find((item) => item.key === "YQTax")?.value || 0;
      const otherCharges = 0; // This might need adjustment based on actual data

      return {
        Title:
          pax.title ||
          (pax.paxType === 1 ? "Mr" : pax.paxType === 2 ? "Master" : "Master"),
        FirstName: pax.firstName || "",
        LastName: pax.lastName || "",
        PaxType: pax.paxType, // 1 = Adult, 2 = Child, 3 = Infant
        DateOfBirth: pax.dateOfBirth
          ? new Date(pax.dateOfBirth).toISOString()
          : "1987-12-06T00:00:00",
        Gender: pax.gender === "male" || pax.gender === "1" ? 1 : 2,
        PassportNo: pax.passportNumber || "",
        PassportExpiry: pax.passportExpiry
          ? new Date(pax.passportExpiry).toISOString()
          : "2030-12-06T00:00:00",
        AddressLine1: pax.addressLine1 || contactAddress || "123, Test",
        City: pax.city || "Gurgaon",
        CountryCode: pax.countryCode || "IN",
        CellCountryCode: "+91",
        ContactNo: pax.contactNo || contactMobile || "1234567890",
        Nationality: pax.nationality || "IN",
        Email: pax.email || contactEmail || "test@example.com",
        IsLeadPax: pax.isLeadPax || index === 0,
        Fare: {
          Currency: "INR",
          BaseFare: fareData.BaseFare || 0,
          Tax: fareData.Tax || 0,
          YQTax: yqTax,
          OtherCharges: otherCharges,
          PublishedFare: publishedFare,
          OfferedFare: publishedFare, // Adjust if you have different offered fare
        },
      };
    });

    const payload = {
      ResultIndex:
        selectedFlight?.ResultIndex ||
        selectedFlight?.originalFlightData?.ResultIndex,
      Passengers,
      EndUserIp: "192.168.11.58", // You might want to get this dynamically
      TraceId: searchData?.TraceId || null,

      InsuranceRequired: !!selectedInsurancePlan,
      InsuranceData: selectedInsurancePlan
        ? {
            PlanCode: selectedInsurancePlan.PlanCode,
            PlanName: selectedInsurancePlan.PlanName,
            Premium: selectedInsurancePlan.Premium,
            SumInsured: selectedInsurancePlan.SumInsured,
            Coverage: selectedInsurancePlan.CoverageDetails,
            TraceId: insuranceTraceId || "",
          }
        : null,
    };

    console.log("Final Booking Payload:", JSON.stringify(payload, null, 2));
    return payload;
  };

  const handleProceedToPayment = async () => {
    const userdetails = await getUserData("safarix_user");
    if (!selectedFlight || !selectedFare) {
      alert("Missing flight details. Please reselect the flight.");
      return;
    }

    // Validate all passenger data
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
          alert(
            `Please fill all required fields for ${passenger.type} passenger`
          );
          return;
        }
      }
    }

    if (!contactEmail || !contactMobile) {
      alert("Please fill contact details");
      return;
    }

    const payload = await buildFlightBookingPayload();

    console.log("Booking Payload", payload);
    const bookingDetails = {
      userId: userdetails?.id,
      serviceType: "flight",
      vendorType: "flight",
      vendorId: selectedFlight?.airline.flightNumber || null,
      serviceProviderId: "",
      serviceDetails: payload,

      totalAmount: calculateTotalAmount(),
      startDate: selectedFlight?.origin.time,

      insuranceSelected: !!selectedInsurancePlan,
      insurancePlan: selectedInsurancePlan || null, // ⬅ fix
    };

    try {
      const result = startPayment(bookingDetails);
    } catch (error) {
      console.error("Booking failed", error);
      alert("Something went wrong! Try again.");
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

  const { baseFare, tax } = calculateFareBreakdown();
  const totalAmount = calculateTotalAmount();
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
                      {formatDate(originInfo.time || originInfo.DepartureTime)}
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
                      {airlineInfo.name || airlineInfo.AirlineName || "Airline"}
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
                    {!selectedFare.isRefundable && (
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
                      {formatTime(originInfo.time || originInfo.DepartureTime)}
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
                        {destinationInfo.city || destinationInfo.City || "N/A"}
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
                      <p className="mb-0 text-success">{baggageInfo.checkin}</p>
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

          {/* Passenger Details Form */}
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
                            handlePassengerChange(index, "city", e.target.value)
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
            </Card.Body>
          </Card>

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
        </Col>

        <Col lg={4}>
          {/* Fare Summary */}
          <Card className="sticky-top shadow-sm" style={{ top: "20px" }}>
            <Card.Header className="bg-primary text-white">
              <h5 className="mb-0">Fare Summary</h5>
              {fareDetails && <small>Live prices from airline</small>}
            </Card.Header>
            <Card.Body>
              {/* Passenger Count */}
              <div className="passenger-count mb-3 p-2 bg-light rounded">
                <small className="text-muted">
                  <strong>Passengers:</strong> {passengerCount.adults} Adult(s),{" "}
                  {passengerCount.children} Child(s), {passengerCount.infants}{" "}
                  Infant(s)
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

                {selectedInsurancePlan && (
                  <div className="d-flex justify-content-between mb-2">
                    <span>Travel Insurance</span>
                    <span className="text-success">
                      + ₹{selectedInsurancePlan?.Premium?.toLocaleString()}
                    </span>
                  </div>
                )}

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
                    <span>- ₹ {appliedCoupon.discount.toLocaleString()}</span>
                  </div>
                )}

                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5">
                  <span>Total Amount</span>
                  <span className="text-primary">
                    ₹ {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Coupon Section */}
              {/* <div className="coupon-section mb-3">
                <Form.Group>
                  <Form.Label>Coupons and Offers</Form.Label>
                  <div className="d-flex gap-2">
                    <Form.Control
                      type="text"
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                    />
                    <Button
                      variant={appliedCoupon ? "success" : "outline-primary"}
                      onClick={applyCoupon}
                      disabled={!!appliedCoupon}
                    >
                      {appliedCoupon ? "Applied" : "Apply"}
                    </Button>
                  </div>
                </Form.Group>
                <div className="text-end">
                  <Button variant="link" size="sm" className="p-0">
                    VIEW ALL COUPONS ✅
                  </Button>
                </div>
              </div> */}
              {/* Cancellation Policy */}
              <div className="cancellation-policy">
                <h6>Cancellation & Date Change Policy</h6>
                <Table bordered size="sm" className="mb-3">
                  <thead>
                    <tr>
                      <th>Flight Details</th>
                      <th>Penalty</th>
                      <th>Refund</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Cancellation Penalty:</td>
                      <td>₹ 4,650</td>
                      <td>
                        ₹{" "}
                        {totalAmount - 4650 > 0
                          ? (totalAmount - 4650).toLocaleString()
                          : 0}
                      </td>
                    </tr>
                    <tr>
                      <td>Cancel Between (ST):</td>
                      <td colSpan="2">
                        Now -{" "}
                        {formatDate(
                          originInfo.time || originInfo.DepartureTime
                        )}{" "}
                        06:30
                      </td>
                    </tr>
                  </tbody>
                </Table>

                <div className="text-center">
                  <small className="text-muted">
                    Get more benefits by upgrading your fare
                  </small>
                </div>
              </div>
              {/* insurance section */}

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

                {insuranceData &&
                Array.isArray(insuranceData) &&
                insuranceData.length > 0 ? (
                  <>
                    <div className="insurance-plans mb-3">
                      {insuranceData.map((plan, index) => (
                        <div
                          key={index}
                          className={`insurance-plan p-2 mb-2 border rounded ${
                            selectedInsurancePlan?.PlanCode === plan.PlanCode
                              ? "border-primary"
                              : ""
                          }`}
                          onClick={() => setSelectedInsurancePlan(plan)}
                          style={{ cursor: "pointer" }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <strong className="d-block">
                                {plan.PlanName || "Travel Insurance"}
                              </strong>
                              <small className="text-muted">
                                Coverage: ₹
                                {parseInt(
                                  plan.SumInsured || 0
                                ).toLocaleString()}
                              </small>
                              {plan.PoweredBy && (
                                <small className="d-block text-info">
                                  <em>{plan.PoweredBy}</em>
                                </small>
                              )}
                            </div>
                            <div className="text-end">
                              <strong className="text-primary d-block">
                                ₹{(plan.Premium || 0).toLocaleString()}
                              </strong>
                              <small className="text-muted">
                                {plan.Currency || "INR"}
                              </small>
                            </div>
                          </div>

                          {/* Coverage Details */}
                          {plan.CoverageDetails &&
                            plan.CoverageDetails.length > 0 && (
                              <div className="mt-2">
                                <small className="d-block fw-bold mb-1">
                                  Coverage Includes:
                                </small>
                                <div className="d-flex flex-wrap gap-1">
                                  {plan.CoverageDetails.slice(0, 3).map(
                                    (coverage, idx) => (
                                      <Badge
                                        key={idx}
                                        bg="info"
                                        className="me-1 mb-1"
                                      >
                                        {coverage.CoverageName || coverage.Name}
                                      </Badge>
                                    )
                                  )}
                                  {plan.CoverageDetails.length > 3 && (
                                    <Badge bg="secondary" className="mb-1">
                                      +{plan.CoverageDetails.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                          {plan.PlanDescription && (
                            <small className="d-block mt-1 text-muted">
                              {plan.PlanDescription}
                            </small>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="insurance-option">
                      <Form.Check
                        type="radio"
                        id="insurance-yes"
                        label={`Yes, add travel insurance (₹${
                          selectedInsurancePlan?.Premium?.toLocaleString() || 0
                        })`}
                        checked={selectedInsurancePlan !== null}
                        onChange={() => {
                          if (
                            !selectedInsurancePlan &&
                            insuranceData?.length > 0
                          ) {
                            setSelectedInsurancePlan(insuranceData[0]); // default first plan
                          }
                        }}
                      />

                      <Form.Check
                        type="radio"
                        id="insurance-no"
                        label="No, I don't need insurance"
                        checked={selectedInsurancePlan === null}
                        onChange={() => setSelectedInsurancePlan(null)}
                      />
                    </div>
                    {selectedInsurancePlan && (
                      <div className="insurance-total mt-2 p-2 bg-light rounded">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <small>Selected Insurance:</small>
                            <small className="text-muted">
                              {selectedInsurancePlan?.PlanName}
                            </small>
                          </div>
                          <small className="text-success fw-bold">
                            + ₹
                            {selectedInsurancePlan?.Premium?.toLocaleString()}
                          </small>
                        </div>
                      </div>
                    )}
                  </>
                ) : !insuranceLoading && !insuranceData ? (
                  <div className="text-center py-3">
                    <small className="text-muted d-block mb-2">
                      Insurance options are currently unavailable for this trip
                    </small>
                    <Form.Check
                      type="radio"
                      id="insurance-no-only"
                      label="Continue without insurance"
                      checked={true}
                      onChange={() => setSelectedInsurancePlan(null)}
                      disabled={insuranceLoading}
                    />
                  </div>
                ) : null}
              </div>
              {/* Proceed to Pay Button */}
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
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    PROCESSING...
                  </>
                ) : (
                  // `PROCEED TO PAY ₹ ${totalPrice.toLocaleString()}`
                  `PROCEED TO PAY ₹ ${calculateTotalAmount().toLocaleString()}`
                )}
              </Button>
              {/* API Status Indicator */}
              {fareDetails && (
                <div className="text-center mt-2">
                  <small className="text-success">
                    ✅ Live fare loaded successfully
                  </small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Flightcheckout;
