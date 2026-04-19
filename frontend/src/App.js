import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import BookingHomePage from "./M2/pages/BookingHomePage";
import UserBookingPage from "./M2/pages/UserBookingPage";
import AdminBookingPage from "./M2/pages/AdminBookingPage";
import "./M2/styles/Booking.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/m2" replace />} />
        <Route path="/m2" element={<BookingHomePage />} />
        <Route path="/m2/user" element={<UserBookingPage />} />
        <Route path="/m2/admin" element={<AdminBookingPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;