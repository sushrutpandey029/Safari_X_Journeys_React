import React from "react";
import "./TermsConditions.css"; // Reuse the same styles for a matching look

function PrivacyPolicy() {
  return (
    <div className="terms-container">
      {/* Header Section */}
      <div className="terms-header">
        <h1>Privacy Policy</h1>
        
      </div>

      {/* Divider Line */}
      <div className="terms-divider"></div>

      {/* Content Section */}
      <div className="terms-content">
        <p>
          This Privacy Policy explains how we collect, use, disclose, and safeguard your
          information when you visit our website and/or use our mobile application (collectively,
          the "Services"). Please read this policy carefully. If you do not agree with the terms
          of this Privacy Policy, please do not access the Services.
        </p>

        <h3>Information We Collect</h3>
        <p>
          We may collect information that you voluntarily provide to us when you register on the
          Services, express an interest in obtaining information about us or our products and
          Services, participate in activities on the Services, or otherwise contact us. This may
          include your name, email address, phone number, and any other information you choose to
          provide. We may also collect certain information automatically, such as device
          information, IP address, browser type, pages you visit, and the time and date of your
          visit.
        </p>

        <h3>How We Use Your Information</h3>
        <p>
          We use your information to operate, maintain, and improve our Services; to respond to
          inquiries and provide customer support; to send administrative information; to personalize
          your experience; to analyze usage and trends; and to comply with legal obligations.
        </p>

        <h3>Cookies and Similar Technologies</h3>
        <p>
          We may use cookies, web beacons, and similar tracking technologies to collect and store
          information about your use of the Services. You can control cookies through your browser
          settings; however, disabling cookies may affect some features of the Services.
        </p>

        <h3>Sharing of Information</h3>
        <p>
          We do not sell your personal information. We may share information with service providers
          who perform services for us (such as hosting, analytics, and customer support) under
          appropriate confidentiality obligations, or when required by law, to protect rights and
          safety, or with your consent.
        </p>

        <h3>Data Security</h3>
        <p>
          We implement reasonable technical and organizational measures to protect your personal
          information. However, no electronic transmission over the internet or information storage
          technology can be guaranteed to be 100% secure, so we cannot promise absolute security.
        </p>

        <h3>Children's Privacy</h3>
        <p>
          Our Services are not directed to children under 13. If you believe we have collected
          personal information from a child, please contact us so that we can take appropriate
          action.
        </p>

        <h3>Your Rights & Choices</h3>
        <p>
          Depending on your location, you may have rights to access, correct, update, or delete
          your personal information, and to object to or restrict certain processing. To exercise
          these rights, please contact us using the details below.
        </p>

        <h3>Third-Party Links</h3>
        <p>
          The Services may contain links to third-party websites and services. We are not
          responsible for the privacy practices or the content of third parties.
        </p>

        <h3>Changes to This Policy</h3>
        <p>
          We may update this Privacy Policy from time to time. The updated version will be
          indicated by an updated "Last updated" date and will be effective as soon as it is
          accessible.
        </p>

        <h3>Contact Us</h3>
        <p>
          If you have questions or comments about this Policy, please contact us at
          <a href="mailto:privacy@example.com"> privacy@example.com</a>.
        </p>

        <p style={{ marginTop: 24, fontStyle: "italic" }}>Last updated: 18 August 2025</p>
      </div>
    </div>
  );
}

export default PrivacyPolicy;