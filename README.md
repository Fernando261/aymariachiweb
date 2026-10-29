# ¡Ay! Mariachi Para Todos — Sitio web oficial

Landing page premium y responsive para presentar **Ay! Mariachi Para Todos** como empresa. Proyecto web **independiente** de la aplicación móvil; puede publicarse con dominio propio y enlazar la app cuando esté lista.

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
│   ├── logo-ay-mariachi.png            # Tu logo original recortado y con transparencia
│   └── app-screens/                    # Capturas reales optimizadas y anonimizadas
│       ├── bienvenida.webp
│       ├── acceso.webp
│       ├── inicio.webp
│       ├── eventos.webp
│       └── perfil.webp
└── src/
    ├── main.tsx                        # Punto de entrada de React
    ├── App.tsx                         # Todas las secciones / interacciones de la web
    ├── styles.css                      # Diseño y responsive, separado del código
    ├── config/
    │   └── site.ts                     # ÚNICO LUGAR para configurar redes y contacto
    └── components/
        ├── AppShowcase.tsx             # Carrusel con 5 capturas reales y Anime.js
        ├── MariachiScene.tsx           # Trompeta 3D en React Three Fiber
        └── Motion.tsx                  # Anime.js + detección de movimiento reducido
```

## IMPORTANTE: conectar las redes reales

Edita **`src/config/site.ts`** y rellena los valores de `whatsappNumber`, `instagram`, `facebook`, `tiktok` y `email`.

- `whatsappNumber` debe ser un número con indicativo internacional, **solo dígitos**, por ejemplo `5213312345678` (solo ejemplo ficticio; no lo uses en producción).
- Las redes deben llevar **las URLs reales y oficiales** de la empresa.
- Los contactos que estén vacíos se muestran como tarjetas no clicables y se indica que están pendientes; nunca enviarán a perfiles inventados.
- Si la app se publica, agrega la URL final a `appUrl`.

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
- El escaparate contiene **capturas reales** de la app proporcionadas por el desarrollador. Las imágenes de Eventos y Perfil se han **anonimizado** para evitar mostrar un nombre personal, fechas y direcciones en una web pública.
- Son imágenes de una **versión en desarrollo**; los datos y el comportamiento de la app están sujetos a cambios.

## Nota de revisión

El código TypeScript/TSX pasó una comprobación sintáctica local y se comprobó que las cinco imágenes y el CSS están bien formados. No se pudo realizar un build completo en este entorno, porque la instalación de dependencias con npm agotó el tiempo de conexión. En tu computadora ejecuta `npm install` y después `npm run build` para realizar la verificación completa.

## Personalizar el escaparate de la app (actualizado)

La sección **Nuestra app** muestra dos móviles inclinados con capturas reales y una navegación de 5 pantallas. Empieza por **Inicio**, después avanza automáticamente cada 6,5 s cuando está visible. El avance se detiene al interactuar con el carrusel, y respeta `prefers-reduced-motion`. En móvil también permite deslizar horizontalmente sobre los teléfonos.

- Para reemplazar una captura, guarda la nueva imagen en `public/app-screens/` y cambia su `src` en el arreglo `screens` dentro de **`src/components/AppShowcase.tsx`**.
- Para editar títulos y descripciones del carrusel, cambia `title` y `description` en el mismo arreglo.
- El diseño, tamaños y transiciones están separados en **`src/styles.css`** bajo el comentario `CAPTURAS REALES`.
- Antes de incluir nuevas capturas en una web pública, oculta nombres, teléfonos, direcciones y eventos privados. Las cinco imágenes WebP del proyecto son las versiones públicas; **los archivos JPG privados originales no se incluyen**.
