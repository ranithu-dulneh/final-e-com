import { useEffect, useRef } from 'react';
import { useNavigationType } from 'react-router-dom';

export function useScrollRestoration(key, isReady) {
  const navigationType = useNavigationType();
  const hasRestored = useRef(false);

  // Save scroll position with debouncing to avoid performance issues
  useEffect(() => {
    let timeoutId;
    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.setItem(`scroll-position-${key}`, window.scrollY);
      }, 100);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [key]);

  // Restore scroll position when data is ready
  useEffect(() => {
    if (isReady && navigationType === "POP" && !hasRestored.current) {
      const savedPosition = sessionStorage.getItem(`scroll-position-${key}`);
      if (savedPosition !== null) {
        // Use setTimeout to ensure DOM is fully rendered after data load
        setTimeout(() => {
          window.scrollTo({
            top: parseInt(savedPosition, 10),
            behavior: 'smooth'
          });
        }, 100);
        hasRestored.current = true;
      }
    }
  }, [isReady, navigationType, key]);
}
