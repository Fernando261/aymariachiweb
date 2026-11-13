import { useEffect, useRef, useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { demoMariachis } from '../config/demo-mariachis';
import { categories, mariachis, type Category, type Mariachi } from '../config/mariachis';
import {
  confirmationDeposit, formatMxn, groupRates, outsideMinimumMinutes, serenadeAndMass, setMinutes,
} from '../config/service-prices';
import { buildWhatsAppUrl, company } from '../config/site';

const municipalities = ['Guadalajara', 'Zapopan', 'San Pedro Tlaquepaque', 'Tonalá', 'Otro municipio'];
const areas = [
  { id: 'inside', label: 'Dentro del Periférico', duration: `${setMinutes} minutos` },
  { id: 'outside', label: 'Fuera del Periférico', duration: `${outsideMinimumMinutes / 60} horas (mínimo)` },
] as const;
const outsidePolicy = `Fuera del Periférico, el servicio es de mínimo ${outsideMinimumMinutes / 60} horas.`;
const depositPolicy = `Al confirmar, se hace un depósito de ${formatMxn(confirmationDeposit)}.`;
const eventDateFormatter = new Intl.DateTimeFormat('sv-SE', {
  timeZone: 'America/Mexico_City',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

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
  const [service, setService] = useState('');
  const [eventArea, setEventArea] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [municipality, setMunicipality] = useState('');
  const [location, setLocation] = useState('');
  const earliestDate = eventDateFormatter.format(new Date());
  const detailTitle = useRef<HTMLHeadingElement>(null);
  const optionButtons = useRef(new Map<string, HTMLButtonElement>());
  const usingExamples = mariachis.length === 0;
  const catalog = usingExamples ? demoMariachis : mariachis;
  const visible = catalog.filter((item) => item.active && groupRates.some((rate) => item.musicianCounts.includes(rate.musicians)) &&
    (!category || item.categories.includes(category)));
  const selected = visible.find((item) => item.code === selectedCode);
  const categoryLabel = categories.find((item) => item.id === category)?.label;
  // Desde «Todas», el visitante concreta la ocasión antes de preparar la solicitud.
  const [requestCategory, setRequestCategory] = useState<Category | ''>('');
  const occasion = category ?? requestCategory;
  const occasionLabel = categories.find((item) => item.id === occasion)?.label;
  const rates = groupRates.filter((rate) => selected?.musicianCounts.includes(rate.musicians));
  const allowsSerenadeAndMass = (occasion === 'serenatas' || occasion === 'misas') &&
    selected?.musicianCounts.includes(serenadeAndMass.musicians);
  const rate = service === 'serenata-misa' && allowsSerenadeAndMass
    ? serenadeAndMass
    : rates.find((item) => String(item.musicians) === service);
  const area = areas.find((item) => item.id === eventArea);
  const price = rate ? formatMxn(rate.price) : '';
  const needsQuote = eventArea === 'outside';
  const validEvent = eventDate >= earliestDate && !!eventTime && municipalities.includes(municipality) && !!location.trim();
  const canRequest = !!selected && !!occasion && selected.categories.includes(occasion) && !!rate && !!area && validEvent;
  const message = canRequest ? [
    'Solicitud web · AYM-01',
    `🎺 *${company.name}*`,
    '¡Hola! Me gustaría solicitar mariachi para mi evento.',
    '',
    '🎶 *Servicio elegido*',
    `Categoría: ${occasionLabel ?? ''}`,
    usingExamples
      ? `Referencia ilustrativa: ${selected.alias} (ejemplo)`
      : `Mariachi: ${selected.alias} (${selected.code})`,
    `Servicio: ${rate.name}`,
    `Músicos: ${rate.musicians}`,
    `Duración: ${area.duration}`,
    '',
    '📍 *Datos del evento*',
    `Fecha: ${eventDate}`,
    `Hora (Guadalajara): ${eventTime}`,
    `Municipio: ${municipality}`,
    `Ubicación: ${location.trim()}`,
    `Zona del evento: ${area.label}`,
    '',
    '💳 *Tarifa y depósito*',
    `Tarifa publicada: ${price}`,
    ...(needsQuote ? ['Total del servicio: por cotizar'] : []),
    `Depósito al confirmar: ${formatMxn(confirmationDeposit)}`,
    '',
    '¿Me pueden confirmar la disponibilidad? ¡Gracias!',
  ].join('\n') : '';
  const contactUrl = buildWhatsAppUrl(company.whatsappNumber, message);

  const reset = () => { setSelectedCode(null); setService(''); setRequestCategory(''); };
  // También limpia al entrar desde las tarjetas de Experiencias.
  useEffect(() => { reset(); }, [category]);
  useEffect(() => { if (selectedCode) detailTitle.current?.focus(); }, [selectedCode]);

  return (
    <div className="catalog" aria-labelledby="catalog-title">
      <h3 id="catalog-title" tabIndex={-1}>Encuentra tu mariachi</h3>
      {usingExamples && <p className="catalog-demo"><strong>Perfiles de ejemplo</strong><br />Las fotos son ilustrativas. Usa estas opciones como referencia al preparar tu solicitud.</p>}
      <div className="catalog-filters" role="group" aria-label="Filtrar por ocasión">
        <button type="button" aria-pressed={category === null} onClick={() => { reset(); onCategoryChange(null); }}>Todas</button>
        {categories.map((item) => <button type="button" key={item.id} aria-pressed={category === item.id} onClick={() => { reset(); onCategoryChange(item.id); }}>{item.label}</button>)}
      </div>
      <p role="status">{categoryLabel ?? 'Todas las ocasiones'} · {visible.length} {visible.length === 1 ? 'opción' : 'opciones'}</p>
      {!contactUrl && <p role="status">Las solicitudes por WhatsApp aún no están disponibles.</p>}
      {!selected ? (
        visible.length ? <ul className="catalog-list">{visible.map((item) => <li key={item.code} className="catalog-card">
          <CatalogPhoto mariachi={item} illustrative={usingExamples} />
          <h4>{item.alias}</h4>
          {item.description && <p>{item.description}</p>}
          {item.zone && <p>Zona: {item.zone}</p>}
          <p>Formaciones disponibles: {groupRates.filter((rate) => item.musicianCounts.includes(rate.musicians)).map((rate) => rate.name).join(', ')}</p>
          <button type="button" ref={(node) => { if (node) optionButtons.current.set(item.code, node); else optionButtons.current.delete(item.code); }} onClick={() => { setService(''); setRequestCategory(''); setSelectedCode(item.code); }}>Elegir {item.alias}</button>
        </li>)}</ul> : <div className="catalog-card"><h4>Estamos preparando las opciones</h4><p>Aún no hay mariachis disponibles en este listado. Puedes cambiar de categoría o <a href="#contacto">contactarnos</a> para hablar de tu evento.</p></div>
      ) : (
        <div className="catalog-card">
          <button type="button" className="catalog-back" onClick={() => { const code = selected.code; reset(); requestAnimationFrame(() => optionButtons.current.get(code)?.focus()); }}>Volver al listado</button>
          <h4 ref={detailTitle} tabIndex={-1}>{selected.alias}</h4>
          <CatalogPhoto mariachi={selected} illustrative={usingExamples} />
          {selected.description && <p>{selected.description}</p>}
          {selected.zone && <p>Zona: {selected.zone}</p>}
          {!category && <label>Tipo de ocasión<select required value={requestCategory} onChange={(event) => {
            setRequestCategory(event.target.value as Category | '');
            if (service === 'serenata-misa') setService('');
          }}><option value="">Elige la ocasión</option>{categories.filter((item) => selected.categories.includes(item.id)).map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>}
          <label><span id="catalog-service-label">Servicio</span>
            <select aria-labelledby="catalog-service-label" required value={service} onChange={(event) => setService(event.target.value)}>
              <option value="">Elige el servicio</option>
              {rates.map((item) => <option key={item.musicians} value={item.musicians}>{item.name} · {formatMxn(item.price)}</option>)}
              {allowsSerenadeAndMass && <option value="serenata-misa">{serenadeAndMass.name} · {serenadeAndMass.musicians} músicos · {formatMxn(serenadeAndMass.price)}</option>}
            </select>
          </label>
          <fieldset className="catalog-event">
            <legend>¿Qué fecha, hora y ubicación sería tu evento?</legend>
            <label>Fecha del evento<input type="date" min={earliestDate} required value={eventDate} onChange={(event) => setEventDate(event.target.value)} /></label>
            <label>Hora del evento (Guadalajara)<input type="time" required value={eventTime} onChange={(event) => setEventTime(event.target.value)} /></label>
            <label>Municipio<select required value={municipality} onChange={(event) => setMunicipality(event.target.value)}><option value="">Elige el municipio</option>{municipalities.map((name) => <option key={name}>{name}</option>)}</select></label>
            <label>Ubicación del evento<input type="text" placeholder="Colonia, dirección o lugar del evento" maxLength={180} required value={location} onChange={(event) => setLocation(event.target.value)} /></label>
            <label>Zona del evento
              <select required value={eventArea} onChange={(event) => setEventArea(event.target.value)}>
                <option value="">Elige la zona</option>
                {areas.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <p>{outsidePolicy}</p>
          </fieldset>
          <div className="catalog-summary" aria-live="polite" aria-atomic="true">
            <h5>Resumen de tu solicitud</h5>
            <dl>
              <dt>Categoría</dt><dd>{occasionLabel || 'Por elegir'}</dd>
              <dt>Mariachi</dt><dd>{selected.alias} · {selected.code}</dd>
              <dt>Servicio</dt><dd>{rate ? `${rate.name} · ${rate.musicians} músicos` : 'Por elegir'}</dd>
              <dt>Duración</dt><dd>{area?.duration ?? 'Por elegir la zona'}</dd>
              <dt>Tarifa publicada</dt><dd>{price || 'Por elegir'}</dd>
              {needsQuote && <><dt>Total del servicio</dt><dd>Por cotizar</dd></>}
              <dt>Depósito al confirmar</dt><dd>{formatMxn(confirmationDeposit)}</dd>
              <dt>Fecha</dt><dd>{eventDate || 'Por elegir'}</dd>
              <dt>Hora</dt><dd>{eventTime || 'Por elegir'}</dd>
              <dt>Ubicación</dt><dd>{[location.trim(), municipality, area?.label].filter(Boolean).join(' · ') || 'Por elegir'}</dd>
            </dl>
          </div>
          <p id="request-help">Completa los datos y revisa el resumen. La solicitud se abre en WhatsApp para que la envíes. {depositPolicy}</p>
          {canRequest && contactUrl ? <a className="button button--gold" href={contactUrl} target="_blank" rel="noopener noreferrer" aria-describedby="request-help"><WhatsAppIcon /> Enviar solicitud</a> : <button className="button button--gold" type="button" disabled aria-describedby="request-help"><WhatsAppIcon /> Enviar solicitud</button>}
        </div>
      )}
    </div>
  );
}
