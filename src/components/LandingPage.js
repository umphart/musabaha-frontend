import React from 'react';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to MUSABAHA HOMES LTD.</h1>
          <p>Your trusted partner for quality homes and real estate solutions</p>
          <div className="hero-buttons">
            <a href="#about" className="btn btn-primary">Learn More</a>
            <a href="login" className="btn btn-primary">Get Started</a>
            <a href="#contact" className="btn btn-secondary">Contact Us</a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2>Why Choose Us?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏠</div>
              <h3>Quality Homes</h3>
              <p>We provide high-quality, affordable housing solutions tailored to your needs.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📍</div>
              <h3>Prime Locations</h3>
              <p>Our properties are strategically located with access to amenities and transportation.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🤝</div>
              <h3>Trusted Service</h3>
              <p>With years of experience, we've built a reputation for reliability and excellence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section">
        <div className="container">
          <h2>About MHL</h2>
          <p>MUSABAHA HOMES LTD. has been a leading real estate developer since 2005. We specialize in creating sustainable communities and providing housing solutions that meet the diverse needs of our clients. Our commitment to quality, innovation, and customer satisfaction has made us a trusted name in the industry.</p>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact-section">
        <div className="container">
          <h2>Contact Us</h2>
          <div className="contact-info">
            <p><strong>Address:</strong> No. 015, City Plaza Along Ring Road Western Bypass Along Yankaba Road, Kano State.</p>
            <p><strong>Phone:</strong> +2349084220705, +2349039108863, +2347038192719</p>
            <p><strong>Email:</strong> musababahomesth@gmail.com</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; {new Date().getFullYear()} MUSABAHA HOMES LTD. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;