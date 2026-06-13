import type { QuickLink, SupportCard } from './types';

export const tripMeta = {
  title: 'Londres 2026',
  subtitle: 'Guía narrativa y operativa del viaje familiar',
  dateRange: '24-28 julio 2026',
  base: 'Kennington, Zona 1',
  travellers: '5 viajeros',
};

export const tripDocs: QuickLink[] = [];

export const generalSupportCards: SupportCard[] = [
  {
    title: 'Checklist de preparación',
    summary: 'Lo mínimo que conviene tener resuelto para viajar con tranquilidad.',
    bullets: [
      'Pasaportes y 4/5 ETAs listas: solo falta tramitar/archivar una ETA.',
      'Pagos y transporte definidos: adultos con contactless, Oyster para el menor que la necesita y niño pequeño gratis acompañado.',
      'Tickets críticos en la carpeta real ViajeLondres2026, que se descargará en los móviles.',
      'Últimos pendientes reales: £100 en efectivo, adaptadores/batería, taxi a Manises y check-in.',
    ],
  },
  {
    title: 'Cómo leer el viaje',
    summary: 'Cada parada tiene una pequeña historia para que no sea solo una foto bonita.',
    bullets: [
      'Preguntar siempre: qué pasó aquí, por qué importó y qué detalle curioso recordaremos.',
      'No hace falta memorizar datos: basta con llevar 1-2 historias por parada.',
      'La guía pública da contexto; los tickets y datos privados siguen solo en Drive.',
    ],
  },
  {
    title: 'Último día sin estrés',
    summary: 'La mañana del regreso está protegida si a las 11:55 ya está todo cerrado.',
    bullets: [
      'El propietario permite dejar maletas con los cleaners hasta la hora del transfer.',
      'El transfer de vuelta recoge en Kennington a las 12:10.',
      'Objetivo de llegada a Heathrow: 13:45-14:00.',
    ],
  },
];

export const lockedMoments = [
  '24/07 10:30-11:30 · Vuelo W9 5368 VLC -> LTN',
  '24/07 12:20 · Transfer privado LTN -> apartamento',
  '24/07 20:00 · London Eye',
  '25/07 09:30-10:50 · Westminster Abbey + Galleries',
  '25/07 12:20-13:00 · City Cruises Thames flexible por fecha',
  '26/07 10:30 · Warner Bros Studio Tour',
  '27/07 10:00 · British Museum',
  '28/07 12:10 · Transfer apartamento -> Heathrow',
  '28/07 16:10 · Vuelo BA408 LHR -> VLC',
];

export const practicalNotes = [
  'ETA Reino Unido: 4/5 aprobadas; falta solo una.',
  'Tower Bridge decidido: no reservar interior, cruzarlo por fuera para gastar menos y llevar el día más tranquilo.',
  'Roaming: todos con Movistar; no comprar eSIM por defecto, solo comprobar roaming activo antes de salir.',
  'Check-in de ida y vuelta asignado; segundo móvil verifica que las tarjetas de embarque quedan descargadas.',
  'El propietario permite dejar maletas con los cleaners hasta la hora del transfer del último día.',
  'La entrada al apartamento llegará por email unos días antes del viaje.',
  'BA408 se sigue operando con 16:10 como hora base hasta confirmación final en BA.',
  'Día 5: a las 11:55 todo debe estar listo para el conductor.',
];

export const contacts: { label: string; value: string; note: string }[] = [];

export const mustSee = [
  'Harry Potter Studios',
  'Big Ben por fuera',
  'Westminster Abbey por dentro',
  'London Eye',
  'Buckingham Palace + Horse Guards',
  'Tower of London por fuera',
  'Tower Bridge',
  'Paseo en barco por el Támesis',
  'British Museum',
  'St Paul’s + Millennium Bridge',
  'Notting Hill',
  'Piccadilly Circus',
];
