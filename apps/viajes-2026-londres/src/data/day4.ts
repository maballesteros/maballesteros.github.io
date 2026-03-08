import type { DayPlan } from './types';

export const day4: DayPlan = {
  id: 'day4',
  label: 'Día 4',
  subtitle: 'British Museum + Notting Hill + St Paul’s',
  date: 'Lunes 27/07',
  theme: 'Cultura con barrios y arquitectura',
  summary:
    'El lunes equilibra gran museo, barrio con personalidad y una de las mejores secuencias arquitectónicas del viaje: St Paul’s y Millennium Bridge.',
  highlight:
    'Es un día muy completo porque alterna piezas maestras, atmósferas distintas y un cierre urbano con mucha elegancia.',
  fixed: ['Sin ticket pagado con hora cerrada.', 'Decisión cerrada: sin teatro.'],
  stops: [
    {
      time: '09:00-09:30',
      title: 'Kennington -> British Museum',
      area: 'Kennington / Bloomsbury',
      narrative:
        'La salida del lunes ya lleva una estructura muy clara en la cabeza: gran museo por la mañana, barrio con personalidad al mediodía y cierre elegante entre catedral, puente y West End. El traslado no es protagonista, pero sí el arranque de un día muy bien equilibrado.',
      details: ['Hoy importa mucho cambiar de registro varias veces sin perder continuidad.'],
      supportCards: [
        {
          title: 'Mapa mental del día',
          summary: 'Este lunes funciona por contraste bien medido, no por acumulación.',
          bullets: [
            'Museo potente, barrio con color y arquitectura monumental al final.',
            'Si el museo se alarga demasiado, el ajuste más sano suele hacerse en la tarde, no en la mañana.',
          ],
        },
      ],
    },
    {
      time: '10:00-12:15',
      title: 'British Museum (por dentro)',
      area: 'Bloomsbury',
      narrative:
        'Un museo inmenso tratado con disciplina: no se trata de verlo todo, sino de entrar, localizar grandes hitos y salir antes de saturarse. La combinación de Rosetta, Egipto, Partenón y Asiria da una mañana cultural potentísima.',
      details: [
        'Abrió en 1759.',
        'Fue el primer gran museo público nacional de acceso gratuito.',
        'Hoy guarda más de ocho millones de objetos en colección.',
      ],
      supportCards: [
        {
          title: 'Recorrido corto que sí compensa',
          summary: 'La clave aquí es seleccionar y no dejarse tragar por la escala del museo.',
          bullets: [
            'Great Court para orientarse.',
            'Rosetta Stone y Egipto como gran bloque icónico.',
            'Partenón y Asiria para cerrar con impacto visual fuerte.',
            'Últimos minutos para baño, tienda y salida ordenada.',
          ],
        },
        {
          title: 'Lo que conviene evitar',
          summary: 'El British Museum castiga mucho si se visita “a ver qué sale”.',
          bullets: [
            'No intentar recorrerlo sin plan.',
            'Mejor salir con ganas de más que arrastrarse por agotamiento cultural.',
          ],
        },
      ],
      links: [
        {
          label: 'Web British Museum',
          href: 'https://www.britishmuseum.org/visit',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/British_Museum_%28aerial%29.jpg/1280px-British_Museum_%28aerial%29.jpg',
      imageAlt: 'British Museum',
    },
    {
      time: '12:15-12:35',
      title: 'Traslado a Notting Hill Gate',
      area: 'Bloomsbury -> Notting Hill',
      narrative:
        'El salto de museo enciclopédico a barrio con atmósfera es parte de la gracia del día. Este cambio tan claro de registro ayuda mucho a que la jornada no se haga plana ni pesada.',
      details: ['Es un contraste buscado: gran colección histórica y luego calle, color y vida de barrio.'],
      supportCards: [
        {
          title: 'Cambio de textura',
          summary: 'Aquí el día gana frescura justo cuando un segundo museo podría hacerlo pesado.',
          bullets: [
            'Notting Hill no compite con el museo; lo airea.',
            'El contraste es parte de la calidad del día, no un simple traslado.',
          ],
        },
      ],
    },
    {
      time: '12:35-13:30',
      title: 'Notting Hill (paseo barrio)',
      area: 'Portobello Road',
      narrative:
        'Cambio radical de registro: de museo enciclopédico a barrio de color, fachada bonita y textura urbana. Aquí el plan es caminar, mirar y absorber ambiente, dejando que el barrio haga su trabajo sin convertirlo en una lista de microparadas.',
      details: [
        'Notting Hill pasó de zona humilde e inmigrante a barrio muy codiciado sin perder su identidad cultural.',
      ],
      supportCards: [
        {
          title: 'Mini ruta sugerida',
          summary: 'Con un rato bien usado ya os lleváis la esencia del barrio.',
          bullets: [
            'Portobello Road como eje reconocible.',
            'Fachadas de color y calles residenciales para la parte más de postal.',
            'No conviene convertirlo en recorrido milimetrado: aquí manda más el ambiente que el checklist.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/e/e7/Portobello_Road%2C_Notting_Hill%2C_London.jpg',
      imageAlt: 'Portobello Road en Notting Hill',
    },
    {
      time: '13:30-14:00',
      title: "Notting Hill -> St Paul's",
      area: 'Notting Hill -> City',
      narrative:
        'Volvéis al eje central para el segundo gran bloque patrimonial del día. Este traslado está muy bien colocado: permite cambiar de barrio a monumento sin sensación de salto arbitrario.',
      details: ['La cúpula de St Paul’s gana mucho cuando llegáis a ella tras el contraste con Notting Hill.'],
      supportCards: [
        {
          title: 'Volver al gran icono',
          summary: 'Este cambio de escala es justo lo que mantiene la jornada viva.',
          bullets: [
            'Después del color de barrio, St Paul\'s entra con más fuerza visual todavía.',
            'Es buen momento para comer algo ligero si hiciera falta, sin retrasar el bloque principal.',
          ],
        },
      ],
    },
    {
      time: '14:00-15:30',
      title: "St Paul's Cathedral (por dentro)",
      area: 'City of London',
      narrative:
        'La cúpula de St Paul’s cambia la escala del día. Entrar aquí es entrar en un símbolo de la resiliencia de Londres tras el Gran Incendio y en una de las arquitecturas más reconocibles del país.',
      details: [
        'La catedral actual es obra de Christopher Wren.',
        'Su reconstrucción siguió al Gran Incendio de 1666.',
      ],
      supportCards: [
        {
          title: 'Núcleo de visita',
          summary: 'No hace falta verlo absolutamente todo para salir con una visita muy completa.',
          bullets: [
            'Nave principal y lectura general del espacio al entrar.',
            'Capillas y elementos históricos del interior como segundo bloque.',
            'Cierre flexible según colas y energía del grupo.',
          ],
        },
      ],
      links: [
        {
          label: "Web St Paul's",
          href: 'https://www.stpauls.co.uk/visit-us',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cb/St_Pauls_aerial_%28cropped%29.jpg/1280px-St_Pauls_aerial_%28cropped%29.jpg',
      imageAlt: "St Paul's Cathedral",
    },
    {
      time: '15:30-15:45',
      title: "St Paul's exterior",
      area: 'City of London',
      narrative:
        'Antes de seguir, merece la pena salir a la plaza y regalaros la fachada completa. Es uno de los encuadres clásicos de la City histórica y ayuda a rematar la visita interior con una lectura más urbana.',
      details: ['La fachada y la escalinata funcionan muy bien para foto y descanso breve antes del siguiente tramo.'],
      supportCards: [
        {
          title: 'Foto y respiro',
          summary: 'Este pequeño bloque cierra muy bien la visita interior.',
          bullets: [
            'Muy buen lugar para detenerse un momento y mirar la escala completa del edificio.',
            'La fachada exterior remata el relato de Wren mucho mejor que salir corriendo al siguiente punto.',
          ],
        },
      ],
    },
    {
      time: '16:00-16:45',
      title: 'Millennium Bridge + ribera',
      area: 'Ribera del Támesis',
      narrative:
        'Es uno de los paseos fotográficos más agradecidos del viaje: St Paul’s a un lado, skyline contemporáneo al otro y el río cosiéndolo todo. Aquí Londres enseña muy bien su mezcla de tradición y modernidad.',
      details: ['El puente se hizo famoso al inaugurarse por una oscilación lateral inesperada y tuvo que cerrarse temporalmente.'],
      supportCards: [
        {
          title: 'Qué mirar en este tramo',
          summary: 'Más que cruzarlo, interesa leer lo que une.',
          bullets: [
            'St Paul\'s detrás, Tate Modern y la ribera contemporánea al frente.',
            'Es un tramo de perspectiva y skyline, no de prisa.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Millenium_bridge_2015.jpg/960px-Millenium_bridge_2015.jpg',
      imageAlt: 'Millennium Bridge',
    },
    {
      time: '17:00-17:30',
      title: 'Somerset House Courtyard',
      area: 'Strand',
      narrative:
        'Somerset House aporta una pausa elegante antes del cierre más animado. Es una parada corta, muy visual y muy buena para bajar un poco la intensidad antes de volver al ruido amable del West End.',
      details: ['Somerset House fue residencia Tudor y luego gran edificio estatal.'],
      supportCards: [
        {
          title: 'Pausa elegante',
          summary: 'Un patio así hace de bisagra perfecta entre lo monumental y lo urbano.',
          bullets: [
            'No hace falta alargarlo: la gracia está en la atmósfera, no en exprimirlo.',
            'Muy buena parada para respirar antes del cierre de tarde-noche.',
          ],
        },
      ],
      links: [
        {
          label: 'Web Somerset House',
          href: 'https://www.somersethouse.org.uk/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/4/45/The_courtyard_of_Somerset_House%2C_Strand%2C_London_-_geograph.org.uk_-_1601172.jpg',
      imageAlt: 'Somerset House Courtyard',
    },
    {
      time: '17:45-19:30',
      title: "Covent Garden + Neal's Yard + cena",
      area: 'Covent Garden',
      narrative:
        'La tarde se cierra con vida de plaza, artistas callejeros, patios comerciales y un rincón con color como Neal’s Yard. Es un final urbano redondo: activo, bonito y sin exigir una última gran paliza física.',
      details: [
        'Covent Garden nació como mercado de frutas y verduras.',
        "Neal's Yard aporta color y un pequeño desvío con mucha personalidad.",
      ],
      supportCards: [
        {
          title: 'Microrecorrido final',
          summary: 'Aquí funciona muy bien dejarse llevar con una estructura mínima.',
          bullets: [
            'Plaza principal de Covent Garden para el ambiente y los artistas.',
            'Desvío breve a Neal\'s Yard para el toque de color y sorpresa.',
            'Cena sin complicarse demasiado: el día ya está ganado.',
          ],
        },
      ],
      links: [
        {
          label: 'Web Covent Garden',
          href: 'https://www.coventgarden.london/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Covent_Garden_Interior_May_2006_crop.jpg/1280px-Covent_Garden_Interior_May_2006_crop.jpg',
      imageAlt: 'Covent Garden',
    },
  ],
};
