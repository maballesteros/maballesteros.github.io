import type { DayPlan } from './types';

export const day4: DayPlan = {
  id: 'day4',
  label: 'Día 4',
  subtitle: 'British Museum + Notting Hill + St Paul’s',
  date: 'Lunes 27/07',
  theme: 'Cultura con barrios y arquitectura',
  summary:
    'El lunes equilibra museo universal, barrio con historia social y una gran secuencia urbana: St Paul’s, Millennium Bridge, Somerset House y Covent Garden.',
  highlight:
    'Es un día muy completo porque alterna historia mundial, debate sobre colecciones, cultura de barrio, arquitectura de reconstrucción, ingeniería moderna y vida de plaza.',
  fixed: [
    'British Museum reservado a las 10:00.',
    'Entradas gratuitas: 4 Standard + 1 Child.',
    'Decisión cerrada: sin teatro.',
  ],
  stops: [
    {
      time: '09:00-09:30',
      title: 'Kennington -> British Museum',
      area: 'Kennington / Bloomsbury',
      narrative:
        'La salida del lunes ya lleva una estructura muy clara en la cabeza: gran museo por la mañana, barrio con personalidad al mediodía y cierre elegante entre catedral, puente y West End. El traslado no es protagonista, pero prepara una idea importante: hoy Londres no se mira solo como capital británica, sino como ciudad que coleccionó, comerció, reconstruyó y absorbió culturas de todo el mundo.',
      details: [
        'Hoy importa mucho cambiar de registro varias veces sin perder continuidad.',
        'Buen marco para los peques: museo para la historia del mundo, barrio para la vida real, catedral y puente para ver cómo Londres se rehace.',
      ],
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
      narrative: [
        'Un museo inmenso tratado con disciplina y con franja real ya cerrada a las 10:00. El British Museum no conviene mirarlo como “vamos a verlo todo”, porque eso lo convierte en una paliza. Conviene entrar con una misión: escoger pocas piezas y usarlas como puertas a historias enormes.',
        'El museo nació en 1753 a partir de la colección de Hans Sloane y abrió al público en 1759. Eso ya es muy potente: uno de los primeros grandes museos públicos nacionales, pensado para que el conocimiento no quedara solo encerrado en palacios o colecciones privadas. La Great Court, con su techo contemporáneo, funciona muy bien como símbolo de esa ambición de abrir y ordenar el mundo.',
        'Pero el British Museum también es incómodo, y eso lo hace más interesante. Muchas piezas llegaron por compras, excavaciones, donaciones, conquistas, redes imperiales y contextos coloniales que hoy se discuten. La visita gana si no lo simplificáis: no son solo “tesoros del mundo”, también son preguntas sobre quién recoge la historia, quién la cuenta y quién debería custodiar ciertos objetos.',
        'La Rosetta Stone es perfecta para los peques porque parece una piedra “normal” pero cambió nuestra relación con Egipto: permitió descifrar los jeroglíficos al comparar varios sistemas de escritura. Las esculturas del Partenón, en cambio, sirven para contar otra cosa: algo puede ser bellísimo y, al mismo tiempo, estar rodeado de un debate histórico y político muy serio.',
        'La idea de salida puede ser esta: el British Museum es fascinante porque enseña maravillas, pero también obliga a mirar con preguntas. No vais solo a ver objetos antiguos; vais a ver cómo una ciudad imperial intentó reunir el mundo bajo un mismo techo.',
      ],
      details: [
        'Abrió en 1759 tras la compra pública de la colección de Hans Sloane.',
        'Fue el primer gran museo público nacional de acceso gratuito.',
        'Hoy guarda unos ocho millones de objetos y cubre millones de años de historia humana.',
        'La Rosetta Stone permite contar cómo se descifraron los jeroglíficos egipcios.',
        'Las esculturas del Partenón son espectaculares y también polémicas: Grecia reclama su devolución desde hace mucho tiempo.',
        'Reserva gratuita cerrada: 4 entradas Standard + 1 Child.',
      ],
      supportCards: [
        {
          title: 'Reserva cerrada',
          summary: 'Aunque es gratuito, la franja ya está cogida y manda la mañana.',
          bullets: [
            'Entrada a las 10:00 del lunes 27/07.',
            'Llevar tickets reales en la carpeta offline del viaje.',
            'Llegar sin apurar para pasar control y arrancar con calma.',
          ],
        },
        {
          title: 'Recorrido corto que sí compensa',
          summary: 'La clave aquí es seleccionar y no dejarse tragar por la escala del museo.',
          bullets: [
            'Great Court para orientarse.',
            'Rosetta Stone y Egipto como gran bloque icónico: una piedra que desbloqueó una lengua antigua.',
            'Partenón y Asiria para cerrar con impacto visual fuerte.',
            'Últimos minutos para baño, tienda y salida ordenada.',
          ],
        },
        {
          title: 'Lo que conviene contar',
          summary: 'El British Museum es fascinante precisamente porque no es simple.',
          bullets: [
            'No intentar recorrerlo sin plan.',
            'Mirad las piezas como maravillas y también como preguntas: quién las hizo, cómo llegaron aquí, quién cuenta la historia.',
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
        'El salto de museo enciclopédico a barrio con atmósfera es parte de la gracia del día. Pasáis de objetos encerrados en vitrinas a historia viva de calle: comercio, inmigración, música, color, cine y gentrificación. Este cambio tan claro de registro ayuda a que la jornada no se haga plana ni pesada.',
      details: [
        'Es un contraste buscado: gran colección histórica y luego calle, color y vida de barrio.',
        'El viaje no debe ser solo “grandes instituciones”; también hay que dejar entrar barrios con personalidad.',
      ],
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
      narrative: [
        'Cambio radical de registro: de museo enciclopédico a barrio de color, fachada bonita y textura urbana. Notting Hill entra fácil por los ojos, con casas pastel, puertas bonitas y la sombra de la película romántica, pero quedarse solo ahí sería perderse lo importante.',
        'Durante el siglo XX, Notting Hill fue también zona de alquileres baratos, llegada de comunidades inmigrantes, tensiones raciales y vida obrera. No siempre fue el barrio codiciado y fotogénico que se ve hoy. Ese contraste es útil para contarlo en familia: las ciudades cambian, y a veces una fachada preciosa tapa historias bastante más duras.',
        'La cultura caribeña es una de las claves del barrio. El Carnaval de Notting Hill no nació simplemente como fiesta bonita, sino como afirmación comunitaria, música en la calle, orgullo cultural y respuesta a tensiones sociales. Hoy es uno de los grandes eventos de Londres, pero conserva esa raíz de barrio que se hace visible celebrando.',
        'Portobello Road añade otra capa: mercado, antigüedades, comida, turismo y paseo. Es buen sitio para no ir con checklist, sino con ojos abiertos. El valor está en notar cómo una calle puede ser mercado, escenario cinematográfico, escaparate turístico y memoria social al mismo tiempo.',
      ],
      details: [
        'Notting Hill pasó de zona humilde e inmigrante a barrio muy codiciado sin perder del todo su identidad cultural.',
        'Portobello Road empezó como mercado más cotidiano y acabó asociándose mucho a antigüedades y turismo.',
        'La película Notting Hill lo hizo mundialmente reconocible, pero el barrio ya tenía una historia social mucho más profunda.',
      ],
      supportCards: [
        {
          title: 'Mini ruta sugerida',
          summary: 'Con un rato bien usado ya os lleváis color, mercado y una historia social real.',
          bullets: [
            'Portobello Road como eje reconocible.',
            'Fachadas de color y calles residenciales para la parte más de postal.',
            'Contadles que el barrio no fue siempre “mono”: también habla de migración, mezcla, conflicto y fiesta.',
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
        'Volvéis al eje central para el segundo gran bloque patrimonial del día. Este traslado está muy bien colocado: permite cambiar de barrio a monumento sin sensación de salto arbitrario. Después de ver historia social y color de calle, la cúpula de St Paul’s entra como otra clase de relato: el de una ciudad que se quema y decide reconstruirse con ambición.',
      details: [
        'La cúpula de St Paul’s gana mucho cuando llegáis a ella tras el contraste con Notting Hill.',
        'Conviene prepararles la idea del Gran Incendio de 1666 antes de entrar.',
      ],
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
      narrative: [
        'La cúpula de St Paul’s cambia la escala del día. Después de museo y barrio, entráis en uno de los grandes símbolos de reconstrucción de Londres. La catedral actual no es solo un edificio religioso: es una respuesta arquitectónica a una ciudad que ardió.',
        'El Gran Incendio de 1666 arrasó buena parte de la City medieval, incluida la vieja catedral. Christopher Wren recibió la oportunidad de levantar algo que no solo sustituyera lo perdido, sino que proyectara una ciudad nueva. Su St Paul’s no intenta parecer una ruina medieval reparada: se presenta como un Londres ambicioso, clásico, ordenado y capaz de renacer.',
        'La cúpula es la gran protagonista. Durante siglos fue una de las referencias visuales absolutas de la ciudad, antes de que los rascacielos cambiaran el skyline. Mirar hacia arriba dentro de St Paul’s ayuda a entender que la arquitectura también puede ser una declaración de ánimo colectivo.',
        'La Segunda Guerra Mundial añadió otra capa. Durante el Blitz, la imagen de la cúpula resistiendo entre humo y bombas se convirtió en símbolo de Londres aguantando. Por eso la catedral habla dos veces de reconstrucción: después del fuego del siglo XVII y después de la guerra del siglo XX.',
        'Y hay un detalle precioso para cerrar: Wren está enterrado en St Paul’s, y su epitafio se resume en una idea muy sencilla: si buscas su monumento, mira a tu alrededor. Es una frase perfecta para los chicos porque convierte todo el edificio en una respuesta.',
      ],
      details: [
        'La catedral actual es obra de Christopher Wren.',
        'Su reconstrucción siguió al Gran Incendio de 1666.',
        'La famosa cúpula se convirtió durante el Blitz en imagen de Londres resistiendo.',
        'Wren está enterrado en St Paul’s; su epitafio se resume en una idea preciosa: si buscas su monumento, mira a tu alrededor.',
      ],
      supportCards: [
        {
          title: 'Historia que llevarse',
          summary: 'St Paul’s funciona como símbolo de reconstrucción dos veces: 1666 y Segunda Guerra Mundial.',
          bullets: [
            'Nave principal y lectura general del espacio al entrar.',
            'Capillas y elementos históricos del interior como segundo bloque.',
            'Buscad la sensación de escala de la cúpula: está pensada para impresionar y orientar.',
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
        'Antes de seguir, merece la pena salir a la plaza y regalaros la fachada completa. Desde fuera se entiende mejor que Wren no solo diseñó un interior religioso, sino una pieza urbana para dominar la City. La escalinata, la fachada y la cúpula funcionan como gesto de poder, pero también como brújula: durante siglos, antes de los rascacielos, St Paul’s era una de las referencias visuales absolutas de Londres.',
      details: [
        'La fachada y la escalinata funcionan muy bien para foto y descanso breve antes del siguiente tramo.',
        'Buen momento para comparar la City histórica con la City moderna que se ve alrededor.',
      ],
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
      narrative: [
        'Es uno de los paseos fotográficos más agradecidos del viaje: St Paul’s a un lado, Tate Modern y la ribera contemporánea al otro, y el río cosiéndolo todo. El puente parece muy ligero, casi una línea dibujada entre dos mundos.',
        'La idea urbana es buenísima: une la cúpula clásica de Wren con Bankside, el arte contemporáneo y la antigua central eléctrica convertida en museo. En pocos minutos pasáis de la City histórica a una ribera más cultural y moderna.',
        'Y tiene una anécdota perfecta. El Millennium Bridge abrió en 2000, pero la gente lo apodó enseguida “Wobbly Bridge” porque empezó a oscilar de forma alarmante cuando los peatones sincronizaban sus pasos sin darse cuenta. Lo cerraron, lo estudiaron y lo corrigieron con amortiguadores.',
        'Contado a los peques, funciona como una mini lección de ingeniería: incluso una obra moderna, diseñada por expertos, puede aprender de la realidad cuando miles de pies empiezan a comportarse de una forma inesperada. Londres también se equivoca, corrige y sigue caminando.',
      ],
      details: [
        'El puente se hizo famoso al inaugurarse por una oscilación lateral inesperada y tuvo que cerrarse temporalmente.',
        'Une simbólicamente St Paul’s con Bankside y Tate Modern: vieja cúpula, arte contemporáneo y río en una sola línea.',
      ],
      supportCards: [
        {
          title: 'Qué mirar en este tramo',
          summary: 'Más que cruzarlo, interesa leer lo que une y la anécdota de ingeniería que dejó.',
          bullets: [
            'St Paul\'s detrás, Tate Modern y la ribera contemporánea al frente.',
            'Contadles lo del “puente tambaleante”: a veces una obra moderna también falla y aprende.',
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
      narrative: [
        'Somerset House aporta una pausa elegante antes del cierre más animado. El patio tiene algo muy londinense: parece tranquilo, casi decorativo, pero debajo hay varias capas de poder y administración.',
        'El lugar tuvo una vida palaciega y cortesana, ligada a grandes casas aristocráticas y a reinas. Después, con el edificio actual, pasó a representar otro Londres: el del Estado que administra, registra, recauda, archiva y organiza.',
        'Por eso funciona tan bien como bisagra. No es una parada de “gran monumento” como St Paul’s, ni de ambiente puro como Covent Garden. Es un patio donde se nota que el poder también vive en oficinas, instituciones, archivos y edificios civiles.',
        'La visita puede ser corta, pero conviene no correrla. Entrar al patio, bajar el ruido de la calle y mirar la escala del conjunto ya cuenta bastante: Londres no solo se exhibe con coronas y cúpulas, también con arquitectura administrativa elegante.',
      ],
      details: [
        'Somerset House fue residencia Tudor y luego gran edificio estatal.',
        'El patio funciona muy bien como pausa porque cambia el ruido de calle por una escala casi palaciega.',
      ],
      supportCards: [
        {
          title: 'Pausa elegante',
          summary: 'Un patio así hace de bisagra perfecta entre lo monumental, lo administrativo y lo urbano.',
          bullets: [
            'No hace falta alargarlo: la gracia está en la atmósfera, no en exprimirlo.',
            'Idea para contar: no todo el poder se ve en coronas; también se ve en edificios donde se administra el país.',
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
      narrative: [
        'La tarde se cierra con vida de plaza, artistas callejeros, patios comerciales y un rincón con color como Neal’s Yard. Después de tanta historia grande, Covent Garden aporta algo muy importante: una ciudad que se vive en la calle.',
        'El nombre conserva una pista de origen: fue el convent garden, el huerto de la abadía de Westminster. Luego se transformó en plaza planificada, mercado de frutas y verduras, zona de teatros y, finalmente, espacio de ocio urbano. Es una parada perfecta para enseñar que una ciudad cambia de uso muchas veces sin borrar del todo las capas anteriores.',
        'El mercado actual tiene un aire muy ordenado y turístico, pero durante mucho tiempo Covent Garden fue un mercado de abastecimiento real, con carros, cajas, voces, madrugones y mercancía fresca. La ciudad elegante que veis hoy viene de una ciudad bastante más trabajadora.',
        'Neal’s Yard añade el toque de cuento: un patio pequeño, colorido y algo escondido, ideal para cerrar con sorpresa. Y los artistas callejeros conectan con la tradición teatral del West End: Londres también cuenta historias con gente actuando en plazas, no solo en museos e iglesias.',
      ],
      details: [
        'Covent Garden fue durante siglos mercado de frutas y verduras antes de reinventarse como zona de ocio.',
        'Los artistas callejeros actuales conectan con el viejo Londres teatral del West End.',
        "Neal's Yard aporta color y un pequeño desvío con mucha personalidad.",
      ],
      supportCards: [
        {
          title: 'Microrecorrido final',
          summary: 'Aquí funciona muy bien dejarse llevar con una estructura mínima y contar la transformación del barrio.',
          bullets: [
            'Plaza principal de Covent Garden para el ambiente y los artistas.',
            'Desvío breve a Neal\'s Yard para el toque de color y sorpresa.',
            'Recordatorio bonito: de huerto religioso a mercado, de mercado a teatro, de teatro a paseo familiar.',
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
