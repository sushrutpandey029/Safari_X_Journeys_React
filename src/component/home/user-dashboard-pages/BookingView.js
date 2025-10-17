import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

function BookingView() {
  const location = useLocation();
  const navigate = useNavigate();
  const booking = location.state?.bookingData;

  if (!booking) {
    return (
      <div className="container mt-5 text-center">
        <h5>No booking data found</h5>
        <button className="btn btn-primary mt-3" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const {
    bookingId,
    serviceType,
    status,
    totalAmount,
    currency,
    serviceDetails,
    payments,
    vendorResponse,
    HotelRoomsDetails,
  } = booking;

  const handleDownloadInvoice = () => {
    const doc = new jsPDF();

    // 🧾 Header
    doc.setFontSize(18);
    doc.text("Hotel Booking Invoice", 14, 20);
    doc.setFontSize(12);
    doc.text(`Booking ID: ${bookingId}`, 14, 30);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37);

    // 🏨 Booking details
    autoTable(doc, {
      startY: 45,
      head: [["Field", "Value"]],
      body: [
        ["Hotel Name", serviceDetails?.hotelName || "N/A"],
        ["Check-In", serviceDetails?.checkIn || "N/A"],
        ["Check-Out", serviceDetails?.checkOut || "N/A"],
        ["Total Amount", `${currency} ${totalAmount}`],
        ["Payment Method", payments?.[0]?.paymentMethod || "N/A"],
        ["Payment Status", payments?.[0]?.paymentStatus || "N/A"],
      ],
    });

    // 🧳 Guest Details table
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [
        [
          "Title",
          "First Name",
          "Middle Name",
          "Last Name",
          "Email",
          "Phone",
          "Age",
        ],
      ],
      body: HotelRoomsDetails?.flatMap(
        (room) =>
          room.HotelPassenger?.map((pax) => [
            pax.Title,
            pax.FirstName,
            pax.MiddleName || "-",
            pax.LastName,
            pax.Email || "-",
            pax.Phoneno || "-",
            pax.Age || "-",
          ]) || []
      ),
    });

    // 🧾 Vendor / TBO Info
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Vendor Info", "Value"]],
      body: [
        ["TBO Booking ID", vendorResponse?.BookResult?.BookingId || "N/A"],
        ["Booking Ref No", vendorResponse?.BookResult?.BookingRefNo || "N/A"],
        [
          "Confirmation No",
          vendorResponse?.BookResult?.ConfirmationNo || "N/A",
        ],
        [
          "Hotel Booking Status",
          vendorResponse?.BookResult?.HotelBookingStatus || "N/A",
        ],
        ["Trace ID", vendorResponse?.BookResult?.TraceId || "N/A"],
      ],
    });

    // 💰 Footer
    doc.text(
      "Thank you for booking with Safarix!",
      14,
      doc.lastAutoTable.finalY + 20
    );

    // Save PDF
    doc.save(`Invoice_${bookingId}.pdf`);
  };

  return (
    <div className="container" style={{ marginTop: "130px" }}>
      <h4 className="mb-3">Booking Details</h4>

      <table className="table table-bordered">
        <tbody>
          <tr>
            <th>Booking ID</th>
            <td>{bookingId}</td>
          </tr>
          <tr>
            <th>Service Type</th>
            <td>{serviceType}</td>
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
            <th>Hotel Name</th>
            <td>{serviceDetails?.hotelName || "N/A"}</td>
          </tr>
          <tr>
            <th>Check-In</th>
            <td>{serviceDetails?.checkIn || "N/A"}</td>
          </tr>
          <tr>
            <th>Check-Out</th>
            <td>{serviceDetails?.checkOut || "N/A"}</td>
          </tr>
          <tr>
            <th>Payment Status</th>
            <td>{payments?.[0]?.paymentStatus || "N/A"}</td>
          </tr>
          <tr>
            <th>Payment Method</th>
            <td>{payments?.[0]?.paymentMethod || "N/A"}</td>
          </tr>

          {/* 🔹 Guest Details */}
          <tr className="table-primary">
            <th colSpan={2}>Guest Details</th>
          </tr>
          {HotelRoomsDetails?.map((room, roomIndex) =>
            room.HotelPassenger?.map((pax, paxIndex) => (
              <tr key={`${roomIndex}-${paxIndex}`}>
                <td colSpan={2}>
                  {pax.Title} {pax.FirstName} {pax.MiddleName || ""}{" "}
                  {pax.LastName} | Email: {pax.Email || "-"} | Phone:{" "}
                  {pax.Phoneno || "-"} | Age: {pax.Age || "-"}
                </td>
              </tr>
            ))
          )}

          {/* 🔹 Vendor Response Section */}
          <tr className="table-primary">
            <th colSpan={2}>Vendor (TBO) Booking Info</th>
          </tr>
          <tr>
            <th>TBO Booking ID</th>
            <td>{vendorResponse?.BookResult?.BookingId || "N/A"}</td>
          </tr>
          <tr>
            <th>Booking Ref No</th>
            <td>{vendorResponse?.BookResult?.BookingRefNo || "N/A"}</td>
          </tr>
          <tr>
            <th>Confirmation No</th>
            <td>{vendorResponse?.BookResult?.ConfirmationNo || "N/A"}</td>
          </tr>
          <tr>
            <th>Hotel Booking Status</th>
            <td>{vendorResponse?.BookResult?.HotelBookingStatus || "N/A"}</td>
          </tr>
          <tr>
            <th>Response Status</th>
            <td>{vendorResponse?.BookResult?.ResponseStatus || "N/A"}</td>
          </tr>
        </tbody>
      </table>

      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>
        Back to Bookings
      </button>
      {status === "confirmed" ? (
        <button
          className="btn btn-success mt-3 ms-3"
          onClick={handleDownloadInvoice}
        >
          Download Invoice (PDF)
        </button>
      ) : (
        <p className="text-danger mt-3">
          Invoice not available — booking status: {status}
        </p>
      )}
    </div>
  );
}

export default BookingView;
