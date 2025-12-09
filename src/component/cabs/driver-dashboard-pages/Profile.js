import React, { useState } from "react";
import { driverUpdateProfile } from "../../services/cabService";
import { useSelector, useDispatch } from "react-redux";
import { saveUserData, getUserData } from "../../utils/storage";
import { loginSuccess } from "../../redux/slices/authSlice";

function Profile() {
  const driver = getUserData("driver");
  console.log("driver in profile", driver);

  const [formData, setFormData] = useState({
    email: "",
    drivername: "",
  });

  const [loading, setLoading] = useState(false);
  const dispatch = useDispatch();

  const handleChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  //updating user data
  const handleSubmit = async (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm(
      "Are you sure you want to update your profile?"
    );
    if (!confirmUpdate) return;
    try {
      setLoading(true);
      const resp = await driverUpdateProfile(formData);
      console.log("resp in driver update", resp);
      if (resp.success) {
        dispatch(
          loginSuccess({
            user: resp.user,
            token: resp.token,
          })
        );
        saveUserData("driver", resp);
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
          defaultValue={driver?.email}
        />
      </div>
      <div class="mb-3">
        <input
          type="text"
          name="drivername"
          class="form-control"
          placeholder="drivername"
          defaultValue={driver?.drivername}
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
