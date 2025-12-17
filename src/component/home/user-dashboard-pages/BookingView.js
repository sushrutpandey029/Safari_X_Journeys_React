import React from "react";

import HotelView from "./hotel/HotelView";
import FlightView from "./flight/FlightView";
import GuideView from "./guide/GuideView";
import BusView from "./bus/BusView";

export default function BookingView({ booking }) {
  if (!booking)
    return (
      <div className="container mt-5 text-center">
        <h5>No booking data found</h5>
      </div>
    );

  const { serviceType } = booking;

  const renderComponent = () => {
    switch (serviceType) {
      case "hotel":
        return <HotelView booking={booking} />;
      case "flight":
        return <FlightView booking={booking} />;
      case "guide":
        return <GuideView booking={booking} />;
      case "bus":
        return <BusView booking={booking} />;
      default:
        return <h3>Service type not supported yet!</h3>;
    }
  };

  return (
    <div className="container-fluid">
      <h5 className="mb-3 text-capitalize fw-bold">
        {serviceType} Booking Details
      </h5>
      {renderComponent()}
    </div>
  );
}
