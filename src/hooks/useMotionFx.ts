import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

export function useTiltHandlers() {
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    el.style.transform = `perspective(900px) rotateY(${(x - 0.5) * 10}deg) rotateX(${(0.5 - y) * 10}deg) scale(1.015)`;
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };

  const onPointerLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = '';
  };

  return { onPointerMove, onPointerLeave };
}

export function useRevealRef<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    const revealIfInView = () => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight + 120 && rect.bottom > -120) {
        setVisible(true);
        return true;
      }
      return false;
    };

    if (revealIfInView()) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || revealIfInView()) {
            setVisible(true);
            observer.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.01, rootMargin: '120px 0px' }
    );

    observer.observe(el);
    window.addEventListener('scroll', revealIfInView, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', revealIfInView);
    };
  }, []);

  return { ref, visible };
}
