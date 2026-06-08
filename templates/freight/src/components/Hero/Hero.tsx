import { useRevealClass } from '../../hooks/useScrollReveal';
import { Button } from '../UI/Button';
import './Hero.css';

export function Hero() {
  const { ref: staggerRef, className } = useRevealClass();

  return (
    <section id="home" className="hero" ref={staggerRef}>
      <div className="hero-bg">
        <div className="hero-grid" />
        <div className="hero-glow" />
      </div>
      <div className="container hero-content">
        <span className={`hero-badge ${className}`}>Real-Time Freight Tracking</span>
        <h1 className={`hero-title ${className}`}>
          Precision Logistics for
          <span className="hero-highlight"> Modern Freight</span>
        </h1>
        <p className={`hero-subtitle ${className}`}>
          End-to-end freight solutions with live route tracking, optimized delivery schedules,
          and a modern fleet serving Southern Africa.
        </p>
        <div className={`hero-actions ${className}`}>
          <Button variant="primary" size="lg">Get a Quote</Button>
          <Button variant="outline" size="lg">Track Shipment</Button>
        </div>
        <div className={`hero-stats ${className}`}>
          <div className="hero-stat">
            <span className="hero-stat-value">2,500+</span>
            <span className="hero-stat-label">Shipments/Month</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">98.7%</span>
            <span className="hero-stat-label">On-Time Delivery</span>
          </div>
          <div className="hero-stat">
            <span className="hero-stat-value">500+</span>
            <span className="hero-stat-label">Fleet Vehicles</span>
          </div>
        </div>
      </div>
    </section>
  );
}
