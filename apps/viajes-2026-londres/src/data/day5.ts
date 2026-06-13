import type { DayPlan } from './types';

export const day5: DayPlan = {
  id: 'day5',
  label: 'Día 5',
  subtitle: 'Última mañana + Heathrow',
  date: 'Martes 28/07',
  theme: 'Cierre limpio y sin estrés',
  summary:
    'El último día gira alrededor del transfer privado desde el apartamento a las 12:10, pero permite una última mañana compacta en Southwark: mercado, catedral, antiguo muelle y skyline moderno.',
  highlight:
    'Todo el diseño del día busca llegar a Heathrow con control total y aun así regalar una despedida con mucha historia: comida, teatro, comercio fluvial, piedra medieval y rascacielos.',
  fixed: [
    'Check-out formal a las 10:00',
    'Transfer privado Mobio a las 12:10',
    'El propietario permite dejar maletas con los cleaners hasta la hora del transfer',
    'Vuelo BA408 a las 16:10 como hora base',
  ],
  stops: [
    {
      time: '09:20-09:35',
      title: 'Pre-cierre del apartamento + salida ligera',
      area: 'Apartamento',
      narrative:
        'Antes de regalaros la última mañana compacta, conviene dejar el apartamento casi cerrado: maletas agrupadas, documentación controlada y solo lo necesario encima. Formalmente el check-out es a las 10:00, pero el propietario ya ha aceptado que podáis dejar el equipaje mientras pasan los cleaners y salir hasta la hora del transfer. La idea es muy simple: la última historia de Londres solo se disfruta si la salida está domesticada.',
      details: [
        'La flexibilidad confirmada convierte la última mañana en un cierre elegante y no en un trámite incómodo.',
        'El turismo de esta mañana solo funciona si a la vuelta queda recoger y cerrar, no rehacer maletas.',
      ],
      supportCards: [
        {
          title: 'Maletas con el propietario',
          summary: 'Respuesta operativa ya confirmada por el propietario.',
          bullets: [
            'Podéis dejar equipaje en la propiedad con los cleaners hasta la hora del transfer.',
            'Los detalles exactos de entrada llegarán por email unos días antes.',
            'Sigue siendo buena práctica volver con margen para recoger maletas y cerrar tranquilos.',
          ],
        },
      ],
    },
    {
      time: '09:35-10:00',
      title: 'Kennington -> Borough',
      area: 'Kennington / Borough',
      narrative:
        'La mañana compacta se piensa al revés de lo habitual: no para ver mucho, sino para regalaros una última pincelada bonita de Londres sin poner en riesgo el transfer. Salir ligeros y llegar pronto a Borough tiene mucho sentido: Southwark, al sur del río, fue durante siglos el “otro lado” de la City, con mercados, posadas, teatros, iglesias y muelles.',
      details: ['Si el tiempo aprieta, este es el tramo que hay que proteger para que el resto siga teniendo sentido.'],
      supportCards: [
        {
          title: 'Lógica de la mañana',
          summary: 'No es una mañana de checklist; es una mañana de despedida compacta.',
          bullets: [
            'Primero debería caer Hay\'s / Shard si hay que recortar.',
            'La vuelta al apartamento no puede comprimirse demasiado porque protege el transfer.',
          ],
        },
      ],
    },
    {
      time: '10:00-10:35',
      title: 'Borough Market',
      area: 'Borough',
      narrative:
        'La última mañana no va de apurar, sino de regalaros una despedida con sabor. Borough Market funciona muy bien porque no es un mercado inventado para turistas: la zona aparece ligada al comercio desde época medieval, junto al viejo London Bridge y a las rutas que entraban a la City. Durante siglos, Southwark fue lugar de paso, comida, ruido, animales, carros y comercio. Hoy queda convertido en mercado gourmet, pero bajo el café y los puestos sigue latiendo esa historia de abastecer Londres.',
      details: [
        'Borough Market reivindica una historia que arranca al menos en la Edad Media y suele asociarse a 1014 como referencia simbólica.',
        'Su posición junto a London Bridge lo convirtió en un punto natural para vender comida a quienes entraban y salían de la City.',
        'Buen cierre sensorial: Londres también se recuerda por olores, pan, fruta, café y voces de mercado.',
      ],
      supportCards: [
        {
          title: 'Qué hacer aquí',
          summary: 'Este bloque funciona mejor si se vive ligero y con historia de mercado.',
          bullets: [
            'Desayuno tardío, café o picoteo rápido antes de seguir.',
            'No conviene convertirlo en comida larga: el valor está en el ambiente, no en quedarse mucho tiempo.',
            'Idea para los peques: antes de supermercados, una ciudad comía gracias a lugares como este.',
          ],
        },
      ],
      links: [
        {
          label: 'Web Borough Market',
          href: 'https://boroughmarket.org.uk/visit-us/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/London_2018_March_IMG_0663.jpg/1280px-London_2018_March_IMG_0663.jpg',
      imageAlt: 'Borough Market',
    },
    {
      time: '10:35-10:50',
      title: 'Southwark Cathedral',
      area: 'Southwark',
      narrative:
        'Después del mercado, la catedral introduce un contraste sereno y muy londinense: piedra, silencio, historia y el recuerdo del viejo Southwark comercial y teatral al sur del río. Southwark Cathedral se levanta junto al antiguo punto de cruce hacia la City; su historia escrita llega al Domesday Book de 1086 y tuvo vida como priorato medieval. Además, conecta con el Londres de Shakespeare: su hermano Edmund está enterrado allí, y el barrio estaba muy ligado a los teatros del Bankside isabelino.',
      details: [
        'Es una de las iglesias góticas más antiguas de Londres.',
        'Su historia está ligada al viejo Southwark de comercio, tabernas y teatros.',
        'John Gower, poeta amigo de Chaucer, tiene allí una tumba importante.',
        'John Harvard fue bautizado en esta parroquia; la conexión con Harvard se recuerda dentro de la catedral.',
      ],
      supportCards: [
        {
          title: 'Pausa con contraste',
          summary: 'Este bloque vale por el cambio de atmósfera y por el vínculo con Shakespeare y el viejo Bankside.',
          bullets: [
            'Mercado y catedral juntos dan una despedida muy londinense: vida urbana y capa histórica.',
            'Contadles que cerca de aquí estaba el Londres de teatros, tabernas y caminos de entrada a la City.',
            'No hace falta alargarlo mucho; es una parada de tono y equilibrio.',
          ],
        },
      ],
      links: [
        {
          label: 'Web Southwark Cathedral',
          href: 'https://cathedral.southwark.anglican.org/visiting/visitor-information/',
          external: true,
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3b/Northwest_View_of_Southwark_Cathedral_%2801%29.jpg/1280px-Northwest_View_of_Southwark_Cathedral_%2801%29.jpg',
      imageAlt: 'Southwark Cathedral',
    },
    {
      time: '10:50-11:05',
      title: "Hay's Galleria + foto rápida de The Shard",
      area: "Hay's Galleria / London Bridge",
      narrative:
        'El cierre visual de la mañana compacta combina dos piezas muy buenas. Hay’s Galleria fue muelle y almacén portuario: por aquí entraban mercancías en el Londres comercial del río, y la zona llegó a asociarse con el té y los productos secos hasta ganarse el apodo de “despensa de Londres”. Luego, cuando el puerto se desplazó hacia instalaciones modernas y contenedores, estos muelles quedaron obsoletos y se reconvirtieron. Al lado, The Shard hace el contrapunto: una “ciudad vertical” del siglo XXI diseñada por Renzo Piano.',
      details: [
        "Hay's Galleria fue un muelle y almacén portuario reconvertido en galería comercial cubierta.",
        'The Shard, inaugurado en 2012 y diseñado por Renzo Piano, marcó el salto contemporáneo del skyline.',
        'Curiosidad de The Shard: durante la construcción encontraron un zorro en la planta 72, al que llamaron Romeo.',
      ],
      supportCards: [
        {
          title: 'Última foto potente',
          summary: 'Es un remate visual muy bueno: antiguo puerto reconvertido frente a rascacielos contemporáneo.',
          bullets: [
            'Buen punto para cerrar la mañana con sensación de Londres clásico + Londres contemporáneo.',
            'Idea para contar: el río trajo mercancías durante siglos; ahora esa misma ribera trae oficinas, turismo y skyline.',
            'Si algo se recorta por tiempo, este es el bloque más sacrificable de la mañana.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Hay%27s_Galleria_-_September_2007.jpg/1280px-Hay%27s_Galleria_-_September_2007.jpg',
      imageAlt: "Hay's Galleria",
    },
    {
      time: '11:05-11:25',
      title: 'Regreso al apartamento',
      area: 'London Bridge -> Kennington',
      narrative:
        'Aquí se acaba el turismo y empieza el cierre inteligente del viaje. Volver con tiempo es justo lo que permite que la mañana siga siendo disfrutable sin contaminar la salida con estrés tonto. La despedida buena no es la que añade una última foto, sino la que permite salir de Londres con sensación de control.',
      details: ['Si algo se recorta por tiempo, primero debería caer el tramo Hay’s / Shard.'],
      supportCards: [
        {
          title: 'Punto de no retorno',
          summary: 'A partir de aquí ya no conviene seguir añadiendo nada al plan.',
          bullets: [
            'Este regreso es lo que convierte la mañana en elegante y no en apurada.',
            'La misión cambia de ver Londres a proteger maletas, llaves y transfer.',
          ],
        },
      ],
    },
    {
      time: '11:25-11:55',
      title: 'Cierre de apartamento + maletas + llaves',
      area: 'Kennington',
      narrative:
        'Este es el bloque que no conviene contaminar con turismo. Recoger maletas, revisar que no queda nada, dejar el piso cerrado y estar ya en modo salida. Aquí el viaje deja de ser relato histórico y vuelve a ser operación familiar: pasaportes, bolsas, llaves y margen.',
      practical: 'El voucher pide estar listos 15 minutos antes y el coche solo incluye 15 minutos de espera.',
      supportCards: [
        {
          title: 'Ventana crítica de cierre',
          summary: 'Aquí se decide que la salida siga siendo tranquila.',
          bullets: [
            'El objetivo razonable es tenerlo todo listo entre 11:50 y 12:00.',
            'No mezclar este bloque con más turismo: es el colchón que protege el vuelo.',
            'Si algo se ha alargado, recortar mañana antes que apretar esta franja.',
          ],
        },
      ],
    },
    {
      time: '11:55-12:10',
      title: 'Espera operativa en la puerta / punto de recogida',
      area: 'Kennington',
      narrative:
        'A esta hora ya no toca improvisar nada: todo el grupo listo, teléfonos con batería y equipaje controlado. Este bloque existe para que el transfer se sienta como una salida estable y no como el sprint final del viaje. La última lección práctica también cuenta: un viaje bonito se recuerda mejor cuando no acaba en carrera.',
      details: ['Si el coche no pudiera acceder exactamente a la puerta, el conductor debería llamar o escribir para fijar punto cercano.'],
      supportCards: [
        {
          title: 'Antes de que llegue el coche',
          summary: 'Esta espera corta debe ser tranquila, no una carrera final.',
          bullets: [
            'Grupo completo, maletas juntas y móviles con batería.',
            'Última revisión rápida: pasaportes, cartera, móviles y bolsas pequeñas.',
          ],
        },
      ],
    },
    {
      time: '12:10',
      title: 'Transfer privado al aeropuerto (fijo)',
      area: 'Kennington -> LHR',
      narrative:
        'Este bloque ya está cerrado y manda sobre todo lo demás. El objetivo no es llegar por los pelos, sino convertir la salida al aeropuerto en un trámite previsible y sin tensión. Camino a Heathrow podéis hacer el repaso final del viaje: de Westminster medieval a rascacielos, de mercados antiguos a estudios de cine, de río comercial a skyline moderno.',
      reservation: 'Transfer privado reservado · recogida 12:10',
      details: ['Espera incluida: 15 minutos.', 'Datos completos del conductor/proveedor en la carpeta privada del viaje.'],
      supportCards: [
        {
          title: 'Resumen transfer vuelta',
          summary: 'Datos que importan de verdad del traslado de vuelta.',
          bullets: [
            'Estar listos 15 min antes de la recogida.',
            'Espera incluida: 15 min; luego GBP 2/min.',
            'Teléfonos y voucher completo: solo en Drive/offline.',
          ],
        },
        {
          title: 'Si el coche no aparece',
          summary: 'Escalado simple y rápido, sin perder minutos en duda.',
          bullets: [
            'Primero usar el contacto del proveedor guardado en la carpeta privada.',
            'Si no responde o hay incidencia clara: usar el contacto de emergencia del voucher.',
            'Con el margen previsto, un pequeño retraso aún deja día cómodo de aeropuerto.',
          ],
        },
      ],
      practical: 'Voucher y teléfonos completos guardados solo en la carpeta privada del viaje.',
    },
    {
      time: '13:45-14:00',
      title: 'Llegada objetivo a Heathrow',
      area: 'LHR',
      narrative:
        'Llegar en esta ventana os da tranquilidad de verdad: facturación, seguridad, baño, agua y puerta sin la sensación de sprint final. Heathrow es una de las grandes puertas aéreas del mundo, así que conviene tratarlo como lo que es: un aeropuerto enorme donde el margen vale más que cualquier última improvisación.',
      details: ['Hora base conservadora: 16:10.', 'Pendiente solo confirmar terminal y hora final exacta en BA.'],
      supportCards: [
        {
          title: 'Cronograma inverso LHR',
          summary: 'Márgenes cómodos para no convertir Heathrow en un sprint.',
          bullets: [
            'Objetivo cómodo: llegar entre 13:40 y 13:45.',
            'Bag drop BA: cierre 15:25.',
            'Seguridad pasada: 15:35.',
            'Estar en puerta: 15:50.',
          ],
        },
      ],
    },
    {
      time: '15:50',
      title: 'En puerta',
      area: 'LHR',
      narrative:
        'Objetivo cumplido si a esta hora todo está cerrado y solo queda embarcar. El viaje termina mejor cuando el último recuerdo operativo no es una carrera, sino la sensación de que todo ha estado bajo control hasta el final. Buen cierre emocional: cada uno puede elegir su imagen del viaje antes de despegar.',
      details: ['Seguir usando 16:10 como hora base conservadora hasta validación final en BA.'],
      supportCards: [
        {
          title: 'Checklist final de puerta',
          summary: 'A estas alturas la misión es no dejar cabos sueltos tontos.',
          bullets: [
            'Pasaportes, boarding y fila 19 ya localizados.',
            'Última oportunidad cómoda para baño, agua y reorganizar mochilas.',
            'Mini ritual final: que cada uno diga su momento favorito antes de volver a Valencia.',
          ],
        },
      ],
    },
  ],
};
