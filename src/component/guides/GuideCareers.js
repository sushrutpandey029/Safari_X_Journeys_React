import React, { useState } from "react";
import "./GuideCareers.css";
import Select from "react-select";

import { guideCareerSubmit } from "../services/guideService";

const GuideCareers = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    gender: "",
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
      const formDataToSend = new FormData();

      // Append simple fields
      formDataToSend.append("fullName", formData.fullName);
      formDataToSend.append("emailAddress", formData.emailAddress);
      formDataToSend.append("phoneNumber", formData.phoneNumber);
      formDataToSend.append("address", formData.address);

      // ✅ Newly added fields
      formDataToSend.append("city", formData.city);
      formDataToSend.append("state", formData.state);
      formDataToSend.append("country", formData.country);
      formDataToSend.append("gender", formData.gender);

      formDataToSend.append(
        "professionalSummary",
        formData.professionalSummary
      );
      formDataToSend.append("groupSizesManaged", formData.groupSizesManaged);
      formDataToSend.append(
        "historyCultureRating",
        formData.historyCultureRating
      );
      formDataToSend.append("navigationRating", formData.navigationRating);
      formDataToSend.append(
        "communicationRating",
        formData.communicationRating
      );
      formDataToSend.append(
        "problemSolvingRating",
        formData.problemSolvingRating
      );
      formDataToSend.append("otherTourType", formData.otherTourType);
      formDataToSend.append("additionalInfo", formData.additionalInfo);
      formDataToSend.append("idProofType", formData.idProofType);
      formDataToSend.append("idProofNumber", formData.idProofNumber);

      // Append arrays/objects as JSON strings
      formDataToSend.append(
        "workExperience",
        JSON.stringify(formData.workExperience)
      );
      formDataToSend.append(
        "certifications",
        JSON.stringify(formData.certifications)
      );
      formDataToSend.append(
        "languageProficiency",
        JSON.stringify(formData.languageProficiency)
      );
      formDataToSend.append("education", JSON.stringify(formData.education));
      formDataToSend.append(
        "typesOfTours",
        JSON.stringify(formData.typesOfTours)
      );
      formDataToSend.append(
        "destinationsGuided",
        JSON.stringify(formData.destinationsGuided)
      );
      formDataToSend.append(
        "availability",
        JSON.stringify(formData.availability)
      );
      formDataToSend.append(
        "preferredLocations",
        JSON.stringify(formData.preferredLocations)
      );
      formDataToSend.append("reference1", JSON.stringify(formData.reference1));
      formDataToSend.append("reference2", JSON.stringify(formData.reference2));

      // Append the file (if it exists)
      if (formData.profileImage) {
        formDataToSend.append("profileImage", formData.profileImage);
      }

      console.log(
        "Submitting FormData:",
        Object.fromEntries(formDataToSend.entries())
      );

      const resp = await guideCareerSubmit(formDataToSend);
      console.log("resp in guide career submit", resp);
      alert(
        resp?.data?.message ||
          "Form submitted successfully, waiting for admin approval."
      );
    } catch (err) {
      console.log("err in guide career submit", err.response);
      alert(
        err.response?.data?.message ||
          "Error submitting form. Please try again."
      );
    }
  };

  return (
    <div className="guide-careers-form" style={{marginTop: "100px"}}>
      <h2 class="career-heading">Guide Career Application</h2>
      <form onSubmit={handleSubmit}>
        {/* Personal Information Section */}
        <div className="form-section">
          <h3>Personal Information</h3>
          <div className="row">
            <div className="col-sm-6">
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
            </div>
            <div className="col-sm-6">
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
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
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
            </div>
            <div className="col-sm-6">
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
            </div>
          </div>

          <div className="row">
            {/* City */}
            <div className="col-sm-6">
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* State */}
            <div className="col-sm-6">
              <div className="form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Country */}
            <div className="col-sm-6">
              <div className="form-group">
                <label>Country</label>
                <input
                  type="text"
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">-- Select Gender --</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Professional Summary</label>
                <textarea
                  name="professionalSummary"
                  value={formData.professionalSummary}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Profile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Work Experience Section */}
        <div className="form-section">
          <h3>Work Experience</h3>
          {formData.workExperience.map((exp, index) => (
            <div key={index} className="repeater-item">
              <div className="row align-items-center">
                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-2 d-flex align-items-center">
                  {index > 0 && (
                    <button
                      className="Remove-btn"
                      type="button"
                      onClick={() =>
                        removeRepeaterItem("workExperience", index)
                      }
                    >
                      - Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            className="AddMore"
            type="button"
            onClick={() => addRepeaterItem("workExperience")}
          >
            + Add More
          </button>
        </div>

        {/* Certifications Section */}
        <div className="form-section">
          <h3>Certifications</h3>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="repeater-item">
              <div className="row align-items-center">
                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-2 d-flex align-items-center">
                  {index > 0 && (
                    <button
                      className="Remove-btn"
                      type="button"
                      onClick={() =>
                        removeRepeaterItem("certifications", index)
                      }
                    >
                      - Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            className="AddMore"
            type="button"
            onClick={() => addRepeaterItem("certifications")}
          >
            + Add More
          </button>
        </div>

        {/* Language Proficiency Section */}
        <div className="form-section">
          <h3>Language Proficiency</h3>
          {formData.languageProficiency.map((lang, index) => (
            <div key={index} className="repeater-item">
              <div className="row align-items-center">
                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-2 d-flex align-items-center">
                  {index > 0 && (
                    <button
                      className="Remove-btn"
                      type="button"
                      onClick={() =>
                        removeRepeaterItem("languageProficiency", index)
                      }
                    >
                      - Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            className="AddMore"
            type="button"
            onClick={() => addRepeaterItem("languageProficiency")}
          >
            + Add More
          </button>
        </div>

        {/* Education Section */}
        <div className="form-section">
          <h3>Education</h3>
          {formData.education.map((edu, index) => (
            <div key={index} className="repeater-item">
              <div className="row align-items-center">
                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-5">
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
                </div>

                <div className="col-sm-2 d-flex align-items-center">
                  {index > 0 && (
                    <button
                      className="Remove-btn"
                      type="button"
                      onClick={() => removeRepeaterItem("education", index)}
                    >
                      - Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button
            className="AddMore"
            type="button"
            onClick={() => addRepeaterItem("education")}
          >
            + Add More
          </button>
        </div>

        {/* Tour Specializations Section */}
        <div className="form-section">
          <h3>Tour Specializations</h3>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Types of Tours You Can Guide</label>
                <Select
                  isMulti
                  name="typesOfTours"
                  options={tourTypes.map((type) => ({
                    value: type,
                    label: type,
                  }))}
                  value={formData.typesOfTours.map((t) => ({
                    value: t,
                    label: t,
                  }))}
                  onChange={(selectedOptions) => {
                    const values = selectedOptions
                      ? selectedOptions.map((opt) => opt.value)
                      : [];
                    setFormData((prev) => ({
                      ...prev,
                      typesOfTours: values,
                    }));
                  }}
                  placeholder="Search and select tour types..."
                />
              </div>
            </div>

            <div className="col-sm-6">
              <div className="form-group">
                <label>Other Tour Type (if not listed above)</label>
                <input
                  type="text"
                  name="otherTourType"
                  value={formData.otherTourType}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Destinations You've Guided Before</label>
                <Select
                  isMulti
                  name="destinationsGuided"
                  options={locations.map((location) => ({
                    value: location,
                    label: location,
                  }))}
                  value={formData.destinationsGuided.map((loc) => ({
                    value: loc,
                    label: loc,
                  }))}
                  onChange={(selectedOptions) => {
                    // React-Select cross icon ke liye array ka format sahi rakhna zaroori hai
                    const values = selectedOptions
                      ? selectedOptions.map((opt) => opt.value)
                      : [];
                    setFormData((prev) => ({
                      ...prev,
                      destinationsGuided: values,
                    }));
                  }}
                  placeholder="Search and select destinations..."
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Other Tour Type (if not listed above)</label>
                <input
                  type="text"
                  name="otherTourType"
                  value={formData.otherTourType}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skill Ratings Section */}
        <div className="form-section">
          <h3>Skill Ratings</h3>
          <div className="row">
            <div className="col-sm-6">
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
            </div>
            <div className="col-sm-6">
              <div className="rating-group">
                <label>Navigation Skills</label>
                <div className="star-rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={
                        star <= formData.navigationRating ? "filled" : ""
                      }
                      onClick={() =>
                        setFormData({ ...formData, navigationRating: star })
                      }
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
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
            </div>
            <div className="col-sm-6">
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
          </div>
        </div>

        {/* Availability & Preferences Section */}
        <div className="form-section">
          <h3>Availability & Preferences</h3>
          <div className="row">
            <div className="col-sm-12">
  <div className="form-group">
    <label>Available Days</label>
    <div className="checkbox-group d-flex flex-wrap gap-3">
      {weekDays.map((day, index) => (
        <div key={index} className="form-check">
          <input
            className="form-check-input"
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
          <label className="form-check-label" htmlFor={`day-${index}`}>
            {day}
          </label>
        </div>
      ))}
    </div>
  </div>
</div>


            <div className="row">
              <div className="col-sm-6">
                <div className="form-group">
                  <label>Preferred Locations to Guide</label>
                  <Select
                    isMulti
                    name="preferredLocations"
                    options={locations.map((loc) => ({
                      value: loc,
                      label: loc,
                    }))}
                    value={formData.preferredLocations.map((l) => ({
                      value: l,
                      label: l,
                    }))}
                    onChange={(selectedOptions) => {
                      const values = selectedOptions
                        ? selectedOptions.map((opt) => opt.value)
                        : [];
                      setFormData((prev) => ({
                        ...prev,
                        preferredLocations: values,
                      }));
                    }}
                    placeholder="Search and select locations..."
                  />
                </div>
              </div>

              <div className="col-sm-6">
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
            </div>
          </div>
        </div>

        {/* References Section */}
        <div className="form-section">
          <h3>References</h3>
          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Reference 1 Name</label>
                <input
                  type="text"
                  value={formData.reference1.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "reference1",
                      "name",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Reference 1 Contact</label>
                <input
                  type="text"
                  value={formData.reference1.contact}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "reference1",
                      "contact",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-sm-6">
              <div className="form-group">
                <label>Reference 2 Name</label>
                <input
                  type="text"
                  value={formData.reference2.name}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "reference2",
                      "name",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
            <div className="col-sm-6">
              <div className="form-group">
                <label>Reference 2 Contact</label>
                <input
                  type="text"
                  value={formData.reference2.contact}
                  onChange={(e) =>
                    handleNestedInputChange(
                      "reference2",
                      "contact",
                      e.target.value
                    )
                  }
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="form-section">
          <h3>Additional Information</h3>
          <div className="row">
            <div className="col-sm-12">
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
          </div>
        </div>

        {/* Identification Section */}
        <div className="form-section">
          <h3>Identification</h3>
          <div className="row">
            <div className="col-sm-6">
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
                  <option value="PAN Card">PAN Card</option>
                </select>
              </div>
            </div>
            <div className="col-sm-6">
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
          </div>
        </div>

        <button type="submit" className="explore-btn">
          Submit Application
        </button>
      </form>
    </div>
  );
};

export default GuideCareers;
