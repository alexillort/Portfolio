# .ART — Alexander Rozo Torres

Portafolio bilingüe construido a partir de https://alexillort.framer.website/ y /work.

## Ejecutar

- `npm run dev` — vista local en http://127.0.0.1:5173
- `npm run build` — compilar la aplicación y el Worker
- `npm start` — previsualizar el Worker compilado
- `node node_modules/typescript/bin/tsc --noEmit` — comprobar tipos
- `node tests/feeds.mjs` — comprobar integración de contenidos y selección editorial

## Páginas y contenido

- `/`: introducción centrada con retrato, nombre con zoom al hacer scroll, áreas con texto desplazable, biografía, disciplinas, sección de 19 herramientas del Framer original, selección Work, carrusel de exploraciones, invitación a Research y footer «love».
- `/work`: ocho proyectos conservados del portafolio original, tarjetas que se apilan al hacer scroll, portadas que se estiran y amplían con el scroll, filtros, fichas y congresos.
- `/about`: biografía, áreas animadas, tarjetas visuales de disciplinas y carrusel de exploraciones.
- `/contact`: títulos móviles y enlaces de contacto.
- `/research`: publicaciones de Google Scholar con búsqueda y filtro por año; al final, video IEEE VR 2022.
- `?lang=es` y `?lang=en`: idioma renderizado desde el servidor; la preferencia se conserva en el navegador.
- `lib/content.ts`: datos de contacto y selección editorial. Solo los proyectos de esta lista aparecen públicamente. Añadir un proyecto requiere incluirlo aquí con su URL real de Behance. El feed no publica toda la cuenta.

## Actualización automática y límites

`/api/projects` consulta el RSS público https://www.behance.net/alexrozzo.xml y, si falla, los metadatos del perfil público. Solo actualiza coincidencias por ID de proyecto. Actualmente cuatro proyectos de la selección están en el feed. Los otros cuatro se conservan como archivo del sitio original.

`/api/publications` consulta el perfil SPK8iKAAAAAJ de Google Scholar. Si la fuente no responde, consulta el registro público ORCID 0000-0001-9343-2264, verificado mediante nombre y publicaciones coincidentes. Conserva los títulos originales y los metadatos de Scholar cuando coinciden con ORCID.

La consulta se hace al visitar el sitio, con caché de una hora; no necesita republicación. Si una fuente está bloqueada o caída, se utiliza la última copia de la instancia del servidor o la copia incluida en el código. No hay un proceso programado mientras el sitio está cerrado, ni un historial persistente en base de datos. Los servicios externos pueden restringir consultas automáticas.

Validación local: Scholar respondió con 14 registros. Behance RSS fue leído desde Node y PowerShell, y sus cuatro coincidencias validadas con fixtures; el Worker de prueba recibe HTTP 403 desde Behance. La comprobación del hosting el 28 de octubre de 2026 devolvió ocho proyectos desde el archivo guardado (cached=true), así que la sincronización de Behance no está operativa mientras persista ese rechazo. El endpoint de publicaciones devolvió 14 entradas actualizadas mediante ORCID + el archivo de Google Scholar (cached=false). No se usan proxies ni evasión de bloqueos.

## Identidad y medios

Marca: `.ART` (no es una compra ni conexión de dominio). Retrato y portadas proceden del sitio original. La única tipografía es DM Sans, servida localmente en pesos 400, 500, 700 y 900. Hay un saludo solo en la primera entrada de la sesión y transiciones transparentes de vidrio desenfocado entre páginas. El nombre y las portadas reaccionan al scroll; los botones usan vidrio y las portadas completas se desenfocan al pasar el cursor o recibir foco. Se conserva el cursor circular amarillo. La marca tiene un punto centrado de aproximadamente la mitad de la altura visual de ART. El menú conserva navegación por teclado y cierre con Escape. Respeta reducción de movimiento y ofrece pausa manual. El video conserva el enlace usado en Work: «3DUI Contest Fast Forward | IEEE VR 2022», publicado por IEEE Virtual Reality Conference.

Referencias de diseño, separadas del código de la web en `../research/references`: Dennis Snellenberg (entrada y transiciones), Lusion (estiramiento y escala de medios al hacer scroll, y botones), Luzia (tarjetas visuales redondeadas), Athos (apilado al scroll), Bruno Arizio y Bruno Simon. Sus snapshots HTML son material de consulta local y no se empaquetan ni se reutilizan como código de producción.

## Congresos

Se conservan JIHCI 2025, 2024, 2023 y 2021 del archivo original. Se añade Colombia 4.0 2025 (panelista de animación), confirmado por el usuario. JIHCI 2026 figura como próximo evento, 10–12 de noviembre, ponente/autor confirmado por el usuario; no se presenta como participación ya realizada. La fecha oficial está en https://jihci2026.utalca.cl/.

## Publicación

El identificador del Site está en `.openai/hosting.json`. Mantener la audiencia privada inicial. La publicación no sustituye el sitio existente en Framer. Usar el flujo del plugin Sites para compilar, sincronizar fuente, empaquetar y publicar.

## Exploraciones visuales

Seis imágenes originales generadas con IA en `public/images/exploration/` cubren Gen AI, VR/AR/XR, vibe coding, UX/UI, datos, investigación, efectos visuales y modelado 3D. Son ilustraciones temáticas, no casos de clientes. Los prompts están en `docs/exploration-image-prompts.md`. El carrusel avanza cada 4,5 segundos mientras está visible; se pausa al enfocar, pasar el cursor, arrastrar, usar controles, ocultar la pestaña, desactivar movimiento o solicitar movimiento reducido. Permite navegación manual y sus enlaces llevan a Work.

## Movimiento de las portadas

`app/surface-motion.tsx` dibuja las portadas por franjas horizontales en Canvas 2D. La expansión varía según la altura en la pantalla y la velocidad de scroll: el contorno y los píxeles se deforman juntos y recuperan su forma al detenerse. Se conserva el apilado de Work. El efecto se aplica a la selección del inicio y a Work; utiliza una imagen HTML accesible como respaldo y se desactiva con movimiento reducido o la pausa global. Lusion Featured Work y Projects se revisaron como referencia; la implementación es propia y no usa sus recursos, mapas de profundidad ni código.

Los logotipos de `public/images/tools/` se recuperaron del portafolio original del usuario. Las publicaciones detalladas y el video aparecen exclusivamente en Research; el inicio presenta solo el título, texto y enlace a publicaciones.
