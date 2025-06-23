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
        <Route path="/about" element={<About/>}/>
        <Route path="/contact-us" element={<ContactUs/>}/>
      </Route>
    </Routes>
  );
}

export default RootNavigation;
