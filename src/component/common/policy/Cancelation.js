import React from "react";


const Cancellation = () => {
  return (
    <div className="refund" style={{marginTop:"90px"}}>
      <div className="terms-container container-fluid">
        {/* Header Section */}
        <div className="terms-header">
          <h1>Refund & Cancellation Policy</h1>
        </div>

        {/* Divider Line */}
        <div className="terms-divider"></div>

        {/* Content Section */}
        <div className="terms-content">
          <p className="mb-0">
            <strong>Effective Date:</strong> 1-Aug-2025
          </p>
          <p>
            We understand travel plans may change. Below are our cancellation and
            refund terms:
          </p>

          <h3>Cancellation by Traveler</h3>
          <p>
            • More than 60 days before departure → <strong>90% refund</strong> (minus
            transaction fees). <br />
            • 30–60 days before departure → <strong>50% refund</strong>. <br />
            • 15–30 days before departure → <strong>25% refund</strong>. <br />
            • Less than 15 days before departure → <strong>No refund</strong>. <br />
            <br />
            <em>
              Note: Certain bookings (air tickets, permits, special accommodations)
              may be non-refundable regardless of notice period.
            </em>
          </p>

          <h3>Cancellation by Safarix Journeys</h3>
          <p>
            If we cancel a trip for reasons within our control, a full refund will be
            provided. For cancellations due to force majeure, we will offer alternate
            dates, credit vouchers, or partial refunds where possible.
          </p>

          <h3>Refund Timelines</h3>
          <p>
            • Eligible refunds will be processed within{" "}
            <strong>14–21 working days</strong> of cancellation request. <br />
            • Refunds will be made via the original payment method (bank
            transfer/credit card).
          </p>

          <h3>Changes to Bookings</h3>
          <p>
            Date or itinerary changes are subject to availability and may incur
            additional charges.
          </p>

          <h3>Travel Insurance Disclaimer</h3>
          <p>
            We strongly advise all travelers to purchase comprehensive travel
            insurance that covers trip cancellations, medical emergencies, accidents,
            lost baggage, and delays.
          </p>
          <p>
            Refunds from Safarix Journeys are strictly as per the policy above and do
            not cover losses due to medical issues, missed flights, or other personal
            circumstances. Such costs must be claimed under the traveler’s insurance
            policy.
          </p>

          <p style={{ marginTop: 24, fontStyle: "italic" }}>
            Last updated: 1 August 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default Cancellation;

