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
      narrative: [
        'Entráis con reserva cerrada en uno de los lugares más simbólicos del Reino Unido. Westminster Abbey no es simplemente una iglesia bonita: es el gran teatro de las coronaciones inglesas y británicas desde 1066, cuando Guillermo el Conquistador fue coronado aquí el día de Navidad.',
        'La abadía funciona como una especie de memoria nacional en piedra. Por un lado está el poder: coronaciones, bodas reales, funerales de Estado y tumbas de monarcas. Por otro está la cultura: Poets\' Corner, científicos, escritores, músicos y personajes que el país ha querido recordar dentro del mismo edificio donde se escenifica la monarquía.',
        'La Coronation Chair es una de esas piezas que conviene mirar con calma si está accesible. Eduardo I la encargó para alojar la Stone of Scone, y durante siglos ha estado ligada al ritual de coronación. Para los peques se puede contar casi como objeto mágico: una silla que no manda, pero que ayuda a convertir a alguien en rey o reina delante de todo el país.',
        'Las Queen\'s Diamond Jubilee Galleries añaden una capa especial porque están arriba, en el triforio medieval. Es como subir al desván noble de la abadía: un lugar alto, algo secreto, desde el que se ven tesoros, objetos de ceremonia y memoria acumulada. No es solo “ver más cosas”; es mirar la abadía desde una altura que cambia la sensación del edificio.',
        'La idea bonita para salir de allí es esta: Westminster Abbey no cuenta una sola historia, sino quién quiso ser recordado, quién tuvo poder, quién escribió, quién descubrió, quién reinó y cómo un país convierte su pasado en ceremonia.',
      ],
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
      narrative: [
        'Whitehall es una transición perfecta entre patrimonio y ceremonia. Al salir de la abadía y caminar hacia Horse Guards no estáis yendo “de un sitio a otro”: estáis atravesando un corredor de poder.',
        'El nombre recuerda el enorme Palacio de Whitehall, que fue residencia principal de los monarcas ingleses durante los Tudor y los Estuardo. A finales del siglo XVII, un incendio destruyó casi todo aquel complejo palaciego, pero el eje político sobrevivió de otra manera: ministerios, edificios oficiales, memoriales y acceso ceremonial.',
        'Por eso Whitehall es muy útil para leer Londres: aquí el poder se ve menos como castillo o palacio y más como administración. Downing Street queda muy cerca, los memoriales recuerdan guerras y sacrificios, y la calle conduce hacia guardias, parque y Buckingham. Es una avenida corta, pero muy cargada.',
      ],
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
      narrative: [
        'Aquí entráis en la liturgia londinense de uniforme, caballo y tradición. Horse Guards parece una escena preparada para turistas, pero no nace como decorado: fue la entrada oficial al viejo Palacio de Whitehall y sigue marcando el acceso ceremonial al eje real.',
        'La King\'s Life Guard es guardia montada real. La gracia está en entender que esos cascos, corazas, caballos y movimientos medidos no son solo estética: vienen de una tradición militar y cortesana en la que proteger al soberano también era representarlo públicamente.',
        'Para los niños funciona muy bien porque tiene algo casi teatral, pero con reglas reales. Los caballos no son atrezo, los guardias están trabajando y el ritual mantiene una continuidad rara: en una ciudad modernísima todavía queda una puerta donde el Estado se muestra con caballo, uniforme y silencio.',
      ],
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
      narrative: [
        'Desde Horse Guards no vais simplemente “por un parque bonito” hacia Buckingham: vais cruzando un antiguo paisaje de poder real. St James\'s Park empezó siendo terreno palaciego, no parque urbano. Enrique VIII lo incorporó en el siglo XVI como zona de caza junto al gran complejo de Whitehall, y después Jacobo I lo transformó en un lugar más exótico: mandó acondicionarlo y allí llegó a haber animales raros para la corte, como camellos, aves exóticas e incluso cocodrilos.',
        'Cuando caminéis junto al lago, buscad los pelícanos. No están ahí por casualidad decorativa: forman parte de una tradición que viene de 1664, cuando un embajador ruso regaló pelícanos a Carlos II. Es una anécdota perfecta para los nenes: en medio del Londres más institucional, el parque conserva todavía una rareza casi de cuento cortesano.',
        'El paseo también cuenta otra historia: cómo la monarquía fue pasando de vivir encerrada en palacios a mostrarse ante la ciudad. St James\'s Park, The Mall y Buckingham forman un gran escenario ceremonial. No es solo césped, lago y fachada: es una especie de teatro urbano donde Londres representa sus grandes momentos de Estado.',
        'Y al llegar a Buckingham conviene mirar el palacio sabiendo una cosa curiosa: no nació como palacio real. Empezó como Buckingham House, una gran casa aristocrática construida en 1703. Jorge III la compró en 1761 para la reina Carlota, y durante años se conoció como “The Queen\'s House”. La primera monarca que vivió allí de verdad como residencia principal fue la reina Victoria, en 1837.',
        'Así que la foto frente a la verja tiene más capas de lo que parece: estáis delante de una casa privada convertida en símbolo mundial. Ese balcón, esa fachada y esa avenida han servido para celebraciones, duelos, cambios de reinado, guerras, bodas, jubileos y saludos multitudinarios. Aunque no entréis, la visita exterior merece la pena porque resume muy bien una idea: en Londres, la historia política también se pasea.',
      ],
      details: [
        'St James\'s Park fue primero paisaje real y zona de caza, no parque público.',
        'Los pelícanos del parque vienen de una tradición iniciada en 1664.',
        'Buckingham fue primero Buckingham House, una casa aristocrática construida en 1703.',
        'Jorge III compró Buckingham House en 1761 para la reina Carlota.',
        'La reina Victoria fue la primera soberana que vivió allí como residencia principal, en 1837.',
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
      narrative: [
        'La secuencia monumental se remata con la gran postal política de Londres. Volver a Big Ben de día permite fijarse mejor en Parliament Square: no es solo un sitio de tráfico y turistas, sino una plaza donde Londres convierte ideas abstractas en piedra, bronce y fachada.',
        'Alrededor se mezclan Parlamento, abadía, estatuas de líderes políticos y memoria pública. Es un lugar muy británico en ese sentido: no explica la historia con un panel único, sino colocando personajes, edificios y símbolos uno frente a otro, como si siguieran discutiendo.',
        'El detalle sencillo sigue siendo muy útil para los peques: Big Ben es la campana, no la torre. Pero aquí se puede añadir otra capa: esa campana marca el tiempo de una ciudad que ha convertido sus instituciones en imagen mundial.',
      ],
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
      narrative: [
        'Londres desde el agua cambia la lectura de la ciudad. A pie los barrios parecen piezas separadas; desde el Támesis, en cambio, todo se ordena: Parlamento, puentes, muelles, cúpulas, torres, rascacielos y fachadas que miran al río.',
        'Durante siglos el Támesis fue autopista, puerto, frontera, defensa, cloaca y escenario ceremonial. Antes de que el metro y el tráfico moderno reorganizaran la ciudad, el río era la gran vía de entrada de mercancías, personas, noticias y peligros. Londres creció porque podía comerciar desde aquí.',
        'También fue un río difícil. Hubo contaminación, olores terribles y problemas sanitarios enormes, especialmente antes de las grandes obras de alcantarillado del siglo XIX. Así que navegarlo hoy tranquilamente tiene algo curioso: se disfruta como paseo lo que durante siglos fue infraestructura dura.',
        'Es una de las mejores transiciones del viaje porque descansa las piernas mientras explica por qué la Torre, los mercados, los muelles y los puentes estaban donde estaban. El barco no es solo transporte: es mirar Londres con su columna vertebral a la vista.',
      ],
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
      narrative: [
        'Aquí aparece la Londres medieval con toda su densidad histórica. La Torre de Londres nace tras la conquista normanda: Guillermo el Conquistador necesitaba dominar la ciudad y levantó una fortaleza que funcionaba como mensaje clarísimo de poder. No era solo defensa; era una forma de decir “ahora mando yo”.',
        'La White Tower, el núcleo más antiguo, debía impresionar tanto como proteger. Su posición junto al río permitía controlar entradas, mercancías y movimientos. Por eso la Torre se entiende mejor desde fuera si la miráis como una pieza de control urbano: castillo, puerta, amenaza y símbolo.',
        'Con el tiempo fue muchas cosas a la vez: palacio, prisión, arsenal, tesoro, casa de la Royal Mint, menagerie y custodia de las Joyas de la Corona. Por allí pasan relatos de reyes, ejecuciones, cautivos famosos, ceremonias y leyendas. Es una de esas paradas donde Londres deja claro que el poder no siempre fue amable.',
        'Aunque no entréis, el perímetro y la relación con el Támesis ya cuentan muchísimo. La anécdota de los cuervos funciona de maravilla con niños: según la leyenda, si abandonan la Torre caerán la Corona y el reino. Probablemente es una tradición tardía, pero como cuento londinense es irresistible.',
      ],
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
      narrative: [
        'Luego llega el puente más icónico de Londres, y aquí la decisión ya está tomada: verlo y cruzarlo por fuera. Tower Bridge es perfecto así, porque incluso sin entrar se entiende la idea principal: parece un castillo medieval, pero en realidad es una máquina victoriana.',
        'Se construyó entre 1886 y 1894 para resolver un problema muy concreto. Londres necesitaba otro cruce al este, pero no podía cerrar el paso a los barcos altos que todavía llegaban al Pool of London. La solución fue un puente con grandes hojas basculantes que podían abrirse, combinado con pasarelas y torres de apariencia gótica.',
        'Ese disfraz medieval no es casual. Los victorianos sabían hacer ingeniería moderna, pero querían que encajara visualmente junto a la Torre de Londres. Así que el puente mezcla hierro, vapor, hidráulica y estética histórica. Es una lección estupenda: a veces una ciudad no solo construye algo útil, también decide cómo quiere que parezca.',
        'La anécdota del autobús de 1952 remata muy bien la parada: un conductor de un double-decker vio que el puente empezaba a abrirse y aceleró para pasar de una hoja a la otra. El bus logró saltar el hueco. Es una historia perfecta para contar justo mientras cruzáis por fuera, sin necesidad de pagar el interior.',
      ],
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
      narrative: [
        'La tarde cambia de escala: de iconos gigantes a una joya escondida. St Dunstan in the East es uno de esos lugares que parecen un secreto, aunque estén en plena City. No impresiona por tamaño, sino por atmósfera.',
        'Fue una iglesia parroquial de la City, dañada por el Gran Incendio de 1666. Después se reconstruyó y Christopher Wren intervino en la torre y el campanario, de modo que el lugar quedó unido a la gran historia de la reconstrucción de Londres tras el fuego.',
        'La Segunda Guerra Mundial volvió a romperlo. El Blitz dejó la iglesia gravemente dañada, y Londres tomó una decisión preciosa: no reconstruirla como templo completo, sino convertir sus ruinas en jardín público. Muros, ventanas vacías, vegetación y silencio quedaron como una memoria abierta.',
        'Por eso esta parada merece hacerse despacio. Es una forma muy londinense de recordar: no escondiendo la cicatriz, sino dejando que se convierta en un espacio vivo. Después de torres, puentes y multitudes, St Dunstan cuenta la historia baja, herida y bonita de la ciudad.',
      ],
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
      narrative: [
        'Leadenhall aporta el Londres victoriano cubierto: hierro, cristal, color y un ambiente elegante que cambia por completo la textura del día. Después de la ruina silenciosa de St Dunstan, aquí volvéis al Londres comercial, pulido y lleno de detalle.',
        'Pero debajo de esa decoración tan fotogénica hay mucha historia de mercado. La zona estuvo ligada al comercio desde época medieval, especialmente a alimentos como carne, aves y productos frescos. Londres no se alimentaba con monumentos: se alimentaba gracias a mercados, carros, puestos, olores, gremios y trato diario.',
        'La estructura actual del siglo XIX refleja la confianza de la City victoriana. El comercio quería ser más ordenado, higiénico y eficiente, pero también espectacular. Por eso Leadenhall no parece solo un mercado: parece una galería donde comprar se vuelve una experiencia urbana elegante.',
        'La curiosidad pop ayuda con los peques: sus galerías han servido de escenario cinematográfico, incluido el universo Harry Potter. Pero lo más interesante es mirar más abajo: antes de ser decorado de película, este lugar ya era una maquinaria cotidiana para abastecer a Londres.',
      ],
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
      narrative: [
        'El cierre urbano perfecto para el sábado: neones, cruce icónico, tiendas, energía de tarde-noche y cena en uno de los barrios más vivos de Londres. Después de abadías, guardias, palacios, río y fortaleza, aquí la ciudad cambia otra vez de máscara.',
        'Piccadilly Circus se hizo famoso como cruce luminoso y escaparate de publicidad moderna. No tiene la solemnidad de Westminster ni la antigüedad de la Torre, pero cuenta otra historia muy importante: la del Londres que mira, compra, queda, se orienta por luces y se reconoce en pantallas.',
        'Soho añade una capa más rica. Pasó de zona aristocrática a barrio de inmigración, música, teatro, restaurantes, bohemia, vida nocturna y mezcla social. Su historia tiene esquinas brillantes y otras más complicadas, pero para el viaje familiar interesa sobre todo esa idea de barrio mestizo donde Londres se vuelve menos oficial y más callejero.',
        'Es buen sitio para cerrar el día porque resume el contraste del sábado. Por la mañana habéis visto cómo el país representa tradición y poder; por la noche, cómo una ciudad enorme mezcla comida, teatro, luces, idiomas y gente. Londres no solo conserva pasado: lo mezcla con vida urbana.',
      ],
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
