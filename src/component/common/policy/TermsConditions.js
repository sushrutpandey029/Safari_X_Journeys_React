import React from "react";
import "./TermsConditions.css";

function TermsConditions() {
  return (
    <div className="terms-container">
      {/* Header Section */}
      <div className="terms-header">
        <h1>Terms and Conditions</h1>
       
      </div>

      {/* Divider Line */}
      <div className="terms-divider"></div>

      {/* Content Section */}
      <div className="terms-content">
        <p>
          In these Terms of Use, any use of the words "you", "yours" or similar expressions shall
          mean any user of this website and the app whatsoever. Terms such as "we", "us", "our" or
          similar expressions shall mean the Football Association Premier League Limited.
        </p>
        <p>
          This website, <a href="https://www.premierleague.com">www.premierleague.com</a> (the
          “Website”), and the Premier League mobile application (the “App”) are operated by the
          Football Association Premier League Limited, a company registered in England and Wales
          under company number 02719699 with registered office at The Premier League, Brunel
          Building, 57 North Wharf Road, London, W2 1HQ. Our VAT number is 672 6255 22.
        </p>
        <p>
          Please read this page carefully as it sets out the terms that apply to your use of the
          Website and the App, and any part of their content and all materials appearing on them. By
          using the Website you confirm that you accept these Terms of Use and you agree to comply
          with them. If you do not agree to these Terms of Use, please refrain from using the
          Website and App.
        </p>

        <h3>YOUR USE OF THE WEBSITE IF YOU ARE UNDER 18</h3>
        <p>
          If you are under 18, you may need your parent/guardian to help you with your use of the
          Website and the App and with reading these Terms and Conditions. If anything is hard to
          understand, please ask your parent/guardian to explain. If you still have any questions,
          you or your parent/guardian can contact us at:{" "}
          <a href="mailto:info@premierleague.com">info@premierleague.com</a>.
        </p>
      </div>
    </div>
  );
}

export default TermsConditions;