import { animate } from 'animejs';
import { ArrowLeft, ArrowRight, Play } from 'lucide-react';
import { useEffect, useRef, useState, type TouchEvent } from 'react';

type AppScreen = {
  id: string;
  title: string;
  description: string;
  src: string;
  alt: string;
};

// Modifica esta lista si quieres reemplazar, reordenar o agregar pantallas.
// Los archivos deben estar en public/app-screens/.
const screens: AppScreen[] = [
  {
    id: 'bienvenida', title: 'La bienvenida',
    description: 'Una primera impresión llena de tradición.',
    src: '/app-screens/bienvenida.webp',
    alt: 'Pantalla de bienvenida de Ay! Mariachi Para Todos, con mariachis y botón Comenzar',
  },
  {
    id: 'acceso', title: 'Tu experiencia comienza aquí',
    description: 'Un acceso claro para clientes y mariachis.',
    src: '/app-screens/acceso.webp',
    alt: 'Acceso de usuarios y mariachis con los colores negro y dorado de la aplicación',
  },
  {
    id: 'inicio', title: 'Descubre la música',
    description: 'Serenatas, bodas y celebraciones en un solo lugar.',
    src: '/app-screens/inicio.webp',
    alt: 'Inicio real de la aplicación mostrando categorías y servicios populares',
  },
  {
    id: 'eventos', title: 'Tus eventos, organizados',
    description: 'Sigue tus solicitudes y próximas celebraciones.',
    src: '/app-screens/eventos.webp',
    alt: 'Pantalla Mis eventos de la app, con datos de ubicación y fechas de ejemplo',
  },
  {
    id: 'perfil', title: 'Todo a tu manera',
    description: 'Tu cuenta y preferencias, siempre contigo.',
    src: '/app-screens/perfil.webp',
    alt: 'Pantalla Perfil de la app, con nombre de demostración',
  },
];

export default function AppShowcase({ reducedMotion }: { reducedMotion: boolean }) {
  const [activeIndex, setActiveIndex] = useState(2);
  const [visible, setVisible] = useState(false);
  const [paused, setPaused] = useState(false);
  const [userSelected, setUserSelected] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const frontImageRef = useRef<HTMLImageElement>(null);
  const backImageRef = useRef<HTMLImageElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);
  const swipeStartX = useRef<number | null>(null);

  const active = screens[activeIndex];
  const behind = screens[(activeIndex + 1) % screens.length];

  useEffect(() => {
    const element = containerRef.current;
    if (!element || typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (reducedMotion || !visible || paused || userSelected) return;
    const interval = window.setInterval(() => {
      setActiveIndex((index) => (index + 1) % screens.length);
    }, 6500);
    return () => window.clearInterval(interval);
  }, [reducedMotion, visible, paused, userSelected]);

  useEffect(() => {
    if (reducedMotion) return;
    if (frontImageRef.current) {
      animate(frontImageRef.current, {
        opacity: [0.15, 1], scale: [1.065, 1],
        duration: 760, ease: 'out(3)',
      });
    }
    if (backImageRef.current) {
      animate(backImageRef.current, {
        opacity: [0.2, 1], scale: [1.025, 1],
        duration: 900, ease: 'out(3)',
      });
    }
    if (titleRef.current) {
      animate(titleRef.current, {
        opacity: [0, 1], y: [10, 0],
        duration: 650, ease: 'out(3)',
      });
    }
  }, [activeIndex, reducedMotion]);

  const select = (index: number) => {
    setUserSelected(true); // Al interactuar, dejamos de avanzar automáticamente.
    setActiveIndex((index + screens.length) % screens.length);
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (swipeStartX.current === null) return;
    const delta = event.changedTouches[0].clientX - swipeStartX.current;
    swipeStartX.current = null;
    if (Math.abs(delta) < 45) return;
    select(activeIndex + (delta < 0 ? 1 : -1));
  };

  return (
    <div
      className="app-showcase"
      data-reveal
      ref={containerRef}
      role="region"
      aria-roledescription="carrusel"
      aria-label="Pantallas reales de la aplicación Ay! Mariachi Para Todos"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
    >
      <div
        className="app-art"
        onTouchStart={(event) => { swipeStartX.current = event.touches[0].clientX; }}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={() => { swipeStartX.current = null; }}
      >
        <div className="app-art__circle" aria-hidden="true" />
        <div className="app-art__spark app-art__spark--one" aria-hidden="true">✦</div>
        <div className="app-art__spark app-art__spark--two" aria-hidden="true">✧</div>

        <div className="phone phone--back phone--live" aria-hidden="true">
          <img
            key={`back-${behind.id}`}
            ref={backImageRef}
            className="phone__shot phone__shot--back"
            src={behind.src}
            alt=""
            loading="lazy"
            draggable={false}
          />
          <span className="phone__glass" />
        </div>
        <div className="phone phone--front phone--live" role="img" aria-label={active.alt}>
          <img
            key={`front-${active.id}`}
            ref={frontImageRef}
            className="phone__shot"
            src={active.src}
            alt=""
            loading="eager"
            draggable={false}
          />
          <span className="phone__glass" aria-hidden="true" />
        </div>
        <div className="app-art__tag"><Play size={13} fill="currentColor" /> CAPTURAS REALES DE LA APP</div>
      </div>

      <div className="app-showcase__console">
        <div className="app-showcase__caption">
          <span className="app-showcase__number">PANTALLA {String(activeIndex + 1).padStart(2, '0')} / {String(screens.length).padStart(2, '0')}</span>
          <span ref={titleRef} className="app-showcase__title">{active.title}</span>
          <small>{active.description}</small>
        </div>
        <div className="app-showcase__controls" aria-label="Controlar las pantallas de la app">
          <button type="button" className="app-showcase__arrow" onClick={() => select(activeIndex - 1)} aria-label="Pantalla anterior"><ArrowLeft size={18} /></button>
          <div className="app-showcase__dots" aria-label="Seleccionar pantalla">
            {screens.map((screen, index) => (
              <button
                type="button"
                key={screen.id}
                className={`app-showcase__dot ${index === activeIndex ? 'is-active' : ''}`}
                onClick={() => select(index)}
                aria-label={`Mostrar ${screen.title}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                title={screen.title}
              />
            ))}
          </div>
          <button type="button" className="app-showcase__arrow" onClick={() => select(activeIndex + 1)} aria-label="Pantalla siguiente"><ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
