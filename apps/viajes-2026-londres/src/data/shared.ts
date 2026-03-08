import type { QuickLink, SupportCard } from './types';

export const docsBase = '/viajes/2026-londres/docs';

export const tripMeta = {
  title: 'Londres 2026',
  subtitle: 'Guía visual y operativa del viaje familiar',
  dateRange: '24-28 julio 2026',
  base: '1A Kennington Lane, London, SE11 4RG',
  travellers: '5 viajeros',
};

export const tripDocs: QuickLink[] = [
  { label: 'Reserva vuelos', href: `${docsBase}/reserva-vuelos.pdf` },
  { label: 'Reserva apartamento', href: `${docsBase}/reserva-apartamento.pdf` },
];

export const generalSupportCards: SupportCard[] = [
  {
    title: 'Checklist de preparación',
    summary: 'Lo mínimo que conviene tener resuelto para viajar con tranquilidad.',
    bullets: [
      'Pasaportes, ETA y documentación accesibles.',
      'Tarjetas, adaptadores y batería externa listos.',
      'Tickets críticos descargados en al menos dos móviles.',
      'Revisar email de entrada del apartamento en la semana del viaje.',
    ],
  },
  {
    title: 'Último día sin estrés',
    summary: 'La mañana del regreso está protegida si a las 11:55 ya está todo cerrado.',
    bullets: [
      'Matthew permite dejar maletas con los cleaners hasta la hora del transfer.',
      'Mobio recoge a las 12:10 en 1A Kennington Lane.',
      'Objetivo de llegada a Heathrow: 13:45-14:00.',
    ],
  },
];

export const lockedMoments = [
  '24/07 10:00-11:35 · Vuelo W9 5368 VLC -> LTN',
  '24/07 12:20 · Transfer privado LTN -> apartamento (2107972)',
  '24/07 20:00 · London Eye',
  '26/07 10:30 · Warner Bros Studio Tour',
  '28/07 12:10 · Transfer apartamento -> Heathrow (MOZ8632893)',
  '28/07 16:10 · Vuelo BA408 LHR -> VLC',
];

export const practicalNotes = [
  'Matthew permite dejar maletas con los cleaners hasta la hora del transfer del último día.',
  'La entrada al apartamento llegará por email unos días antes del viaje.',
  'BA408 se sigue operando con 16:10 como hora base hasta confirmación final en BA.',
  'Día 5: a las 11:55 todo debe estar listo para el conductor.',
];

export const contacts = [
  { label: 'Matthew', value: '+44 7811 408059', note: 'apartamento / WhatsApp' },
  { label: 'Limowide', value: '+44 7458 148595', note: 'transfer llegada' },
  { label: 'Mobio emergency', value: '+31 20 303 0777', note: 'transfer vuelta' },
  { label: 'Mobio provider', value: '+44 808 168 9338', note: 'proveedor vuelta' },
  { label: 'eDreams 24/7', value: '+1 855 980 5669', note: 'soporte' },
];

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
