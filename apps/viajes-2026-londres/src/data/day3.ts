import type { DayPlan } from './types';
import { docsBase } from './shared';

export const day3: DayPlan = {
  id: 'day3',
  label: 'Día 3',
  subtitle: 'Warner Bros Studio Tour',
  date: 'Domingo 26/07',
  theme: 'Día temático premium',
  summary:
    'Toda la jornada se organiza en torno a una experiencia muy concreta y ya pagada: Harry Potter Studios. El resto del día solo existe para que esa visita salga redonda.',
  highlight:
    'No es un día de ciudad; es un día de inmersión total en una experiencia premium y con mucha emoción para los peques.',
  fixed: ['Warner Bros Studio Tour reservado a las 10:30.'],
  stops: [
    {
      time: '08:35-08:45',
      title: 'Salida de Kennington',
      area: 'Kennington',
      narrative:
        'Hoy es día temático total, así que se sale con margen y mentalidad de experiencia premium. La idea no es solo llegar, sino llegar sin ruido para que toda la energía vaya a disfrutar el tour y no a gestionar pequeños fallos logísticos.',
      details: [
        'Día diseñado para una sola gran experiencia, no para combinarla con ciudad.',
      ],
      supportCards: [
        {
          title: 'Mochila crítica del día',
          summary: 'Todo lo importante tiene que ir resuelto antes de salir de casa.',
          bullets: [
            'Tickets en al menos dos móviles.',
            'Batería externa, agua y algún snack ligero.',
            'Punto de encuentro familiar definido por si alguien se despista dentro del tour.',
          ],
        },
      ],
      links: [{ label: 'Reserva Warner', href: `${docsBase}/booking-warner.pdf` }],
    },
    {
      time: '08:45-09:05',
      title: 'Kennington -> Euston',
      area: 'Metro / Euston',
      narrative:
        'Tramo directo y funcional, pero clave para que la mañana fluya sin fricción. Cuando este enlace sale limpio, todo el día mejora: el tour empieza a sentirse especial y no una cadena de transbordos.',
      details: [
        'Conviene llegar a Euston con margen suficiente para que el tren no se viva con presión.',
      ],
      supportCards: [
        {
          title: 'Movimiento limpio',
          summary: 'El objetivo aquí es llegar a Euston sin dispersión ni improvisaciones.',
          bullets: [
            'No conviene convertir este tramo en una carrera: el margen es parte de la experiencia.',
            'Aprovechad el metro para revisar que tickets y móviles siguen accesibles.',
          ],
        },
      ],
    },
    {
      time: '09:20-09:45',
      title: 'Euston -> Watford Junction',
      area: 'Tren',
      narrative:
        'En cuanto subís al tren empieza la transición real a modo Harry Potter. Es un buen momento para revisar tickets, comentar qué hace más ilusión del tour y preparar el bloque central del día con cabeza.',
      details: ['Este tramo suele rondar los 20 minutos en servicios rápidos.'],
      supportCards: [
        {
          title: 'Referencia de la reserva',
          summary: 'Lo más útil aquí es tener muy visible el dato del tour.',
          bullets: [
            'Studio Tour reservado para las 10:30.',
            'Order number 6975945 en la confirmación/tickets.',
            'Objetivo operativo real: estar en la entrada sobre las 10:10.',
          ],
        },
      ],
      links: [{ label: 'Reserva Warner', href: `${docsBase}/booking-warner.pdf` }],
    },
    {
      time: '09:45-10:00',
      title: 'Shuttle oficial a estudios',
      area: 'Watford Junction / Leavesden',
      narrative:
        'El shuttle oficial forma parte natural de la experiencia: os deja prácticamente en puerta y reduce muchísimo la complejidad frente a otras opciones. Además, ese último tramo ya mete al grupo en modo Leavesden.',
      details: [
        'Leavesden fue antes complejo ligado a la industria aeronáutica y hoy es uno de los centros de rodaje más importantes del Reino Unido.',
      ],
      supportCards: [
        {
          title: 'Claves operativas Warner',
          summary: 'Lo importante para que la entrada salga limpia.',
          bullets: [
            'Objetivo real: estar en entrada hacia las 10:10.',
            'El shuttle oficial suele rondar 15 min desde Watford Junction.',
            'Mejor revisar tickets y punto de reunión familiar antes de bajar del tren.',
          ],
        },
      ],
      links: [{ label: 'Reserva Warner', href: `${docsBase}/booking-warner.pdf` }],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Warner_Bros._Studios%2C_Leavesden%2C_September_2023.JPG/1280px-Warner_Bros._Studios%2C_Leavesden%2C_September_2023.JPG',
      imageAlt: 'Warner Bros Studios Leavesden',
    },
    {
      time: '10:00-10:10',
      title: 'Control + acceso',
      area: 'Entrada Warner Bros Studio Tour',
      narrative:
        'Estos minutos valen oro. Llegar con colchón, entrar sin prisas y dejar que la emoción suba poco a poco suele mejorar muchísimo la experiencia, especialmente en un día tan esperado.',
      details: [
        'Objetivo operativo: estar allí hacia las 10:10 para no convertir la entrada en una pequeña contrarreloj.',
      ],
      supportCards: [
        {
          title: 'Antes de entrar',
          summary: 'Pequeños ajustes que evitan fricción dentro del tour.',
          bullets: [
            'Baño, agua y tickets revisados antes del acceso.',
            'Si hay cualquier incidencia, es el último momento limpio para resolverla fuera.',
          ],
        },
      ],
    },
    {
      time: '10:30-14:00 (aprox.)',
      title: 'Studio Tour',
      area: 'Warner Bros Studio Tour London',
      narrative:
        'Este es el bloque estrella del viaje: sets, utilería, atmósfera cinematográfica y la sensación muy potente de que el mundo de la saga existe físicamente y no solo en pantalla. La mejor estrategia aquí no es intentar verlo todo, sino disfrutarlo bien y dejar que cada zona tenga su propio ritmo.',
      reservation: 'Entrada reservada a las 10:30 · order 6975945',
      details: [
        'Great Hall para arrancar fuerte.',
        'Sets interiores principales y zonas técnicas.',
        'Backlot para exteriores y pausa breve.',
        'Tienda al final, sin prisas.',
        'Muchos elementos son físicos y a escala real; ahí está buena parte de la magia.',
      ],
      supportCards: [
        {
          title: 'Microsecuencia recomendada',
          summary: 'Ordenar la visita ayuda a no quemarse en la primera mitad.',
          bullets: [
            '10:30-11:00: Great Hall y arranque emocional fuerte.',
            '11:00-11:45: sets interiores icónicos.',
            '11:45-12:20: Backlot y pausa breve.',
            '12:20-13:10: criaturas, props y bloque técnico.',
            '13:10-14:00: tienda y cierre sin carreras.',
          ],
        },
        {
          title: 'Tip de experiencia',
          summary: 'Aquí compensa más ver menos y disfrutar mejor.',
          bullets: [
            'No intentéis fotografiarlo todo: algunas zonas se disfrutan más mirándolas que documentándolas.',
            'Guardar energía para la tienda evita llegar a ella con prisa o saturación.',
          ],
        },
      ],
      links: [
        { label: 'Reserva Warner', href: `${docsBase}/booking-warner.pdf` },
        {
          label: 'Web Warner Studio Tour',
          href: 'https://www.wbstudiotour.co.uk/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/e/ef/The_making_of_Harry_Potter%2C_Warner_Bros_Studio%2C_London_04.jpg',
      imageAlt: 'Making of Harry Potter Studio Tour',
    },
    {
      time: '14:00-15:00',
      title: 'Salida + shuttle + vuelta a Londres',
      area: 'Leavesden -> Londres',
      narrative:
        'La salida conviene hacerla sin pelearle al día un segundo acto ambicioso. El valor está en haber exprimido bien el tour y conservar el regreso ligero, sin transformar el final de una experiencia premium en una contrarreloj rara.',
      supportCards: [
        {
          title: 'Salida inteligente',
          summary: 'El regreso debe proteger el buen sabor del día, no competir con él.',
          bullets: [
            'Mejor salir ordenados del estudio que arañar una última foto con el grupo ya cansado.',
            'Antes de marchar, revisar compras, móviles y tickets para no dejar nada atrás.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Watford_Junction_2025_19_01_58_353000.jpeg/1280px-Watford_Junction_2025_19_01_58_353000.jpeg',
      imageAlt: 'Watford Junction',
    },
    {
      time: '16:00 en adelante',
      title: 'Tarde libre ligera',
      area: 'Centro de Londres',
      narrative:
        'Aquí manda la energía real del grupo. Si vais frescos, paseo corto y merienda; si vais cargados, descanso sin culpa. La decisión buena es la que protege el día 4, no la que añade una parada más por orgullo.',
      details: ['No es un día de ciudad; es un día de experiencia temática completa.'],
      supportCards: [
        {
          title: 'Criterio de cierre',
          summary: 'La tarde no necesita volverse “productiva” para que el día sea redondo.',
          bullets: [
            'Si aún hay energía: paseo corto y merienda en zona céntrica.',
            'Si no la hay: descanso directo, porque el lunes vuelve a ser día fuerte.',
          ],
        },
      ],
    },
  ],
};
