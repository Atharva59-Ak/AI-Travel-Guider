import { useEffect, useRef } from 'react';
import { useMotionValue, animate } from 'framer-motion';

// Scroll-triggered reveal animation
export const useRevealOnScroll = (threshold = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.classList.add('reveal-active');
          observer.unobserve(element);
        }
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [threshold]);

  return ref;
};

// Parallax scroll effect
export const useParallax = (speed = 0.5) => {
  const ref = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleScroll = () => {
      const rect = element.getBoundingClientRect();
      const scrollY = window.scrollY;
      const elementTop = scrollY + rect.top;
      const elementVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (elementVisible) {
        const offset = (scrollY - elementTop) * speed;
        y.set(offset);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, y]);

  return { ref, y };
};

// Counter animation on scroll
export const useCounterAnimation = (end: number, duration = 2000) => {
  const ref = useRef<HTMLDivElement>(null);
  const count = useMotionValue(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const controls = animate(count, end, {
            duration: duration / 1000,
            ease: 'easeOut',
          });
          observer.unobserve(element);
          return () => controls.stop();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [end, duration, count]);

  return { ref, count };
};

// Stagger children animation
export const useStaggerChildren = (delayBetween = 0.1) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const children = element.children;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          Array.from(children).forEach((child, index) => {
            setTimeout(() => {
              child.classList.add('stagger-reveal-active');
            }, index * delayBetween * 1000);
          });
          observer.unobserve(element);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [delayBetween]);

  return ref;
};
