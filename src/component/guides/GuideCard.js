import React from "react";
import { BASE_URL } from "../services/apiEndpoints";

function GuideCard({ guide }) {

  // Agar workExperience array me years hai to usse total experience calculate karo
  let experienceYears = 0;
  if (guide.workExperience && guide.workExperience.length > 0) {
    const startYear = parseInt(guide.workExperience[0].years); // first job year
    const currentYear = new Date().getFullYear(); // e.g. 2025
    experienceYears = currentYear - startYear; // total years
  }

  return (
    <div className="col-sm-3 mb-4">
      <div className="box">
        <img
          src={`${BASE_URL}/uploads/guides/${guide.profileImage}`}
          alt="Banner"
          className="img-fluid"
           />
        {/* <img src="/images/guide.webp" alt="Banner" className="img-fluid" /> */}
        <div class="details">
          <h4>{guide.state}</h4>
          <p>
            <span class="label">Name:</span> {guide.fullName}
          </p>
          <p>
            <span class="label">Rating:</span> <span class="stars">★★★★</span>
          </p>
          <p>
            <span className="label">Experience:</span> {experienceYears} years
          </p>
        </div>
      </div>
    </div>
  );
}

export default GuideCard;
