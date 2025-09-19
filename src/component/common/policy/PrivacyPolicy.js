import React from "react";
import "./TermsConditions.css"; // Reuse the same styles for a matching look

function PrivacyPolicy() {
  return (
 
  <div className="privacy">
     <div className="terms-container container-fluid">
  {/* Header Section */}
  <div className="terms-header">
    <h1>Privacy Policy</h1>
  </div>

  {/* Divider Line */}
  <div className="terms-divider"></div>

  {/* Content Section */}
  <div className="terms-content">
    <p className="mb-0"><strong>Effective Date:</strong>1-Aug-2025</p>
    <p>
      This Privacy Policy describes how Safarix Journeys (“Company”, “we”, “our”, “us”) collects,
      uses, and safeguards personal data when you visit our website or book our services.
    </p>

    <h3>Information We Collect</h3>
    <p>
      <strong>Personal Information:</strong> Name, contact details, travel preferences, ID
      documents (if required for booking).<br />
      <strong>Payment Details:</strong> Processed securely via third-party payment gateways; we do
      not store card details.<br />
      <strong>Usage Data:</strong> Device info, IP address, cookies, browsing activity.
    </p>

    <h3>How We Use Information</h3>
    <p>
      • To process bookings and deliver travel services.<br />
      • To communicate updates, itineraries, and offers.<br />
      • To improve site performance and customer experience.<br />
      • To comply with legal obligations.
    </p>

    <h3>Sharing of Data</h3>
    <p>
      We may share data with:<br />
      • Suppliers (airlines, hotels, guides) to fulfill bookings.<br />
      • Payment processors for secure transactions.<br />
      • Legal authorities when required by law.<br />
      <br />
      We never sell your data to third parties.
    </p>

    <h3>Security</h3>
    <p>
      We use encryption, firewalls, and restricted access to protect your information. However, no
      system can guarantee 100% security.
    </p>

    <h3>Your Rights</h3>
    <p>
      You have the right to access, update, or delete your personal data. You may also opt-out of
      marketing communications.
    </p>

    <h3>Cookies</h3>
    <p>
      Our website uses cookies for analytics and personalization. You can disable cookies in browser
      settings, though site functionality may be limited.
    </p>

    <h3>Policy Updates</h3>
    <p>
      We may update this policy; the latest version will always be posted here.
    </p>

    <p style={{ marginTop: 24, fontStyle: "italic" }}>Last updated: 18 August 2025</p>
  </div>
</div>
  </div>


  );
}

export default PrivacyPolicy;