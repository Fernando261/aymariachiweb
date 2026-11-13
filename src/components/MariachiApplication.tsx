import { useState } from 'react';
import WhatsAppIcon from './WhatsAppIcon';
import { buildWhatsAppUrl, company } from '../config/site';

const requestedInChat = [
  'Número de tarjeta o CLABE para recibir pagos',
  'Foto formal del grupo completo',
  'Video del grupo completo tocando en vivo',
];

export default function MariachiApplication() {
  const [groupName, setGroupName] = useState('');
  const [musicians, setMusicians] = useState('');
  const name = groupName.trim();
  const count = Number(musicians);
  const canApply = !!name && Number.isSafeInteger(count) && count > 0;
  const message = [
    'Solicitud de grupo · AYM-02',
    `🎺 *${company.name}*`,
    '¡Hola! Queremos unir nuestro mariachi al catálogo.',
    '',
    '🎶 *Datos del grupo*',
    `Nombre del grupo: ${name}`,
    `Cantidad de elementos: ${count}`,
    '',
    '📎 *Datos que compartiremos en este chat*',
    ...requestedInChat.map((item) => `• ${item}`),
    '',
    '¿Nos pueden indicar el siguiente paso para completar la solicitud? ¡Gracias!',
  ].join('\n');
  const contactUrl = buildWhatsAppUrl(company.whatsappNumber, message);

  return (
    <section className="section guide-section" id="unete" aria-labelledby="join-title">
      <div className="container guide-grid">
        <div className="guide-copy">
          <h2 className="section-title" id="join-title">Únete con <em>tu mariachi.</em></h2>
          <p className="section-body">Solicita que tu grupo aparezca en el catálogo. Revisaremos tu solicitud por WhatsApp antes de publicar tu perfil.</p>
        </div>
        <div className="catalog mariachi-application">
          <h3>Solicitud de ingreso</h3>
          <label>
            Nombre del grupo
            <input type="text" maxLength={100} required value={groupName} onChange={(event) => setGroupName(event.target.value)} />
          </label>
          <label>
            Cantidad de elementos
            <input type="number" min={1} step={1} inputMode="numeric" required value={musicians} onChange={(event) => setMusicians(event.target.value)} />
          </label>
          <p id="join-help">Envía la solicitud en el chat oficial de WhatsApp y comparte ahí estos datos y archivos.</p>
          <ul className="mariachi-application__requirements">
            {requestedInChat.map((item) => <li key={item}>{item}</li>)}
          </ul>
          {canApply && contactUrl ? (
            <a className="button button--gold" href={contactUrl} target="_blank" rel="noopener noreferrer" aria-describedby="join-help">
              <WhatsAppIcon /> Enviar solicitud para unirme
            </a>
          ) : (
            <button className="button button--gold" type="button" disabled aria-describedby="join-help">
              <WhatsAppIcon /> Enviar solicitud para unirme
            </button>
          )}
          {!contactUrl && <p role="status">Las solicitudes por WhatsApp aún no están disponibles.</p>}
        </div>
      </div>
    </section>
  );
}
