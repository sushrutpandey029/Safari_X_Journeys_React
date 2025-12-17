import React from "react";
import { BASE_URL } from "../services/apiEndpoints";

function GuideCard({ guide }) {
  return (
    <div className="col-sm-3 mb-4">
      <div className="box">
        <img
          src={`${BASE_URL}/uploads/guides/${guide.profileImage}`}
          alt="Banner"
          className="img-fluid"
        />
        <div class="details">
          <h4>{guide.state}</h4>
          <p>
            <span class="label">Name:</span> {guide.fullName}
          </p>
          <p className="rating">
            <span class="stars">★★★★</span>
          </p>
          <p>
            <span className="label">Charges/Day:</span> ₹{guide.chargesPerDay}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GuideCard;
