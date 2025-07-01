import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../redux/slices/authSlice";

import Layout from "./Layout";
import Home from "../home/Home";
import BestGuide from "../bestguide/BestGuide";
import Places from "../places/Places";
import About from "../about/About";
import GuideList from "../guides/GuideList";
import ContactUs from "../common/contactUs/ContactUs";
import HotelBooking from "../hotels/HotelBooking";
import UserDashboard from "../home/UserDashboard";
import PrivateRoute from "./PrivateRoute";
import Blogs from "../blogs/Blogs";
import Blogdetail from "../blogs/Blogdetail";

function RootNavigation() {
  const dispatch = useDispatch();

  useEffect(() => {
    const user = localStorage.getItem("safarix_user");
    const token = localStorage.getItem("safarix_token");
    if (user && token) {
      dispatch(
        loginSuccess({
          user: JSON.parse(user),
          token,
        })
      );
    }
  }, [dispatch]);

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/guides" element={<GuideList />} />
        <Route path="/places" element={<Places />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact-us" element={<ContactUs />} />
        <Route path="/hotel" element={<HotelBooking />} />
        <Route path="/blogs" element={<Blogs/>}/>
        <Route path="/blog-detail" element={<Blogdetail/>}/>
        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <UserDashboard />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default RootNavigation;
