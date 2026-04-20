// frontend/src/hooks/useScrollReveal.ts
// used for scroll animations throughout the site
import { useEffect, useRef } from 'react';

export const useScrollReveal = (threshold = 0.15, deps: any[] = []) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            // Once revealed, stop observing
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold, rootMargin: '0px 0px -60px 0px' }
    );

    // Observe all elements with scroll-reveal class inside ref
    if (ref.current) {
      const elements = ref.current.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale'
      );
      elements.forEach((el) => observer.observe(el));
    }

    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threshold, ...deps]);

  return ref;
};

