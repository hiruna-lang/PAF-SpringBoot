import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Home/Home.css";
import "./ContactPage.css";

function ContactPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        name: "",
        email: "",
        subject: "",
        message: "",
        category: "general"
      });
    }, 3000);
  };

  return (
    <div className="contact-page">
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

      <section className="contact-hero" id="top">
        <div className="contact-hero-content">
          <div className="contact-hero-text">
            <h1>Get in Touch</h1>
            <p>
              Have questions about SmartCampus? Need technical support or want to share feedback? 
              Our team is here to help you make the most of your campus management experience.
            </p>
          </div>
          <div className="contact-hero-image">
            <div className="contact-illustration">
              <div className="contact-illustration-icon">📧</div>
              <div className="contact-illustration-lines">
                <div className="line"></div>
                <div className="line"></div>
                <div className="line"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="contact-content">
        <div className="contact-container">
          <div className="contact-grid">
            <div className="contact-info">
              <h2>Ways to Reach Us</h2>
              
              <div className="contact-methods">
                <div className="contact-method">
                  <div className="contact-method-icon">📧</div>
                  <div className="contact-method-content">
                    <h3>Email Support</h3>
                    <p>support@smartcampus.edu</p>
                    <span className="contact-method-detail">Response within 24 hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">📱</div>
                  <div className="contact-method-content">
                    <h3>Phone Support</h3>
                    <p>+1 (555) 123-4567</p>
                    <span className="contact-method-detail">Mon-Fri, 9AM-5PM EST</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">💬</div>
                  <div className="contact-method-content">
                    <h3>Live Chat</h3>
                    <p>Available in app</p>
                    <span className="contact-method-detail">Instant responses during business hours</span>
                  </div>
                </div>

                <div className="contact-method">
                  <div className="contact-method-icon">🏢</div>
                  <div className="contact-method-content">
                    <h3>Campus Office</h3>
                    <p>Admin Building, Room 201</p>
                    <span className="contact-method-detail">Walk-ins welcome during office hours</span>
                  </div>
                </div>
              </div>

              <div className="contact-faq">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-list">
                  <div className="faq-item">
                    <h4>How do I reset my password?</h4>
                    <p>Click on the "Forgot Password" link on the login page or contact IT support.</p>
                  </div>
                  <div className="faq-item">
                    <h4>Can I access SmartCampus on mobile?</h4>
                    <p>Yes! SmartCampus is fully responsive and works on all mobile devices.</p>
                  </div>
                  <div className="faq-item">
                    <h4>How do I report a bug?</h4>
                    <p>Use the feedback form or email support@smartcampus.edu with details.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              <div className="contact-form-card">
                <h2>Send us a Message</h2>
                {submitted ? (
                  <div className="contact-success">
                    <div className="success-icon">✓</div>
                    <h3>Message Sent Successfully!</h3>
                    <p>We'll get back to you within 24 hours.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="contact-form">
                    <div className="form-group">
                      <label htmlFor="category">Category</label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="general">General Inquiry</option>
                        <option value="technical">Technical Support</option>
                        <option value="billing">Billing & Accounts</option>
                        <option value="feedback">Feedback & Suggestions</option>
                        <option value="partnership">Partnership Opportunities</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="name">Name *</label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          placeholder="Your full name"
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="email">Email *</label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                          placeholder="your.email@example.com"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="subject">Subject *</label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        placeholder="Brief description of your inquiry"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="message">Message *</label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        required
                        rows={6}
                        placeholder="Please provide detailed information about your inquiry..."
                      />
                    </div>

                    <button
                      type="submit"
                      className="contact-submit-btn"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Sending..." : "Send Message"}
                    </button>
                  </form>
                )}
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

export default ContactPage;
