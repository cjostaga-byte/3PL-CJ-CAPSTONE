import React, { useState, useEffect, useRef } from 'react';

interface LazyViewportProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  rootMargin?: string;
  minHeight?: number | string;
  className?: string;
}

export const LazyViewport: React.FC<LazyViewportProps> = ({
  children,
  fallback = null,
  rootMargin = '150px',
  minHeight = '300px',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible) return;
    const el = containerRef.current;
    if (!el) return;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isVisible, rootMargin]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={!isVisible ? { minHeight } : undefined}
    >
      {isVisible ? children : fallback}
    </div>
  );
};
