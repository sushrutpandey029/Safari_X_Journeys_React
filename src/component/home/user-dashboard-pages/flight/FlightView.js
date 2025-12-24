// flight/FlightView.jsx
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { flight_getBookingDetails } from "../../../services/flightService";
import useCancellation from "../../../hooks/useCancellation";
import { insuranceBookingDetails } from "../../../services/insuranceService";
import { handleDownloadInvoice } from "../../../utils/invoice";

export default function FlightView({ booking }) {
  const {
    bookingId,
    status,
    totalAmount,
    currency,
    vendorResponse,
    bookingPayments,
    serviceType,
  } = booking || {};

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
  const PNR = flightAPIData?.PNR || fallbackPNR;
  const vendorBookingId = flightAPIData?.BookingId || fallbackBookingId;

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
  const getBookingDetails = async () => {
    try {
      let payload = { EndUserIp: "192.168.1.11" };

      if (vendorBookingId !== "N/A") payload.BookingId = vendorBookingId;
      else if (PNR !== "N/A") payload.PNR = PNR;
      else return;

      const resp = await flight_getBookingDetails(payload);
      setLiveBookingData(resp.data);
    } catch (err) {
      console.error(err);
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
    getBookingDetails();
    fetchLatestInsurance();
  }, []);

  // PDF Invoice
  // const handleDownloadInvoice = () => {
  //   const doc = new jsPDF();
  //   doc.setFontSize(18);
  //   doc.text("FLIGHT Booking Invoice", 14, 20);

  //   doc.setFontSize(12);
  //   // doc.text(`Booking ID: ${bookingId}`, 14, 28);
  //   doc.text(`PNR: ${PNR}`, 14, 34);
  //   doc.text(`Vendor Booking ID: ${vendorBookingId}`, 14, 40);
  //   doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 46);

  //   autoTable(doc, {
  //     startY: 54,
  //     head: [["Field", "Value"]],
  //     body: [
  //       ["PNR", PNR],
  //       ["Vendor Booking ID", String(vendorBookingId)],
  //       ["Route", `${originCity} → ${destinationCity}`],
  //       ["Departure", depTime?.toLocaleString()],
  //       ["Arrival", arrTime?.toLocaleString()],
  //       [
  //         "Airline",
  //         airline
  //           ? `${airline.AirlineName} (${airline.AirlineCode} ${airline.FlightNumber})`
  //           : "N/A",
  //       ],
  //       ["Total Fare", `${currency} ${totalAmount}`],
  //     ],
  //   });

  //   if (passengers.length > 0) {
  //     autoTable(doc, {
  //       startY: doc.lastAutoTable.finalY + 10,
  //       head: [["Name", "Type", "Gender", "DOB", "Ticket No.", "Status"]],
  //       body: passengers.map((p) => [
  //         `${p.Title} ${p.FirstName} ${p.LastName}`,
  //         p.PaxType === 1 ? "Adult" : p.PaxType === 2 ? "Child" : "Infant",
  //         p.Gender === 1 ? "Male" : "Female",
  //         p.DateOfBirth ? new Date(p.DateOfBirth).toLocaleDateString() : "-",
  //         p.Ticket?.TicketNumber || "-",
  //         p.Ticket?.Status || "-",
  //       ]),
  //     });
  //   }

  //   autoTable(doc, {
  //     startY: doc.lastAutoTable.finalY + 10,
  //     head: [["Payment Field", "Value"]],
  //     body: [
  //       ["Amount", `${currency} ${totalAmount}`],
  //       ["Method", paymentInfo.paymentMethod || "N/A"],
  //       ["Payment Status", paymentInfo.paymentStatus || "N/A"],
  //     ],
  //   });

  //   doc.save(`Invoice_Flight_${bookingId}.pdf`);
  // };

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

      {/* BOOKING TABLE */}
      <table className="table table-bordered mt-3">
        <tbody>
          {/* <tr>
            <th>Booking ID</th>
            <td>{bookingId}</td>
          </tr> */}
          <tr>
            <th>Booking ID</th>
            <td>{vendorBookingId}</td>
          </tr>
          <tr>
            <th>PNR</th>
            <td>{PNR}</td>
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
                <td>{insurance.premiumAmount}</td>
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
          <button
            className="btn btn-success mt-3"
            // onClick={handleDownloadInvoice}
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
          </button>
          <button
            className="btn btn-danger mt-3 ms-2"
            disabled={isCancelling}
            onClick={() => startCancellation({ vendorBookingId, bookingId })}
          >
            {isCancelling ? "Processing..." : "Cancel Flight"}
          </button>
        </>
      )}
    </>
  );
}
