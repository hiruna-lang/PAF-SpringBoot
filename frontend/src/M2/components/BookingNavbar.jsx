import React from "react";
import { Link, useLocation } from "react-router-dom";

export default function BookingNavbar() {
  const location = useLocation();

  return (
    <header className="booking-header">
      <div className="booking-header-inner">
        <div className="booking-brand">
          <h1>Smart Campus Booking</h1>
          <p>Module 2 • Booking Management</p>
        </div>

        <nav className="booking-nav">
          <Link
            to="/m2"
            className={location.pathname === "/m2" ? "nav-link active" : "nav-link"}
          >
            Overview
          </Link>
          <Link
            to="/m2/user"
            className={location.pathname === "/m2/user" ? "nav-link active" : "nav-link"}
          >
            User Page
          </Link>
          <Link
            to="/m2/admin"
            className={location.pathname === "/m2/admin" ? "nav-link active" : "nav-link"}
          >
            Admin Page
          </Link>
        </nav>
      </div>
    </header>
  );
}