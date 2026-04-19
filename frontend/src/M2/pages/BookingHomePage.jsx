import React from "react";
import { Link } from "react-router-dom";
import BookingNavbar from "../components/BookingNavbar";

export default function BookingHomePage() {
  return (
    <div className="booking-page">
      <BookingNavbar />

      <section className="hero-section">
        <div className="hero-card">
          <span className="hero-badge">Module 2</span>
          <h2>Booking Management System</h2>
          <p>
            Manage campus resource booking requests with a clear workflow.
            Users can create and view bookings, while admins can review and
            update booking status.
          </p>

          <div className="hero-actions">
            <Link to="/m2/user" className="primary-btn">
              Go to User Page
            </Link>
            <Link to="/m2/admin" className="secondary-btn">
              Go to Admin Page
            </Link>
          </div>
        </div>
      </section>

      <section className="feature-grid-section">
        <div className="feature-grid">
          <div className="feature-card">
            <h3>User Booking Flow</h3>
            <p>Create booking requests, view your bookings, and cancel approved bookings.</p>
          </div>

          <div className="feature-card">
            <h3>Admin Workflow</h3>
            <p>Review all bookings and update them as APPROVED, REJECTED, or CANCELLED.</p>
          </div>

          <div className="feature-card">
            <h3>Connected to Backend</h3>
            <p>This frontend uses your Spring Boot Module 2 booking APIs directly.</p>
          </div>
        </div>
      </section>
    </div>
  );
}