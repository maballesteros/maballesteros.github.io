import type { DayPlan } from './types';
import { docsBase } from './shared';

export const day2: DayPlan = {
  id: 'day2',
  label: 'Día 2',
  subtitle: 'Westminster + río + Tower + Soho',
  date: 'Sábado 25/07',
  theme: 'Londres monumental clásico',
  summary:
    'El sábado exprime los iconos mayores de Londres con una lógica de cercanía impecable: abadía, guardias, palacio, río, fortaleza, puente y cierre en el West End.',
  highlight:
    'Es el día más gran capital europea del viaje y el que reúne más postales potentes en menos distancia mental.',
  fixed: ['No hay ticket cerrado, pero Westminster Abbey debería reservarse.'],
  stops: [
    {
      time: '08:30-09:00',
      title: 'Desayuno y salida suave',
      area: 'Kennington',
      narrative:
        'El sábado arranca sin prisas y con una idea muy clara: este es el gran día monumental del viaje, así que interesa salir bien desayunados y con el grupo descansado. Londres hoy no se visita a trompicones; se encadena con lógica, casi como si una parada fuera empujando a la siguiente.',
      details: [
        'La gracia del día está en cómo se enlazan los iconos por cercanía y no en correr entre ellos.',
      ],
      supportCards: [
        {
          title: 'Ritmo del día',
          summary: 'Conviene pensar el sábado como una secuencia larga y muy visual.',
          bullets: [
            'Llevar agua, batería y algo de snack evita que el día se rompa a media tarde.',
            'La mañana concentra la mayor densidad monumental; la noche es más ambiente que monumento.',
            'Si hay que recortar algo por cansancio, mejor tocar City tardía que Westminster o Tower Bridge.',
          ],
        },
      ],
    },
    {
      time: '09:30-10:40',
      title: 'Westminster Abbey (por dentro)',
      area: 'Westminster',
      narrative:
        'Entráis en uno de los lugares más simbólicos del Reino Unido: coronaciones, bodas reales y sepulturas de figuras clave de la historia británica. Empezar aquí le da al día un peso cultural enorme desde el minuto uno y hace que todo lo demás se lea con más contexto.',
      details: [
        'Aquí se coronan los monarcas ingleses desde 1066.',
        'También descansan Newton, Darwin o Dickens.',
      ],
      supportCards: [
        {
          title: 'Claves para entrar bien',
          summary: 'La abadía merece visita con foco, no en modo museo infinito.',
          bullets: [
            'Reservar franja previa para no depender de colas del sábado.',
            'Núcleo que no debería faltar: nave, Coronation Chair si está accesible y Poets\' Corner.',
            'Mejor salir con energía que agotar el día en la primera gran visita.',
          ],
        },
      ],
      links: [
        {
          label: 'Web Westminster Abbey',
          href: 'https://www.westminster-abbey.org/visit-us/opening-times',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/8/84/Westminster_Abbey_West_Front_Facade_by_Nicholas_Hawkmoor%2C_London.jpg',
      imageAlt: 'Westminster Abbey',
    },
    {
      time: '10:40-11:00',
      title: 'Paseo a Horse Guards',
      area: 'Whitehall',
      narrative:
        'Whitehall es una transición perfecta entre patrimonio y ceremonia. Es un eje cargado de poder político británico, edificios oficiales y memoria histórica, y os va colocando de manera natural en el Londres institucional más reconocible.',
      details: [
        'Es un tramo corto, elegante y muy bien conectado con Horse Guards.',
        'Caminarlo ayuda a entender que Westminster no es solo postal: también es centro de gobierno real y político.',
      ],
      supportCards: [
        {
          title: 'Qué contar mientras camináis',
          summary: 'Este paseo funciona mejor si se lee como corredor del poder británico.',
          bullets: [
            'Whitehall concentra ministerios, memoriales y la cercanía al 10 de Downing Street.',
            'Es buen tramo para bajar un poco el ritmo tras la abadía sin perder interés.',
          ],
        },
      ],
    },
    {
      time: '11:00-11:20',
      title: "Horse Guards (King's Life Guard)",
      area: 'Horse Guards Parade',
      narrative:
        'Aquí entráis en la liturgia londinense de uniforme, caballo y tradición. Aunque a primera vista parezca un show, sigue siendo guardia ceremonial real, y precisamente por eso el conjunto funciona tan bien: protocolo auténtico con estética de postal.',
      details: [
        'Servicio ceremonial real, no simple recreación para turistas.',
        'Bloque corto, muy fotogénico y con encanto familiar claro.',
      ],
      supportCards: [
        {
          title: 'Foto y ceremonia',
          summary: 'Es una parada corta: conviene mirar bien y no dispersarse.',
          bullets: [
            'Hora de referencia útil: 11:00 para el King\'s Life Guard.',
            'Mejor colocarse con unos minutos de margen para ver caballos, uniforme y fondo arquitectónico.',
            'A los peques suele gustar porque combina animal, ritual y colorido en muy poco tiempo.',
          ],
        },
      ],
      links: [
        {
          label: 'Horario Horse Guards',
          href: 'https://www.army.mod.uk/events/changing-of-the-guard/',
          external: true,
        },
      ],
      image: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Horse_Guards_2011.jpg',
      imageAlt: 'Horse Guards',
    },
    {
      time: '11:20-11:50',
      title: "St James's Park + Buckingham Palace (exterior)",
      area: "St James's Park / Buckingham",
      narrative:
        'Desde Horse Guards avanzáis por el parque más elegante del centro hasta plantaros frente a Buckingham. La gracia no está solo en tachar el palacio, sino en disfrutar el eje entero: parque, lago, memorial y fachada real.',
      details: [
        'Buckingham fue primero casa aristocrática y luego residencia oficial del monarca.',
        'La bandera sobre el palacio indica si el rey está en residencia.',
      ],
      supportCards: [
        {
          title: 'Qué mirar aquí',
          summary: 'Este tramo luce más si no se reduce solo a una foto del palacio.',
          bullets: [
            'St James\'s Park aporta la entrada elegante y relajada al eje real.',
            'Victoria Memorial da mucha profundidad visual al frente de Buckingham.',
            'No hace falta alargarlo mucho: es una parada de fachada y atmósfera, no de visita interior.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8d/Buckingham_Palace_London_Morning_2020_01_%28cropped%29.jpg/1280px-Buckingham_Palace_London_Morning_2020_01_%28cropped%29.jpg',
      imageAlt: 'Buckingham Palace',
    },
    {
      time: '11:50-12:10',
      title: 'Whitehall + Big Ben (exterior)',
      area: 'Whitehall / Westminster',
      narrative:
        'La secuencia monumental se remata con la gran postal política de Londres. Volver a Big Ben de día, ya sin el cansancio del viaje, os permite disfrutar mejor la escala del conjunto y fijar uno de los grandes símbolos del viaje.',
      details: [
        'Big Ben es la campana; la torre se llama Elizabeth Tower.',
        'Parliament Square condensa arquitectura, poder y relato histórico en muy pocos metros.',
      ],
      supportCards: [
        {
          title: 'Postal política',
          summary: 'Parada corta de altísimo rendimiento visual y simbólico.',
          bullets: [
            'Muy buen momento para foto familiar con Parlamento y torre completos.',
            'Es uno de esos puntos donde explicar una curiosidad simple mejora mucho el recuerdo.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/f/f7/Big_Ben_Elizabeth_Tower_London_2023_01.jpg',
      imageAlt: 'Big Ben y Parliament',
    },
    {
      time: '12:20-13:00',
      title: 'Travesía por el Támesis hacia Tower Pier',
      area: 'Westminster -> Tower Pier',
      narrative:
        'Londres desde el agua cambia la lectura de la ciudad. Lo que a pie son barrios separados, desde el río se convierte en una sucesión coherente de puentes, siluetas y frentes urbanos. Es una de las mejores transiciones del viaje porque orienta, descansa y sigue siendo muy turística.',
      details: [
        'El Támesis fue durante siglos la gran autopista comercial de Londres.',
        'Ideal para orientarse visualmente para los siguientes días.',
      ],
      supportCards: [
        {
          title: 'Embarque y plan B',
          summary: 'Conviene llevar este tramo muy resuelto para no perder la inercia del día.',
          bullets: [
            'Embarque con margen y buscando sitio con buena vista al salir de Westminster.',
            'Si hubiese mucha cola o incidencia, plan B limpio: metro hasta Tower Hill sin tocar el resto del día.',
            'En el barco interesa mirar más que hacer mil fotos: ayuda mucho a ordenar mentalmente Londres.',
          ],
        },
      ],
      links: [
        {
          label: 'Opciones de river cruise',
          href: 'https://www.citycruises.com/london-thames-river-cruises/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/4/4b/Thames_Clippers_Uber_Boat_Aurora_Clipper_River_Thames_London_England.jpg',
      imageAlt: 'Barco en el Támesis',
    },
    {
      time: '13:00-13:35',
      title: 'Torre de Londres (exterior)',
      area: 'Tower Hill',
      narrative:
        'Aquí aparece la Londres medieval con toda su densidad histórica. Aunque no entréis, el perímetro, la relación con el río y la potencia visual de la fortaleza ya justifican de sobra la parada.',
      details: [
        'La Torre de Londres fue fortaleza, prisión, palacio y arsenal.',
        'Las Joyas de la Corona se custodian allí.',
      ],
      supportCards: [
        {
          title: 'Cómo leer la fortaleza',
          summary: 'No hace falta entrar para notar el peso histórico del lugar.',
          bullets: [
            'Miradla como pieza de control del río y de acceso a la ciudad medieval.',
            'Funciona muy bien hacer foto amplia antes de acercarse al perímetro.',
          ],
        },
      ],
      links: [
        {
          label: 'Web Tower of London',
          href: 'https://www.hrp.org.uk/tower-of-london/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/Tower_of_London_from_the_Shard_%288515883950%29.jpg/1280px-Tower_of_London_from_the_Shard_%288515883950%29.jpg',
      imageAlt: 'Tower of London',
    },
    {
      time: '13:35-14:15',
      title: 'Almuerzo en zona Tower Hill',
      area: 'Tower Hill',
      narrative:
        'Parada funcional, pero muy importante para sostener el día. Aquí interesa resolver bien hambre e hidratación porque la tarde sigue fuerte y la experiencia empeora mucho si este bloque se improvisa mal.',
      details: ['Es una buena zona para comer sin romper la lógica del recorrido.'],
      supportCards: [
        {
          title: 'Comida con criterio',
          summary: 'Este bloque tiene menos épica, pero mucho impacto en cómo se vive la tarde.',
          bullets: [
            'Mejor comida rápida y clara que sentarse demasiado tiempo y romper el ritmo.',
            'El objetivo es salir de aquí con energía para puente, City y cierre en Soho.',
          ],
        },
      ],
    },
    {
      time: '14:15-15:45',
      title: 'Tower Bridge',
      area: 'Tower Bridge',
      narrative:
        'Luego llega el puente más icónico de Londres, que funciona incluso sin entrar. Cruzarlo a pie os da estructura, río, skyline y uno de los mejores paisajes urbanos del viaje.',
      details: [
        'Se inauguró en 1894 para no frenar el paso de barcos altos hacia el puerto interior.',
        'Versión rápida: cruce y fotos. Versión premium: pasarelas altas y suelo de cristal.',
      ],
      supportCards: [
        {
          title: 'Dos maneras de vivirlo',
          summary: 'El puente ya compensa mucho por fuera; entrar es un extra, no una obligación.',
          bullets: [
            'Exterior: puente, entorno, vistas al río y skyline del este.',
            'Interior opcional: pasarelas altas y exposición del mecanismo si os apetece subir nivel.',
            'Es una de las mejores postales familiares del viaje, así que merece algo de tiempo real.',
          ],
        },
      ],
      links: [
        {
          label: 'Web Tower Bridge',
          href: 'https://www.towerbridge.org.uk/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Tower_Bridge_at_Dawn.jpg/1280px-Tower_Bridge_at_Dawn.jpg',
      imageAlt: 'Tower Bridge',
    },
    {
      time: '15:45-16:20',
      title: 'St Dunstan in the East',
      area: 'City of London',
      narrative:
        'La tarde cambia de escala: de iconos gigantes a una joya escondida. St Dunstan es una de esas paradas que suelen sorprender más de lo esperado porque mezcla ruina, jardín y memoria de guerra en un rincón muy fotogénico.',
      details: [
        'La iglesia quedó gravemente dañada en el Blitz y se conservó como jardín público.',
        'Es un buen ejemplo de cómo Londres convierte heridas históricas en espacios vivos.',
      ],
      supportCards: [
        {
          title: 'Rincón secreto',
          summary: 'Es una parada pequeña, pero con mucha capacidad de sorpresa.',
          bullets: [
            'Funciona mejor como pausa contemplativa que como visita larga.',
            'Muy buen lugar para notar el contraste entre historia dura y belleza tranquila.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/St_Dunstan-in-the-East.jpg/960px-St_Dunstan-in-the-East.jpg',
      imageAlt: 'St Dunstan in the East',
    },
    {
      time: '16:20-16:50',
      title: 'Leadenhall Market',
      area: 'City of London',
      narrative:
        'Leadenhall aporta el Londres victoriano cubierto: hierro, cristal, color y un ambiente elegante que cambia por completo la textura del día. Es un premio visual muy alto con esfuerzo muy bajo.',
      details: [
        'Existe desde época medieval y su versión actual del siglo XIX es una joya comercial victoriana.',
      ],
      supportCards: [
        {
          title: 'Victoria bajo techo',
          summary: 'Bloque corto, cómodo y con recompensa estética inmediata.',
          bullets: [
            'Ideal si el grupo necesita bajar pulsaciones sin dejar de ver algo muy londinense.',
            'Muy buena parada para fotos con hierro, cristal y color sin exposición larga al clima.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Leadenhall_Market_In_London_-_Feb_2006_rotated.jpg/1280px-Leadenhall_Market_In_London_-_Feb_2006_rotated.jpg',
      imageAlt: 'Leadenhall Market',
    },
    {
      time: '17:15-18:00',
      title: 'Traslado a Piccadilly Circus',
      area: 'City -> West End',
      narrative:
        'Este movimiento está pensado para que el día no termine en zona de oficinas, sino en el Londres más vivo y reconocible de tarde-noche. Es un traslado con intención: cambiar de registro sin romper el ritmo.',
      details: [
        'Después de la City, el salto al West End da un cierre mucho más festivo y familiar.',
      ],
      supportCards: [
        {
          title: 'Decisión de energía',
          summary: 'Este es el punto donde se nota si el grupo quiere remate urbano fuerte o cierre más corto.',
          bullets: [
            'Si vais justos de batería, basta con Piccadilly y cena temprana.',
            'Si vais bien, Soho compensa muchísimo como cierre de contraste.',
          ],
        },
      ],
    },
    {
      time: '18:00-19:30',
      title: 'Piccadilly + Soho (paseo y cena)',
      area: 'West End',
      narrative:
        'El cierre urbano perfecto para el sábado: neones, cruce icónico, tiendas, energía de tarde-noche y cena en uno de los barrios más vivos y multiculturales de Londres. Después de la parte monumental, esta parada enseña que Londres también es pulso, mezcla y noche amable.',
      details: ['Soho pasó de barrio aristocrático a zona bohemia y gastronómica.'],
      supportCards: [
        {
          title: 'Cierre del sábado',
          summary: 'Aquí la misión ya no es aprender historia, sino saborear ciudad viva.',
          bullets: [
            'Piccadilly da el golpe visual; Soho aporta ambiente, mezcla y buena cena.',
            'Muy buen lugar para terminar sin meter un último monumento forzado.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg/1280px-Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg',
      imageAlt: 'Piccadilly Circus al anochecer',
    },
  ],
};
