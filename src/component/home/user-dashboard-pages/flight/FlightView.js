// flight/FlightView.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { flight_getBookingDetails } from "../../../services/flightService";
import useCancellation from "../../../hooks/useCancellation";
import { insuranceBookingDetails } from "../../../services/insuranceService";
import { handleDownloadInvoice } from "../../../utils/invoice";
import { downloadBookingPDF } from "../../../services/bookingService";

export default function FlightView({ booking }) {
  const [activeBookingId, setActiveBookingId] = useState(null);

  const {
    bookingId,
    status,
    totalAmount,
    currency,
    vendorResponse,
    bookingPayments,
    serviceType,
  } = booking || {};

  console.log("booking in flightview page", booking);

  // Normalize vendor booking IDs
  const bookingIds = React.useMemo(() => {
    if (Array.isArray(booking?.vendorResponse?.bookingIds)) {
      return booking.vendorResponse.bookingIds.map(String);
    }

    if (typeof booking?.vendorBookingId === "string") {
      return booking.vendorBookingId.split(",").map((id) => id.trim());
    }

    return [];
  }, [booking]);

  const insurance = booking?.insuranceDetails;
  const insuranceBookingId = insurance?.insuranceBookingId;
  const policyDocumentUrl = insurance?.policyDocumentUrl;
  const [insuranceStatusData, setInsuranceStatusData] = useState(null);
  const [loadingInsurance, setLoadingInsurance] = useState(false);

  const {
    isCancelling,
    cancelStatus,
    cancelMessage,
    cancelResult,
    startCancellation,
  } = useCancellation(serviceType || "flight");

  const [liveBookingData, setLiveBookingData] = useState(null);

  const paymentInfo = bookingPayments?.[0] || {};

  // Extract fallback data
  const bookRoot = vendorResponse?.Response;
  const bookInner = bookRoot?.Response || bookRoot || {};

  const ticketRoot = vendorResponse?.ticketResponse?.Response;
  const ticketInner = ticketRoot?.Response || ticketRoot || {};

  const fallbackFlight =
    ticketInner?.FlightItinerary || bookInner?.FlightItinerary || {};

  const fallbackPNR = ticketInner?.PNR || bookInner?.PNR || "N/A";
  const fallbackBookingId =
    ticketInner?.BookingId || bookInner?.BookingId || "N/A";

  // Preferred live API → fallback
  const flightAPIData = liveBookingData?.data?.Response || {};
  const flightItinerary = flightAPIData?.FlightItinerary || fallbackFlight;
  // BookingId from live API OR active tab
  const vendorBookingId = flightAPIData?.BookingId || activeBookingId || "";

  // PNR from live API OR journey-level data
  const activeIndex = bookingIds.findIndex(
    (id) => String(id) === String(activeBookingId)
  );

  const PNR =
    flightAPIData?.PNR || booking?.vendorResponse?.pnrs?.[activeIndex] || "";

  const segments = flightItinerary?.Segments || [];
  const passengers = flightItinerary?.Passenger || [];

  const firstSegment = Array.isArray(segments) && segments[0];

  const originAirport = firstSegment?.Origin?.Airport;
  const destinationAirport = firstSegment?.Destination?.Airport;

  const originCity = originAirport?.CityName || originAirport?.AirportCode;
  const destinationCity =
    destinationAirport?.CityName || destinationAirport?.AirportCode;

  const depTime =
    firstSegment?.Origin?.DepTime && new Date(firstSegment.Origin.DepTime);
  const arrTime =
    firstSegment?.Destination?.ArrTime &&
    new Date(firstSegment.Destination.ArrTime);

  const airline = firstSegment?.Airline;

  // Fetch booking details (Live Data)
  // const getBookingDetails = async () => {
  //   try {
  //     let payload = { EndUserIp: "192.168.1.11" };

  //     if (vendorBookingId !== "N/A") payload.BookingId = vendorBookingId;
  //     else if (PNR !== "N/A") payload.PNR = PNR;
  //     else return;
  //     console.log("payload before gliht getbookingdtails", payload);
  //     const resp = await flight_getBookingDetails(payload);
  //     setLiveBookingData(resp.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  const getBookingDetails = async (bookingIdToFetch) => {
    try {
      if (!bookingIdToFetch) return;

      const payload = {
        EndUserIp: "192.168.1.11",
        BookingId: bookingIdToFetch,
      };

      console.log("Fetching booking details for:", bookingIdToFetch);

      const resp = await flight_getBookingDetails(payload);
      setLiveBookingData(resp.data);
    } catch (err) {
      console.error("Flight getBookingDetails error", err);
    }
  };

  const fetchLatestInsurance = async () => {
    try {
      setLoadingInsurance(true);
      const resp = await insuranceBookingDetails({
        BookingId: insuranceBookingId,
      });
      console.log("insurance resp", resp);
      setInsuranceStatusData(resp.data);
    } catch (error) {
      console.error("Error fetching insurance:", error);
    } finally {
      setLoadingInsurance(false);
    }
  };

  useEffect(() => {
    fetchLatestInsurance();
  }, []);

  const handleDownloadInvoice = async (bookingId,vendorBookingId) => {
    try {
      console.log("bookingid indownload", bookingId,vendorBookingId);
      const pdfBlob = await downloadBookingPDF(bookingId,vendorBookingId);

      const url = window.URL.createObjectURL(
        new Blob([pdfBlob], { type: "application/pdf" })
      );

      const link = document.createElement("a");
      link.href = url;
      link.download = `Booking-${bookingId}.pdf`;
      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice", error);
      alert("Unable to download invoice. Please try again.");
    }
  };

  const getJourneySummary = (index) => {
    console.log("🔥 getJourneySummary called for index:", index);
    const journey = booking?.vendorResponse?.journeys?.[index];
    console.log("journey", journey);
    const itinerary =
      journey?.bookResponse?.Response?.Response?.FlightItinerary;
    console.log("itinerary", itinerary);
    if (!itinerary) return "";

    // Primary (TBO best)
    if (
      typeof itinerary.Origin === "string" &&
      typeof itinerary.Destination === "string"
    ) {
      return `${itinerary.Origin} → ${itinerary.Destination}`;
    }

    // Fallback
    const segments = itinerary?.Segments;
    if (!segments?.length) return "";

    const origin = segments[0]?.Origin?.Airport?.AirportCode;
    const destination =
      segments[segments.length - 1]?.Destination?.Airport?.AirportCode;
    console.log("origin,destination", origin, destination);
    return origin && destination ? `${origin} → ${destination}` : "";
  };

  useEffect(() => {
    if (bookingIds.length > 0) {
      setActiveBookingId(bookingIds[0]); // default first journey
    }
  }, [bookingIds]);

  useEffect(() => {
    if (activeBookingId) {
      getBookingDetails(activeBookingId);
    }
  }, [activeBookingId]);

  return (
    <>
      {/* STATUS UI */}
      {cancelStatus === "processing" && (
        <div className="alert alert-warning mt-3">{cancelMessage}</div>
      )}
      {cancelStatus === "success" && cancelResult && (
        <div className="alert alert-success mt-3">
          <strong>Cancellation Complete</strong>
          <p>Refund Amount: ₹{cancelResult.refund}</p>
          <p>Cancellation Fee: ₹{cancelResult.charge}</p>
          <p>Credit Note: {cancelResult.creditNote}</p>
        </div>
      )}
      {(cancelStatus === "failed" || cancelStatus === "rejected") && (
        <div className="alert alert-danger mt-2">{cancelMessage}</div>
      )}

      {bookingIds.length > 1 && (
        <ul className="nav nav-tabs mb-3">
          {bookingIds.map((id, index) => {
            const journeyLabel =
              booking.serviceDetails?.TripType === "round"
                ? index === 0
                  ? "Onward"
                  : "Return"
                : `Journey ${index + 1}`;

            const routeSummary = getJourneySummary(index);

            return (
              <li className="nav-item" key={id}>
                <button
                  className={`nav-link ${
                    activeBookingId === id ? "active" : ""
                  }`}
                  onClick={() => setActiveBookingId(id)}
                >
                  <div className="fw-bold">{journeyLabel}</div>
                  {routeSummary && (
                    <small className="text-muted">{routeSummary}</small>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {/* BOOKING TABLE */}
      <table className="table table-bordered mt-3">
        <tbody>
          <tr>
            <th>Booking ID</th>
            <td>{vendorBookingId || "Loading..."}</td>
          </tr>
          <tr>
            <th>PNR</th>
            <td>{PNR || "Loading..."}</td>
          </tr>

          <tr>
            <th>Status</th>
            <td>{status}</td>
          </tr>
          <tr>
            <th>Total Amount</th>
            <td>
              {currency} {totalAmount}
            </td>
          </tr>
          <tr>
            <th>Route</th>
            <td>
              {originCity} → {destinationCity}
            </td>
          </tr>
          <tr>
            <th>Departure</th>
            <td>{depTime?.toLocaleString()}</td>
          </tr>
          <tr>
            <th>Arrival</th>
            <td>{arrTime?.toLocaleString()}</td>
          </tr>
          <tr>
            <th>Airline</th>
            <td>
              {airline?.AirlineName} ({airline?.AirlineCode}{" "}
              {airline?.FlightNumber})
            </td>
          </tr>
        </tbody>
      </table>

      {/* insurance table */}
      {insurance && (
        <>
          <h6 className="mt-4">
            <strong>🛡 Insurance Details</strong>
          </h6>

          <table className="table table-bordered">
            <tbody>
              <tr>
                <th>Insurance Booking ID</th>
                <td>{insurance.insuranceBookingId}</td>
              </tr>

              <tr>
                <th>Policy Number</th>
                <td>{insurance.policyNumber || "Pending"}</td>
              </tr>

              <tr>
                <th>Plan Name</th>
                <td>{insurance.planName}</td>
              </tr>

              <tr>
                <th>Premium Amount</th>
                <td>{insurance.totalAmount}</td>
              </tr>

              <tr>
                <th>Status</th>
                <td
                  className={
                    insurance.status === "confirmed"
                      ? "text-success"
                      : "text-danger"
                  }
                >
                  {insurance.status}
                </td>
              </tr>

              {/* LATEST STATUS */}
              {insuranceStatusData?.PolicyStatus && (
                <tr>
                  <th>Latest Policy Status</th>
                  <td>{insuranceStatusData.PolicyStatus}</td>
                </tr>
              )}

              {/* 📄 POLICY DOCUMENT LINK — INSIDE TABLE */}
              {booking.insuranceDetails?.responsePayload?.Response?.Itinerary
                ?.PaxInfo?.[0]?.DocumentURL && (
                <tr>
                  <th>Policy Document</th>
                  <td>
                    <a
                      href={
                        booking.insuranceDetails.responsePayload.Response
                          .Itinerary.PaxInfo[0].DocumentURL
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary btn-sm"
                    >
                      Download Policy PDF
                    </a>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </>
      )}

      {/* PASSENGER TABLE */}
      <h6>
        <strong>Passengers</strong>
      </h6>
      {passengers.length ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Gender</th>
              <th>DOB</th>
              <th>Ticket No</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {passengers.map((p, i) => (
              <tr key={i}>
                <td>
                  {p.Title} {p.FirstName} {p.LastName}
                </td>
                <td>
                  {p.PaxType === 1
                    ? "Adult"
                    : p.PaxType === 2
                    ? "Child"
                    : "Infant"}
                </td>
                <td>{p.Gender === 1 ? "Male" : "Female"}</td>
                <td>
                  {p.DateOfBirth
                    ? new Date(p.DateOfBirth).toLocaleDateString()
                    : "-"}
                </td>
                <td>{p.Ticket?.TicketNumber || "-"}</td>
                <td>{p.Ticket?.Status || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        "No passenger details available"
      )}

      {/* ACTION BUTTONS */}
      {status === "confirmed" && (
        <>
          {/* <button
            className="btn btn-success mt-3"
             onClick={() =>
              handleDownloadInvoice({
                serviceType: "flight",
                payload: {
                  bookingId,
                  PNR,
                  vendorBookingId,
                  originCity,
                  destinationCity,
                  depTime,
                  arrTime,
                  airline,
                  passengers,
                  currency,
                  totalAmount,
                  paymentInfo,
                },
              })
            }
          >
            Download Invoice (PDF)
          </button> */}
          <button
            className="btn btn-outline-primary"
            onClick={() => handleDownloadInvoice(booking.bookingId,vendorBookingId)}
          >
            Download Invoice
          </button>
          <button
            className="btn btn-outline-danger"
            disabled={isCancelling}
            onClick={() =>
              startCancellation({ vendorBookingId: activeBookingId, bookingId })
            }
          >
            {isCancelling ? "Processing..." : "Cancel Flight"}
          </button>
        </>
      )}
    </>
  );
}
