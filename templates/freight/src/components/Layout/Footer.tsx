import './Footer.css';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer-inner">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Velocity Freight Solutions</h3>
            <p>Precision logistics & transportation services across Southern Africa. Real-time tracking, reliable delivery, modern fleet.</p>
          </div>
          <div className="footer-links">
            <h4>Services</h4>
            <a href="#services">Freight Transport</a>
            <a href="#services">Route Optimization</a>
            <a href="#services">Warehousing</a>
            <a href="#services">Supply Chain</a>
          </div>
          <div className="footer-links">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-contact">
            <h4>Contact</h4>
            <p>Johannesburg, South Africa</p>
            <p>+27 11 234 5678</p>
            <p>info@velocityfreight.co.za</p>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {year} Velocity Freight Solutions. All rights reserved.</p>
          <p className="footer-powered">Powered by Logistiqs AI</p>
        </div>
      </div>
    </footer>
  );
}
