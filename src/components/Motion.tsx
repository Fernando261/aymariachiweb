import { animate, createScope, createTimeline, stagger } from 'animejs';
import { useEffect, useRef, useState } from 'react';

/** Respeta la preferencia del sistema y anima solo elementos que entran al viewport. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(query.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

export function usePageMotion(reducedMotion: boolean) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!root.current || reducedMotion) return;
    const container = root.current;
    const scope = createScope({ root: container }).add(() => {
      const timeline = createTimeline({ defaults: { ease: 'out(3)' } });
      timeline
        .add('.hero-logo', { opacity: [0, 1], y: [8, 0], duration: 520 }, 0)
        .add('.hero-title .line', { opacity: [0, 1], y: [15, 0], duration: 460, delay: stagger(70) }, 90)
        .add('.hero-description, .hero-actions', { opacity: [0, 1], y: [8, 0], duration: 420 }, 190);
    });

    // Animación Anime.js al entrar en pantalla; evita ejecutar en cada scroll.
    const elements = Array.from(container.querySelectorAll<HTMLElement>('[data-reveal]'));
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target as HTMLElement;
        observer.unobserve(el);
        animate(el, {
          opacity: [0, 1], y: [38, 0],
          duration: 900, ease: 'out(3)',
        });
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -20px 0px' });
    elements.forEach((element) => observer.observe(element));
    return () => { observer.disconnect(); scope.revert(); };
  }, [reducedMotion]);

  return root;
}
