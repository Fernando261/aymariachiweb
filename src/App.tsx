import { useEffect, useState } from 'react';
import {
  ArrowDown, ArrowRight, ArrowUpRight, CalendarHeart, ChevronRight,
  Facebook, Heart, Instagram, Menu, MessageCircle, Music2,
  Sparkles as SparklesIcon, Star, X,
} from 'lucide-react';
import MariachiScene from './components/MariachiScene';
import EventCatalog from './components/EventCatalog';
import { type Category } from './config/mariachis';
import { usePageMotion, useReducedMotion } from './components/Motion';
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

      <header className={`site-header ${scrolled ? 'is-scrolled' : ''}`}>
        <nav className="nav container" aria-label="Navegación principal">
          <a className="brand" href="#inicio" onClick={closeMenu} aria-label="Ay! Mariachi Para Todos, ir al inicio">
            <img className="brand__logo" src={logoUrl} alt="Ay! Mariachi Para Todos" width="1536" height="1024" />
          </a>
          <div className={`nav-links ${menuOpen ? 'is-open' : ''}`} id="nav-principal">
            <a href="#nosotros" onClick={closeMenu}>Nosotros</a>
            <a href="#experiencias" onClick={closeMenu}>Experiencias</a>
            <a href="#guia" onClick={closeMenu}>Guía para tu evento</a>
            <a href="#contacto" onClick={closeMenu} className="mobile-contact">Contáctanos</a>
          </div>
          <a className="nav-cta" href="#contacto">Hablemos <ArrowUpRight size={16} /></a>
          <button type="button" className="menu-toggle" aria-expanded={menuOpen} aria-controls="nav-principal" aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'} onClick={() => setMenuOpen((open) => !open)}>
            {menuOpen ? <X size={25} /> : <Menu size={25} />}
          </button>
        </nav>
      </header>

      <main id="contenido">
        {/* HERO CINEMATOGRÁFICO */}
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-ambient hero-ambient--one" aria-hidden="true" />
          <div className="hero-ambient hero-ambient--two" aria-hidden="true" />
          <div className="hero-grid" aria-hidden="true" />
          <div className="container hero-layout">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-rule" /> UNA TRADICIÓN QUE NUNCA DEJA DE EMOCIONAR</p>
              <h1 className="hero-title" id="hero-title">
                <span className="line">Que suene</span>
                <span className="line line--gold"><em>lo inolvidable.</em></span>
              </h1>
              <p className="hero-description">Hay momentos que no se cuentan, <strong>se cantan.</strong> Llevamos la esencia del mariachi mexicano a las historias que merecen quedarse para siempre.</p>
              <div className="hero-actions">
                <a className="button button--gold" href="#experiencias">Descubre la experiencia <ArrowUpRight size={19} /></a>
                <a className="text-link" href="#nosotros">Conócenos <span className="text-link__circle"><ArrowRight size={16} /></span></a>
              </div>
              <div className="hero-bottom">
                <span className="hero-location"><span className="small-diamond" /> HECHO CON EL ALMA DE JALISCO</span>
                <a href="#nosotros" className="scroll-prompt" aria-label="Desplazarse a la sección Nosotros"><ArrowDown size={16} /> DESLIZA PARA DESCUBRIR</a>
              </div>
            </div>
            <div className="hero-art" aria-hidden="false">
              <div className="hero-art__halo" aria-hidden="true" />
              <div className="hero-art__ring hero-art__ring--one" aria-hidden="true" />
              <div className="hero-art__ring hero-art__ring--two" aria-hidden="true" />
              <span className="hero-art__note hero-art__note--a" aria-hidden="true">♪</span>
              <span className="hero-art__note hero-art__note--b" aria-hidden="true">♫</span>
              <MariachiScene reducedMotion={reducedMotion} />
              <div className="hero-art__stamp" aria-hidden="true"><span>CON ORGULLO</span><strong>GDL</strong><span>JALISCO · MX</span></div>
              <div className="hero-art__caption"><span>FIG. 01</span><span>EL SONIDO DE MÉXICO</span></div>
            </div>
          </div>
          <div className="hero-bottom-line" aria-hidden="true" />
        </section>

        {/* MARQUESINA */}
        <div className="marquee" aria-label="Tradición, emoción y momentos inolvidables">
          <div className="marquee__track" aria-hidden="true">
            {Array.from({ length: 4 }).map((_, i) => (
              <span className="marquee__item" key={i}>TRADICIÓN <span>✦</span> EMOCIÓN <span>✦</span> MÚSICA CON ALMA <span>✦</span> MOMENTOS INOLVIDABLES <span>✦</span></span>
            ))}
          </div>
        </div>

        {/* EMPRESA */}
        <section className="section about" id="nosotros" aria-labelledby="about-title">
          <div className="container about-grid">
            <div className="about-visual" data-reveal>
              <div className="about-visual__frame">
                <span className="about-visual__corner about-visual__corner--tl" />
                <span className="about-visual__corner about-visual__corner--br" />
                <img src={logoUrl} alt="Logo oficial dorado de Ay! Mariachi Para Todos" className="about-logo" loading="lazy" />
                <span className="about-visual__signature">NUESTRAS RAÍCES · NUESTRA PASIÓN</span>
              </div>
              <div className="about-visual__floating"><Star size={19} fill="currentColor" /><span>TRADICIÓN<br />QUE CONECTA</span></div>
            </div>
            <div className="about-copy" data-reveal>
              <p className="section-kicker">01 / NUESTRA ESENCIA</p>
              <Ornament className="ornament--left" />
              <h2 className="section-title" id="about-title">El mariachi no solo se escucha. <em>Se siente.</em></h2>
              <p className="section-body">En <strong>Ay! Mariachi Para Todos</strong> creemos que la música tiene el poder de transformar cualquier instante en una historia memorable.</p>
              <p className="section-body">Nacemos de una idea sencilla: acercar la riqueza de nuestra tradición a más personas, uniendo la calidez del mariachi con las posibilidades de la tecnología.</p>
              <div className="about-values">
                <div><span className="about-values__icon"><Heart size={20} /></span><span><strong>Corazón mexicano</strong><small>Autenticidad en cada nota</small></span></div>
                <div><span className="about-values__icon"><SparklesIcon size={20} /></span><span><strong>Una nueva forma de conectar</strong><small>Tradición que mira al futuro</small></span></div>
              </div>
              <a href="#guia" className="inline-link">Prepara tu evento <ArrowUpRight size={17} /></a>
            </div>
          </div>
        </section>

        {/* EXPERIENCIAS */}
        <section className="section experiences" id="experiencias" aria-labelledby="experiences-title">
          <div className="container">
            <div className="section-heading" data-reveal>
              <div><p className="section-kicker">02 / HAGAMOS HISTORIA</p><h2 className="section-title" id="experiences-title">Cada ocasión merece <em>su propia canción.</em></h2></div>
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

        {/* MANIFIESTO */}
        <section className="manifesto" aria-label="Nuestro manifiesto">
          <div className="manifesto__lights" aria-hidden="true" />
          <div className="container manifesto__content" data-reveal>
            <Ornament />
            <span className="manifesto__eyebrow">NUESTRA RAZÓN DE SER</span>
            <p>Porque algunas historias<br />merecen contarse <em>con música.</em></p>
            <div className="manifesto__signature">Ay! Mariachi Para Todos <span>✦</span></div>
          </div>
        </section>

        {/* GUÍA Y CATÁLOGO */}
        <section className="section guide-section" id="guia" aria-labelledby="guide-title">
          <div className="container guide-grid">
            <div className="guide-copy" data-reveal>
              <p className="section-kicker">03 / PREPARA TU MOMENTO</p>
              <Ornament className="ornament--left" />
              <h2 className="section-title" id="guide-title">Guía para <em>tu evento.</em></h2>
              <p className="section-body">Cada celebración tiene su propio ritmo. Piensa en la ocasión, el espacio y el estilo que imaginas para elegir el acompañamiento musical de tu momento.</p>
              <p className="section-body">Explora las ocasiones y define los datos de tu evento desde la web. Envía la solicitud completa por WhatsApp.</p>
              <a className="button button--outline" href="#contacto">Hablemos de tu evento <ArrowUpRight size={18} /></a>
            </div>
            <EventCatalog key={catalogVisit} category={category} onCategoryChange={setCategory} />
          </div>
        </section>

        {/* CONTACTO / REDES */}
        <section className="contact-section" id="contacto" aria-labelledby="contact-title">
          <div className="container">
            <div className="contact-intro" data-reveal>
              <p className="section-kicker">04 / SIGAMOS EN CONTACTO</p>
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
          <div className="footer-column"><h3>EXPLORA</h3><a href="#inicio">Inicio <ChevronRight size={14} /></a><a href="#nosotros">Nuestra esencia <ChevronRight size={14} /></a><a href="#experiencias">Experiencias <ChevronRight size={14} /></a><a href="#guia">Guía para tu evento <ChevronRight size={14} /></a></div>
          <div className="footer-column"><h3>HABLEMOS</h3><a href="#contacto">Contacto <ChevronRight size={14} /></a>{whatsApp && <a href={whatsApp} target="_blank" rel="noopener noreferrer">WhatsApp <ChevronRight size={14} /></a>}{company.instagram && <a href={company.instagram} target="_blank" rel="noopener noreferrer">Instagram <ChevronRight size={14} /></a>}<span>Guadalajara, Jalisco, México</span></div>
          <div className="footer-quote"><span>✦</span><p>Que nunca falte una canción para celebrar la vida.</p></div>
        </div>
        <div className="container footer-bottom"><span>© {new Date().getFullYear()} {company.name}. Todos los derechos reservados.</span><span>CON EL CORAZÓN EN GUADALAJARA <Star size={10} fill="currentColor" /></span><a href="#inicio">VOLVER ARRIBA <ArrowUpRight size={15} /></a></div>
        <div className="footer-wordmark" aria-hidden="true">¡AY! MARIACHI</div>
      </footer>
    </div>
  );
}
