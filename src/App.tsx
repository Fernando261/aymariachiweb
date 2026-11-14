import { useEffect, useState } from 'react';
import {
  ArrowDown, ArrowUpRight, CalendarHeart, ChevronRight,
  Facebook, Heart, Instagram, Menu, MessageCircle, Music2,
  Sparkles as SparklesIcon, Star, X,
} from 'lucide-react';
import EventCatalog from './components/EventCatalog';
import Reviews from './components/Reviews';
import { type Category } from './config/mariachis';
import { usePageMotion, useReducedMotion } from './components/Motion';
import { confirmationDeposit, formatMxn, groupRates, outsideMinimumMinutes, serenadeAndMass, setMinutes } from './config/service-prices';
import { company, whatsAppUrl } from './config/site';

const logoUrl = `${import.meta.env.BASE_URL}logo-ay-mariachi.png`;

type Social = { name: string; caption: string; url: string; icon: typeof Instagram; number: string };
const experiences = [
  {
    category: 'serenatas' as const, number: '01', label: 'El detalle perfecto', title: 'Serenatas',
    body: 'Hay sentimientos que una canción dice mejor. Convierte una sorpresa en un recuerdo para siempre.',
    icon: Heart,
    photo: 'https://images.unsplash.com/photo-1745470419655-51d01b00f22a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'celebraciones' as const, number: '02', label: 'Momentos que se celebran', title: 'Celebraciones',
    body: 'Cumpleaños, aniversarios y reuniones que merecen una banda sonora tan especial como su historia.',
    icon: SparklesIcon,
    photo: 'https://images.unsplash.com/photo-1769230367203-7bd409f483c9?auto=format&fit=crop&w=1200&q=80',
  },
  {
    category: 'especiales' as const, number: '03', label: 'Una ocasión extraordinaria', title: 'Eventos especiales',
    body: 'Bodas, pedidas de mano y grandes encuentros con el alma y la energía de nuestra tradición.',
    icon: CalendarHeart,
    photo: 'https://images.unsplash.com/photo-1769230367366-13ed92feb145?auto=format&fit=crop&w=1200&q=80',
  },
];

function Ornament({ className = '' }: { className?: string }) {
  return (
    <span className={`ornament ${className}`} aria-hidden="true">
      <span className="ornament-line" /><Star size={13} fill="currentColor" strokeWidth={1.2} /><span className="ornament-line" />
    </span>
  );
}

function SocialCard({ social }: { social: Social }) {
  const Icon = social.icon;
  const content = (
    <>
      <span className="social-card__top"><span className="social-card__icon"><Icon size={25} strokeWidth={1.5} /></span><ArrowUpRight className="social-card__arrow" size={22} /></span>
      <span className="social-card__bottom"><strong>{social.name}</strong><small>{social.url ? social.caption : 'Enlace por configurar'}</small></span>
      <span className="social-card__number">{social.number}</span>
    </>
  );
  return social.url ? (
    <a className="social-card" href={social.url} target="_blank" rel="noopener noreferrer" aria-label={`Visitar ${social.name} de Ay! Mariachi Para Todos`}>
      {content}
    </a>
  ) : (
    <div className="social-card social-card--inactive" title={`Agrega el enlace de ${social.name} en src/config/site.ts`}>
      {content}
    </div>
  );
}

export default function App() {
  const reducedMotion = useReducedMotion();
  const root = usePageMotion(reducedMotion);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [category, setCategory] = useState<Category | null>(null);
  const [catalogVisit, setCatalogVisit] = useState(0);
  const whatsApp = whatsAppUrl();
  const socials: Social[] = [
    { name: 'Instagram', caption: 'Síguenos e inspírate', url: company.instagram, icon: Instagram, number: '01' },
    { name: 'WhatsApp', caption: 'Hablemos de tu evento', url: whatsApp, icon: MessageCircle, number: '02' },
    { name: 'Facebook', caption: 'Conoce nuestras novedades', url: company.facebook, icon: Facebook, number: '03' },
    { name: 'TikTok', caption: 'Siente el ritmo', url: company.tiktok, icon: Music2, number: '04' },
  ];

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <div ref={root} className="site-shell" id="inicio">
      <a className="skip-link" href="#contenido">Ir al contenido</a>
      <div className="noise-overlay" aria-hidden="true" />

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}${menuOpen ? ' menu-open' : ''}`}>
        <nav className="nav container" aria-label="Navegación principal">
          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`} id="nav-principal">
            <a href="#guia" onClick={closeMenu}>Guía para tu evento</a>
            <a href="#opiniones" onClick={closeMenu}>Opiniones</a>
            <a href="#experiencias" onClick={closeMenu}>Experiencias</a>
            <a href="#nosotros" onClick={closeMenu}>Nosotros</a>
            <a href="#contacto" onClick={closeMenu} className="mobile-contact">Contáctanos</a>
          </div>
          <a className="nav-cta" href="#contacto">Hablemos <ArrowUpRight size={16} /></a>
          <button type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="nav-principal" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </nav>
      </header>

      <main id="contenido">
        <div className="hero">
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-layout">
            <section className="hero-copy" aria-labelledby="hero-title">
              <div className="hero-logo">
                <img src={logoUrl} alt="Ay! Mariachi Para Todos" width="1536" height="1024" fetchPriority="high" />
              </div>
              <h1 className="hero-title" id="hero-title">
                <span className="line">Que suene</span>
                <span className="line line--gold"><em>lo inolvidable.</em></span>
              </h1>
              <p className="hero-description">Mariachis para serenatas, bodas y celebraciones en Guadalajara.</p>
              <div className="hero-actions">
                <a className="button button--gold" href="#guia">Planea tu evento <ArrowDown size={17} aria-hidden="true" /></a>
              </div>
            </section>

            <section className="booking-guide" id="guia" aria-labelledby="guide-title">
              <h2 className="section-title" id="guide-title">Guía para <em>tu evento.</em></h2>
              <EventCatalog key={catalogVisit} category={category} onCategoryChange={setCategory} reducedMotion={reducedMotion} />
              <details className="booking-rates">
                <summary>Precios y condiciones del servicio</summary>
                <dl className="guide-rates">
                  {groupRates.map((rate) => (
                    <div key={rate.musicians}><dt>{rate.name}</dt><dd>{formatMxn(rate.price)}</dd></div>
                  ))}
                  <div><dt>{serenadeAndMass.name} · {serenadeAndMass.musicians} músicos</dt><dd>{formatMxn(serenadeAndMass.price)}</dd></div>
                </dl>
                <p className="section-body">El servicio se realiza en tandas de {setMinutes} minutos. Fuera del Periférico, el mínimo es de {outsideMinimumMinutes / 60} horas.</p>
                <p className="section-body">Depósito al confirmar: <strong>{formatMxn(confirmationDeposit)}</strong>.</p>
              </details>
            </section>
          </div>
        </div>

        <Reviews />

        {/* EXPERIENCIAS */}
        <section className="section experiences" id="experiencias" aria-labelledby="experiences-title">
          <div className="container">
            <div className="section-heading" data-reveal>
              <h2 className="section-title" id="experiences-title">Cada ocasión merece <em>su propia canción.</em></h2>
              <p className="section-heading__aside">Desde un pequeño gesto de amor hasta una gran celebración. Hay un mariachi para cada emoción.</p>
            </div>
            <div className="experience-grid">
              {experiences.map((item) => {
                const Icon = item.icon;
                return (
                  <a className="experience-card" key={item.number} href="#guia" onClick={() => {
                    setCategory(item.category);
                    setCatalogVisit((visit) => visit + 1);
                    requestAnimationFrame(() => document.getElementById('catalog-title')?.focus());
                  }} data-reveal>
                    <div className="experience-card__image" style={{ backgroundImage: `linear-gradient(180deg, rgba(12,9,8,.08), rgba(8,7,7,.85)), url('${item.photo}')` }}>
                      <span className="experience-card__number">{item.number} / 03</span>
                      <span className="experience-card__icon"><Icon size={23} strokeWidth={1.5} /></span>
                    </div>
                    <div className="experience-card__content">
                      <span className="experience-card__eyebrow">{item.label}</span>
                      <div className="experience-card__title-row"><h3>{item.title}</h3><span className="experience-card__arrow"><ArrowUpRight size={20} /></span></div>
                      <p>{item.body}</p>
                    </div>
                  </a>
                );
              })}
            </div>
            <p className="photo-credit">Fotografías ilustrativas: Alan Morales y Fotógrafo Samuel Cruz / <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer">Unsplash</a>. No representan necesariamente músicos afiliados.</p>
          </div>
        </section>

        <section className="section about" id="nosotros" aria-labelledby="about-title">
          <div className="container about-copy" data-reveal>
            <h2 className="section-title" id="about-title">El mariachi no solo se escucha. <em>Se siente.</em></h2>
            <p className="section-body">En <strong>Ay! Mariachi Para Todos</strong> acercamos la música de mariachi a quienes quieren celebrar con una tradición que se vive en familia, entre amigos y en comunidad.</p>
          </div>
        </section>

        {/* CONTACTO / REDES */}
        <section className="contact-section" id="contacto" aria-labelledby="contact-title">
          <div className="container">
            <div className="contact-intro" data-reveal>
              <Ornament />
              <h2 id="contact-title">¿Tu historia necesita <em>mariachi?</em></h2>
              <p>Queremos ser parte de ese momento. Conoce nuestros medios de contacto y acompáñanos en nuestras redes sociales.</p>
              {whatsApp && <a href={whatsApp} target="_blank" rel="noopener noreferrer" className="button button--gold contact-primary">Hablemos por WhatsApp <MessageCircle size={19} /></a>}
            </div>
            <div className="social-grid" data-reveal>{socials.map((social) => <SocialCard social={social} key={social.name} />)}</div>
            {!socials.some((social) => social.url) && !company.email && (
              <p className="social-note">Estamos preparando nuestros canales oficiales. Los enlaces se activarán aquí cuando estén disponibles.</p>
            )}
            {company.email && <p className="contact-email">O escríbenos a <a href={`mailto:${company.email}`}>{company.email} <ArrowUpRight size={15} /></a></p>}
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer__top-border" aria-hidden="true" />
        <div className="container footer-main">
          <div className="footer-brand">
            <img src={logoUrl} alt="Ay! Mariachi Para Todos" loading="lazy" />
            <p>La tradición que nos une.<br />La música que nos mueve.</p>
          </div>
          <div className="footer-column"><h3>EXPLORA</h3><a href="#inicio">Inicio <ChevronRight size={14} /></a><a href="#nosotros">Nuestra esencia <ChevronRight size={14} /></a><a href="#experiencias">Experiencias <ChevronRight size={14} /></a><a href="#guia">Guía para tu evento <ChevronRight size={14} /></a><a href="#opiniones">Opiniones <ChevronRight size={14} /></a></div>
          <div className="footer-column"><h3>HABLEMOS</h3><a href="#contacto">Contacto <ChevronRight size={14} /></a>{whatsApp && <a href={whatsApp} target="_blank" rel="noopener noreferrer">WhatsApp <ChevronRight size={14} /></a>}{company.instagram && <a href={company.instagram} target="_blank" rel="noopener noreferrer">Instagram <ChevronRight size={14} /></a>}<span>Guadalajara, Jalisco, México</span></div>
          <div className="footer-quote"><span>✦</span><p>Que nunca falte una canción para celebrar la vida.</p></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.name}. Todos los derechos reservados.</span><span>CON EL CORAZÓN EN GUADALAJARA <Star size={10} fill="currentColor" /></span><a href="#inicio">VOLVER ARRIBA <ArrowUpRight size={15} /></a></div>
        <div className="footer-wordmark" aria-hidden="true">¡AY! MARIACHI</div>
      </footer>
    </div>
  );
}
