import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadFlightInvoice = ({
  bookingId,
  PNR,
  vendorBookingId,
  originCity,
  destinationCity,
  depTime,
  arrTime,
  airline,
  passengers = [],
  currency,
  totalAmount,
  paymentInfo = {},
}) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text("Flight Booking Invoice", 14, 20);

  doc.setFontSize(11);
  doc.text(`PNR: ${PNR}`, 14, 30);
  doc.text(`Vendor Booking ID: ${vendorBookingId}`, 14, 36);
  doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`, 14, 42);

  autoTable(doc, {
    startY: 50,
    head: [["Field", "Value"]],
    body: [
      ["Route", `${originCity} → ${destinationCity}`],
      ["Departure", depTime?.toLocaleString() || "-"],
      ["Arrival", arrTime?.toLocaleString() || "-"],
      [
        "Airline",
        airline
          ? `${airline.AirlineName} (${airline.AirlineCode} ${airline.FlightNumber})`
          : "N/A",
      ],
      ["Total Fare", `${currency} ${totalAmount}`],
    ],
  });

  if (passengers.length) {
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Passenger", "Type", "Gender", "Ticket No", "Status"]],
      body: passengers.map((p) => [
        `${p.Title} ${p.FirstName} ${p.LastName}`,
        p.PaxType === 1 ? "Adult" : p.PaxType === 2 ? "Child" : "Infant",
        p.Gender === 1 ? "Male" : "Female",
        p.Ticket?.TicketNumber || "-",
        p.Ticket?.Status || "-",
      ]),
    });
  }

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["Payment", "Value"]],
    body: [
      ["Amount", `${currency} ${totalAmount}`],
      ["Method", paymentInfo.paymentMethod || "N/A"],
      ["Status", paymentInfo.paymentStatus || "N/A"],
    ],
  });

  doc.save(`Invoice_Flight_${bookingId}.pdf`);
};
