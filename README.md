# ¡Ay! Mariachi Para Todos — Sitio web oficial

Landing page premium y responsive para presentar **Ay! Mariachi Para Todos** como empresa. Incluye una guía para preparar eventos y canales de contacto.

## Tecnología

- **React 19 + TypeScript + Vite**: estructura por componentes y build rápido.
- **CSS puro** en `src/styles.css`: todo el diseño en un archivo separado del JSX.
- **Anime.js 4**: presentación de portada escalonada y entradas por sección al hacer scroll.
- **Three.js + React Three Fiber + Drei**: trompeta dorada 3D, iluminación, destellos y respuesta al puntero (sin modelos externos ni pago a Spline).
- **Lucide React**: iconografía escalable.

## Cómo ejecutar (Windows / PowerShell)

> Requiere Node.js 20.19+ o 22.12+ y conexión a Internet para instalar las dependencias.

```powershell
cd C:\ruta\donde\guardaste\ay-mariachi-web
npm install
npm run dev
```

Abre la dirección que aparece en la terminal (normalmente `http://localhost:5173`).

Para generar la versión final:

```powershell
npm run build
npm run preview
```

La versión publicable se crea en `dist/`. Puedes desplegarla en Vercel, Netlify, Cloudflare Pages o cualquier hosting estático. Para Vercel/Netlify: comando de build `npm run build`, carpeta de salida `dist`.

## Estructura

```text
ay-mariachi-web/
├── index.html                          # SEO y entrada HTML
├── package.json                        # Dependencias y comandos
├── tsconfig.json                       # Configuración de TypeScript
├── vite.config.ts                      # Configuración de Vite
├── README.md
├── public/
│   ├── favicon.svg                     # Identidad visual en pestaña
│   └── logo-ay-mariachi.png            # Logo de bienvenida oficial, sin modificaciones
└── src/
    ├── main.tsx                        # Punto de entrada de React
    ├── App.tsx                         # Todas las secciones / interacciones de la web
    ├── styles.css                      # Diseño y responsive, separado del código
    ├── config/
    │   └── site.ts                     # ÚNICO LUGAR para configurar redes y contacto
    └── components/
        ├── EventGuide.tsx              # Guía de tres temas, controles y gesto móvil
        ├── MariachiScene.tsx           # Trompeta 3D en React Three Fiber
        └── Motion.tsx                  # Anime.js + detección de movimiento reducido
```

## IMPORTANTE: conectar las redes reales

Edita **`src/config/site.ts`** y rellena los valores de `whatsappNumber`, `instagram`, `facebook`, `tiktok` y `email`.

- `whatsappNumber` debe ser un número con indicativo internacional, **solo dígitos**, por ejemplo `5213312345678` (solo ejemplo ficticio; no lo uses en producción).
- Las redes deben llevar **las URLs reales y oficiales** de la empresa.
- Los contactos que estén vacíos se muestran como tarjetas no clicables y se indica que están pendientes; nunca enviarán a perfiles inventados.

## Reemplazar la trompeta por una escena hecha en Spline (opcional)

Ya hay un 3D funcional hecho específicamente para Ay! Mariachi. Si más adelante tienes una escena propia en Spline, puedes sustituir la trompeta así:

1. Abre tu proyecto en https://spline.design y selecciona **Export → Code → React**.
2. Instala lo que indica la documentación oficial:

```powershell
npm install @splinetool/react-spline @splinetool/runtime
```

3. Crea `src/components/SplineStage.tsx` con este contenido, cambiando la URL por **TU** URL exportada:

```tsx
import Spline from '@splinetool/react-spline';

export default function SplineStage() {
  return (
    <div className="scene-canvas">
      <Spline scene="https://prod.spline.design/TU_ID/scene.splinecode" />
      <p className="spline-credit">
        <a href="https://app.spline.design" target="_blank" rel="noopener noreferrer">Abrir en Spline</a>
        {' · '}
        <a href="https://spline.design" target="_blank" rel="noopener noreferrer">Made with Spline</a>
      </p>
    </div>
  );
}
```

4. En `src/App.tsx` cambia `import MariachiScene ...` por `import SplineStage from './components/SplineStage';` y `<MariachiScene reducedMotion={reducedMotion} />` por `<SplineStage />`.
5. Agrega este CSS:

```css
.spline-credit { position: absolute; bottom: 10px; right: 12px; z-index: 5; font-size: 9px; color: #d8b76a; }
.spline-credit a { text-decoration: underline; }
```

Usa una escena que hayas creado o cuya licencia permita reutilización, y conserva la atribución correspondiente. **No se ha colocado ninguna escena ajena fingiendo que es propiedad de la empresa.**

## Diseño adaptable y accesibilidad

- Navbar fijo con menú desplegable para teléfonos.
- Diseño fluido desde 320 px, tablets y pantallas anchas.
- Etiquetas semánticas, `aria-label`, enlace para saltar al contenido y focos visibles.
- Respeta `prefers-reduced-motion` (reduce animaciones y el movimiento 3D).
- Fotografías ilustrativas: se muestran desde imágenes de Unsplash, requieren conexión para cargar. El sitio conserva fondos de color si no cargan.

## Fotos, créditos y datos

- Fotografías ilustrativas de Alan Morales y Fotógrafo Samuel Cruz, publicadas bajo la licencia de Unsplash, con atribución visible en el sitio. **No presentan músicos necesariamente afiliados a la empresa**.
- El nombre, la identidad dorada y el logo fueron aportados por el solicitante.
- Los textos son propuestas editoriales que se pueden ajustar; no incluyen cifras de ventas, clientes o logros no confirmados.

## Guía para tu evento (W2)

`src/components/EventGuide.tsx` contiene los tres temas: ocasión, espacio y estilo. Reutiliza el panel, flechas e indicadores del carrusel anterior, con tarjetas de texto y sin avance automático ni animaciones de transición. Permite Tab + Enter/Espacio, flechas izquierda/derecha, Inicio/Fin y gesto horizontal en móvil. El gesto vertical conserva el scroll. La zona `#guia` queda disponible para incorporar el catálogo en W3.

## Base y procedencia de W2

- `origin/main`: `20b09d6ef093d5a42b0d5c8b0837ceca14e38d76` al iniciar.
- PR #1 abierto, en borrador y sin integrar: W2 parte de `codex/web-w1-rutas-recursos`, commit `dbad9a16b7b82b4e025e8ffce930fb6bea6a5254`.
- Rama W2: `codex/web-w2-logo-y-guia`; base del PR: `codex/web-w1-rutas-recursos`, para mostrar únicamente W2.
- Logo copiado sin modificar desde `Fernando261/aymariachiparatodos`, commit `75eaa5f50a3bf57a5fa7cab6339307e66746e009`, `assets/images/logo.png`, usado por `src/app/welcome.tsx`. Solo se copia ese archivo; el repositorio de referencia no se modifica.
- Las imágenes del encabezado, Nosotros y pie usan `import.meta.env.BASE_URL`. El metadato de imagen usa `%BASE_URL%`.
- Alex queda a cargo de la integración y publicación.

Validación W2 completada: `npm ci --cache /tmp/aymariachi-npm-cache`, `npm run build` y `git diff --check`. La caché predeterminada no era escribible. Chromium/Playwright verificó los tres logos (carga y HTTP 200) en `/` y `/aymariachiweb/`, controles, indicadores, teclado, gesto móvil, ausencia de desbordamiento horizontal y movimiento reducido en 1440 y 390 px. También se comprobó el menú móvil y la guía con movimiento normal. Capturas locales revisadas de la guía en ambos tamaños. Queda pendiente la revisión visual independiente de Alex y la prueba en un teléfono físico. Vite conserva el aviso previo por el tamaño del JavaScript inicial.
