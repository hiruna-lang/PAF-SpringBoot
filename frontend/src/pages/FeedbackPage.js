import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Home/Home.css";
import "./FeedbackPage.css";

function FeedbackPage() {
  const navigate = useNavigate();
  const [feedbackType, setFeedbackType] = useState("general");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    email: "",
    urgency: "medium"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [rating, setRating] = useState(0);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    setSubmitted(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        title: "",
        description: "",
        email: "",
        urgency: "medium"
      });
      setRating(0);
      setFeedbackType("general");
    }, 3000);
  };

  const feedbackTypes = [
    {
      id: "general",
      title: "General Feedback",
      description: "Share your overall experience with SmartCampus",
      icon: "💬",
      color: "#0f766e"
    },
    {
      id: "bug",
      title: "Bug Report",
      description: "Report technical issues or unexpected behavior",
      icon: "🐛",
      color: "#dc2626"
    },
    {
      id: "feature",
      title: "Feature Request",
      description: "Suggest new features or improvements",
      icon: "✨",
      color: "#2563eb"
    },
    {
      id: "ui",
      title: "UI/UX Feedback",
      description: "Help us improve the user interface and experience",
      icon: "🎨",
      color: "#7c3aed"
    }
  ];

  return (
    <div className="feedback-page">
      <nav className="nav">
        <a
          className="nav-brand"
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            navigate("/");
          }}
        >
          <span className="nav-brand-icon">SC</span>
          <span className="nav-brand-name">SmartCampus</span>
        </a>

        <div className="nav-center">
          <button
            className="nav-menu-btn"
            type="button"
            onClick={() => navigate("/resources")}
          >
            Resources
          </button>

          <button
            className="nav-menu-btn"
            type="button"
            onClick={() => navigate("/m2?tab=my-bookings")}
          >
            My Booking
          </button>

          <button
            className="nav-menu-btn"
            type="button"
            onClick={() => navigate("/create-ticket")}
          >
            Create Ticket
          </button>
        </div>

        <div className="nav-icons">
          <button
            className="nav-icon-btn"
            type="button"
            onClick={() => navigate("/notifications")}
            aria-label="Notifications"
            title="Notifications"
          >
            <span className="nav-icon">🔔</span>
          </button>

          <button
            className="nav-icon-btn nav-profile-btn"
            type="button"
            onClick={() => navigate("/profile")}
            aria-label="Profile"
            title="Profile"
          >
            <span className="nav-icon">👤</span>
          </button>
        </div>
      </nav>

      <section className="feedback-hero" id="top">
        <div className="feedback-hero-content">
          <div className="feedback-hero-text">
            <h1>Share Your Feedback</h1>
            <p>
              Your insights help us build a better SmartCampus experience. 
              Whether it's a bug report, feature suggestion, or general feedback, 
              we're listening and ready to improve.
            </p>
          </div>
          <div className="feedback-hero-image">
            <div className="feedback-illustration">
              <div className="feedback-illustration-icon">💡</div>
              <div className="feedback-illustration-dots">
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
                <div className="dot"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="feedback-content">
        <div className="feedback-container">
          <div className="feedback-types">
            <h2>What type of feedback would you like to share?</h2>
            <div className="feedback-type-grid">
              {feedbackTypes.map((type) => (
                <button
                  key={type.id}
                  className={`feedback-type-card ${feedbackType === type.id ? 'active' : ''}`}
                  onClick={() => setFeedbackType(type.id)}
                  style={{ borderColor: feedbackType === type.id ? type.color : '#e2e8f0' }}
                >
                  <div className="feedback-type-icon" style={{ color: type.color }}>
                    {type.icon}
                  </div>
                  <h3 style={{ color: feedbackType === type.id ? type.color : '#1e293b' }}>
                    {type.title}
                  </h3>
                  <p>{type.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="feedback-form-section">
            <div className="feedback-form-card">
              <h2>Tell us more</h2>
              {submitted ? (
                <div className="feedback-success">
                  <div className="success-icon">✓</div>
                  <h3>Thank You for Your Feedback!</h3>
                  <p>We appreciate your input and will review it carefully.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="feedback-form">
                  <div className="form-group">
                    <label htmlFor="title">Title *</label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      placeholder={feedbackType === "bug" ? "Brief description of the issue" : "Summary of your feedback"}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">Description *</label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      placeholder={
                        feedbackType === "bug" 
                          ? "Please describe the issue in detail, including steps to reproduce..."
                          : feedbackType === "feature"
                          ? "Describe the feature you'd like to see and how it would help..."
                          : "Please share your detailed feedback..."
                      }
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="email">Email (optional)</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="urgency">Urgency</label>
                      <select
                        id="urgency"
                        name="urgency"
                        value={formData.urgency}
                        onChange={handleInputChange}
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  {feedbackType === "general" && (
                    <div className="form-group">
                      <label>Rate your experience</label>
                      <div className="rating-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            className={`star ${rating >= star ? 'active' : ''}`}
                            onClick={() => setRating(star)}
                          >
                            ★
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="feedback-submit-btn"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Feedback"}
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="feedback-tips">
            <h2>Tips for Effective Feedback</h2>
            <div className="tips-grid">
              <div className="tip-card">
                <div className="tip-icon">🎯</div>
                <h3>Be Specific</h3>
                <p>Provide clear, detailed information about what you're experiencing.</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">📸</div>
                <h3>Include Context</h3>
                <p>Tell us what you were trying to accomplish when the issue occurred.</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">🔄</div>
                <h3>Reproduce Steps</h3>
                <p>For bugs, list the exact steps to reproduce the issue.</p>
              </div>
              <div className="tip-card">
                <div className="tip-icon">💡</div>
                <h3>Suggest Solutions</h3>
                <p>If you have ideas for improvements, we'd love to hear them.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-content">
          <div className="footer-section">
            <div className="footer-brand">
              <span className="nav-brand-icon">SC</span>
              <span className="nav-brand-name">SmartCampus</span>
            </div>
            <p className="footer-description">
              Unified campus operations, finally human. SmartCampus brings together resources, 
              student services, and support in one seamless platform.
            </p>
            <div className="footer-social">
              <a href="#" className="footer-social-link" aria-label="Twitter">
                <span className="footer-social-icon">𝕏</span>
              </a>
              <a href="#" className="footer-social-link" aria-label="LinkedIn">
                <span className="footer-social-icon">in</span>
              </a>
              <a href="#" className="footer-social-link" aria-label="GitHub">
                <span className="footer-social-icon">⚡</span>
              </a>
            </div>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Platform</h3>
            <ul className="footer-links">
              <li><a href="#features">Features</a></li>
              <li><a href="/resources">Resources</a></li>
              <li><a href="/create-ticket">Support</a></li>
              <li><a href="/m2?tab=my-bookings">Bookings</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Support</h3>
            <ul className="footer-links">
              <li><a href="/contact">Contact Us</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Feedback</h3>
            <ul className="footer-links">
              <li><a href="/feedback">Send Feedback</a></li>
            </ul>
          </div>

          <div className="footer-section">
            <h3 className="footer-heading">Legal</h3>
            <ul className="footer-links">
              <li><a href="/privacy">Privacy Policy</a></li>
              <li><a href="/terms">Terms of Service</a></li>
              <li><a href="/security">Security</a></li>
              <li><a href="/compliance">Compliance</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-content">
            <div className="footer-copy">
              © 2024 SmartCampus. Built for modern universities and empowered teams.
            </div>
            <div className="footer-bottom-links">
              <a href="/privacy">Privacy</a>
              <span className="footer-separator">•</span>
              <a href="/terms">Terms</a>
              <span className="footer-separator">•</span>
              <a href="/cookies">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default FeedbackPage;
