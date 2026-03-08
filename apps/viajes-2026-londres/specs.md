## Viajes 2026 Londres - Specs

Esta app es una SPA local para visualizar y revisar el viaje familiar a Londres de julio de 2026 antes de publicar nada.

### Propósito actual

- Servir como guía visual compartible por URL local.
- Concentrar el plan operativo, las reservas cerradas y el relato turístico día a día.
- Mostrar cada jornada con un tono de guía turístico y soporte visual.

### Arquitectura actual

- SPA React + Vite + TypeScript.
- Estilo con Tailwind + CSS propio.
- Sin backend ni fetch remoto de datos del viaje.
- Todos los datos viven en el cliente en un índice común y un dataset por día.

### Ruta local/pública prevista

- Fuente: `apps/viajes-2026-londres`
- Build estático: `/viajes/2026-londres/`

### Estructura funcional actual

- Hero editorial con resumen del viaje.
- Navegación mobile-first por días; en escritorio se expande a tarjetas más grandes.
- Panel lateral con imprescindibles, notas operativas, acceso rápido documental y contactos clave.
- Vista principal por día con:
  - resumen editorial del día,
  - bloques fijos,
  - timeline de paradas con narrativa turística,
  - imagen remota por parada cuando aplica,
  - fallback visual si una imagen remota falla,
  - curiosidades y contexto histórico,
  - notas de reserva y operativa,
  - tarjetas plegables de soporte dentro de cada parada con jerarquía reforzada para móvil,
  - enlaces rápidos a PDFs, vouchers y webs oficiales cuando aplica.

### Documentación integrada

- La app incluye un paquete documental local en `public/docs/`.
- Cada parada muestra enlaces rápidos solo a:
  - reservas/tickets relacionados,
  - vouchers y PDFs operativos,
  - webs oficiales cuando aporta valor práctico.
- La documentación interna resumida del viaje ya no se abre como `.md` desde las paradas:
  - se integra como tarjetas plegables dentro de la propia experiencia,
  - los enlaces se reservan para material externo o documental que de verdad conviene abrir aparte.
- Hay además un panel global de acceso rápido con la documentación troncal del viaje.

### Dirección visual actual

- Estética editorial cálida, con paleta crema/cobre y tipografía expresiva.
- Hero tipo portada de revista de viaje.
- Tarjetas con efecto cristal suave y fondos en capas.
- Timeline visual de paradas para entender el día de un vistazo.
- Priorizada para móvil sin perder calidad en escritorio.

### Datos y contenido

- Los datos salen de un índice general y un fichero por día:
  - `src/data/shared.ts`
  - `src/data/day1.ts` ... `src/data/day5.ts`
  - `src/data/index.ts`
- `src/data.ts` actúa solo como barrel de compatibilidad.
- El contenido se ha destilado a partir de la documentación del viaje en Obsidian.
- No hay CMS ni sincronización automática: esta primera versión es una POC curada a mano.
- Regla de mantenimiento actual:
  - cada parada de la app debe corresponder 1:1 con los bloques del `.md` detallado de ese día,
  - sobre esa parada se añaden extras operativos (reservas, contactos, tips, contingencias),
  - el patrón bueno de referencia es el de las tarjetas plegables integradas, no el enlace a guías internas.

### Restricciones actuales

- No se enlaza desde ninguna otra parte del sitio.
- No usa router ni hash routing porque toda la experiencia vive en una sola pantalla.
- El objetivo actual es POC local, no publicación definitiva.
- Build validada localmente con `npm run build`.
