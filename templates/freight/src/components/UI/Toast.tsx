import { useEffect, useState } from 'react';
import './Toast.css';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, type = 'success', visible, onClose, duration = 4000 }: ToastProps) {
  const [animState, setAnimState] = useState<'hidden' | 'entering' | 'visible' | 'leaving'>('hidden');

  useEffect(() => {
    if (visible) {
      setAnimState('entering');
      requestAnimationFrame(() => setAnimState('visible'));
      const timer = setTimeout(() => {
        setAnimState('leaving');
        setTimeout(onClose, 300);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setAnimState('hidden');
    }
  }, [visible, duration, onClose]);

  if (animState === 'hidden') return null;

  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ';

  return (
    <div className={`toast toast-${type} toast-${animState}`} role="alert">
      <span className="toast-icon">{icon}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={() => {
        setAnimState('leaving');
        setTimeout(onClose, 300);
      }} aria-label="Close">
        ×
      </button>
    </div>
  );
}
