import React, { useEffect } from "react";
import { Route, Routes, Router } from "react-router-dom";
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
import GuideDashboard from "../guides/GuideDashboard";
import DriverDashboard from "../cabs/DriverDashboard";
import CabList from "../cabs/CabList";
import GuideCareers from "../guides/GuideCareers";
import BotModal from "../common/BotModal";
import Testimonials from "../common/testimonials/Testimonials";
import Cabdetail from "../cabs/Cabdetail";

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
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blog-detail" element={<Blogdetail />} />
        <Route path="/cabs" element={<CabList />} />
        <Route path="/guide-careers" element={<GuideCareers />} />
        <Route path="/bot-modal" element={<BotModal />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/cab-details" element={<Cabdetail />} />

        <Route
          path="/user-dashboard"
          element={
            <PrivateRoute allowedRoles={["user"]}>
              <UserDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/guide-dashboard"
          element={
            <PrivateRoute allowedRoles={["guide"]}>
              <GuideDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/driver-dashboard"
          element={
            <PrivateRoute allowedRoles={["driver"]}>
              <DriverDashboard />
            </PrivateRoute>
          }
        />
      </Route>
    </Routes>
  );
}

export default RootNavigation;
