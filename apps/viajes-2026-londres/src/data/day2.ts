import type { DayPlan } from './types';

export const day2: DayPlan = {
  id: 'day2',
  label: 'Día 2',
  subtitle: 'Westminster + río + Tower + Soho',
  date: 'Sábado 25/07',
  theme: 'Londres monumental clásico',
  summary:
    'El sábado recorre una cadena histórica muy potente: abadía de coronaciones, guardias reales, palacio, río comercial, fortaleza medieval, puente victoriano y cierre en el West End.',
  highlight:
    'Es el día más “historia británica en directo” del viaje: poder religioso, monarquía, ejército ceremonial, comercio fluvial, cárcel real, ingeniería victoriana y ciudad nocturna.',
  fixed: [
    'Westminster Abbey reservado: entrada general 09:30-10:00.',
    "Queen's Diamond Jubilee Galleries reservado: 10:00-10:30.",
    'City Cruises reservado: ticket flexible por fecha para el 25/07.',
    'Tower Bridge decidido: cruzarlo por fuera, sin reservar interior.',
  ],
  stops: [
    {
      time: '08:30-09:00',
      title: 'Desayuno y salida suave',
      area: 'Kennington',
      narrative:
        'El sábado arranca sin prisas y con una idea muy clara: este es el gran día monumental del viaje. La ruta tiene sentido histórico: camináis desde la base en Kennington hacia Westminster, el viejo corazón ceremonial del poder inglés. No es solo ir a una visita; es entrar en el escenario donde la monarquía, el Parlamento y la ciudad se han cruzado durante siglos.',
      details: [
        'Salida recomendada desde Kennington: 08:50-09:00 andando hacia Westminster Abbey.',
        'Objetivo operativo: estar en la Abbey sobre 09:20-09:25.',
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
      time: '09:30-10:50',
      title: 'Westminster Abbey + Galleries (por dentro)',
      area: 'Westminster',
      narrative:
        'Entráis con reserva cerrada en uno de los lugares más simbólicos del Reino Unido. Westminster Abbey no es simplemente una iglesia bonita: es el gran teatro de las coronaciones inglesas y británicas desde 1066. Allí se han coronado reyes, se han celebrado bodas reales y descansan científicos, escritores, políticos y monarcas. Las Galleries, arriba en el triforio medieval, añaden una mirada casi secreta: ver tesoros y memoria nacional desde una altura que normalmente no forma parte de una iglesia corriente.',
      details: [
        'Aquí se coronan los monarcas ingleses y británicos desde Guillermo el Conquistador.',
        'También descansan o son recordados Newton, Darwin, Dickens, Chaucer y muchas figuras de la cultura británica.',
        'La Coronation Chair fue encargada por Eduardo I y ha estado ligada durante siglos al ritual de coronación.',
        "Reserva cerrada con entrada general y Queen's Diamond Jubilee Galleries.",
      ],
      supportCards: [
        {
          title: 'Historieta para contar',
          summary: 'La abadía concentra casi mil años de poder, ceremonias y memoria.',
          bullets: [
            'Entrada general: 09:30-10:00.',
            "Queen's Diamond Jubilee Galleries: 10:00-10:30.",
            'Núcleo que no debería faltar: nave, Coronation Chair si está accesible y Poets\' Corner.',
            'Idea para los peques: no estáis entrando en “una iglesia”, sino en el sitio donde el país escenifica quién manda y a quién recuerda.',
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
        'Whitehall es una transición perfecta entre patrimonio y ceremonia. Fue el gran eje del poder real cuando el enorme Palacio de Whitehall dominaba esta zona; hoy queda convertido en avenida de ministerios, memoriales y edificios oficiales. Caminarlo ayuda a entender que Westminster no es solo postal: aquí se administra, se recuerda y se representa el Estado.',
      details: [
        'Es un tramo corto, elegante y muy bien conectado con Horse Guards.',
        'Cerca quedan Downing Street, memoriales de guerra y el eje ceremonial que conecta Parlamento, guardias y palacio.',
      ],
      supportCards: [
        {
          title: 'Qué contar mientras camináis',
          summary: 'Este paseo funciona mejor si se lee como corredor del poder británico.',
          bullets: [
            'Whitehall concentra ministerios, memoriales y la cercanía al 10 de Downing Street.',
            'El nombre recuerda el antiguo palacio real de Whitehall, destruido en gran parte por un incendio a finales del siglo XVII.',
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
        'Aquí entráis en la liturgia londinense de uniforme, caballo y tradición. Horse Guards no es decorado: fue la entrada oficial al viejo Whitehall y sigue funcionando como punto ceremonial de acceso al eje real. La King\'s Life Guard es guardia montada real; parece una escena hecha para turistas, pero nace de una función militar y cortesana muy real.',
      details: [
        'Servicio ceremonial real, no simple recreación para turistas.',
        'Los guardias pertenecen al entorno de la Household Cavalry, con tradición militar y ceremonial.',
        'Los caballos son parte de la guardia, no atrezzo: mejor mirar de cerca sin invadirlos.',
      ],
      supportCards: [
        {
          title: 'Ceremonia real, no espectáculo vacío',
          summary: 'Funciona como foto, pero también como supervivencia visible de la corte militar.',
          bullets: [
            'Hora de referencia útil: 11:00 para el King\'s Life Guard.',
            'Mejor colocarse con unos minutos de margen para ver caballos, uniforme y fondo arquitectónico.',
            'A los peques suele gustar porque combina animal, ritual y colorido en muy poco tiempo.',
            'Buen aviso para ellos: se puede mirar mucho, pero no tocar caballos ni riendas.',
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
        'Desde Horse Guards no vais simplemente “por un parque bonito” hacia Buckingham: cruzáis un antiguo paisaje de poder real. St James\'s Park nació como terreno palaciego y zona de caza de Enrique VIII junto a Whitehall. Más tarde, Carlos II lo transformó con gusto francés tras su exilio, y desde 1664 los pelícanos forman parte de su rareza cortesana, por un regalo de un embajador ruso. Al final del paseo, Buckingham cuenta otra historia: empezó como casa aristocrática, no como palacio, y se convirtió en residencia principal con la reina Victoria en 1837.',
      details: [
        'St James\'s Park fue primero paisaje real y zona de caza, no parque público.',
        'Los pelícanos del parque vienen de una tradición iniciada en el siglo XVII.',
        'Buckingham fue primero Buckingham House, una casa aristocrática, antes de convertirse en símbolo mundial de la monarquía.',
        'La bandera sobre el palacio indica si el rey está en residencia.',
      ],
      supportCards: [
        {
          title: 'Qué contar aquí',
          summary: 'El tramo funciona como una pequeña historia de la monarquía al aire libre.',
          bullets: [
            'St James\'s Park aporta la entrada elegante y relajada al eje real.',
            'Victoria Memorial da mucha profundidad visual al frente de Buckingham.',
            'Curiosidad familiar: buscad pelícanos; no son decoración casual, son tradición real.',
            'No hace falta alargarlo mucho: es una parada de fachada, atmósfera e historia exterior.',
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
        'La secuencia monumental se remata con la gran postal política de Londres. Volver a Big Ben de día permite fijarse mejor en Parliament Square: alrededor no hay solo tráfico y turistas, sino estatuas y memoria política. Es un lugar donde Londres convierte ideas abstractas como democracia, imperio, guerra, reformas y liderazgo en piedra, bronce y fachada.',
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
            'Curiosidad simple: Big Ben no es la torre, sino la campana.',
            'Mirad la plaza como un mapa de personajes: no solo edificios, también memoria pública.',
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
        'Londres desde el agua cambia la lectura de la ciudad. Durante siglos el Támesis fue autopista, puerto, frontera, cloaca, defensa y escenario ceremonial. Lo que a pie son barrios separados, desde el río se convierte en una sucesión coherente de puentes, siluetas y frentes urbanos. Es una de las mejores transiciones del viaje porque descansa las piernas mientras explica por qué Londres creció mirando al agua.',
      details: [
        'El Támesis fue durante siglos la gran autopista comercial de Londres.',
        'Desde el barco se entiende mejor por qué la Torre, los muelles, los mercados y los puentes estaban colocados donde estaban.',
        'Ideal para orientarse visualmente para los siguientes días.',
      ],
      supportCards: [
        {
          title: 'Embarque y relato',
          summary: 'Conviene llevar este tramo resuelto y usarlo para leer la ciudad desde el río.',
          bullets: [
            'Ticket City Cruises reservado para el 25/07, flexible por fecha y sin hora fija cerrada.',
            'Embarque con margen y buscando sitio con buena vista al salir de Westminster.',
            'Si hubiese mucha cola o incidencia, plan B limpio: metro hasta Tower Hill sin tocar el resto del día.',
            'En el barco interesa mirar más que hacer mil fotos: el río ordena mentalmente Londres.',
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
        'Aquí aparece la Londres medieval con toda su densidad histórica. La Torre de Londres nace tras la conquista normanda: Guillermo el Conquistador necesitaba dominar la ciudad y levantó una fortaleza que funcionaba como mensaje clarísimo de poder. Con el tiempo fue palacio, prisión, arsenal, tesoro, casa de la Royal Mint, menagerie y custodia de las Joyas de la Corona. Aunque no entréis, el perímetro y la relación con el río ya cuentan muchísimo.',
      details: [
        'La Torre de Londres fue fortaleza, prisión, palacio, arsenal y símbolo de control del acceso a la ciudad.',
        'Las Joyas de la Corona se custodian allí.',
        'La leyenda de los cuervos dice que si abandonan la Torre caerán la Corona y el reino; es probablemente una tradición tardía, pero es una anécdota perfecta.',
      ],
      supportCards: [
        {
          title: 'Cómo leer la fortaleza',
          summary: 'No hace falta entrar para notar el peso histórico del lugar.',
          bullets: [
            'Miradla como pieza de control del río y de acceso a la ciudad medieval.',
            'Idea para los peques: no era solo castillo, era también advertencia política.',
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
        'Parada funcional, pero muy importante para sostener el día. Comer cerca de Tower Hill tiene sentido histórico además de práctico: estáis en una zona que durante siglos mezcló fortaleza, muelles, comercio, soldados, presos, funcionarios y viajeros. Londres no se construyó solo con palacios; también con gente que descargaba, vigilaba, negociaba y comía alrededor del puerto.',
      details: [
        'Es una buena zona para comer sin romper la lógica del recorrido.',
        'Después de la Torre conviene recuperar energía: la tarde todavía tiene puente, ruina, mercado victoriano y West End.',
      ],
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
      title: 'Tower Bridge (cruce exterior)',
      area: 'Tower Bridge',
      narrative:
        'Luego llega el puente más icónico de Londres, y aquí la decisión ya está tomada: verlo y cruzarlo por fuera. Tower Bridge se construyó entre 1886 y 1894 para resolver un problema muy victoriano: Londres necesitaba otro cruce al este, pero no podía bloquear el paso de barcos altos hacia el Pool of London. Por eso combina puente levadizo, puente colgante y arquitectura gótica decorativa. Parece medieval, pero es una máquina industrial del siglo XIX vestida de castillo.',
      details: [
        'Se inauguró en 1894 para no frenar el paso de barcos altos hacia el puerto interior.',
        'Decisión cerrada: no reservar pasarelas ni interior; cruce exterior y fotos.',
        'Anécdota potente: en 1952 un autobús de dos pisos llegó a saltar de una hoja del puente a la otra cuando el puente empezó a abrirse por error.',
      ],
      supportCards: [
        {
          title: 'Ingeniería con disfraz medieval',
          summary: 'El puente ya compensa mucho por fuera y el día gana calma sin el interior.',
          bullets: [
            'Exterior: puente, entorno, vistas al río y skyline del este.',
            'Sin pasarelas altas ni suelo de cristal: ahorro y menos presión de horarios.',
            'Merece tiempo real para cruzarlo, mirar hacia la Torre y sacar fotos sin correr.',
            'Contadles que se abre porque antes los barcos grandes tenían prioridad real sobre el tráfico de la calle.',
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
        'La tarde cambia de escala: de iconos gigantes a una joya escondida. St Dunstan in the East fue iglesia de la City, dañada por el Gran Incendio de 1666, reconstruida después con intervención de Christopher Wren y finalmente bombardeada en el Blitz. En vez de reconstruirla como iglesia completa, Londres la convirtió en jardín público: una ruina viva, verde y silenciosa en mitad del distrito financiero.',
      details: [
        'La iglesia quedó gravemente dañada en el Blitz y se conservó como jardín público.',
        'Es un buen ejemplo de cómo Londres convierte heridas históricas en espacios vivos.',
        'Aquí la historia no se cuenta con vitrinas, sino con muros vacíos, plantas y silencio.',
      ],
      supportCards: [
        {
          title: 'Rincón secreto',
          summary: 'Es una parada pequeña, pero con mucha capacidad de sorpresa.',
          bullets: [
            'Funciona mejor como pausa contemplativa que como visita larga.',
            'Muy buen lugar para notar el contraste entre historia dura y belleza tranquila.',
            'Idea para los peques: a veces una ciudad recuerda no reconstruyendo del todo, sino dejando una cicatriz bonita.',
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
        'Leadenhall aporta el Londres victoriano cubierto: hierro, cristal, color y un ambiente elegante que cambia por completo la textura del día. Pero debajo de esa decoración tan fotogénica hay mucha historia comercial: esta zona fue mercado desde época medieval, y la estructura actual del siglo XIX refleja la confianza de la City victoriana, cuando el comercio quería ser eficiente, higiénico y también espectacular.',
      details: [
        'Existe desde época medieval y su versión actual del siglo XIX es una joya comercial victoriana.',
        'Es una buena parada para explicar que Londres también se hizo con mercados, gremios, carnes, aves, frutas y dinero, no solo con reyes.',
      ],
      supportCards: [
        {
          title: 'Victoria bajo techo',
          summary: 'Bloque corto, cómodo y con recompensa estética inmediata.',
          bullets: [
            'Ideal si el grupo necesita bajar pulsaciones sin dejar de ver algo muy londinense.',
            'Muy buena parada para fotos con hierro, cristal y color sin exposición larga al clima.',
            'Curiosidad pop: sus galerías han servido de escenario cinematográfico, incluido el universo Harry Potter.',
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
        'Este movimiento está pensado para que el día no termine en zona de oficinas, sino en el Londres más vivo y reconocible de tarde-noche. También tiene lectura histórica: saltáis desde la City, corazón financiero y medieval, hacia el West End, territorio de teatros, ocio, luces, consumo y mezcla social. Es pasar del Londres que administra dinero al Londres que sale a la calle.',
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
        'El cierre urbano perfecto para el sábado: neones, cruce icónico, tiendas, energía de tarde-noche y cena en uno de los barrios más vivos y multiculturales de Londres. Piccadilly Circus se hizo famoso como cruce luminoso y escaparate de publicidad moderna; Soho, en cambio, pasó de zona aristocrática a barrio de inmigración, música, teatro, restaurantes, bohemia y vida nocturna. Después de reyes, abadías y fortalezas, aquí Londres enseña su lado mestizo.',
      details: [
        'Soho pasó de barrio aristocrático a zona bohemia, gastronómica y teatral.',
        'Piccadilly funciona como Times Square londinense, pero con escala más europea y muy pegado al West End.',
      ],
      supportCards: [
        {
          title: 'Cierre del sábado',
          summary: 'Aquí la historia se nota en la mezcla: luces, teatro, migraciones, restaurantes y noche.',
          bullets: [
            'Piccadilly da el golpe visual; Soho aporta ambiente, mezcla y buena cena.',
            'Muy buen lugar para terminar sin meter un último monumento forzado.',
            'Idea para cerrar el día: Londres también es esto, una ciudad que no solo conserva pasado, sino que lo mezcla con vida urbana.',
          ],
        },
      ],
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg/1280px-Open_Happiness_Piccadilly_Circus_Blue-Pink_Hour_120917-1126-jikatu.jpg',
      imageAlt: 'Piccadilly Circus al anochecer',
    },
  ],
};
