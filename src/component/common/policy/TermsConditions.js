import React from "react";
import "./TermsConditions.css";

function TermsConditions() {
  return (
   <div className="terms-container" style={{marginTop:"90px"}}>
  {/* Header Section */}
  <div className="terms-header">
    <h1>Terms & Conditions</h1>
  </div>

  {/* Divider Line */}
  <div className="terms-divider"></div>

  {/* Content Section */}
  <div className="terms-content">
    <p className="mb-0"><strong>Effective Date:</strong> 1-Aug-2025</p>
    <p >
      By booking with Safarix Journeys, you (“Client”, “you”, “traveler”) agree to the following terms:
    </p>

    <h3>Bookings & Payments</h3>
    <p>
      • Bookings are confirmed only upon receipt of full or partial payment. <br />
      • Prices are subject to change until confirmed. <br />
      • Payments must be made through approved channels.
    </p>

    <h3>Cancellations by Client</h3>
    <p>
      • Cancellations must be made in writing. Refund eligibility is as per our Refund & Cancellation Policy.
    </p>

    <h3>Cancellations by Company</h3>
    <p>
      • We reserve the right to cancel or modify tours due to unforeseen circumstances (force majeure, safety concerns, low participation). In such cases, alternatives or refunds will be offered.
    </p>

    <h3>Liability</h3>
    <p>
      • Safarix Journeys acts as an intermediary between clients and suppliers (hotels, transport, etc.). 
      We are not liable for acts, omissions, or defaults of third parties. <br />
      • Travelers are responsible for ensuring they have valid passports, visas, insurance, vaccinations, and health documents. <br />
      • Participation is at the traveler's own risk.
    </p>

    <h3>Travel Insurance (Strongly Recommended)</h3>
    <p>
      We strongly recommend that all travelers purchase comprehensive travel insurance that covers: <br />
      – Trip cancellations and curtailments <br />
      – Medical emergencies, hospitalization, and evacuation <br />
      – Baggage loss or damage <br />
      – Flight delays and missed connections
    </p>
    <p>
      Safarix Journeys is not liable for losses arising from events that are typically covered under such insurance policies. Proof of travel insurance may be requested prior to departure.
    </p>

    <h3>Force Majeure</h3>
    <p>
      We are not liable for delays, cancellations, or losses caused by events beyond our control including natural disasters, political unrest, strikes, epidemics, or government restrictions.
    </p>

    <h3>Traveler Conduct</h3>
    <p>
      We reserve the right to refuse service or terminate participation without refund if a traveler’s behavior threatens safety, comfort, or violates laws.
    </p>

    <h3>Intellectual Property</h3>
    <p>
      All website content (logos, itineraries, images) belongs to Safarix Journeys and cannot be copied or used without permission.
    </p>

    <h3>Governing Law</h3>
    <p>
      These terms are governed by the laws of New Delhi, India, and disputes are subject to the exclusive jurisdiction of courts at New Delhi, India.
    </p>
  </div>
</div>

  );
}

export default TermsConditions;