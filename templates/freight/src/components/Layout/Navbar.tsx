import { useState, useEffect } from 'react';
import './Navbar.css';

const NAV_ITEMS = [
  { label: 'Home', href: '#home' },
  { label: 'Services', href: '#services' },
  { label: 'Tracking', href: '#tracking' },
  { label: 'Dashboard', href: '#dashboard' },
  { label: 'Quote', href: '#quote' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id || 'home');
          }
        });
      },
      { threshold: 0.2, rootMargin: '-80px 0px 0px 0px' }
    );

    document.querySelectorAll('section[id]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleNavClick = (href: string) => {
    setMobileOpen(false);
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''}`}>
      <div className="container navbar-inner">
        <a href="#home" className="navbar-brand" onClick={(e) => { e.preventDefault(); handleNavClick('#home'); }}>
          <span className="navbar-logo">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="6" fill="var(--color-primary)" />
              <path d="M8 20h16l-3-6H11l-3 6z" fill="var(--color-accent)" />
              <circle cx="12" cy="24" r="2" fill="white" />
              <circle cx="20" cy="24" r="2" fill="white" />
            </svg>
          </span>
          <span className="navbar-title">Velocity Freight</span>
        </a>

        <div className={`navbar-links ${mobileOpen ? 'open' : ''}`}>
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`navbar-link ${activeSection === item.href.replace('#', '') ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); handleNavClick(item.href); }}
            >
              {item.label}
            </a>
          ))}
        </div>

        <button
          className={`navbar-toggle ${mobileOpen ? 'open' : ''}`}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle navigation"
        >
          <span /><span /><span />
        </button>
      </div>
    </nav>
  );
}
