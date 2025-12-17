import { downloadFlightInvoice } from "./flightInvoice";
import { downloadHotelInvoice } from "./hotelInvoice";
import { downloadBusInvoice } from "./busInvoice";
import { downloadCabInvoice } from "./cabInvoice";

export const handleDownloadInvoice = ({ serviceType, payload }) => {
  switch (serviceType) {
    case "flight":
      return downloadFlightInvoice(payload);

    case "hotel":
      return downloadHotelInvoice(payload);

    case "bus":
      return downloadBusInvoice(payload);

    case "cab":
      return downloadCabInvoice(payload);

    default:
      throw new Error("Unsupported service type for invoice");
  }
};
