import { useRevealClass } from '../../hooks/useScrollReveal';
import './LiveTracking.css';

const STEPS = ['Ordered', 'Picked Up', 'In Transit', 'Out for Delivery', 'Delivered'];
const CURRENT_STEP = 2; // "In Transit"

export function LiveTracking() {
  const { ref, className } = useRevealClass();

  return (
    <section className="section tracking-section" ref={ref}>
      <div className="container">
        <div className={`section-header ${className}`}>
          <h2>Live Shipment Tracking</h2>
          <p>Real-time status updates for your freight shipments</p>
        </div>
        <div className={`tracking-card ${className}`}>
          {/* Live indicator */}
          <div className="tracking-live">
            <span className="live-dot" />
            <span>Live — In Transit</span>
          </div>

          {/* Steps */}
          <div className="tracking-steps">
            {STEPS.map((step, i) => (
              <div
                key={step}
                className={`tracking-step ${i <= CURRENT_STEP ? 'active' : ''} ${i === CURRENT_STEP ? 'current' : ''}`}
              >
                <div className="step-indicator">
                  {i < CURRENT_STEP ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 8L7 11L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className="step-label">{step}</span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="tracking-progress">
            <div
              className="tracking-progress-fill"
              style={{ '--progress-width': `${((CURRENT_STEP + 1) / STEPS.length) * 100}%` } as React.CSSProperties}
            />
          </div>

          {/* Info row */}
          <div className="tracking-info">
            <div className="tracking-info-item">
              <span className="info-label">Shipment ID</span>
              <span className="info-value">VFL-2025-0842</span>
            </div>
            <div className="tracking-info-item">
              <span className="info-label">Estimated Delivery</span>
              <span className="info-value">Tomorrow, 14:30 SAST</span>
            </div>
            <div className="tracking-info-item">
              <span className="info-label">Current Location</span>
              <span className="info-value">Durban Hub — Sorting</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
