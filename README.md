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
- `/work`: ocho proyectos conservados del portafolio original, filtros y fichas con enlaces reales.
- `/research`: publicaciones de Google Scholar con búsqueda y filtro por año.
- `?lang=es` y `?lang=en`: idioma renderizado desde el servidor; la preferencia se conserva en el navegador.
- `lib/content.ts`: datos de contacto y selección editorial. Solo los proyectos de esta lista aparecen públicamente. Añadir un proyecto requiere incluirlo aquí con su URL real de Behance. El feed no publica toda la cuenta.

## Actualización automática y límites

`/api/projects` consulta el RSS público https://www.behance.net/alexrozzo.xml y, si falla, los metadatos del perfil público. Solo actualiza coincidencias por ID de proyecto. Actualmente cuatro proyectos de la selección están en el feed. Los otros cuatro se conservan como archivo del sitio original.

`/api/publications` consulta el perfil SPK8iKAAAAAJ de Google Scholar. Si la fuente no responde, consulta el registro público ORCID 0000-0001-9343-2264, verificado mediante nombre y publicaciones coincidentes. Conserva los títulos originales y los metadatos de Scholar cuando coinciden con ORCID.

La consulta se hace al visitar el sitio, con caché de una hora; no necesita republicación. Si una fuente está bloqueada o caída, se utiliza la última copia de la instancia del servidor o la copia incluida en el código. No hay un proceso programado mientras el sitio está cerrado, ni un historial persistente en base de datos. Los servicios externos pueden restringir consultas automáticas.

Validación local: Scholar respondió con 14 registros. Behance RSS fue leído desde Node y PowerShell, y sus cuatro coincidencias validadas con fixtures; el Worker de prueba recibe HTTP 403 desde Behance. Por ello la actualización de Behance en hosting debe considerarse no verificada hasta una respuesta real satisfactoria. No se usan proxies ni evasión de bloqueos.

## Identidad y medios

Marca: `.ART` (no es una compra ni conexión de dominio). Retrato, portadas y tipografía Satoshi proceden del sitio original. Las fuentes Satoshi proceden de Fontshare a través de los assets públicos del sitio. La escultura se genera en WebGL, sin descargar modelos ni imágenes ajenos. Respeta reducción de movimiento y ofrece pausa manual. El video conserva el enlace usado en Work: «3DUI Contest Fast Forward | IEEE VR 2022», publicado por IEEE Virtual Reality Conference.

Referencias de diseño, separadas del código de la web en `../research/references`: Dennis Snellenberg, Lusion, Bruno Arizio y Bruno Simon. Sus snapshots HTML son material de consulta local y no se empaquetan ni se reutilizan como código de producción.

## Publicación

El identificador del Site está en `.openai/hosting.json`. Mantener la audiencia privada inicial. La publicación no sustituye el sitio existente en Framer. Usar el flujo del plugin Sites para compilar, sincronizar fuente, empaquetar y publicar.
