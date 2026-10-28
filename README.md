# .ART — Alexander Rozo Torres

Portafolio bilingüe construido a partir de https://alexillort.framer.website/ y /work.

## Ejecutar

- `npm run dev` — vista local en http://127.0.0.1:5173
- `npm run build` — compilar la aplicación y el Worker
- `npm start` — previsualizar el Worker compilado
- `node node_modules/typescript/bin/tsc --noEmit` — comprobar tipos
- `node tests/feeds.mjs` — comprobar integración de contenidos y selección editorial

## Páginas y contenido

- `/`: introducción, escultura WebGL, selección Work, biografía, disciplinas, video IEEE VR 2022, publicaciones y footer «love».
- `/work`: ocho proyectos conservados del portafolio original, tarjetas que se apilan al hacer scroll, portadas con curvatura WebGL, filtros, fichas y congresos.
- `/about`: biografía, tarjetas visuales de disciplinas y capturas del portafolio original.
- `/contact`: títulos móviles y enlaces de contacto.
- `/research`: publicaciones de Google Scholar con búsqueda y filtro por año.
- `?lang=es` y `?lang=en`: idioma renderizado desde el servidor; la preferencia se conserva en el navegador.
- `lib/content.ts`: datos de contacto y selección editorial. Solo los proyectos de esta lista aparecen públicamente. Añadir un proyecto requiere incluirlo aquí con su URL real de Behance. El feed no publica toda la cuenta.

## Actualización automática y límites

`/api/projects` consulta el RSS público https://www.behance.net/alexrozzo.xml y, si falla, los metadatos del perfil público. Solo actualiza coincidencias por ID de proyecto. Actualmente cuatro proyectos de la selección están en el feed. Los otros cuatro se conservan como archivo del sitio original.

`/api/publications` consulta el perfil SPK8iKAAAAAJ de Google Scholar. Si la fuente no responde, consulta el registro público ORCID 0000-0001-9343-2264, verificado mediante nombre y publicaciones coincidentes. Conserva los títulos originales y los metadatos de Scholar cuando coinciden con ORCID.

La consulta se hace al visitar el sitio, con caché de una hora; no necesita republicación. Si una fuente está bloqueada o caída, se utiliza la última copia de la instancia del servidor o la copia incluida en el código. No hay un proceso programado mientras el sitio está cerrado, ni un historial persistente en base de datos. Los servicios externos pueden restringir consultas automáticas.

Validación local: Scholar respondió con 14 registros. Behance RSS fue leído desde Node y PowerShell, y sus cuatro coincidencias validadas con fixtures; el Worker de prueba recibe HTTP 403 desde Behance. La comprobación del hosting el 28 de octubre de 2026 devolvió ocho proyectos desde el archivo guardado (cached=true), así que la sincronización de Behance no está operativa mientras persista ese rechazo. El endpoint de publicaciones devolvió 14 entradas actualizadas mediante ORCID + el archivo de Google Scholar (cached=false). No se usan proxies ni evasión de bloqueos.

## Identidad y medios

Marca: `.ART` (no es una compra ni conexión de dominio). Retrato y portadas proceden del sitio original. La única tipografía es DM Sans, servida localmente en pesos 400, 500, 700 y 900. Las cuatro capturas de Framer fueron suministradas por el usuario. Hay una entrada de saludos, transiciones de cortina entre páginas, nombre y títulos móviles, cursor circular amarillo y barras de vidrio. El menú conserva navegación por teclado y cierre con Escape. La escultura se genera en WebGL, sin descargar modelos ni imágenes ajenos. Respeta reducción de movimiento y ofrece pausa manual. El video conserva el enlace usado en Work: «3DUI Contest Fast Forward | IEEE VR 2022», publicado por IEEE Virtual Reality Conference.

Referencias de diseño, separadas del código de la web en `../research/references`: Dennis Snellenberg (entrada y transiciones), Lusion (medios curvos y botones), Luzia (tarjetas visuales redondeadas), Athos (apilado al scroll), Bruno Arizio y Bruno Simon. Sus snapshots HTML son material de consulta local y no se empaquetan ni se reutilizan como código de producción.

## Congresos

Se conservan JIHCI 2025, 2024, 2023 y 2021 del archivo original. Se añade Colombia 4.0 2025 (panelista de animación), confirmado por el usuario. JIHCI 2026 figura como próximo evento, 10–12 de noviembre, ponente/autor confirmado por el usuario; no se presenta como participación ya realizada. La fecha oficial está en https://jihci2026.utalca.cl/.

## Publicación

El identificador del Site está en `.openai/hosting.json`. Mantener la audiencia privada inicial. La publicación no sustituye el sitio existente en Framer. Usar el flujo del plugin Sites para compilar, sincronizar fuente, empaquetar y publicar.
