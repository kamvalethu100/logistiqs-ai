import { useRevealClass } from '../../hooks/useScrollReveal';
import './RouteMap.css';

export function RouteMap() {
  const { ref, className } = useRevealClass();

  const pathLength = 800;

  return (
    <section id="tracking" className="section route-section" ref={ref}>
      <div className="container">
        <div className={`section-header ${className}`}>
          <h2>Live Freight Network</h2>
          <p>Real-time route visualization across our Southern Africa network</p>
        </div>
        <div className={`route-map-container ${className}`}>
          <svg viewBox="0 0 800 400" className="route-svg" xmlns="http://www.w3.org/2000/svg">
            {/* Background */}
            <rect width="800" height="400" fill="#f0f4f8" rx="12" />

            {/* Subtle grid */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dce2eb" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="800" height="400" fill="url(#grid)" />

            {/* Route line (dashed, draws on load) */}
            <path
              d="M 100 300 Q 250 100 400 200 Q 550 300 700 150"
              fill="none"
              stroke="var(--color-primary-light)"
              strokeWidth="3"
              strokeDasharray="8 6"
              className="route-path"
              style={{ '--path-length': pathLength } as React.CSSProperties}
            />

            {/* Route line (solid, behind dashed — draws on load) */}
            <path
              d="M 100 300 Q 250 100 400 200 Q 550 300 700 150"
              fill="none"
              stroke="var(--color-primary-light)"
              strokeWidth="2"
              strokeDasharray={pathLength}
              strokeDashoffset={pathLength}
              className="route-solid"
            />

            {/* Truck icon moving along path */}
            <g className="route-truck">
              <rect x="-10" y="-8" width="20" height="14" rx="3" fill="var(--color-accent)" />
              <circle cx="-5" cy="6" r="4" fill="#1a202c" />
              <circle cx="5" cy="6" r="4" fill="#1a202c" />
            </g>

            {/* Waypoints */}
            <g className="waypoint" transform="translate(100, 300)">
              <circle r="8" fill="var(--color-primary)" />
              <circle r="4" fill="white" />
              <text x="0" y="-14" textAnchor="middle" fontSize="11" fill="var(--color-text)" fontWeight="600">JHB</text>
            </g>
            <g className="waypoint" transform="translate(400, 200)" style={{ animationDelay: '0.5s' }}>
              <circle r="8" fill="var(--color-primary)" />
              <circle r="4" fill="white" />
              <text x="0" y="-14" textAnchor="middle" fontSize="11" fill="var(--color-text)" fontWeight="600">DBN</text>
            </g>
            <g className="waypoint" transform="translate(700, 150)" style={{ animationDelay: '1s' }}>
              <circle r="8" fill="var(--color-primary)" />
              <circle r="4" fill="white" />
              <text x="0" y="-14" textAnchor="middle" fontSize="11" fill="var(--color-text)" fontWeight="600">CPT</text>
            </g>

            {/* Origin/Destination labels */}
            <text x="100" y="340" textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">Origin</text>
            <text x="700" y="130" textAnchor="middle" fontSize="10" fill="var(--color-text-muted)">Destination</text>
          </svg>
        </div>
      </div>
    </section>
  );
}
