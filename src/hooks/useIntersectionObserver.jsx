import { useState, useCallback, useEffect, useRef } from "react";

const useIntersectionObserver = ({threshold} = {}) => {
  const observerRef = useRef(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  const handleIntersection = useCallback((entries) => {
    setIsIntersecting(entries[0].isIntersecting);
  }, []);

  useEffect(() => {
    const current = observerRef.current;
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: threshold ?? 1.0,
    };

    const observer = new IntersectionObserver(
      handleIntersection,
      observerOptions
    );

    if (current) {
      observer.observe(current)
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };
  }, [handleIntersection, threshold]);

  return {
    isIntersecting,
    observerRef,
  }
}

export default useIntersectionObserver