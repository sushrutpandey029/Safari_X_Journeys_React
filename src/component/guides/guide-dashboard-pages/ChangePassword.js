import React, { useEffect, useState } from "react";
import { guideChangePassword } from "../../services/guideService";

function ChangePassword() {
  const [formData, setFormData] = useState({
    oldpassword: "",
    newpassword: "",
    confirmpassword: "",
  });

  const handleChange = (e) => {
    e.preventDefault();
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("formdata before change paswrod", formData);
      const resp = await guideChangePassword(formData);
      if (resp.success) {
        console.log("resp in change passwrod", resp);
        alert(resp.message || "Password changed successfully.");
        setFormData({
          ...formData,
          oldpassword: "",
          newpassword: "",
          confirmpassword: "",
        });
        window.location.reload(true);
      } else {
        alert("Failed to changed successfully.");
      }
    } catch (err) {
      console.log("err in change password", err.response?.data);
      alert(
        err.response?.data?.message ||
          "Failed to change password, please try again."
      );
    }
  };
  return (
    <form>
      <div class="mb-3">
        <input
          type="password"
          name="oldpassword"
          class="form-control"
          id="exampleInputEmail1"
          placeholder="Old Password"
          onChange={handleChange}
        />
      </div>

      <div class="mb-3">
        <input
          type="password"
          name="newpassword"
          class="form-control"
          id="exampleInputEmail1"
          placeholder="New Password"
          onChange={handleChange}
        />
      </div>

      <div class="mb-3">
        <input
          type="password"
          name="confirmpassword"
          class="form-control"
          id="exampleInputPassword1"
          placeholder="Confirm Password"
          onChange={handleChange}
        />
      </div>

      <button type="submit" class="explore-btn" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  );
}

export default ChangePassword;
