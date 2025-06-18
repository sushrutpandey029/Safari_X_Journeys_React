import React from "react";
import { Route, Routes } from "react-router-dom";

import Layout from "./Layout";
import Home from "../home/Home";
import BestGuide from "../bestguide/BestGuide";
import Places from "../places/Places";

function RootNavigation() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="/best-guides" element={<BestGuide />} />
        <Route path="/places" element={<Places />} />
      </Route>
    </Routes>
  );
}

export default RootNavigation;
