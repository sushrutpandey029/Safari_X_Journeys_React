// guide/GuideView.jsx
import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { downloadBookingPDF } from "../../../services/bookingService";

export default function GuideView({ booking }) {
  const {
    bookingId,
    status,
    currency,
    totalAmount,
    serviceDetails,
    vendorResponse,
    bookingPayments,
  } = booking;

  // const handleDownloadGuideInvoice = () => {
  //   const doc = new jsPDF();
  //   doc.text("Guide Service Invoice", 14, 20);

  //   autoTable(doc, {
  //     startY: 30,
  //     head: [["Field", "Value"]],
  //     body: [
  //       ["Guide Name", serviceDetails?.guideName],
  //       ["Email", serviceDetails?.guideEmail],
  //       ["Phone", serviceDetails?.guidePhone],
  //       ["Location", serviceDetails?.location],
  //       ["Charges", `${currency} ${serviceDetails?.chargesPerDay}`],
  //     ],
  //   });

  //   doc.save(`Guide_${bookingId}.pdf`);
  // };

  const handleDownloadInvoice = async (bookingId) => {
    try {
      const pdfBlob = await downloadBookingPDF(bookingId);

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

  return (
    <>
      <table className="table table-bordered">
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
            <th>Total Amount</th>
            <td>
              {currency} {totalAmount}
            </td>
          </tr>
          <tr>
            <th>Guide</th>
            <td>{serviceDetails?.guideName}</td>
          </tr>
          <tr>
            <th>Date</th>
            <td>{serviceDetails?.selectedDate}</td>
          </tr>
        </tbody>
      </table>

      {status === "confirmed" && (
        
        <button
          className="btn btn-outline-primary"
          onClick={() => handleDownloadInvoice(booking.bookingId)}
        >
          Download Invoice
        </button>
      )}
    </>
  );
}
