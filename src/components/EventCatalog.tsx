import { useEffect, useRef, useState } from 'react';
import { demoMariachis } from '../config/demo-mariachis';
import { categories, mariachis, type Category, type Mariachi } from '../config/mariachis';
import { buildWhatsAppUrl, company } from '../config/site';

function WhatsAppIcon() {
  return <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 12 0 12 12 0 0 0 1.6 18L0 24l6.2-1.6A12 12 0 0 0 24 12c0-3.2-1.2-6.2-3.5-8.5ZM12 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 1 1 12 22Zm5.5-7.5c-.3-.1-1.8-.9-2.1-1-.3-.1-.5-.1-.7.2l-1 1.2c-.2.2-.4.2-.7.1a8.2 8.2 0 0 1-3.9-3.4c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.6l-1-2.3c-.2-.6-.5-.5-.7-.5H7.7c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.8 4.4 1.8.8 2.5.9 3.4.8.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4Z" /></svg>;
}

function CatalogPhoto({ mariachi, illustrative }: { mariachi: Mariachi; illustrative: boolean }) {
  if (!mariachi.photo) return null;
  const alt = illustrative ? 'Fotografía ilustrativa de mariachis' : `Presentación de ${mariachi.alias}`;
  return <img src={`${import.meta.env.BASE_URL}${mariachi.photo.replace(/^\/+/, '')}`} alt={alt} loading="lazy" />;
}

export default function EventCatalog({ category, onCategoryChange }: {
  category: Category | null;
  onCategoryChange: (category: Category | null) => void;
}) {
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [musicians, setMusicians] = useState('');
  const [duration, setDuration] = useState('');
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const optionButtons = useRef(new Map<string, HTMLButtonElement>());
  const isDemo = new URLSearchParams(window.location.search).get('demo') === '1';
  const catalog = isDemo ? demoMariachis : mariachis;
  const visible = catalog.filter((item) => item.active && item.musicianCounts.length > 0 &&
    (!category || item.categories.includes(category)));
  const selected = visible.find((item) => item.code === selectedCode);
  const categoryLabel = categories.find((item) => item.id === category)?.label;
  // Desde «Todas», el visitante concreta la ocasión antes de preparar la solicitud.
  const [requestCategory, setRequestCategory] = useState<Category | ''>('');
  const occasion = category ?? requestCategory;
  const occasionLabel = categories.find((item) => item.id === occasion)?.label;
  const validMusicians = !!selected?.musicianCounts.includes(Number(musicians));
  const validDuration = !duration || !!selected?.durationMinutes?.includes(Number(duration));
  const message = selected ? [
    '¡Hola! Me gustaría solicitar una presentación de mariachi.',
    `Categoría: ${occasionLabel ?? ''}`,
    `Mariachi: ${selected.alias} (${selected.code})`,
    `Músicos: ${musicians}`,
    ...(duration ? [`Duración: ${duration} minutos`] : []),
    'Quisiera consultar disponibilidad y organizar los detalles.',
  ].join('\n') : '';
  const contactUrl = isDemo ? '' : buildWhatsAppUrl(company.whatsappNumber, message);
  const canRequest = !!selected && !!occasion && selected.categories.includes(occasion) && validMusicians && validDuration && !!contactUrl;

  const reset = () => { setSelectedCode(null); setMusicians(''); setDuration(''); setRequestCategory(''); };
  // También limpia al entrar desde las tarjetas de Experiencias.
  useEffect(() => { reset(); }, [category]);
  useEffect(() => { if (selectedCode) detailTitle.current?.focus(); }, [selectedCode]);

  return (
    <div className="catalog" aria-labelledby="catalog-title">
      <h3 id="catalog-title" tabIndex={-1}>Encuentra tu mariachi</h3>
      {isDemo && <p className="catalog-demo"><strong>Catálogo de prueba</strong><br />Los perfiles y datos son de ejemplo. Las fotos son ilustrativas.</p>}
      <div className="catalog-filters" role="group" aria-label="Filtrar por ocasión">
        <button type="button" aria-pressed={category === null} onClick={() => { reset(); onCategoryChange(null); }}>Todas</button>
        {categories.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => { reset(); onCategoryChange(item.id); }}>{item.label}</button>)}
      </div>
      <p role="status">{categoryLabel ?? 'Todas las ocasiones'} · {visible.length} {visible.length === 1 ? 'opción' : 'opciones'}</p>
      {!isDemo && !contactUrl && <p role="status">Las solicitudes por WhatsApp aún no están disponibles. Puedes usar nuestros otros <a href="#contacto">medios de contacto</a>.</p>}
      {!selected ? (
        visible.length ? <ul className="catalog-list">{visible.map((item) => <li key={item.code} className="catalog-card">
          <CatalogPhoto mariachi={item} illustrative={isDemo} />
          <h4>{item.alias}</h4>
          {item.description && <p>{item.description}</p>}
          {item.zone && <p>Zona: {item.zone}</p>}
          <p>Músicos: {item.musicianCounts.join(', ')}</p>
          {!!item.durationMinutes?.length && <p>Duración (min): {item.durationMinutes.join(', ')}</p>}
          <button type="button" ref={(node) => { if (node) optionButtons.current.set(item.code, node); else optionButtons.current.delete(item.code); }} onClick={() => { setMusicians(''); setDuration(''); setRequestCategory(''); setSelectedCode(item.code); }}>Elegir {item.alias}</button>
        </li>)}</ul> : <div className="catalog-card"><h4>Estamos preparando las opciones</h4><p>Aún no hay mariachis disponibles en este listado. Puedes cambiar de categoría o <a href="#contacto">contactarnos</a> para hablar de tu evento.</p></div>
      ) : (
        <div className="catalog-card">
          <button type="button" className="catalog-back" onClick={() => { const code = selected.code; reset(); requestAnimationFrame(() => optionButtons.current.get(code)?.focus()); }}>Volver al listado</button>
          <h4 ref={detailTitle} tabIndex={-1}>{selected.alias}</h4>
          <CatalogPhoto mariachi={selected} illustrative={isDemo} />
          {selected.description && <p>{selected.description}</p>}
          {selected.zone && <p>Zona: {selected.zone}</p>}
          {!category && <label>Tipo de ocasión<select value={requestCategory} onChange={(event) => setRequestCategory(event.target.value as Category | '')}><option value="">Elige la ocasión</option>{categories.filter((item) => selected.categories.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
          <label>Número de músicos<select value={musicians} onChange={(event) => setMusicians(event.target.value)}><option value="">Elige la cantidad</option>{selected.musicianCounts.map((count) => <option key={count} value={count}>{count} músicos</option>)}</select></label>
          {!!selected.durationMinutes?.length && <label>Duración (opcional)<select value={duration} onChange={(event) => setDuration(event.target.value)}><option value="">Por acordar en WhatsApp</option>{selected.durationMinutes.map((minutes) => <option key={minutes} value={minutes}>{minutes} minutos</option>)}</select></label>}
          <div className="catalog-summary" aria-live="polite" aria-atomic="true">
            <h5>Resumen de tu solicitud</h5>
            <dl><dt>Categoría</dt><dd>{occasionLabel || 'Por elegir'}</dd><dt>Mariachi</dt><dd>{selected.alias} · {selected.code}</dd><dt>Músicos</dt><dd>{musicians || 'Por elegir'}</dd><dt>Duración</dt><dd>{duration ? `${duration} minutos` : 'Por acordar en WhatsApp'}</dd></dl>
          </div>
          <p id="request-help">{isDemo
            ? 'El envío está deshabilitado en esta demostración. Las solicitudes reales se gestionan por el WhatsApp de la empresa.'
            : 'Elige la ocasión y la cantidad de músicos para continuar. La fecha, dirección y demás detalles se acuerdan en WhatsApp. Allí revisarás el mensaje y confirmarás su envío.'}</p>
          {canRequest ? <a className="button button--gold" href={contactUrl} target="_blank" rel="noopener noreferrer" aria-describedby="request-help"><WhatsAppIcon /> Enviar solicitud</a> : <button className="button button--gold" type="button" disabled aria-describedby="request-help"><WhatsAppIcon /> Enviar solicitud</button>}
        </div>
      )}
    </div>
  );
}
