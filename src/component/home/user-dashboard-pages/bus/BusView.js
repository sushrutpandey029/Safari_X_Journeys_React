// bus/BusView.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { bus_getBookingDetails } from "../../../services/busservice";
import useCancellation from "../../../hooks/useCancellation";
import { downloadBookingPDF } from "../../../services/bookingService";
import BlockingLoader from "../loader/BlockingLoader";
import { toast } from "react-toastify";

export default function BusView({ booking }) {
  const {
    bookingId,
    status,
    totalAmount,
    currency,
    vendorResponse,
    bookingPayments,
    serviceDetails,
    insuranceDetails,
  } = booking || {};

  const paymentInfo = bookingPayments?.[0] || {};

  // Extract vendor book result
  const bookResult = vendorResponse?.BookResult || {};
  const BusId =
    bookResult?.BusId ||
    bookResult?.BookingId ||
    bookResult?.BusBookingId ||
    null;
  console.log("bus id", BusId);

  // Extract from DB serviceDetails
  const { TraceId, EndUserIp } = serviceDetails || {};
  // const { TokenId, TraceId, EndUserIp } = serviceDetails || {};
  console.log("service detials", serviceDetails);
  console.log("traceid in busview", TraceId);

  // LIVE DATA STATE
  const [liveData, setLiveData] = useState(null);
  const [loading, setLoading] = useState(true);

  // ❗ Cancellation hook
  const {
    isCancelling,
    cancelStatus,
    cancelMessage,
    cancelResult,
    startCancellation,
  } = useCancellation("bus");

  // 1️⃣ FETCH LIVE BUS BOOKING DETAILS
  const fetchBusBookingDetails = async () => {
    try {
      setLoading(true);

      const payload = {
        EndUserIp: booking.serviceDetails.EndUserIp,
        // TokenId: booking.serviceDetails.TokenId,
        TraceId: booking.serviceDetails.TraceId,
        BusId: booking.vendorResponse?.BookResult?.BusId, // IMPORTANT
        IsBaseCurrencyRequired: false,
      };
      console.log("payload before bus booking detail", payload);

      const response = await bus_getBookingDetails(payload);

      console.log("🔵 RAW BUS API RESPONSE:", response);

      // Correct structure:
      const result =
        response?.data?.data?.GetBookingDetailResult ||
        response?.data?.GetBookingDetailResult ||
        null;

      console.log("🔵 LIVE BUS DATA:", result);

      setLiveData(result);
    } catch (err) {
      console.error("❌ BusView fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (TraceId && BusId) fetchBusBookingDetails();
  }, [TraceId, BusId]);
  // useEffect(() => {

  //   if (TokenId && TraceId && BusId) fetchBusBookingDetails();
  // }, [TokenId, TraceId, BusId]);

  if (!liveData) return <div>Loading...</div>;

  // Extract itinerary
  const itinerary = liveData?.Itinerary || {};

  const {
    Origin,
    Destination,
    TravelName,
    BusType,
    DateOfJourney,
    DepartureTime,
    ArrivalTime,
    Passenger = [],
    BoardingPointdetails,
    CancelPolicy = [],
  } = itinerary;

  // PDF Invoice

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const pdfBlob = await downloadBookingPDF(bookingId);

      const url = window.URL.createObjectURL(
        new Blob([pdfBlob], { type: "application/pdf" }),
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

  return (
    <>
      <BlockingLoader
        show={isCancelling}
        title="Cancelling Booking"
        message="Your cancellation request is being processed. Please do not go back or close this window. This may take up to 30 seconds."
      />

      {/* Cancellation messages */}
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

      {/* MAIN BOOKING TABLE */}
      <table className="table table-bordered mt-3">
        <tbody>
          <tr>
            <th>Booking ID</th>
            <td>{bookingId}</td>
          </tr>
          <tr>
            <th>Status</th>
            <td>{status}</td>
          </tr>
          <tr>
            <th>Vendor PNR</th>
            <td>{bookResult?.TravelOperatorPNR || "N/A"}</td>
          </tr>
          <tr>
            <th>Route</th>
            <td>
              {Origin} → {Destination}
            </td>
          </tr>
          <tr>
            <th>Departure</th>
            <td>{new Date(DepartureTime).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Arrival</th>
            <td>{new Date(ArrivalTime).toLocaleString()}</td>
          </tr>
          <tr>
            <th>Bus Type</th>
            <td>{BusType}</td>
          </tr>
          <tr>
            <th>Travel Operator</th>
            <td>{TravelName}</td>
          </tr>
          <tr>
            <th>Total Fare</th>
            <td>
              {currency} {totalAmount}
            </td>
          </tr>
        </tbody>
      </table>

      {/* BOARDING DETAILS */}
      <h6>
        <strong>Boarding Point</strong>
      </h6>
      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>Name</th>
            <td>{BoardingPointdetails?.CityPointName}</td>
          </tr>
          <tr>
            <th>Address</th>
            <td>{BoardingPointdetails?.CityPointAddress}</td>
          </tr>
          <tr>
            <th>Contact</th>
            <td>{BoardingPointdetails?.CityPointContactNumber}</td>
          </tr>
          <tr>
            <th>Time</th>
            <td>
              {new Date(BoardingPointdetails?.CityPointTime).toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {/* PASSENGERS */}
      <h6>
        <strong>Passengers</strong>
      </h6>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Name</th>
            <th>Gender</th>
            <th>Seat Name</th>
            {/* <th>Fare</th> */}
          </tr>
        </thead>
        <tbody>
          {Passenger.map((p, i) => (
            <tr key={i}>
              <td>
                {p.Title} {p.FirstName} {p.LastName}
              </td>
              <td>{p.Gender === 1 ? "Male" : "Female"}</td>
              <td>{p.Seat?.SeatName}</td>
              {/* <td>₹{p.Seat?.Price?.BasePrice}</td> */}
              {/* <td>
                {p.Seat?.SeatName} (₹{p.Seat?.Price?.BasePrice})
              </td>
              <td>₹{p.Seat?.Price?.BasePrice}</td> */}
            </tr>
          ))}
        </tbody>
      </table>

      {/* CANCELLATION POLICY */}
      <h6>
        <strong>Cancellation Policy</strong>
      </h6>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Policy</th>
            <th>Charge (%)</th>
            <th>Valid From</th>
            <th>Valid To</th>
          </tr>
        </thead>
        <tbody>
          {CancelPolicy.map((p, i) => (
            <tr key={i}>
              <td>{p.PolicyString}</td>
              <td>{p.CancellationCharge}%</td>
              <td>{new Date(p.FromDate).toLocaleString()}</td>
              <td>{new Date(p.ToDate).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {(status === "confirmed" || status === "cancelled") && (
        <button
          className="btn btn-outline-primary"
          onClick={() => handleDownloadInvoice(booking.bookingId)}
        >
          Download Invoice
        </button>
      )}

      {/* ACTION BUTTONS */}
      {status === "confirmed" && (
        <>
          <button
            className="btn btn-outline-danger"
            disabled={isCancelling}
            onClick={() =>
              startCancellation({ vendorBookingId: BusId, bookingId, TraceId })
            }
          >
            {isCancelling ? "Processing..." : "Cancel Booking"}
          </button>
        </>
      )}
    </>
  );
}
