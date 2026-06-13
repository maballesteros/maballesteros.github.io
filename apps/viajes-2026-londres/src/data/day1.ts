import type { DayPlan } from './types';

export const day1: DayPlan = {
  id: 'day1',
  label: 'Día 1',
  subtitle: 'Aterrizaje + South Bank + London Eye',
  date: 'Viernes 24/07',
  theme: 'Aterrizaje elegante y primer wow visual',
  summary:
    'El primer día está diseñado para entrar en Londres sin desgaste: llegar, instalarse y abrir el viaje con una tarde de río, Parlamento, South Bank y London Eye.',
  highlight:
    'La tarde no intenta hacer mucho; intenta que el viaje empiece con una primera lectura de Londres: poder político junto al río, reconstrucción urbana de posguerra y el icono moderno del milenio.',
  fixed: [
    'Vuelo ida W9 5368',
    'Transfer privado desde LTN a las 12:20',
    'Check-in del apartamento desde las 14:00',
    'London Eye a las 20:00',
  ],
  stops: [
    {
      time: '10:30-11:30',
      title: 'Vuelo',
      area: 'VLC -> LTN',
      narrative:
        'El viaje arranca de verdad aquí: vuelo W9 5368, ya con el último cambio horario de Wizz incorporado. Salida a las 10:30, llegada prevista a Luton a las 11:30 y primer cambio de chip a modo Londres. Es buen momento para venderles a los peques la idea del día: hoy no toca correr, toca aterrizar en una ciudad que se entiende muy bien desde el río.',
      details: [
        'Buen momento para repasar con los peques el plan visual de la tarde: río, Big Ben, luces y London Eye.',
        'Llegar con esa película mental hace que el primer paseo se viva con más ilusión.',
      ],
      reservation: 'W9 5368 · salida 10:30 · llegada prevista 11:30',
      supportCards: [
        {
          title: 'Referencia de vuelo',
          summary: 'El dato operativo clave de esta primera franja.',
          bullets: [
            'Vuelo W9 5368, VLC -> LTN.',
            'Conviene llevar pasaportes y ETA muy a mano al aterrizar.',
            'Si el vuelo se retrasa, la prioridad operativa pasa inmediatamente al transfer.',
          ],
        },
      ],
    },
    {
      time: '11:30-12:20',
      title: 'Llegada + control + equipaje',
      area: 'LTN',
      narrative:
        'Aquí toca el bloque práctico: pasaportes, cintas de equipaje y salida por llegadas con todo el grupo coordinado. No es una parada histórica, pero sí marca el tono del viaje: Londres funciona mejor cuando las transiciones se hacen con calma. La clave de esta franja no es avanzar rápido, sino proteger la energía del día 1 para que el paseo posterior se sienta ligero y no como una continuación del aeropuerto.',
      details: [
        'Si alguna fase se atasca, aviso rápido al transfer y fuera presión.',
        'Cuanto menos desgaste metáis aquí, más mágico se siente luego South Bank.',
      ],
      supportCards: [
        {
          title: 'Protocolo rápido LTN',
          summary: 'La secuencia mínima para no perder control en llegadas.',
          bullets: [
            'Pasaportes, equipaje y salida por llegadas sin dispersarse.',
            'Al recuperar datos/WiFi, revisar si hay mensaje del conductor.',
            'El transfer de las 12:20 sigue bien encajado porque Limowide confirmó seguimiento de vuelo y 60 min de espera gratuita.',
          ],
        },
      ],
    },
    {
      time: '12:20',
      title: 'Recogida transfer privado en LTN',
      area: 'Llegadas LTN',
      narrative:
        'Punto de encuentro en llegadas con cartel del titular. Tenéis 60 minutos de espera incluida desde aterrizaje, así que el plan ya nace con colchón para retrasos normales. Esta decisión no es glamurosa, pero sí muy londinense en el buen sentido: quitar fricción para poder mirar la ciudad cuando toca mirarla.',
      details: [
        'Evita correr y os permite entrar a Londres por la puerta grande, sin fricción.',
        'Prioridad absoluta si hay incidencia: avisar al transfer.',
      ],
      reservation: 'Transfer privado reservado · recogida 12:20',
      supportCards: [
        {
          title: 'Incidencias transfer LTN',
          summary: 'Qué hacer si no aparece el conductor o el aeropuerto se atasca.',
          bullets: [
            'Buscar cartel del titular al salir por llegadas.',
            'Si no aparece en 5-10 min: usar los teléfonos guardados en la carpeta privada del viaje.',
            'Si no se resuelve: activar plan B desde la guía privada de llegada.',
            'Plan B inmediato: coach a Victoria + taxi al apartamento.',
          ],
        },
      ],
    },
    {
      time: '13:30-14:15',
      title: 'Llegada estimada a Kennington',
      area: 'Kennington',
      narrative:
        'Con tráfico variable, lo razonable es llegar cerca de la ventana de check-in. Kennington queda al sur del Támesis, en esa Londres menos monumental donde la ciudad se vuelve más residencial y cotidiana. Tiene sentido como base precisamente por eso: está cerca del gran escenario turístico, pero os permite dormir fuera del ruido.',
      details: [
        'Kennington funciona muy bien como base por equilibrio entre centralidad y descanso.',
        'El sur del río ayuda a entender que Londres no es solo Westminster y la City: también son barrios vividos, calles residenciales y transporte muy práctico.',
      ],
      supportCards: [
        {
          title: 'Base del viaje',
          summary: 'El piso ya os deja bien colocados para el resto de Londres.',
          bullets: [
            'Base en Kennington, bien colocada para entrar al centro.',
            'Check-in previsto desde las 14:00.',
            'Buena ubicación para moverse rápido al centro sin vivir en el ruido del centro.',
          ],
        },
      ],
    },
    {
      time: '14:00-16:30',
      title: 'Check-in + descanso + compra mínima',
      area: 'Apartamento en Kennington',
      narrative:
        'Este bloque compra tranquilidad real para todo el viaje. Instalación ordenada, revisión básica del apartamento y compra mínima resuelta para no volver tarde con tareas pendientes. Tiene menos glamour que el resto, pero funciona como hacían las antiguas posadas de viaje: se crea base, se reparten recursos y se sale a explorar con la retaguardia controlada.',
      details: [
        'Compra mínima para la noche de llegada y el desayuno del día 2.',
        'Pequeño descanso para bajar del modo aeropuerto al modo viaje.',
      ],
      supportCards: [
        {
          title: 'Compra mínima útil',
          summary: 'Pequeñas cosas que compran mucha tranquilidad el resto del viaje.',
          bullets: [
            'Desayuno del día 2 resuelto antes de salir por la tarde.',
            'Cena ligera o recurso rápido para no depender del regreso nocturno.',
            'Agua, snacks y cualquier básico de peques antes del bloque del Eye.',
          ],
        },
      ],
    },
    {
      time: '16:30-16:50',
      title: 'Salimos de Kennington hacia Waterloo',
      area: 'Kennington / Northern line / Waterloo',
      narrative:
        'Subís a la Northern line y en pocos minutos estáis en Waterloo. El nombre ya trae historia: recuerda la victoria británica y aliada sobre Napoleón en 1815, y la estación acabó siendo una de las grandes puertas ferroviarias de Londres. Al salir a superficie y buscar el río se produce ese click del primer día: dejáis atrás el barrio y aparecéis de golpe en el gran escenario visual de la ciudad.',
      details: [
        'Waterloo es una entrada magnífica porque os deja a un paseo del Támesis y del eje Westminster / South Bank.',
        'El propio nombre Waterloo permite contar una microhistoria: Londres está lleno de lugares donde la geografía urbana recuerda victorias, imperio, ferrocarril y memoria nacional.',
      ],
      supportCards: [
        {
          title: 'Movimiento inteligente',
          summary: 'Un tramo corto para transformar logística en Londres de postal.',
          bullets: [
            'El valor aquí no está en el transporte, sino en lo bien que os deja colocados para la tarde.',
            'Si vais cansados, esta ruta protege el día porque evita enlaces raros y decisiones de última hora.',
          ],
        },
      ],
    },
    {
      time: '16:50-17:20',
      title: 'Westminster Bridge + Big Ben (exterior)',
      area: 'Westminster',
      narrative:
        'Ahora sí: la primera gran postal del viaje, pero con historia dentro. El Parlamento que veis es heredero del viejo palacio medieval de Westminster, destruido casi por completo por el gran incendio de 1834 y reconstruido después como ese decorado neogótico inmenso que hoy parece “Londres de siempre”. Big Ben, además, no es la torre: es la gran campana. La torre se llama Elizabeth Tower desde 2012.',
      details: [
        'La torre del reloj se completó en 1859, dentro de la gran reconstrucción victoriana del Parlamento.',
        'El conjunto funciona como símbolo democrático, pero también como una pieza teatral: Londres convirtió un incendio enorme en una fachada política reconocible en todo el mundo.',
      ],
      supportCards: [
        {
          title: 'Historieta para contar',
          summary: 'La foto gana mucho si se mira como reconstrucción, no solo como postal.',
          bullets: [
            'Big Ben es la campana; la torre es Elizabeth Tower.',
            'El Parlamento actual nació tras el incendio de 1834.',
            'El estilo neogótico no es medieval puro: es una reconstrucción victoriana pensada para parecer solemne, antigua y nacional.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/41/Westminster_Bridge_and_Big_Ben_in_London.jpg/1280px-Westminster_Bridge_and_Big_Ben_in_London.jpg',
      imageAlt: 'Westminster Bridge y Big Ben',
    },
    {
      time: '17:20-17:45',
      title: 'Paseo por South Bank',
      area: 'South Bank / County Hall / Jubilee Gardens',
      narrative:
        'Al cruzar a South Bank, Londres cambia de tono: menos institución, más paseo, más vida. Esta ribera no siempre fue el paseo cultural amable de hoy; durante mucho tiempo tuvo almacenes, industria ligera y una relación mucho más dura con el río. El gran giro simbólico llegó con el Festival of Britain de 1951, cuando el país quiso sacudirse la austeridad de posguerra y mostrar ciencia, diseño, arquitectura y optimismo moderno justo aquí, en la ribera sur.',
      details: [
        'South Bank pasó de frente industrial a uno de los paseos culturales más queridos de la ciudad.',
        'La zona permite contar una idea bonita: Londres no solo conserva historia, también reutiliza heridas, muelles y espacios industriales para convertirlos en cultura pública.',
      ],
      supportCards: [
        {
          title: 'Qué contar aquí',
          summary: 'South Bank es la historia de una ribera que dejó de ser trasera industrial para convertirse en fachada cultural.',
          bullets: [
            'En 1951 el Festival of Britain usó esta zona como escaparate de modernidad tras la guerra.',
            'El contraste con Westminster es perfecto: al otro lado, poder antiguo; aquí, cultura urbana y paseo ciudadano.',
            'Muy buen tramo para entrar en el viaje sin cansaros demasiado.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/London_Eye_Sunset.jpg/1280px-London_Eye_Sunset.jpg',
      imageAlt: 'South Bank y London Eye al atardecer',
    },
    {
      time: '17:45-18:10',
      title: 'Parada corta para recargar',
      area: 'South Bank',
      narrative:
        'La pausa estratégica del primer día. Bebida, snack y baño sin alejaros de la zona del Eye. Parece un detalle menor, pero también es una forma de viajar bien: el Londres de ribera se disfruta más sentado unos minutos, viendo pasar gente, barcos y luces, que intentando encadenar monumentos sin respirar.',
      details: [
        'En viajes familiares, este tipo de pausa marca mucha diferencia en cómo se vive la noche.',
        'El Támesis ha sido durante siglos vía comercial, frontera mental y escenario ceremonial; incluso una pausa junto al río cuenta ciudad.',
      ],
      supportCards: [
        {
          title: 'Pausa con intención',
          summary: 'Esta media hora compra energía para el bloque fuerte de la noche.',
          bullets: [
            'Bebida, baño y snack sin alejaros del Eye.',
            'Es mejor esta pausa que llegar al London Eye con el grupo ya cansado.',
          ],
        },
      ],
    },
    {
      time: '18:10-18:30',
      title: 'Cierre del paseo y reconocimiento del acceso al Eye',
      area: 'South Bank',
      narrative:
        'Últimas fotos de ribera, revisión tranquila de tickets y reconocimiento visual de por dónde entrar luego. Es un bloque pequeño, pero muy inteligente: os deja colocados para volver al Eye sin improvisaciones. Además, ayuda a mirar la rueda como algo más que atracción: fue uno de los grandes proyectos del cambio de milenio, pensado para darle a Londres un nuevo punto de vista sobre sí misma.',
      details: [
        'El primer día no se gana haciendo más cosas, sino quitándole fricción al momento fuerte.',
        'Ver con calma el acceso os permite volver a las 19:15-19:30 sin incertidumbre.',
      ],
      supportCards: [
        {
          title: 'Acceso al Eye',
          summary: 'Llegar con el acceso ubicado hace toda la noche mucho más fácil.',
          bullets: [
            'Conviene revisar tickets y detectar claramente por dónde entrar.',
            'A estas horas la misión ya no es ver más, sino dejar el bloque del Eye limpísimo.',
          ],
        },
      ],
    },
    {
      time: '19:15-19:30',
      title: 'Llegada al London Eye',
      area: 'Ribera del Támesis',
      narrative:
        'Llegar con margen aquí cambia totalmente la experiencia. No es lo mismo correr hacia una cola que entrar ya con el río, Westminster y la luz de la tarde colocados a vuestro favor. Antes de subir, mirad su estructura: no es una noria tradicional apoyada por los dos lados, sino una gran rueda en voladizo, sostenida desde un lado como si se asomara al Támesis.',
      details: [
        'La hora del ticket corresponde a la entrada a cola, no al embarque inmediato.',
        'Estos minutos de margen convierten una logística tensa en una espera disfrutona.',
        'Fue concebida por Marks Barfield Architects y lanzada en el año 2000 como icono de modernidad.',
      ],
      supportCards: [
        {
          title: 'Mini tip operativo',
          summary: 'El margen aquí no es lujo; es calidad de experiencia.',
          bullets: [
            'La hora del ticket es acceso a cola, no subida directa.',
            'Llegar así evita tensión y deja disfrutar el entorno antes de entrar.',
          ],
        },
      ],
    },
    {
      time: '20:00',
      title: 'London Eye (fijo)',
      area: 'Ribera del Támesis',
      narrative:
        'El primer gran wow del viaje. El London Eye no solo impresiona: os da mapa mental real de la ciudad. Fue pensado inicialmente con permiso temporal, como muchos proyectos del milenio, pero gustó tanto que acabó quedándose. Desde arriba se entiende muy bien Londres como capas: Westminster y el poder político, el río como columna vertebral, la City más antigua y los rascacielos que llegaron después.',
      reservation: 'Entrada reservada para las 20:00',
      details: [
        'La hora del ticket corresponde a la cola, no al embarque directo.',
        'Se inauguró en 2000 como atracción del milenio y terminó quedándose como icono estable de la ciudad.',
        'Mide 135 metros y se convirtió en una de las grandes imágenes del Londres moderno.',
        'La lectura panorámica ayuda mucho a entender el resto del viaje.',
      ],
      supportCards: [
        {
          title: 'Por qué importa',
          summary: 'No es solo una atracción: es el símbolo de cómo Londres quiso presentarse al siglo XXI.',
          bullets: [
            'Reserva cerrada para las 20:00.',
            'Desde arriba ganáis mapa mental real de Westminster, el río y parte del skyline.',
            'Curiosidad: nació con vocación temporal, pero la ciudad lo adoptó.',
            'Muy buena primera gran experiencia porque mezcla emoción, ingeniería y orientación.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d6/London-Eye-2009.JPG/1280px-London-Eye-2009.JPG',
      imageAlt: 'London Eye al atardecer',
    },
    {
      time: '21:00-22:00',
      title: 'Cena y regreso',
      area: 'South Bank o Kennington',
      narrative:
        'El cierre ideal del primer día no es un sprint final, sino una cena tranquila y la sensación de haber inaugurado el viaje con los grandes iconos ya vividos. Si aún hay batería, las luces del río rematan muy bien la noche; si no, volver pronto es una decisión inteligente. El objetivo no es tachar más Londres, sino dormir con una primera historia clara: Parlamento reconstruido, South Bank reinventado y London Eye convertido en icono moderno.',
      details: [
        'Objetivo emocional del día: acostarse con el viaje ya inaugurado y energía guardada para el sábado.',
        'Buen resumen para los peques: hoy habéis visto tres Londres a la vez, el político, el cultural y el moderno.',
      ],
      supportCards: [
        {
          title: 'Criterio para cerrar bien',
          summary: 'El mejor final del Día 1 es el que protege el sábado.',
          bullets: [
            'Si aún hay ganas, paseo corto con luces en el río.',
            'Si no, volver pronto es una buena decisión, no una derrota.',
          ],
        },
      ],
    },
  ],
};
