import React from "react";
import { BASE_URL } from "../services/apiEndpoints";

function GuideCard({ guide }) {
  return (
    <div className="col-sm-3 mb-4">
      <div className="box">
        {/* <img src={`${BASE_URL}/uploads/guides/${guide.profile_image}`} alt="Banner" className="img-fluid" /> */}
        <img src="/images/guide.webp" alt="Banner" className="img-fluid" />
        <div class="details">
          <h4>{guide.state}</h4>
          <p>
            <span class="label">Name:</span> {guide.guidename}
          </p>
          <p>
            <span class="label">Rating:</span> <span class="stars">★★★★</span>
          </p>
          <p>
            <span class="label">Experience:</span> {guide.experience_years}
          </p>
        </div>
      </div>
    </div>
  );
}

export default GuideCard;
