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
        ├── EventCatalog.tsx            # Catálogo, selección y solicitud por WhatsApp
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

## Catálogo manual y solicitudes (W3)

Las tarjetas Serenatas, Celebraciones y Eventos especiales llevan a `#guia`, enfocan el título del catálogo y aplican el filtro. Los botones de categoría señalan la opción activa y «Todas» recupera el listado completo. Tras elegir un grupo se muestran sus cantidades admitidas, las duraciones disponibles si las hay y un resumen. «Volver al listado» devuelve el foco al grupo. Cambiar la categoría o el grupo limpia las elecciones; volver a pulsar una tarjeta de Experiencias también vuelve al listado filtrado.

### Agregar opciones aprobadas

Edita `src/config/mariachis.ts`. El arreglo `mariachis` está vacío a propósito: aún no se han proporcionado opciones públicas aprobadas. No publiques los fixtures de `tests/catalog-fixtures.ts`.

Cada objeto debe cumplir el tipo `Mariachi`:

| Campo | Configuración |
| --- | --- |
| `code` | Código público único y estable; no lo reutilices para otro grupo. |
| `alias` | Alias público con el formato `Mariachi #…`. Nunca el nombre real. |
| `categories` | Una o más de `serenatas`, `celebraciones`, `especiales`. |
| `musicianCounts` | Cantidades de músicos aprobadas, enteros positivos sin duplicados. No dejes vacío un grupo disponible. |
| `active` | `true` para mostrarlo; `false` lo oculta de todos los filtros. |
| `zone` | Opcional: solo zona de servicio pública aprobada, nunca dirección privada. |
| `description` | Opcional: una descripción breve del repertorio o el tipo de evento. |
| `photo` | Opcional: ruta relativa a `public/`, sin barra inicial; imagen autorizada sin datos privados. Se aplica la base de Vite. |
| `durationMinutes` | Opcional: duraciones aprobadas en minutos, enteros positivos sin duplicados. Si falta o está vacío, no aparece selector. |

No se hacen consultas a servicios, no hay registro de clientes ni persistencia de solicitudes. Este catálogo es estático y manual; actualizarlo requiere una nueva compilación. Mantén los nombres reales y los datos privados fuera del repositorio.

### Perfiles de ejemplo

Cuando el arreglo de grupos aprobados está vacío, «Guía para tu evento» muestra tres perfiles de ejemplo con fotos ilustrativas de la app móvil. Al configurar el WhatsApp oficial, el mensaje identifica la selección como referencia ilustrativa y permite consultar disponibilidad con la empresa. Al cargar grupos aprobados, el catálogo muestra esos perfiles.

### WhatsApp

Configura únicamente el número oficial en `company.whatsappNumber` de `src/config/site.ts` (indicativo internacional, solo dígitos). Si sigue vacío, la solicitud permanece deshabilitada. Los enlaces generales de contacto conservan su mensaje original.

El mensaje de solicitud incluye categoría, alias y código públicos, cantidad de músicos y duración si se eligió. Se codifica con `encodeURIComponent` para conservar acentos y saltos de línea. Desde «Todas» se elige también una ocasión admitida por el grupo. La duración se puede dejar por acordar. El botón abre WhatsApp en otra pestaña: el visitante revisa y confirma allí el envío. La fecha, la dirección, el nombre del cliente y la organización se tratan únicamente en WhatsApp.

### Pruebas reproducibles

```sh
npm ci
npm run build
npx playwright install chromium
npm run test:e2e
git diff --check
```

Si Chromium ya está instalado, usa `CHROMIUM_PATH=/ruta/a/chromium npm run test:e2e`. Las pruebas levantan Vite en 4180 y los previews de `dist/` en 4181 (raíz) y 4182 (montaje bajo `/aymariachiweb/`). Los fixtures se inyectan solo mediante interceptación de módulos en el navegador de pruebas contra Vite. El build usa la configuración real del catálogo y del WhatsApp. Ninguna prueba envía solicitudes ni abre WhatsApp. No se requiere instalar navegadores para compilar la web.

### Validación ejecutada de W3

- `npm ci --cache /tmp/aymariachi-npm-cache`, `npm run build` y `git diff --check`: correctos. Vite conserva el aviso previo de tamaño del bundle.
- `CHROMIUM_PATH=/usr/bin/chromium npm run test:e2e`: **7 pruebas correctas**. El build real se probó vacío en `/` y `/aymariachiweb/`; los fixtures aislados verificaron filtros, inactivos, cambio de grupo/categoría, regreso al listado, cantidades, duraciones, resumen, mensaje exacto codificado, ausencia de número y enlaces de contacto existentes.
- Interacción táctil emulada a 320 y 390 px, escritorio a 1440 px y teclado (Enter, Espacio, Tab y selectores). Sin desbordamiento horizontal en los tres anchos. Capturas del flujo con fixtures revisadas localmente a 390 y 1440 px.
- Se comprobó que ni los códigos ni el número ficticio de las pruebas aparecen en `dist/`.
- Pendientes: revisión independiente de Alex, teléfono físico, lector de pantalla y apertura real de WhatsApp con número oficial. No se abrió WhatsApp ni se envió ningún mensaje.

### Base de W3

W2 (PR #2) seguía abierto al iniciar W3. La rama `codex/web-w3-catalogo-whatsapp` parte de la versión revisada `0a98794bbbc7e73a9fd28654fe953714088b45de` de `codex/web-w2-logo-y-guia`; esa misma rama es la base del PR para aislar W3. Alex conserva la integración y publicación.

## Base y procedencia de W2

- `origin/main`: `20b09d6ef093d5a42b0d5c8b0837ceca14e38d76` al iniciar.
- PR #1 abierto, en borrador y sin integrar: W2 parte de `codex/web-w1-rutas-recursos`, commit `dbad9a16b7b82b4e025e8ffce930fb6bea6a5254`.
- Rama W2: `codex/web-w2-logo-y-guia`; base del PR: `codex/web-w1-rutas-recursos`, para mostrar únicamente W2.
- Logo copiado sin modificar desde `Fernando261/aymariachiparatodos`, commit `75eaa5f50a3bf57a5fa7cab6339307e66746e009`, `assets/images/logo.png`, usado por `src/app/welcome.tsx`. Solo se copia ese archivo; el repositorio de referencia no se modifica.
- Las imágenes del encabezado, Nosotros y pie usan `import.meta.env.BASE_URL`. El metadato de imagen usa `%BASE_URL%`.
- Alex queda a cargo de la integración y publicación.

Validación W2 completada: `npm ci --cache /tmp/aymariachi-npm-cache`, `npm run build` y `git diff --check`. La caché predeterminada no era escribible. Chromium/Playwright verificó los tres logos (carga y HTTP 200) en `/` y `/aymariachiweb/`, controles, indicadores, teclado, gesto móvil, ausencia de desbordamiento horizontal y movimiento reducido en 1440 y 390 px. También se comprobó el menú móvil y la guía con movimiento normal. Capturas locales revisadas de la guía en ambos tamaños. Queda pendiente la revisión visual independiente de Alex y la prueba en un teléfono físico. Vite conserva el aviso previo por el tamaño del JavaScript inicial.
