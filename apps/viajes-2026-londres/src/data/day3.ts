import type { DayPlan } from './types';

export const day3: DayPlan = {
  id: 'day3',
  label: 'Día 3',
  subtitle: 'Warner Bros Studio Tour',
  date: 'Domingo 26/07',
  theme: 'Día temático premium',
  summary:
    'Toda la jornada se organiza en torno a una experiencia muy concreta y ya pagada: Harry Potter Studios, en los estudios donde se rodaron las ocho películas.',
  highlight:
    'No es un día de ciudad; es un día para enseñarles que la magia del cine también se fabrica con carpinteros, pintores, maquetas, criaturas, costura, efectos y muchísima paciencia.',
  fixed: ['Warner Bros Studio Tour reservado a las 10:30.'],
  stops: [
    {
      time: '08:35-08:45',
      title: 'Salida de Kennington',
      area: 'Kennington',
      narrative:
        'Hoy es día temático total, así que se sale con margen y mentalidad de experiencia premium. La idea no es solo llegar, sino llegar sin ruido para que toda la energía vaya a disfrutar el tour. Buen arranque para contarles una idea clave: hoy no vais a un parque de atracciones, vais a un lugar de trabajo cinematográfico convertido en museo vivo.',
      details: [
        'Día diseñado para una sola gran experiencia, no para combinarla con ciudad.',
        'El valor está en mirar cómo se construyó el mundo mágico: decorados reales, objetos físicos, vestuario, criaturas y efectos.',
      ],
      supportCards: [
        {
          title: 'Mochila crítica del día',
          summary: 'Todo lo importante tiene que ir resuelto antes de salir de casa.',
          bullets: [
            'Tickets en al menos dos móviles.',
            'Batería externa, agua y algún snack ligero.',
            'Punto de encuentro familiar definido por si alguien se despista dentro del tour.',
            'Idea para los peques: hoy se mira con ojos de “cómo lo hicieron”, no solo de fan.',
          ],
        },
      ],
    },
    {
      time: '08:45-09:05',
      title: 'Kennington -> Euston',
      area: 'Metro / Euston',
      narrative:
        'Tramo directo y funcional, pero clave para que la mañana fluya sin fricción. También es el momento de cambiar mentalmente de Londres monumental a Londres audiovisual: la ciudad y sus alrededores son una enorme fábrica de historias, desde estudios clásicos hasta rodajes modernos.',
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
        'En cuanto subís al tren empieza la transición real a modo Harry Potter. Podéis plantearlo como una cuenta atrás: primero se leen los libros, luego se ven las películas, y hoy se descubre la tercera capa, la de los artesanos que construyeron puertas, mesas, túnicas, varitas, criaturas y calles enteras para que pareciera inevitable.',
      details: ['Este tramo suele rondar los 20 minutos en servicios rápidos.'],
      supportCards: [
        {
          title: 'Referencia de la reserva',
          summary: 'Lo más útil aquí es tener muy visible el dato del tour.',
          bullets: [
            'Studio Tour reservado para las 10:30.',
            'Tickets reales guardados en la carpeta privada del viaje.',
            'Objetivo operativo real: estar en la entrada sobre las 10:10.',
          ],
        },
      ],
    },
    {
      time: '09:45-10:00',
      title: 'Shuttle oficial a estudios',
      area: 'Watford Junction / Leavesden',
      narrative:
        'El shuttle oficial forma parte natural de la experiencia: os deja prácticamente en puerta y reduce muchísimo la complejidad frente a otras opciones. Además, ese último tramo ya mete al grupo en modo Leavesden, un lugar que antes de ser sinónimo de Harry Potter ya tenía vida industrial y aeronáutica. La magia cinematográfica llegó después, reutilizando grandes espacios capaces de albergar decorados enormes.',
      details: [
        'Leavesden fue antes complejo ligado a la industria aeronáutica y hoy es uno de los centros de rodaje más importantes del Reino Unido.',
        'Allí se rodaron las ocho películas de Harry Potter, y parte de lo que vais a ver son sets, props y vestuario originales.',
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
      image:
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Warner_Bros._Studios%2C_Leavesden%2C_September_2023.JPG/1280px-Warner_Bros._Studios%2C_Leavesden%2C_September_2023.JPG',
      imageAlt: 'Warner Bros Studios Leavesden',
    },
    {
      time: '10:00-10:10',
      title: 'Control + acceso',
      area: 'Entrada Warner Bros Studio Tour',
      narrative:
        'Estos minutos valen oro. Llegar con colchón, entrar sin prisas y dejar que la emoción suba poco a poco suele mejorar muchísimo la experiencia. Antes de entrar, merece la pena recordarles que en cine casi nada “aparece”: todo alguien lo diseñó, lo pintó, lo envejeció, lo iluminó o lo movió para que la cámara lo creyera.',
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
      narrative: [
        'Este es el bloque estrella del viaje: sets, utilería, atmósfera cinematográfica y la sensación muy potente de que el mundo de la saga existe físicamente y no solo en pantalla. La clave es entrar con una idea clara para los peques: hoy no vais a “ver Harry Potter”, vais a descubrir cómo se fabricó.',
        'Leavesden tiene una historia anterior a la magia. El lugar nació ligado a la industria aeronáutica y a grandes espacios de producción; después se reconvirtió en estudio cinematográfico. Esa escala explica por qué allí podían construirse decorados enormes, guardar piezas durante años y rodar una saga completa sin que todo dependiera de localizaciones temporales.',
        'El Gran Comedor es el arranque emocional perfecto. Fue uno de los primeros grandes sets construidos para la primera película y acabó apareciendo en casi toda la saga. Mirarlo así cambia la visita: no es una sala “decorada”, sino un espacio físico donde carpintería, pintura, iluminación, continuidad y cámara trabajaron juntos para crear un lugar que todos reconocemos.',
        'Luego viene lo más bonito para mirar como detectives de cine. En el despacho de Dumbledore, muchos libros antiguos no eran libros mágicos, sino guías telefónicas encuadernadas para llenar estanterías. El Knight Bus no fue solo un truco digital: se construyó físicamente combinando piezas de autobuses de dos pisos. Parte de la magia consiste precisamente en que muchísimas cosas eran reales, pesadas, pintadas, cosidas o envejecidas a mano.',
        'La visita gana si la convertís en una búsqueda de oficios: quién hizo las varitas, quién envejeció las paredes, quién diseñó criaturas, quién cosió túnicas, quién construyó puertas y quién decidió qué objeto había en cada estantería. Después de todo, el recuerdo no será solo “he visto Hogwarts”, sino “he entendido que la magia también se construye con trabajo humano”.',
      ],
      reservation: 'Entrada reservada a las 10:30',
      details: [
        'Great Hall para arrancar fuerte: decorado real y uno de los grandes iconos de la saga.',
        'Sets interiores principales y zonas técnicas: aquí se entiende el trabajo de arte, carpintería, pintura, efectos y continuidad.',
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
          title: 'Historias que buscar',
          summary: 'Aquí compensa más mirar con curiosidad que fotografiarlo todo.',
          bullets: [
            'El Gran Comedor podía sentar a más de 400 niños en pantalla: fijaos en la escala del decorado.',
            'Dumbledore: muchos “libros antiguos” eran guías telefónicas disfrazadas.',
            'El Knight Bus se construyó físicamente con piezas de autobuses reales; por eso tiene presencia tan rara y divertida.',
            'Guardar energía para la tienda evita llegar a ella con prisa o saturación.',
          ],
        },
      ],
      links: [
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
        'La salida conviene hacerla sin pelearle al día un segundo acto ambicioso. Después de ver cómo se fabrica una película por dentro, el buen cierre es dejar reposar la experiencia: qué set ha sorprendido más, qué truco parecía más artesanal, qué objeto se llevarían a casa si pudieran. El valor está en haber exprimido bien el tour y conservar el regreso ligero.',
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
        'Aquí manda la energía real del grupo. Si vais frescos, paseo corto y merienda; si vais cargados, descanso sin culpa. La decisión buena es la que protege el día 4. Además, el día ya habrá tenido su propia historia completa: de Londres a Leavesden, de fan a mirada de cine, de decorado a recuerdo familiar.',
      details: [
        'No es un día de ciudad; es un día de experiencia temática completa.',
        'Buen cierre de conversación: qué parte era más “magia” y qué parte era puro oficio cinematográfico.',
      ],
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
