import { useRevealClass } from '../../hooks/useScrollReveal';
import './Services.css';

const SERVICES = [
  { title: 'Freight Transport', desc: 'Full-load and partial-load freight services across Southern Africa with real-time tracking.', icon: '🚛' },
  { title: 'Route Optimization', desc: 'AI-powered route planning to minimize transit time and fuel costs.', icon: '📍' },
  { title: 'Warehousing', desc: 'Secure storage solutions with inventory management and just-in-time delivery.', icon: '🏭' },
  { title: 'Supply Chain', desc: 'End-to-end supply chain management from procurement to final delivery.', icon: '🔗' },
  { title: 'Cross-Border', desc: 'Seamless cross-border logistics with customs clearance and regulatory compliance.', icon: '🌍' },
  { title: 'Express Delivery', desc: 'Time-critical urgent deliveries with dedicated vehicles and priority handling.', icon: '⚡' },
];

export function Services() {
  const { ref, className } = useRevealClass();

  return (
    <section id="services" className="section services-section" ref={ref}>
      <div className="container">
        <div className={`section-header ${className}`}>
          <h2>Our Services</h2>
          <p>Comprehensive freight and logistics solutions tailored to your needs</p>
        </div>
        <div className="services-grid">
          {SERVICES.map((svc, i) => (
            <div
              key={svc.title}
              className={`service-card ${className}`}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <span className="service-icon">{svc.icon}</span>
              <h3 className="service-title">{svc.title}</h3>
              <p className="service-desc">{svc.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
