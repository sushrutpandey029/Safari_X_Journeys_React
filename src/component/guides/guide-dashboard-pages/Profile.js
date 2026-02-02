// import React, { useState } from "react";
// import { guideUpdateProfile } from "../../services/guideService";
// import { useSelector, useDispatch } from "react-redux";
// import { saveUserData, getUserData } from "../../utils/storage";

// function Profile() {
//   const guide = getUserData("guide");
//   console.log("guide in profile", JSON.stringify(guide,null,2));

//   const [formData, setFormData] = useState({
//     emailAddress: "",
//     fullName: "",
//   });

//   const [loading, setLoading] = useState(false);

//   const handleChange = (e) => {
//     e.preventDefault();
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const confirmUpdate = window.confirm(
//       "Are you sure you want to update your profile?"
//     );
//     if (!confirmUpdate) return;
//     try {
//       setLoading(true);
//       const resp = await guideUpdateProfile(formData);
//       console.log("resp in guide update", resp);
//       if (resp.success) {
//         console.log("resp in update profile", resp);
//         saveUserData("guide", resp.user); //updating data in localstorage
//         alert(resp.message || "Profile updated successfully.");

//         window.location.reload(true);
//       } else {
//         alert("Failed to update profile.");
//       }
//     } catch (err) {
//       console.log("err in update guide profile", err.response?.data);
//       alert(
//         err.response?.data?.message ||
//           "Failed to update user data, please try again."
//       );
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <form>
//       <div class="mb-3">
//         <input
//           type="emailAddress"
//           name="emailAddress"
//           class="form-control"
//           placeholder="emailAddress"
//           onChange={handleChange}
//           defaultValue={guide?.emailAddress}
//         />
//       </div>
//       <div class="mb-3">
//         <input
//           type="text"
//           name="fullName"
//           class="form-control"
//           placeholder="fullName"
//           defaultValue={guide?.fullName}
//           onChange={handleChange}
//         />
//       </div>
//       <button type="submit" class="explore-btn" onClick={handleSubmit}>
//         {loading ? "Submitting..." : "Submit"}
//       </button>
//     </form>
//   );
// }

// export default Profile;
import React, { useEffect, useState } from "react";
import { guideUpdateProfile } from "../../services/guideService";
import { getUserData, saveUserData } from "../../utils/storage";

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState(null);

  const [formData, setFormData] = useState({
    fullName: "",
    emailAddress: "",
    phoneNumber: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    professionalSummary: "",
    chargesPerDay: "",

    workExperience: [],
    certifications: [],
    languageProficiency: [],
    education: [],

    typesOfTours: [],
    otherTourType: "",
    destinationsGuided: [],
    groupSizesManaged: "",

    historyCultureRating: "",
    navigationRating: "",
    communicationRating: "",
    problemSolvingRating: "",

    availability: [],
    preferredLocations: [],

    reference1: { name: "", contact: "" },
    reference2: { name: "", contact: "" },

    additionalInfo: "",
    idProofType: "",
    idProofNumber: "",
  });

  /* ===============================
     LOAD GUIDE DATA (ONCE)
  =============================== */
  useEffect(() => {
    const guide = getUserData("guide");

    if (!guide) return;
    console.log("guide in guide profile",guide,null,2)

    setFormData({
      fullName: guide.fullName || "",
      emailAddress: guide.emailAddress || "",
      phoneNumber: guide.phoneNumber || "",
      gender: guide.gender || "",
      address: guide.address || "",
      city: guide.city || "",
      state: guide.state || "",
      country: guide.country || "",
      professionalSummary: guide.professionalSummary || "",
      chargesPerDay: guide.chargesPerDay || "",

      workExperience: guide.workExperience || [],
      certifications: guide.certifications || [],
      languageProficiency: guide.languageProficiency || [],
      education: guide.education || [],

      typesOfTours: guide.typesOfTours || [],
      otherTourType: guide.otherTourType || "",
      destinationsGuided: guide.destinationsGuided || [],
      groupSizesManaged: guide.groupSizesManaged || "",

      historyCultureRating: guide.historyCultureRating || "",
      navigationRating: guide.navigationRating || "",
      communicationRating: guide.communicationRating || "",
      problemSolvingRating: guide.problemSolvingRating || "",

      availability: guide.availability || [],
      preferredLocations: guide.preferredLocations || [],

      reference1: guide.reference1 || { name: "", contact: "" },
      reference2: guide.reference2 || { name: "", contact: "" },

      additionalInfo: guide.additionalInfo || "",
      idProofType: guide.idProofType || "",
      idProofNumber: guide.idProofNumber || "",
    });
  }, []);

  /* ===============================
     BASIC HANDLERS
  =============================== */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  /* ===============================
     ARRAY HANDLERS
  =============================== */
  const handleArrayChange = (field, index, key, value) => {
    const updated = [...formData[field]];
    updated[index] = { ...updated[index], [key]: value };
    setFormData((p) => ({ ...p, [field]: updated }));
  };

  const addArrayItem = (field, template) => {
    setFormData((p) => ({ ...p, [field]: [...p[field], template] }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((p) => ({
      ...p,
      [field]: p[field].filter((_, i) => i !== index),
    }));
  };

  /* ===============================
     MULTI SELECT / CHECKBOX
  =============================== */
  const toggleValue = (field, value) => {
    setFormData((p) => ({
      ...p,
      [field]: p[field].includes(value)
        ? p[field].filter((v) => v !== value)
        : [...p[field], value],
    }));
  };

  /* ===============================
     SUBMIT
  =============================== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!window.confirm("Update profile?")) return;

    try {
      setLoading(true);

      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
  if (Array.isArray(value) || typeof value === "object") {
    payload.append(key, JSON.stringify(value));
  } else {
    payload.append(key, value);
  }
});


      if (profileImage) {
        payload.append("profileImage", profileImage);
      }

      const res = await guideUpdateProfile(payload);

      if (res.success) {
        saveUserData("guide", res.user);
        alert("Profile updated successfully");
        window.location.reload();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ================= PERSONAL INFORMATION ================= */}
      <h4 className="mb-3">Personal Information</h4>

      <div className="mb-2">
        <label className="form-label">Full Name</label>
        <input
          className="form-control"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Email Address</label>
        <input
          className="form-control"
          name="emailAddress"
          value={formData.emailAddress}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Phone Number</label>
        <input
          className="form-control"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Gender</label>
        <select
          className="form-control"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
        >
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
      </div>

      <div className="mb-2">
        <label className="form-label">Address</label>
        <input
          className="form-control"
          name="address"
          value={formData.address}
          onChange={handleChange}
        />
      </div>

      <div className="row">
        <div className="col-md-4 mb-2">
          <label className="form-label">City</label>
          <input
            className="form-control"
            name="city"
            value={formData.city}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label">State</label>
          <input
            className="form-control"
            name="state"
            value={formData.state}
            onChange={handleChange}
          />
        </div>
        <div className="col-md-4 mb-2">
          <label className="form-label">Country</label>
          <input
            className="form-control"
            name="country"
            value={formData.country}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="mb-2">
        <label className="form-label">Professional Summary</label>
        <textarea
          className="form-control"
          name="professionalSummary"
          value={formData.professionalSummary}
          onChange={handleChange}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Charges Per Day</label>
        <input
          type="number"
          className="form-control"
          name="chargesPerDay"
          value={formData.chargesPerDay}
          onChange={handleChange}
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Profile Image</label>
        <input
          type="file"
          className="form-control"
          onChange={handleFileChange}
        />
      </div>

      {/* ================= WORK EXPERIENCE ================= */}
      <h4>Work Experience</h4>
      {formData.workExperience.map((item, i) => (
        <div key={i} className="row mb-2">
          <div className="col-md-5">
            <label className="form-label">Company</label>
            <input
              className="form-control"
              value={item.company || ""}
              onChange={(e) =>
                handleArrayChange(
                  "workExperience",
                  i,
                  "company",
                  e.target.value
                )
              }
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Years</label>
            <input
              className="form-control"
              value={item.years || ""}
              onChange={(e) =>
                handleArrayChange("workExperience", i, "years", e.target.value)
              }
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeArrayItem("workExperience", i)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() =>
          addArrayItem("workExperience", { company: "", years: "" })
        }
      >
        + Add Experience
      </button>

      {/* ================= CERTIFICATIONS ================= */}
      <h4>Certifications</h4>
      {formData.certifications.map((item, i) => (
        <div key={i} className="row mb-2">
          <div className="col-md-5">
            <label className="form-label">Certification Name</label>
            <input
              className="form-control"
              value={item.name || ""}
              onChange={(e) =>
                handleArrayChange("certifications", i, "name", e.target.value)
              }
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Year Obtained</label>
            <input
              className="form-control"
              value={item.year || ""}
              onChange={(e) =>
                handleArrayChange("certifications", i, "year", e.target.value)
              }
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeArrayItem("certifications", i)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() => addArrayItem("certifications", { name: "", year: "" })}
      >
        + Add Certification
      </button>

      {/* ================= LANGUAGE PROFICIENCY ================= */}
      <h4>Language Proficiency</h4>
      {formData.languageProficiency.map((item, i) => (
        <div key={i} className="row mb-2">
          <div className="col-md-5">
            <label className="form-label">Language</label>
            <input
              className="form-control"
              value={item.language || ""}
              onChange={(e) =>
                handleArrayChange(
                  "languageProficiency",
                  i,
                  "language",
                  e.target.value
                )
              }
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Fluency Level</label>
            <select
              className="form-control"
              value={item.fluency || ""}
              onChange={(e) =>
                handleArrayChange(
                  "languageProficiency",
                  i,
                  "fluency",
                  e.target.value
                )
              }
            >
              <option value="">Select</option>
              <option>Fluent</option>
              <option>Proficient</option>
              <option>Intermediate</option>
              <option>Basic</option>
            </select>
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeArrayItem("languageProficiency", i)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() =>
          addArrayItem("languageProficiency", { language: "", fluency: "" })
        }
      >
        + Add Language
      </button>

      {/* ================= EDUCATION ================= */}
      <h4>Education</h4>
      {formData.education.map((item, i) => (
        <div key={i} className="row mb-2">
          <div className="col-md-5">
            <label className="form-label">Degree</label>
            <input
              className="form-control"
              value={item.degree || ""}
              onChange={(e) =>
                handleArrayChange("education", i, "degree", e.target.value)
              }
            />
          </div>
          <div className="col-md-5">
            <label className="form-label">Year</label>
            <input
              className="form-control"
              value={item.year || ""}
              onChange={(e) =>
                handleArrayChange("education", i, "year", e.target.value)
              }
            />
          </div>
          <div className="col-md-2 d-flex align-items-end">
            <button
              type="button"
              className="btn btn-danger"
              onClick={() => removeArrayItem("education", i)}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-secondary mb-4"
        onClick={() => addArrayItem("education", { degree: "", year: "" })}
      >
        + Add Education
      </button>

      {/* ================= TOUR & AVAILABILITY ================= */}
      <h4>Tour & Availability</h4>

      <label className="form-label">Types of Tours</label>
      {["Adventure", "Cultural", "Historical", "Wildlife", "Culinary"].map(
        (t) => (
          <div key={t} className="form-check">
            <input
              type="checkbox"
              className="form-check-input"
              checked={formData.typesOfTours.includes(t)}
              onChange={() => toggleValue("typesOfTours", t)}
            />
            <label className="form-check-label">{t}</label>
          </div>
        )
      )}

      <div className="mb-2 mt-2">
        <label className="form-label">Other Tour Type</label>
        <input
          className="form-control"
          name="otherTourType"
          value={formData.otherTourType}
          onChange={handleChange}
        />
      </div>

      <label className="form-label">Destinations Guided</label>
      {[
        "Delhi",
        "Rajasthan",
        "Agra",
        "Mumbai",
        "Goa",
        "Kerala",
        "Himachal Pradesh",
      ].map((d) => (
        <div key={d} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.destinationsGuided.includes(d)}
            onChange={() => toggleValue("destinationsGuided", d)}
          />
          <label className="form-check-label">{d}</label>
        </div>
      ))}

      <div className="mb-3">
        <label className="form-label">Group Sizes Managed</label>
        <input
          className="form-control"
          name="groupSizesManaged"
          value={formData.groupSizesManaged}
          onChange={handleChange}
        />
      </div>

      <label className="form-label">Available Days</label>
      {[
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ].map((day) => (
        <div key={day} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.availability.includes(day)}
            onChange={() => toggleValue("availability", day)}
          />
          <label className="form-check-label">{day}</label>
        </div>
      ))}

      <label className="form-label mt-2">Preferred Locations</label>
      {[
        "Delhi",
        "Rajasthan",
        "Agra",
        "Mumbai",
        "Goa",
        "Kerala",
        "Himachal Pradesh",
      ].map((loc) => (
        <div key={loc} className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={formData.preferredLocations.includes(loc)}
            onChange={() => toggleValue("preferredLocations", loc)}
          />
          <label className="form-check-label">{loc}</label>
        </div>
      ))}

      {/* ================= RATINGS ================= */}
      <h4 className="mt-4">Skill Ratings</h4>
      {[
        ["historyCultureRating", "History & Culture Knowledge"],
        ["navigationRating", "Navigation Skills"],
        ["communicationRating", "Communication Skills"],
        ["problemSolvingRating", "Problem Solving Skills"],
      ].map(([field, label]) => (
        <div key={field} className="mb-2">
          <label className="form-label">{label} (1–5)</label>
          <select
            className="form-control"
            name={field}
            value={formData[field]}
            onChange={handleChange}
          >
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
      ))}

      {/* ================= REFERENCES ================= */}
      <h4>References</h4>

      <div className="mb-2">
        <label className="form-label">Reference 1 Name</label>
        <input
          className="form-control"
          value={formData.reference1.name}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              reference1: { ...p.reference1, name: e.target.value },
            }))
          }
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Reference 1 Contact</label>
        <input
          className="form-control"
          value={formData.reference1.contact}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              reference1: { ...p.reference1, contact: e.target.value },
            }))
          }
        />
      </div>

      <div className="mb-2">
        <label className="form-label">Reference 2 Name</label>
        <input
          className="form-control"
          value={formData.reference2.name}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              reference2: { ...p.reference2, name: e.target.value },
            }))
          }
        />
      </div>

      <div className="mb-4">
        <label className="form-label">Reference 2 Contact</label>
        <input
          className="form-control"
          value={formData.reference2.contact}
          onChange={(e) =>
            setFormData((p) => ({
              ...p,
              reference2: { ...p.reference2, contact: e.target.value },
            }))
          }
        />
      </div>

      {/* ================= ADDITIONAL & ID ================= */}
      <h4>Additional Information</h4>
      <textarea
        className="form-control mb-3"
        name="additionalInfo"
        value={formData.additionalInfo}
        onChange={handleChange}
      />

      <h4>ID Proof</h4>
      <div className="mb-2">
        <label className="form-label">ID Proof Type</label>
        <select
          className="form-control"
          name="idProofType"
          value={formData.idProofType}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option>Aadhar Card</option>
          <option>PAN Card</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="form-label">ID Proof Number</label>
        <input
          className="form-control"
          name="idProofNumber"
          value={formData.idProofNumber}
          onChange={handleChange}
        />
      </div>

      <button className="btn btn-primary" disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
};

export default Profile;
