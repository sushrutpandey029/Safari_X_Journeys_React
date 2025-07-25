import React, { useState } from "react";
import "./GuideCareers.css";

import { guideCareerSubmit } from "../services/guideService";

const GuideCareers = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    address: "",
    professionalSummary: "",
    workExperience: [{ company: "", years: "" }],
    certifications: [{ name: "", year: "" }],
    languageProficiency: [{ language: "", fluency: "" }],
    education: [{ degree: "", year: "" }],
    typesOfTours: [],
    otherTourType: "",
    destinationsGuided: [],
    groupSizesManaged: "",
    historyCultureRating: 0,
    navigationRating: 0,
    communicationRating: 0,
    problemSolvingRating: 0,
    availability: { days: [] },
    preferredLocations: [],
    reference1: { name: "", contact: "" },
    reference2: { name: "", contact: "" },
    additionalInfo: "",
    idProofType: "",
    idProofNumber: "",
    profileImage: null,
  });

  const tourTypes = [
    "Adventure",
    "Cultural",
    "Historical",
    "Wildlife",
    "Culinary",
  ];

  const weekDays = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const locations = [
    "Delhi",
    "Rajasthan",
    "Agra",
    "Mumbai",
    "Goa",
    "Kerala",
    "Himachal Pradesh",
  ];

  const fluencyLevels = ["Fluent", "Proficient", "Intermediate", "Basic"];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNestedInputChange = (parent, field, value, index = null) => {
    if (index !== null) {
      const updatedArray = [...formData[parent]];
      updatedArray[index][field] = value;
      setFormData({
        ...formData,
        [parent]: updatedArray,
      });
    } else {
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [field]: value,
        },
      });
    }
  };

  const handleArrayInputChange = (field, value, isChecked) => {
    let updatedArray = [...formData[field]];
    if (isChecked) {
      updatedArray.push(value);
    } else {
      updatedArray = updatedArray.filter((item) => item !== value);
    }
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  const addRepeaterItem = (field) => {
    setFormData({
      ...formData,
      [field]: [
        ...formData[field],
        field === "workExperience"
          ? { company: "", years: "" }
          : field === "certifications"
          ? { name: "", year: "" }
          : field === "languageProficiency"
          ? { language: "", fluency: "" }
          : { degree: "", year: "" },
      ],
    });
  };

  const removeRepeaterItem = (field, index) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  const handleFileUpload = (e) => {
    setFormData({
      ...formData,
      profileImage: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("career guide", formData);
      const resp = await guideCareerSubmit(formData);
      console.log("resp in guide career submit", resp);
      alert(
        resp?.data?.message ||
          "form added successfully, waiting for admin approval."
      );
    } catch (err) {
      console.log("err in guide career submit", err.response);
      alert(
        err.response?.data?.message ||
          "error in filling form, please try again."
      );
    }
  };

  return (
    <div className="guide-careers-form">
      <h2>Guide Career Application</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="emailAddress"
              value={formData.emailAddress}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Professional Summary</label>
            <textarea
              name="professionalSummary"
              value={formData.professionalSummary}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Profile Image</label>
            <input type="file" accept="image/*" onChange={handleFileUpload} />
          </div>
        </div>

        <div className="form-section">
          <h3>Work Experience</h3>
          {formData.workExperience.map((exp, index) => (
            <div key={index} className="repeater-item">
              <div className="form-group">
                <label>Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "workExperience",
                      "company",
                      e.target.value,
                      index
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Years</label>
                <input
                  type="number"
                  value={exp.years}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "workExperience",
                      "years",
                      e.target.value,
                      index
                    )
                  }
                  required
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeRepeaterItem("workExperience", index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addRepeaterItem("workExperience")}
          >
            Add More
          </button>
        </div>

        <div className="form-section">
          <h3>Certifications</h3>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="repeater-item">
              <div className="form-group">
                <label>Certification Name</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "certifications",
                      "name",
                      e.target.value,
                      index
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Year Obtained</label>
                <input
                  type="number"
                  value={cert.year}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "certifications",
                      "year",
                      e.target.value,
                      index
                    )
                  }
                  required
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeRepeaterItem("certifications", index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addRepeaterItem("certifications")}
          >
            Add More
          </button>
        </div>

        <div className="form-section">
          <h3>Language Proficiency</h3>
          {formData.languageProficiency.map((lang, index) => (
            <div key={index} className="repeater-item">
              <div className="form-group">
                <label>Language</label>
                <input
                  type="text"
                  value={lang.language}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "languageProficiency",
                      "language",
                      e.target.value,
                      index
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Fluency Level</label>
                <select
                  value={lang.fluency}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "languageProficiency",
                      "fluency",
                      e.target.value,
                      index
                    )
                  }
                  required
                >
                  <option value="">Select fluency</option>
                  {fluencyLevels.map((level, i) => (
                    <option key={i} value={level}>
                      {level}
                    </option>
                  ))}
                </select>
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    removeRepeaterItem("languageProficiency", index)
                  }
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addRepeaterItem("languageProficiency")}
          >
            Add More
          </button>
        </div>

        <div className="form-section">
          <h3>Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="repeater-item">
              <div className="form-group">
                <label>Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "education",
                      "degree",
                      e.target.value,
                      index
                    )
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={edu.year}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "education",
                      "year",
                      e.target.value,
                      index
                    )
                  }
                  required
                />
              </div>

              {index > 0 && (
                <button
                  type="button"
                  onClick={() => removeRepeaterItem("education", index)}
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button type="button" onClick={() => addRepeaterItem("education")}>
            Add More
          </button>
        </div>

        <div className="form-section">
          <h3>Tour Specializations</h3>
          <div className="form-group">
            <label>Types of Tours You Can Guide</label>
            <div className="checkbox-group">
              {tourTypes.map((type, index) => (
                <div key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`tourType-${index}`}
                    checked={formData.typesOfTours.includes(type)}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "typesOfTours",
                        type,
                        e.target.checked
                      )
                    }
                  />
                  <label htmlFor={`tourType-${index}`}>{type}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Other Tour Type (if not listed above)</label>
            <input
              type="text"
              name="otherTourType"
              value={formData.otherTourType}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label>Destinations You've Guided Before</label>
            <div className="checkbox-group">
              {locations.map((location, index) => (
                <div key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`destination-${index}`}
                    checked={formData.destinationsGuided.includes(location)}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "destinationsGuided",
                        location,
                        e.target.checked
                      )
                    }
                  />
                  <label htmlFor={`destination-${index}`}>{location}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Typical Group Sizes You've Managed</label>
            <input
              type="text"
              name="groupSizesManaged"
              value={formData.groupSizesManaged}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Skill Ratings</h3>
          <div className="rating-group">
            <label>History & Culture Knowledge</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= formData.historyCultureRating ? "filled" : ""
                  }
                  onClick={() =>
                    setFormData({ ...formData, historyCultureRating: star })
                  }
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="rating-group">
            <label>Navigation Skills</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= formData.navigationRating ? "filled" : ""}
                  onClick={() =>
                    setFormData({ ...formData, navigationRating: star })
                  }
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="rating-group">
            <label>Communication Skills</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= formData.communicationRating ? "filled" : ""
                  }
                  onClick={() =>
                    setFormData({ ...formData, communicationRating: star })
                  }
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div className="rating-group">
            <label>Problem Solving Skills</label>
            <div className="star-rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={
                    star <= formData.problemSolvingRating ? "filled" : ""
                  }
                  onClick={() =>
                    setFormData({ ...formData, problemSolvingRating: star })
                  }
                >
                  ★
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Availability & Preferences</h3>
          <div className="form-group">
            <label>Available Days</label>
            <div className="checkbox-group">
              {weekDays.map((day, index) => (
                <div key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`day-${index}`}
                    checked={formData.availability.days.includes(day)}
                    onChange={(e) => {
                      let updatedDays = [...formData.availability.days];
                      if (e.target.checked) {
                        updatedDays.push(day);
                      } else {
                        updatedDays = updatedDays.filter((d) => d !== day);
                      }
                      setFormData({
                        ...formData,
                        availability: {
                          ...formData.availability,
                          days: updatedDays,
                        },
                      });
                    }}
                  />
                  <label htmlFor={`day-${index}`}>{day}</label>
                </div>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Preferred Locations to Guide</label>
            <div className="checkbox-group">
              {locations.map((location, index) => (
                <div key={index} className="checkbox-item">
                  <input
                    type="checkbox"
                    id={`prefLocation-${index}`}
                    checked={formData.preferredLocations.includes(location)}
                    onChange={(e) =>
                      handleArrayInputChange(
                        "preferredLocations",
                        location,
                        e.target.checked
                      )
                    }
                  />
                  <label htmlFor={`prefLocation-${index}`}>{location}</label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>References</h3>
          <div className="form-group">
            <label>Reference 1 Name</label>
            <input
              type="text"
              value={formData.reference1.name}
              onChange={(e) =>
                handleNestedInputChange("reference1", "name", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Reference 1 Contact</label>
            <input
              type="text"
              value={formData.reference1.contact}
              onChange={(e) =>
                handleNestedInputChange("reference1", "contact", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Reference 2 Name</label>
            <input
              type="text"
              value={formData.reference2.name}
              onChange={(e) =>
                handleNestedInputChange("reference2", "name", e.target.value)
              }
              required
            />
          </div>

          <div className="form-group">
            <label>Reference 2 Contact</label>
            <input
              type="text"
              value={formData.reference2.contact}
              onChange={(e) =>
                handleNestedInputChange("reference2", "contact", e.target.value)
              }
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="form-group">
            <label>
              Additional Info (Special interests, unique skills, etc.)
            </label>
            <textarea
              name="additionalInfo"
              value={formData.additionalInfo}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Identification</h3>
          <div className="form-group">
            <label>ID Proof Type</label>
            <select
              name="idProofType"
              value={formData.idProofType}
              onChange={handleInputChange}
              required
            >
              <option value="">Select ID type</option>
              <option value="Aadhar Card">Aadhar Card</option>
              <option value="Passport">Passport</option>
              <option value="Driver's License">Driver's License</option>
              <option value="PAN Card">PAN Card</option>
            </select>
          </div>

          <div className="form-group">
            <label>ID Proof Number</label>
            <input
              type="text"
              name="idProofNumber"
              value={formData.idProofNumber}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <button type="submit" className="submit-button">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default GuideCareers;
