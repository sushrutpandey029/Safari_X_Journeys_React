import React, { useState } from "react";
import { userUpdateProfile } from "../../services/userService";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../../redux/slices/authSlice";
import { saveUserData } from "../../utils/storage";

function Profile() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  console.log("user in profile", user);
  const [formData, setFormData] = useState({
    emailid: "",
    fullname: "",
    phonenumber: "",
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
      const resp = await userUpdateProfile(formData);
      if (resp.success) {
        console.log("resp in update profile", resp);
        dispatch(updateProfile({ user: resp.user })); //updating data in redux store
        saveUserData("safarix_user",resp.user); //updating data in localstorage
        alert(resp.message || "Profile updated successfully.");
        setFormData({
          ...formData,
          emailid: "",
          fullname: "",
          phonenumber: "",
        });
        window.location.reload(true);
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.log("err in update user profile", err.response?.data);
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
          name="emailid"
          class="form-control"
          placeholder="Email"
          onChange={handleChange}
          defaultValue={user?.emailid}
        />
      </div>
      <div class="mb-3">
        <input
          type="text"
          name="fullname"
          class="form-control"
          placeholder="Fullname"
          defaultValue={user?.fullname}
          onChange={handleChange}
        />
      </div>
      <div class="mb-3">
        <input
          type="number"
          name="phonenumber"
          class="form-control"
          placeholder="Phone Number"
          defaultValue={user?.phonenumber}
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
