import { useRevealClass } from '../../hooks/useScrollReveal';
import { useCountUp } from '../../hooks/useCountUp';
import { useInView } from 'react-intersection-observer';
import './Stats.css';

function CounterStat({ end, label, suffix = '' }: { end: number; label: string; suffix?: string }) {
  const [ref, inView] = useInView({ threshold: 0.3, triggerOnce: true });
  const value = useCountUp({ end, enabled: inView });
  return (
    <div className="stat-item" ref={ref}>
      <span className="stat-number">{value}{suffix}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export function StatsSection() {
  const { ref, className } = useRevealClass();

  return (
    <section className="stats-section" ref={ref}>
      <div className="container">
        <div className={`stats-grid ${className}`}>
          <CounterStat end={2500} label="Shipments Per Month" suffix="+" />
          <CounterStat end={98} label="On-Time Delivery Rate" suffix="%" />
          <CounterStat end={500} label="Fleet Vehicles" suffix="+" />
          <CounterStat end={150} label="Routes Covered" suffix="+" />
        </div>
      </div>
    </section>
  );
}
