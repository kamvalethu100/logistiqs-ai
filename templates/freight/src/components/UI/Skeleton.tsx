import './Skeleton.css';

interface SkeletonProps {
  width?: string;
  height?: string;
  borderRadius?: string;
  count?: number;
  style?: React.CSSProperties;
}

export function Skeleton({ width = '100%', height = '1rem', borderRadius, count = 1, style }: SkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-el"
          style={{
            width,
            height,
            borderRadius: borderRadius || 'var(--radius-sm)',
            marginBottom: count > 1 ? '0.5rem' : 0,
            ...style,
          }}
          aria-hidden="true"
        />
      ))}
    </>
  );
}

export function SkeletonCard() {
  return (
    <div className="skeleton-card">
      <Skeleton height="2rem" width="60%" />
      <Skeleton height="0.875rem" count={3} />
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="skeleton-hero">
      <Skeleton height="3.5rem" width="50%" />
      <Skeleton height="1.25rem" width="70%" />
      <Skeleton height="3rem" width="12rem" borderRadius="var(--radius-md)" />
    </div>
  );
}
