import { ArrowLeft, ArrowRight, CalendarHeart, MapPin, Music2 } from 'lucide-react';
import { useRef, useState } from 'react';

// W3 puede ampliar estos datos o incorporar el catálogo en #guia.
const topics = [
  { id: 'ocasion', title: 'Tipo de ocasión', icon: CalendarHeart,
    description: 'El motivo de tu encuentro ayuda a elegir el repertorio y el momento de llegada.',
    ideas: ['Una serenata para sorprender', 'Cumpleaños y aniversarios', 'Bodas y reuniones especiales'] },
  { id: 'espacio', title: 'Tamaño del espacio', icon: MapPin,
    description: 'Considera cuántas personas asistirán y dónde disfrutarán la música. Comparte las condiciones del lugar.',
    ideas: ['Interior o al aire libre', 'Espacio para músicos e invitados', 'Acceso y reglas de sonido del recinto'] },
  { id: 'estilo', title: 'Estilo de la presentación', icon: Music2,
    description: 'Imagina el ambiente que quieres crear y conversa sobre las canciones que no pueden faltar.',
    ideas: ['Un momento íntimo y emotivo', 'Una celebración alegre y participativa', 'Una entrada o dedicatoria especial'] },
];

export default function EventGuide() {
  const [activeIndex, setActiveIndex] = useState(0);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const select = (index: number) => setActiveIndex((index + topics.length) % topics.length);
  const active = topics[activeIndex];
  const Icon = active.icon;

  return (
    <div className="guide" role="region" aria-roledescription="carrusel" aria-label="Consejos para tu evento"
      onKeyDown={(event) => {
        if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
          event.preventDefault();
          select(event.key === 'Home' ? 0 : event.key === 'End' ? topics.length - 1 : activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
        }
      }}>
      <div className="guide-panel"
        onTouchStart={(event) => { const t = event.touches[0]; swipeStart.current = { x: t.clientX, y: t.clientY }; }}
        onTouchCancel={() => { swipeStart.current = null; }}
        onTouchEnd={(event) => {
          const start = swipeStart.current;
          swipeStart.current = null;
          if (!start) return;
          const touch = event.changedTouches[0];
          const dx = touch.clientX - start.x;
          if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(touch.clientY - start.y)) select(activeIndex + (dx < 0 ? 1 : -1));
        }}>
        <div className="guide-card" id="guide-slide" role="group" aria-roledescription="tarjeta" aria-label={`${activeIndex + 1} de ${topics.length}`} aria-live="polite" aria-atomic="true">
          <Icon size={38} aria-hidden="true" />
          <h3>{active.title}</h3>
          <p>{active.description}</p>
          <ul>{active.ideas.map((idea) => <li key={idea}>{idea}</li>)}</ul>
        </div>
      </div>
      <div className="guide__console">
        <div className="guide__caption"><span className="guide__number">IDEA {String(activeIndex + 1).padStart(2, '0')} / 03</span><small>Usa las flechas o desliza para explorar.</small></div>
        <div className="guide__controls" aria-label="Recorrer la guía">
          <button type="button" className="guide__arrow" onClick={() => select(activeIndex - 1)} aria-label="Consejo anterior" aria-controls="guide-slide"><ArrowLeft size={18} /></button>
          <div className="guide__dots" aria-label="Seleccionar tema">
            {topics.map((topic, index) => <button type="button" key={topic.id} className={`guide__dot ${index === activeIndex ? 'is-active' : ''}`} onClick={() => select(index)} aria-label={`Mostrar ${topic.title}`} aria-current={index === activeIndex ? 'true' : undefined} aria-controls="guide-slide" />)}
          </div>
          <button type="button" className="guide__arrow" onClick={() => select(activeIndex + 1)} aria-label="Consejo siguiente" aria-controls="guide-slide"><ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
