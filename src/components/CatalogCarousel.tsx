import { useRef, useState, Children, cloneElement, isValidElement, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CatalogCarousel({ children, count, categoryLabel, reducedMotion }: {
  children: ReactNode;
  count: number;
  categoryLabel: string;
  reducedMotion: boolean;
}) {
  const track = useRef<HTMLUListElement>(null);
  const [current, setCurrent] = useState(0);

  const centerOffset = (list: HTMLUListElement, card: HTMLElement) =>
    card.offsetLeft - (list.clientWidth - card.offsetWidth) / 2;

  function syncCurrent() {
    const list = track.current;
    if (!list) return;
    let nearest = 0;
    let distance = Infinity;
    Array.from(list.children).forEach((card, index) => {
      const offset = Math.abs(centerOffset(list, card as HTMLElement) - list.scrollLeft);
      if (offset < distance) {
        distance = offset;
        nearest = index;
      }
    });
    setCurrent(nearest);
  }

  function navigate(index: number) {
    const list = track.current;
    const card = list?.children.item(index) as HTMLElement | null;
    if (!list || !card) return;
    list.scrollTo({ left: centerOffset(list, card), behavior: reducedMotion ? 'instant' : 'smooth' });
  }

  return (
    <div className="catalog-carousel" role="region" aria-label="Carrusel de mariachis">
      <div className="carousel-toolbar">
        <p role="status">{categoryLabel}</p>
        {count > 1 && (
          <div className="carousel-controls">
            <button type="button" aria-label="Grupo anterior" aria-controls="mariachi-cards" disabled={current === 0} onClick={() => navigate(current - 1)}>
              <ChevronLeft size={21} aria-hidden="true" />
            </button>
            <span aria-live="polite">{current + 1} de {count}</span>
            <button type="button" aria-label="Grupo siguiente" aria-controls="mariachi-cards" disabled={current === count - 1} onClick={() => navigate(current + 1)}>
              <ChevronRight size={21} aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
      <ul
        id="mariachi-cards"
        ref={track}
        className="catalog-list carousel-track"
        aria-label="Grupos de mariachi"
        data-single={count === 1}
        onScroll={syncCurrent}
        tabIndex={count > 1 ? 0 : undefined}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
          event.preventDefault();
          navigate(current + (event.key === 'ArrowRight' ? 1 : -1));
        }}
      >
        {Children.map(children, (child, index) => isValidElement<{ 'data-position'?: string }>(child)
          ? cloneElement(child, { 'data-position': index < current ? 'before' : index > current ? 'after' : 'current' })
          : child)}
      </ul>
    </div>
  );
}
