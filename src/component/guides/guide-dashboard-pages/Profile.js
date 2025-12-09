import React, { useState } from "react";
import { guideUpdateProfile } from "../../services/guideService";
import { useSelector, useDispatch } from "react-redux";
import { saveUserData, getUserData } from "../../utils/storage";

function Profile() {
  const guide = getUserData("guide");
  console.log("guide in profile", guide);

  const [formData, setFormData] = useState({
    email: "",
    guidename: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm(
      "Are you sure you want to update your profile?"
    );
    if (!confirmUpdate) return;
    try {
      setLoading(true);
      const resp = await guideUpdateProfile(formData);
      console.log("resp in guide update", resp);
      if (resp.success) {
        console.log("resp in update profile", resp);
        saveUserData("guide", resp.user); //updating data in localstorage
        alert(resp.message || "Profile updated successfully.");

        window.location.reload(true);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.log("err in update guide profile", err.response?.data);
      alert(
        err.response?.data?.message ||
          "Failed to update user data, please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form>
      <div class="mb-3">
        <input
          type="email"
          name="email"
          class="form-control"
          placeholder="Email"
          onChange={handleChange}
          defaultValue={guide?.email}
        />
      </div>
      <div class="mb-3">
        <input
          type="text"
          name="guidename"
          class="form-control"
          placeholder="guidename"
          defaultValue={guide?.guidename}
          onChange={handleChange}
        />
      </div>
      <button type="submit" class="explore-btn" onClick={handleSubmit}>
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}

export default Profile;
