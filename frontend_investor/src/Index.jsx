import React from "react"
import { Routes, Route, Navigate } from 'react-router'

// Investor side imports
import Homepage from './pages/Homepage.jsx'
import MapPage from './pages/MapPage.jsx'
import Businesses from './pages/Businesses.jsx'
import Investibles from './pages/Investibles.jsx'
import Contact from './pages/Contact.jsx'

const Index = () => {
  return (
    <Routes>
      {/* <Route path="/" element={} /> */}
      <Route path="/page/homepage/" element={<Homepage />} />
      <Route path="/page/interactive-map/" element={<MapPage />} />
      <Route path="/page/businesses/" element={<Businesses />} />
      <Route path="/page/investibles/" element={<Investibles />} />
      {/* <Route path="/page/contact/" element={<Contact />} /> */}
    </Routes>
  );
};

export default Index