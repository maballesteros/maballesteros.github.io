---
title: WebImmersion - A new kind of WWW
excerpt: "I liked WWW... but wanted to make it better"
tags: [webimmersion]
modified: 2015-11-19
comments: true
---

<section id="table-of-contents" class="toc">
  <header>
    <h3>Overview</h3>
  </header>
<div id="drawer" markdown="1">
*  Auto generated table of contents
{:toc}
</div>
</section><!-- /#table-of-contents -->

WebImmersion was a wild and great idea... I was 26 and wanted to change the world. Enjoy...

---

## WebImmersion - Tecnology Overview

Un fichero es a HTTP lo que un objeto java es a WIP (Web Immersion Protocol). WebImmersion es una extensión de la actual WWW gracias a la cual desarrollar mundos inmersivos altamente interactivos, crear soluciones .com, construir aplicaciones en Internet, etc. se convierte en una rutina. Con WebImmersion Internet pasa de ser una basta red de documentos hiperenlazados a una comunidad viviente de objetos java que se comunican, interoperan, ofrecen sus servicios y..., con el enfoque adecuado, crean mundos inmersivos donde los usuarios se sumergen, interaccionan con el entorno, manipulan objetos java a través de sus interfaces e interconectan servicios que jamás colaboraron para crear soluciones personalizadas a sus propios problemas.

WebImmersion no compite con Jini o EJB, sino que los extiende y ofrece una nueva perspectiva sobre ellos.

Gracias a WebImmersion, la acuñada frase de Sun Microsystems “The network is the computer” se convierte en una realidad tangible.

### Marco histórico

En el año en el que Java apareció en el mercado, allá por el 1995, Internet comenzaba a experimentar un sutil cambio tecnológico. La World Wide Web (WWW), recién nacida en su versión multimedia, comenzaba a extenderse masivamente por todos los continentes. El secreto de su éxito era sencillo: la noción de hipervínculo permitía enlazar documentos de contenido relacionado (o no) que podían enganchar al incipiente cibernauta a la red. Sin embargo, no sólo el hipervículo fue clave para el desarrollo de la WWW. Los navegadores como Mosaic y Netscape llevaron a la WWW a un nuevo nivel introduciendo información multimedia en las páginas que mostraban. Poco después llegó Java y sus applets que, aunque trajeron animación a las páginas en las que se incorporaron, muy pocos entendían entonces cuál era la verdadera implicación de lo que aquello suponía. Ahora, tras una década de WWW, Java ha alcanzado el nivel de madurez adecuado para lograr que la WWW de un nuevo salto. Este es el principal objetivo de WebImmersion.

### Tecnologías relacionadas

WebImmersion no supone un cambio tecnológico básico como suposo java; más bien es una combinación y reestructuración de tecnologías ya existentes para desarrollar una nueva tecnología con su propio mercado y sus propios procesos.

Las tecnologías más cercanas a WebImmersion y en las que (de alguna forma) se basa, son la tecnología HTTP/HTML o lo que conocemos como la WWW, EnterpriseJavaBeans (EJB) y Jini. Dado que es necesario comprender con claridad los puntos clave de dichas tecnologías para comprender qué es exactamente WebImmersion, repasamos a continuación dichas tecnologías. Todas ellas descansan en mayor o menor medida en el modelo cliente/servidor.

#### WWW y HTTP/HTML
Los puntos más característicos de la tecnología HTTP/HTML (incluso XML) son los siguientes:

  - Servidores localizados (mediante IP o DNS) que suminstran ficheros especificados por un URL a clientes remotos.
  - Clientes diseñados como “presentadores genéricos de contenido” (navegadores), con la posibilidad de extender su capacidad para presentar nuevos contenidos a través de pluggins.
  - Contenido asociado a la tecnología: página HTML. Se trata de un fichero de texto formateado que incorpora hipervínculos (referencias URL a otros ficheros, potencialmente en otros servidores de la WWW). Las páginas HTML se “presentan” en el navegador como una página de texto de ancho fijo y largo indefinido.
  - Hipervínculos: Los hay embebidos o no. Si son embebidos en la página HTML, el navegador es responsable de descargar el fichero apuntado por el hipervínculo (URL) y presentar su contenido como parte integrante de la página HTML. Si no es embebido, se presenta un texto de color y subrayado en la página que hará “saltar” al navegador a la dirección especificada por el hipervínculo. De esta forma, el ciclo se repite empezando en esta nueva dirección URL.
  - El interfaz cliente/servidor es conocido por ambas partes: protocolo HTTP.

En la siguiente figura vemos un esquema simplificado de lo que implica la tecnología HTML. Los servidores, según hemos dicho, sirven ficheros. Estos ficheros se estructuran para el cliente en la forma de un árbol, de forma que un URL define claramente el servidor y el path de acceso al fichero. Todas las modificaciones posteriores a esta tecnología (CGI, Servlets, Applets, etc.) no alteran este modelo: se sirven ficheros (o streams de contenidos de ficheros). Lo que sí han modificado es la forma en la que se genera el fichero enviado al cliente: antes siempre era un fichero almacenado en disco, mientras que ahora es muy posible que dicho fichero se genere on-line.

![Tecnología HTML](/images/2000-webimmersion/image01.png)

El ciclo de operación de esta tecnología es el siguiente. Un navegador descarga ficheros HTML y todos los ficheros embebidos en dichas páginas (imágenes, sonidos, videos, etc.), presentándolos todos en la forma de una hoja de ancho fijo y alto indefinido. Para alcanzar este objetivo requiere de un gestor que “organice” la composición de los diferentes elementos integrados en la página, y de un manejador específico capaz de presentar un cierto contenido en la posición y con el tamaño que se le indique. Una vez finalizado el proceso de presentación de contenidos, el usuario puede interaccionar con la página de forma más o menos limitada, siendo la forma más importante de interacción el “click” del ratón sobre un hipervínculo, lo que conducirá a repetir todo el ciclo desde la nueva dirección especificada.

Para los propósitos de la presente explicación, **el punto más importante a recordar sobre la tecnología HTML es que presenta la red como un vasto espacio de documentos (multimedia o no) interrelacionados, y que la “experiencia” de “navegar por la red” se convierte en un saltar de documentos en documentos**.

Introduciremos también el concepto de espacio de aplicación de una tecnología, que es el espacio “lógico” (ámbitos –industriales, ocio, educación, gobierno, etc.-, mercados económicos –banca, automoción, publicidad, etc.-, tipo de usuarios –en todas las edades) donde es posible aplicar una determinada tecnología. En el caso de la WWW y la tecnología HTML, el espacio de aplicación es inmenso, pues ha logrado incorporarse en todos los ámbitos, mercados y usuarios. Actualmente domina la “visión” de Internet (es la única forma en la que la inmensa mayoría percibe Internet).

#### EnterpriseJavaBeans

La tecnología EJB se asienta sobre los siguientes puntos fundamentales:

  - Un cliente de cualquier tipo, no necesariamente java.
  - Un servidor EJB y su contenedor, que contienen una colección de servicios EJB accesibles mediante JNDI. La comunicación con los servicios puede ser mediante IIOP/CORBA, RMI, etc.
  - Sistemas ya existentes de la empresa, pues EJB tiene como principal propósito servir de middletier de los sistemas establecidos en la empresa, proporcionando un medio uniforme y abierto para acceder a la información que contienen.
  - Sólo se transfieren datos: no hay movilidad de código. Los datos deben ser interpretables por igual en el cliente y en el servidor.

![EnterpriseJavaBeans](/images/2000-webimmersion/image03.png)

Como vemos en la figura, un cliente accede a un EJB server con el propósito de obtener información ya existente en los sistemas de la empresa o transformados por algún tipo de proceso previo. Accede a los servicios mediante JNDI, y una vez localizados interactúa con ellos. Se presupone un entorno seguro en el interior de la empresa. Las soluciones son a medida, aunque los módulos EJB intentarán ser todo lo genéricos que sea posible. La implantación es, por tanto, trabajo de especialistas y ajustado a las necesidades de la empresa.

El espacio de aplicación queda reducido al de sistemas informáticos para empresa: así fue concebido. Su diseño se centra en la seguridad de las transacciones y fiabilidad y robustez de la aplicación resultante.

#### Jini

Los puntos más importantes de la tecnología Jini son los siguientes:

  - Tres tipos de elementos: servicios (impresora, tostadora, lavadora, almacén de ficheros, etc.), clientes que desean hacer uso de dichos servicios, y servicios lookup que actuan como intermediarios entre clientes y servicios.
  - Entre los diferentes elementos de Jini se transfieren objetos: contenido serializado y código correspondiente a la clase del objeto.
  - La intercomunicación entre cliente y servicio se realizará vía sockets o a traves de RMI.
  - El cliente localiza un objeto proxy del servicio que desea usar en el servicio lookup y utiliza este proxy como interfaz para realizar consultas o acciones sobre el servicio. La carga del servicio puede repartirse así entre el objeto proxy (en el cliente) y el servidor del servicio.
  - El modelo de seguridad es el propio de código móvil, al estilo de los applets.

En el siguiente esquema tenemos representados los elementos que conforman los bloques básicos de la tecnología Jini:

![Jini](/images/2000-webimmersion/image02.jpg)

Como podemos ver en la figura, un cliente conectado a la red localiza un servicio lookup y solicita un determinado servicio. Para ello especifica un interfaz java que debe cumplir el servicio, además de otros parámetros para centrar más la búsqueda. El servicio de lookup responde con un array de objetos proxy de servicios que implementan dicho interfaz y cumplen los requisitos adicionales especificados. En ocasiones el servicio puede estar contenido en el propio objeto proxy; un servicio “sumador” que sume dos números es lo bastante simple como para que se incluya todo el servicio en el propio proxy. Normalmente el cliente escogerá uno de los servicios y descartará el resto. El cliente empleará entonces el objeto proxy del servicio como el punto de entrada para comunicarse con el servidor del servicio. Las comunicaciones podrían ser vía RMI o con sockets directo.

El espacio de aplicación de Jini es principalmente el de dispositivos electrónicos inteligentes de consumo y es, por tanto, enorme. En cualquier caso pretende cubrir un área principalmente de interacción entre dispositivos autónomos y no la interacción con usuarios humanos.

### Tecnología WebImmersion

La tecnología WebImmersion, como ya apuntábamos, supone una reformulación de tecnologías ya existentes que proporciona un nuevo campo de trabajo dentro de las actuales Tecnologías de la Información.

El objetivo fundamental de WebImmersión es dar un salto cualitativo en la forma en la que el usuario humano (principalmente, aunque no necesariamente siempre) percibe la red. Hasta ahora, el mayor porcentaje de la población de Internautas concibe la red como la actual WWW, lo que equivale a decir “Netscape Navigator” o “Internet Explorer”, imágenes, sonidos y videos, applets java y sencillos formularios en los que introducir tus datos personales. No es esta la única forma de “percibir” la red, como veremos con WebImmersion. “Percepción” es probablemente el concepto más importante dentro de WebImmersion, pues es lo que más cambia para el usuario cotidiano, el usuario al que está orientado esta tecnología.

Un elemento clave de WebImmersion es que no excluye a otras tecnologías, sino que las extiende de forma natural. Así, WebImmersion extiende a la WWW creando un Inmersor que extiende al Navegador agregando objetos java como posibles contenidos representables. Así mismo este inmersor es capaz de acceder a servicios Jini, pues estos son (después de todo) objetos java. WebImmersion define un tipo especial de objetos java conocidos como Entidades Servidoras que desempeñan un rol de gran importancia en el desarrollo de aplicaciones en Red y creación de mundos inmersivos. Estas Entidades Servidoras son objetos java y, como tales, pueden acceder a servicios EJB, CORBA, Jini o cualquier otro servicio que se desarrolle. En definitiva, WebImmersion no está pensada para sustituir a otras tecnologías sino más bien para presentarlas de un modo uniforme e inmersivo para el usuario.

Comenzaremos analizando cuales son los elementos fundamentales de esta tecnología. Después nos detendremos en algunas de estos elementos, para comprender mejor de qué estamos hablando. Terminaremos el apartado con una comparativa con las tecnologías ya existentes y los beneficios que reporta WebImmersion.

#### Elementos fundamentales
Son los siguientes:

  - Adicionalmente a servidores HTTP, Jini o EJB, aparece un nuevo tipo de servidores, localizados mediante IP o DNS, que sirven objetos java (especificados por un URL) a clientes remotos.
  - El cliente principal será el Inmersor, un presentador de contenidos genérico que extiende las habilidades de presentación de contenidos del navegador y agrega la posibilidad de presentar visualmente objetos java, bien a través de un interfaz gráfico incorporado en el propio objeto, o bien mediante un manejador de presentación específico para dicha clase de objetos.
  - Los objetos se estructuran en el servidor en forma de árbol. Todos los objetos no finales (no hoja) implementan un interfaz que los hace contenedores de todos los objetos que tienen por debajo de ellos en el árbol.
  - Cuando un cliente (un Immersor) solicita un objeto del servidor, este puede ser generado en dicho instante, o puede devolverse una copia de un objeto creado anteriormente.
  - Existen objetos java especiales conocidos como Entidades Servidoras que el servidor trata de forma especial, pues no devuelve la propia entidad servidora, sino una Entidad Cliente que la entidad servidora crea en el momento de la petición. La Entidad Cliente suele vincularse mediante RMI a la Entidad Remota, de forma que cuando la Entidad Cliente llega al Immersor, el usuario interactúa con la Entidad Cliente como si se tratase de un “mando a distancia” de la Entidad Servidora. La entidad servidora mantiene un control de todas las entidades cliente que ha creado y puede comunicarse bidireccionalmente con todas ellas, por lo que crear aplicaciones multiusuario es una sencillísima tarea.
  - En concepto de hipervínculo se extiende con WebImmersion, pues ahora los URL pueden apuntar también a servidores de objetos java.
  - Cuando un inmersor recibe un objeto java, puede tratarse de un objeto de clase conocida para la cual exista un manejador específico (por ejemplo, un objeto que implemente javax.swing.table.TableModel podría ser presentado por un manejador de contenidos que creara un Jtable y le asignara dicho modelo, con lo que pasaríamos a ver la tabla en pantalla).
  - El Inmersor que propone WebImmersion se presenta el aspecto de un Navegador, pero incorpora una versatilidad mucho mayor para presentar simultáneamente diferentes contenidos. Esta habilidad resulta crítica para WebImmersion, como entenderemos a continuación.
  - El Inmersor tiene perfectamente integrado el concepto de drag&drop, cut&paste y otras formas de transferencia de información. La ventaja principal en este caso es que se transfieren objetos, de forma que podemos visitar simultáneamente dos entidades servidoras de diferentes empresas y transferir resultados de una a la otra, creando soluciones a medida del usuario para problemas concretos.

#### Comparativa con tecnologías relacionadas
La siguiente tabla muestra una comparativa entre WebImmersion y las principales tecnologías relacionadas:

![Comparativa](/images/2000-webimmersion/image05.png)

## Detalles de la Arquitectura de WebImmersion

### Esquema general de la arquitectura

WebImmersion se compone de tres entornos o marcos de trabajo claramente diferenciados:

  - ImmersionWorldServerFramework
  - ImmersionWorldEntitiesFramework
  - WebImmersorFramework

El siguiente esquema recoge visualmente esta separación:

![WebImmersion arquitectura](/images/2000-webimmersion/image04.png)

Dentro del `ImmersionWorldServerFramework` se enmarcan todos los detalles de la tecnología relativos al servidor de objetos java, al que llamamos `ImmersionWorldServer`. La separación en módulos con responsabilidades bien definidas, interfaces estándar y sustituibles en función de las necesidades del servidor, son los principales objetivos de este marco de trabajo. Los módulos más importantes en los que se divide el servidor son: módulo de autentificación y registro de usuario, módulo de seguridad, módulo de servicio de ficheros, módulo de comunicaciones RMI con SSL, módulo servidor HTTP soporte para RMI y módulo de entrada al árbol de objetos. Especialistas servidores y bases de datos serían los desarrolladores más adecuados para este marco de trabajo.

`ImmersionWorldEntitiesFramework` se encarga de definir qué son Entidades Servidoras y Entidades Clientes, cómo se comunican y qué facilidades ofrecen para el desarrollo de nuevos tipos de Entidades. Principalmente, este marco de trabajo define los interfaces que deben cumplir estas entidades; proporciona también una implementación de referencia, que puede ser usada por desarrolladores de entidades para crear a partir de ellas aplicaciones en red, mundos virtuales, etc.

Finalmente, `WebImmersorFramework` tiene como responsabilidad crear el interface para el usuario humano. Está orientado al desarrollo de un cliente genérico que extiende las posibilidades de un navegador tradicional de WWW, pero capaz de presentar visualmente objetos java extraidos de un ImmersionWorldServer. Dentro de este marco se contempla como principal característica la extensibilidad para la presentación de contenidos. Esta extensibilidad puede lograrse mediante pluggins en el WebImmersor o, de forma dinámica y temporal, mediante entidades servidoras diseñadas para ofrecer servicios de presentación de contenidos. Así, dado un objeto java que mi WebImmersor no es capaz de presentar, solicito a un ImmersionWorldServer especializado en servicios de presentación de contenidos  que me proporcione un objeto presentador de dicho contenido. El resultado dos objetos, el objeto a presentar y el objeto “presentador”, se obtienen de servidores diferentes y se combinan para que el usuario vea un cierto objeto java.
Tras esta breve presentación de los tres entornos de trabajo que se manejan dentro de la tecnología WebImmersion, vamos a analizar con mayor detalle cada uno de ellos.

### Elementos principales de WebImmersion

#### El servidor específcico para WebImmersion: ImmersionWorldServer

WebImmersion, como ya hemos dicho, introduce un nuevo tipo de servidor: ImmersionWorldServer. Este servidor es un servidor de objetos java estructurados según una jerarquía de árbol. La solicitud de objetos java al servidor se realiza mediante RMI a través de la interface ImmersionWorldServerRemoteInterface.

El acceso de un cliente a un objeto java del servidor mediante la interface ImmersionWorldServerRemoteInterface define el Web Immersion Protocol, o “wip”. Los clientes que deseen acceder a un objeto java del servidor, contruyen un URL al objeto del servidor pero especificando que se debe emplear este protocolo: un ejemplo podría ser “wip://www.webimmersion.com/contenthandlers/java.util.Hashtable”. Esta llamada, realizada desde la barra de direcciones del WebImmersor, generaría una llamada RMI al servidor solicitándole el objeto “contenthandlers/java.util.Hashtable”. El servidor retornaría, como respuesta a la invocación del método de petición de objeto, el objeto java solicitado.

El ImmersionWorldServer es algo más que un simple servidor de objetos vía RMI. Como su propio nombre indica, pretende ser el soporte sobre el que construir mundos inmersivos. Hablar de mundos inmersivos supone hablar de usuarios humanos, que son quienes pueden tener experiencias inmersivas. El usuario desempeña en estos servidores un rol muy importante.

Básicamente existen dos tipos de usuarios. En primer lugar están los que sólo “visitan” el servidor solicitando objetos de soporte (como un manejador de contenidos, por ejemplo), o que acceden a Entidades Servidoras que ofrecen interfaces inmersivos pero sólo para ver los lugares públicos. Estos usuarios tienen un perfil muy restringido y les está permitido acceder únicamente a objetos públicos y a características públicas de Entidades Servidoras. Por otra parte están los usuarios registrados en el mundo, para los que el acceso puede autentificarse mediante login y password bajo una conexión segura RMI/SSL. Éstos usuarios tienen acceso a zonas específicas del servidor, poseen un acceso personalizado a Entidades inmersivas (con su propio avatar, objetos personales, etc.) y pueden ser capaces de editar las entidades servidoras sobre las que tengan los privilegios adecuados. En definitiva, los usuarios registrados tienen acceso a capacidades especiales dentro de dicho servidor.

Los ImmersionWorldServers se componen de diferentes módulos sustituibles y configurables, que cooperan para proporcionar los servicios especificados en el ImmersionWorldServerFramework. Aunque WebImmersion proporciona una implementación completamente funcional de referencia, esta implementación no es muy limitada en cuanto al número de usuarios registrados y el tamaño del mundo que puede contener. La modularidad del servidor permite que empresas de desarrollo especializadas diseñen módulos para servidores de inmersión que soporten grandes cantidades de usuarios y mundos inmersivos de gran tamaño y escalables. Así, por ejemplo, el módulo de autentificación y seguimiento de usuarios requiere el almacenamiento de nombres de usuario, datos personales, password, roles, derechos de acceso a edición de entidades, objetos de configuración personalizada, etc. Toda esta información, que se dispara en tamaño al crecer el número de usuarios, debería estar almacenada en bases de datos de gran rendimiento y capacidad. Empresas especializadas en este tipo de servicios, podrían desarrollar estos módulos según las necesidades del servidor.

#### Los objetos especiales para WebImmersion: ServerEntities y ClientEntities

La tecnología WebImmersion introduce unas clases de objetos que presentan un comportamiento especial para servidores de inmersión y para clientes WebImmersor: Entidades Servidoras y Entidades Clientes.

Las Entidades Servidoras son objetos java ubicados en algún punto del árbol de objetos del servidor de inmersión pero que, a diferencia de cualquier obtro objeto java, no son devueltos al cliente cuando se solicita dicho objeto. En lugar de retornar una copia del objeto, el servidor retorna una Entidad Cliente generada por la propia Entidad Servidora. Esta Entidad Cliente estará enlazada normalmente con la Entidad Servidora y actuará como una interfaz remota de la entidad servidora.

Las Entidades Cliente son los objetos java devueltos por el servidor cuando un cliente accede a una Entidad Servidora. Estas Entidades Cliente presentan una interfaz conocida mediante la cual el WebImmersor puede pedirle que cree un GUI para ser presentado dentro del área de presentación de contenidos.

![Server y Client Entities](/images/2000-webimmersion/image07.jpg)

En el esquema vemos el funcionamiento del que hablamos. El cliente, por ejemplo el WebImmersor, solicita un objeto que resulta ser una entidad servidora. El servidor, en respuesta a la petición, pide a la entidad servidora que construya una entidad cliente. La entidad cliente recién creada es devuelta al WebImmersor. Ya en el host cliente, la aplicación WebImmersor desea presentar al usuario el objeto que ha solicitado, así que pide a la entidad cliente que construya un interfaz gráfico (GUI) para ser representado en el área de presentación de contenidos.

Para fijar ideas, imaginemos que accedemos al servidor de una empresa dedicada al mundo de la bolsa. En particular accedemos a una entidad servidora que reporta on-line información de la evolución de las principales bolsas del país. Cuando el WebImmersor solicita dicho objeto, a través de su URL, la entidad servidora crea una entidad cliente enlazada a ella mediante RMI y el servidor de inmersión retorna al WebImmersor dicha entidad cliente. Ya en el WebImmersor, se solicita a la entidad cliente un GUI para presentar en el área de presentación de contenidos. La entidad cliente crea entonces un objeto descendiente de java.awt.Component que muestra de forma gráfica la evolución de la bolsa. Este objeto GUI, al igual que el objeto entidad cliente ejecuta un código procedente del servidor y que jamás estuvo en el host cliente. En este sentido el funcionamiento es como el de un applet, pero con la posibilidad de estar vinculado a un objeto activo en el servidor que procesa o suministra información. Como cada entidad cliente generada se crea para conociendo la identidad del usuario, la información presentada podrá variar según el mismo.

Aunque el diseño y empleo de Entidades Servidoras/Cliente puede ser muy variado (y DEBE serlo, para aprovechar todas sus posibilidades), existe un área de uso donde la tecnología WebImmersion pretende incidir especialmente: desarrollo de Entidades Servidoras/Cliente de carácter inmersivo. El propio nombre de la tecnología, WebImmersion, procede de esta idea central hacia la que deberían focalizarse todos los esfuerzos.

Una Entidad de carácter inmersivo es aquella que sumerje al usuario humano proporcionándole la experiencia de estar en un mundo virtual similar con características similares al real. Un ejemplo de Entidad Servidora inmersiva sería aquella que ofreciera una entidad cliente que creara un GUI donde vieramos una habitración 3D poblada de avatares (representando a otros usuarios conectados a la misma Entidad Servidora) con los que pudiéramos hablar e interaccionar. Como vemos, el modelo es el mismo, pero la experiencia para el usuario es de tipo inmersiva.

Una experiencia de tipo inmersiva no se consigue únicamente poblando un servidor de inmersión de Entidades Servidoras inmersivas, sino que requiere que el diseño global del servidor lo tenga en cuenta. Un buen diseño de servidor/es inmersivo es aquel en el que el usuario iría pasando por los diferentes niveles de inmersion propios de un mundo real, hasta alcanzar la escala en la que tiene objeto la acción que desea realizar. La siguiente imagen intenta representar esta idea.

![WebImmersion](/images/2000-webimmersion/image06.jpg)

El usuario contactaría desde el WebImmersor, por ejemplo, con el URL “wip://www.virtualearth.com/”. Este URL accede a la Entidad Servidora raíz del servidor de inmersión con DNS “www.virtualearth.com”. Esta Entidad Servidora crearía para en usuario una Entidad Cliente que, a su vez, crearía en el área de presentación del WebImmersor la imagen del planeta tierra a vista de satélite. Como el GUI creado no es simplemente una imagen, sino que es en realidad un objeto java, además de mostrarnos la imagen de la tierra, puede ofrecernos información sobre aspectos generales del planeta, descripción de continentes del mismo, datos estadísticos, etc. Además, podría presentar menús para obtener información extra, como cambiar la perspectiva de la imagen, o incluso en lugar de la imagen ver un modelo 3D del planeta con la imagen “real” on-line del planeta tomada por satélites en el espacio. Como vemos las posibilidades son infinitas.

Siguiendo con el diseño de la experiencia inmersiva, la Entidad Principal debería permitirte seleccionar un destino contenido en un nivel inferior de inmersión. En la figura se muestra como siguiente nivel de inmersión el mapa del continente europeo, aunque podría haber sido directamente un país, o incluso una ciudad. Los saltos entre niveles inmersivos deben ser cuidadosos, pues pasar de una escala planetaria a una escala humana no crea fácilmente experiencia inmersiva.

Aunque la sucesión de inmersión que se muestra podría ser creada por una única Entidad Servidora con un GUI muy complejo y cambiante, lo normal es que cada cambio en el nivel de inmersión se corresponda con un salto de una Entidad Servidora a otra. Así, pasaríamos desde la entidad raíz “/” hasta la entidad que representa el interior de un hogar “/europa/españa/valencia/lauria17/13”. Es posible que las Entidades Servidoras que de cada uno de los niveles sean instancias (objetos) diferentes de una misma clase java. Por ejemplo, un desarrollador podría crear la clase “ImageMap” que es una entidad servidora capaz de presentar una imagen, información contextual de la zona sobre la que se sitúe el cursor del ratón (datos sobre un país o ciudad, por ejemplo), y capaz de hacer saltar al WebImmersor a un URL especificado. Sólo con esta clase de objetos ya es posible crear todos los niveles de inmersión excepto el del interior de la casa. Cada “ImageMap” presentaría la imagen correspondiente a su nivel de inmersión y definiría zonas en la imagen que lanzarían hipervínculos a entidades “ImageMap” de niveles inferiores de inmersión. En el caso del interior de la casa, la Entidad Servidora más adecuada sería una capaz de mostrar un entorno 3D, con avatares de usuarios que estén en ese momento en la habitación y con capacidad de hablar e interaccionar con ellos. Nuevamente, esta clase de Entidad Servidora se podría emplear en numerosos contextos.

La verdadera experiencia inmersiva se consigue no obstante cuando el usuario, como avatar en un mundo virtual, es capaz de interaccionar con los objetos de su entorno. Así, imagemos que el usuario halla una “calculadora” virtual en una entidad inmersiva de tipo 3D en la que se encuentra. Al seleccionar con un “click” dicha calculadora, el GUI de la entidad inmersiva habre en el área de presentación de contenidos del WebImmersor una subventana donde lanza la presentación de un cierto URL. Dicho URL apunta a una Entidad Servidora con un GUI que permite al usuario realizar operaciones de cálculo, con un teclado numérico, operaciones comunes, etc. Como podemos imaginar, la experiencia es que el usuario localiza un objeto, y lo manipula de forma real, obteniendo resultados y creando modificaciones persistentes observables por otros usuarios. Así, si en uno de estos entornos 3D hallamos una caja, al seleccionarla obtendremos un GUI que nos permitirá ver su contenido, meter y sacar objetos, etc. Si otro usuario realiza posteriormente la misma operación, encontrará la caja como la dejó el primero.

Vemos que las posibilidades de desarrollo de entidades servidoras son infinitas. Las Entidades Servidoras permiten desarrollar cualquier tipo de aplicación con código procedente del servidor ejecutándose parcialmente en el servidor y parcialmente en el cliente. Esto permite desarrollar cualquier tipo de aplicación en red: desde un simple procesador de textos, a una habitación 3D inmersiva plagada de objetos con los que interacionar, pasando por una aplicación de correo electrónico como Hotmail pero mucho más versatil y cómoda de usar.

Aunque el desarrollador de Entidades Servidoras/Cliente puede desarrollarlas como inmutables, el ImmersionWorldServerFramework proporciona una serie de facilidades muy útiles para que usuarios con los permisos adecuados tengan acceso a editar la entidad. Con Entidades de este tipo, crear un mundo de inmersión es tremendamente sencillo: basta con crear el árbol de objetos/entidades y editar cada uno de ellos. Traducido a términos de la WWW sería como si las páginas Web de un servidor fueran editables desde el mismo navegador siempre que tuvieras los privilegios adecuados. Además, desde el momento en que se realizaran los cambios, estos estarían disponibles para el resto de usuarios.

#### El cliente específico para WebImmersion: WebImmersor

WebImmersion emplea como principal aplicación cliente (aunque no la única posible) el WebImmersor, una aplicación Java 100% diseñada como un presentador genérico de contenidos, extensible a través de pluggins.

Como presentador genérico de contenidos es, entre otras cosas, un navegador genérico de la actual WWW. Acepta URLs de ficheros HTML, JPG, MPEG, etc. y los presenta en pantalla. Sin embargo, a diferencia de los navegadores tradicionales, presenta una característica notable: el usuario es capaz de separar el área de presentación de contenidos de forma arbitraria. La siguiente figura muestra una pantalla extraida del prototipo actual de WebImmersor:

![WebImmersor](/images/2000-webimmersion/image09.jpg)

Como vemos, el área de presentación está separada en 5 partes principales. En la zona izquierda del área de presentación vemos 2 páginas web, una con el “Trail Map” del tutorial de java y la segunda con los API del JDK 1.3. En el lado derecho vemos tres videos visualizándose simultáneamente.

En muy poco tiempo cualquier usuario se da cuenta de lo ventajoso de esta aproximación que, por otra parte, es vital para la explotación de todas las posibilidades de WebImmersion.

Pero WebImmersor no es sólo un navegador convencional con algunas características útiles: WebImmersor es capaz de acceder a servidores inmersivos mediante el protocolo WIP y obtener objetos remotos y acceso a Entidades Servidoras.

En la figura siguiente se muestra un ejemplo del WebImmersor prototipo mostrando un área de presentación de contenidos separada en tres zonas. Cada una de ellas presenta el GUI ofrecido por alguna Entidad Servidora que ha sido accedida mediante el protocolo WIP.

En la zona superior izquierda se muestra el GUI de una entidad creada para el prototipo que se denomina PortalEditor. Su única misión es proporcionar al usuario un interfaz gráfico con el que crear objetos java y asociarles un nombre en el servidor inmersivo. Así, por ejemplo, el GUI muestra (entre otros) que ya hay creado una entidad servidora con el nombre “Mike’sWorld” que no es más que un objeto de la clase “iwsentities.examples.ImageMap”.

En la zona superior derecha del área de presentación de contenidos del WebImmersor se muestra el GUI que retorna el servidor cuando se accede a la entidad “Mike’sWorld”. Vemos una cabecera, la imagen de un planeta rojo y una zona a la derecha de color amarillo. Este es el GUI que retorna la Entidad Servidora prototipo de la clase “iwsentities.examples.ImageMap”. La barra de cabecera incorpora un título que identifica la localización que estamos visitando, además de otras propiedades que luego veremos. La zona de la imagen presenta una imagen cualquiera sobre la que se han definido zonas o regiones. A la derecha vemos el espacio dedicado a un scroller informativo: cada vez que el usuario posiciona el cursor sobre una zona de la imagen, el texto asociado se muestra en el scroller con un suave scroll para visualizar la información con comodidad. Finalmente, cada región de la imagen tiene asociado un hipervínculo, por lo que si hacemos “click” con el ratón sobre cualquiera de ellas, se lanza un salto al URL definido para dicha zona.

![WebImmersor](/images/2000-webimmersion/image08.jpg)

Cuando hacemos “click” sobre la barra de un “ImageMap”, se despliega un menú contextual que nos ofrece dos vistas (si tenemos los privilegios de edición para dicha entidad): vista y edición. La parte inferior del área de presentación de contenidos muestra cómo el GUI cambia, mostrando ahora un editor específico para Entidades Servidoras del tipo “ImageMap”. Desde este editor, el usuario puede (desde su posición remota) cargar una imagen, definir zonas, URLs de destino y descripciones, etc. Cuando la entidad está al gusto del usuario dueño de la entidad, salva el estado y toda esa información (imágenes, URLs, texto, etc.) es transferida y guardada en el servidor, a disposición del siguiente usuario que acceda a dicha entidad.

La simplicidad es total: el propio WebImmersor nos permite construir o modificar el mundo de inmersión desde cualquier parte del mundo. Las posibilidades son infinitas.

![WebImmersor](/images/2000-webimmersion/image12.jpg)

En la figura anterior vemos otro ejemplo de Entidad Servidora inmersiva. Se trata de un objeto java de la clase “iwsentities.examples.GraphicChatRoom” que, como su propio nombre indica, es una habitación virtual donde puedes conversar con la gente (en este ejemplo, la entidad está pensada para crear entornos 2D). Cada usuario que se conecta a dicha Entidad  Servidora, queda representado por un avatar que puede controlar con el ratón y desplazarlo por la pantalla. Sólo aquellos otros usuarios cuyo avatar se encuentre cercano al tuyo excucharán tus mensajes. Además, al igual que la entidad de ejemplo “ImageMap”, es posible definir sobre la imagen de fondo una serie de regiones que lanzan la activación de URLs en el WebImmersor. Así, si hacemos “click” sobre un “armario” de la habitación, es posible que se nos habra una subventana en la zona de presentación del webImmersor mostrándonos el GUI de la entidad servidora que representa al armario (que podría ser un dibujo más detallado del armario con objetos java en su interior).

Nuevamente vemos en la zona inferior el editor de esta entidad servidora. En esta ocasión se nos permite definir las capas que forman el entorno 2D (imágenes, transparencia, posición en el grid de perspectiva, etc.), la dirección de los ejes principales del grid donde se ubican los avatares, zonas del entorno y sus hipervínculos asociados, etc.

### Conclusiones

El lector avispado habrá observado ya que si somos capaces de traernos un “ImageMap” o un “GraphicChatRoom” con sus respectivos editores, nada nos impide traernos cualquier aplicación, sin importar tipo que sea. Con WebImmersion la frase acuñada por Sun de “La red es la computadora” cobra el máximo sentido, pues con WebImmersion la computación se reparte entre servidores de inmersión y clientes WebImmersor. Trabajar en la red es, con WebImmersion, una realidad sencilla, cómoda y de uso extremadamente simple.

Con el desarrollo de módulos para servidores de inmersión que soporten grandes números de usuarios y la proliferación de Entidades Servidoras/Cliente altamente configurables y editables desde el propio WebImmersor, desarrollar mundos inmersivos será una tarea al alcance de cualquier persona con conocimientos mínimos; esto augura una fácil implantación y extensión de la tecnología.

Las oportunidades de negocio que aparecen de forma natural con WebImmersion son incontables. Enumeraremos tan sólo algunas de ellas:

  - Venta de viviendas virtuales, con armarios donde guardar documentos, máquinas de escribir que abren potentes procesadores de texto, pantallas donde poder ver la televisión, etc. Todo ello combinado con la experiencia inmersiva: representación del usuario por un avatar controlado por él, recepción de visitas en el interior de la casa admitidas por el propio dueño, decoración personal de la vivienda, etc.
  - Venta de espacios destinados a empresas comericiales, con dependientes virtuales (avatares) que ayudan al usuario a elegir el producto que desean, además de mostrarle todos los detalles del mismo.
  - Desarrollo de aplicaciones internas (en Intranets) en empresas con administración y configuración de usuario casi nula. La aplicación FSI para Ford España, s.a es un claro ejemplo de este uso de WebImmersion.
  - Desarrollo de aplicaciones externas (para Internet) que ofrezcan servicios propietarios (complejos algoritmos, etc.) previo pago. Esta fórmula de pago por uso del servicio, será probablemente uno de los negocios del futuro más fructíferos: con un mercado global, con millones de usuarios, los servicios pueden ponerse al alcance de cualquiera por poco dinero (poco dinero pero muchos usuarios). Además, cualquier empresa puede triunfar si ofrece un buen servicio. Veamos ejemplos de uso:
    - Una empresa dedicada al campo de las matemáticas desarrolla en la actualidad un paquete tremendamente costoso que sólo puede vender por una gran suma de dinero. No sólo debe contar con el trabajo de desarrollo del producto software, sino también con la preparación y costes de manuales CD-ROMS, caja, distribución del producto en los diferentes paises, etc. Todo esto hace encarecer aún más el producto, que sólo pueden permitirse grupos que realmente lo necesiten. Además, no pueden luchar contra el pirateo informático que les revienta las ganancias.
    - Con WebImmersion, su modelo del neocio cambia radicalmente. Los usuarios acceden a servicios especiales del paquete, algunos de ellos gratuitos (para ganar usuarios) pero otros requieren el pago de cantidades muy asequibles. El mercado es global: cualquiera puede hacer uso de los servicios, por lo que los “pequeños” pero muy numerosos usos de los servicios hacen que la empresa gane rápidamente dinero. No hay distribuidores: el paquete llega a todo el mundo. No hay pirateo posible con este nuevo modelo de negocio: los cálculos duros se realizan en sus potentes servidores y sólo se devuelven resultados. No hay gastos de envío, ni de material... La documentación es on-line, los bugs se solucionan al momento y son accesibles a todos los usuarios en la siguiente reconexión.
  - Ocio. Las oportunidades son inmensas en este campo, y se diluyen un poco con otras áreas: cualquier lugar inmersivo puede ofrecer oportunidades para el ocio, asegurándose que el usuario regresará en otra ocasión. Crear mundos de fantasía o futuristas donde jugar on-line con miles de otros usuarios es algo natural con WebImmersion.
  - Control remoto de instalaciones. Simplificando la inversión en tecnologías más costosas y mejorando la calidad del control.

## Ejemplos de uso de la tecnología WebImmersion

### Distribución masiva de aplicaciones a clientes de mantenimiento nulo. Caso de estudio: Aplicación FSI para Ford España,S.A.

Posiblemente, uno de los usos más productivos a nivel empresarial de la tecnología WebImmersion es la facilidad con la que se diseñan, desarrollan, distribuyen y, sobre todo, se actualizan las aplicaciones en la empresa.

Cuando pensamos en el desarrollo e implantación de una nueva aplicación para la empresa que va a ser usada por muchos usuarios, encontramos (entre otros) los siguientes problemas:

  - Distribución, instalación y configuración de la aplicación. Estas operaciones requieren de personal cualificado que realice esta tarea, que en ocasiones (y según el número de usuarios) puede llevar semanas.
  - Actualización de la aplicación. El software a medida experimenta cambios con relativa frecuencia, por lo que podemos encontrarnos con que el problema de distribución, instalación y configuración se repite con frecuencia. Peor es aún el caso en el que varias versiones del mismo software conviven en la flota de usuarios.

La tendencia actual para resolver este problema consiste en trasladar las aplicaciones, o al menos los resultados, a la WWW. Con el mismo cliente instalado en todos los usuarios (un navegador), cada usuario accede a los servicios que se le ofrecen a través de las páginas HTML de la Intranet de la empresa. Así, por ejemplo, es sencillo acceder a informes de los sistemas de producción, ver tablas de bases de datos de sistemas de almacenamiento, etc. Sin embargo trasladar aplicaciones a las fórmulas ofrecidas por HTML y derivados no es sencillo: después de todo el navegador limita lo que puedes o no hacer.

La percepción que tiene el usuario cuando trabaja con una aplicación trasladada a Internet no es la misma que cuando trabaja con su procesador de textos habitual, su hoja de calculo, etc.: no son “exactamente” programas. El motivo es simple: la WWW no fue concebida para esta función. Es fabulosa para enlazar documentación, pero está muy limitada como medio para distribuir aplicaciones.

Probablemente la aplicación mejor llevada a Internet (por su alcance en número de usuarios) sea Hotmail de Microsoft. Hotmail es una prueba tangible de que es posible distribuir aplicaciones a través de Internet o la Intranet de la empresa. No requiere instalación en el usuario, así como tampoco mantenimiento, pero lo mejor es que las actualizaciones son inmediatas y centralizadas en el servidor. El modelo reduce la instalación, configuración y actualización de aplicaciones a transmitirle al usuario la dirección URL donde debe conectarse para acceder al servició (o, mejor aún, crear un hipervínculo nuevo en la página por defecto del cliente).

El desarrollo de apliaciones en red no es algo forzado para la tecnología WebImmersion, sino su uso natural. A continuación veremos un ejemplo de cómo funciona esta tecnología en una empresa de la talla de Ford.

Los sistemas de control de producción de vehículos de Ford España, S.A. y el resto de plantas Ford en Europa son sistemas informáticos tremendamente robustos y asentados a lo largo de muchos años de buen funcionamiento en la empresa. El acceso a los mismos, desde terminales virtuales (VT) en planta o sesiones Telnet desde un PC, requiere sin embargo unos conocimientos notables del funcionamiento del sistema. Hasta para obtener las piezas de información más sencillas se requiere escribir largos comandos donde es muy fácil cometer errores. El resultado es que muy pocos saben cómo acceder a la información en el sistema y, usualmente, sólo saben acceder a aquella información con la que más asiduamente trabajan.

La solución a este problema pasa por crear un interfaz gráfico seguro que se encarge de consultar al sistema y nos presente la información de una forma amigable, rápida y fiable. Esta aplicación podría desarrollarse empleando otras técnicas, pero WebImmersion ofrece unas características que la convierten en una candidata perfecta:

  - Instalación única por cada cliente. Consistente en el JRE (Java Runtime) y una aplicación cliente genérica similar al WebImmersor pero con menos funcionalidades y personalizado para su uso en Ford.
  - Aplicación modular y extensible. La aplicación se compone de módulos independientes que se comunican entre sí. Extender la aplicación es tan sencillo como agregar nuevos módulos o reconfigurarlos. Las extensiones están disponibles en la siguiente reconexión del usuario.
  - Control de usuarios centralizado y basado en roles. Cada usuario tiene acceso sólo a los módulos permitidos por su “rol de usuario”.
  - Mantenimiento on-line. Cualquier modificación en cualquiera de los módulos (como la corrección de bugs) está inmediatamente disponible a todos los usuarios.

Como vemos, presenta todas las ventajas del modelo HTML pero con la funcionalidad propia de cualquier aplicación actual.

En la siguiente figura vemos la filosofía de WebImmersion aplicada al caso de FSI. Disponemos de un cliente genérico “vacio” y un servidor de inmersión. Uno de los objetos en el servidor contiene una entidad servidora cuya entidad cliente construye en el host cliente los diferentes módulos a los que tiene acceso el usuario en función de sus privilegios.

![WebImmersor Ford](/images/2000-webimmersion/image10.jpg)

Cuando el cliente genérico ha cargado los módulos correspondientes (actualmente la suma TOTAL de información de TODOS los módulos, con imágenes, código, etc. no llega a los 400k que se carga en menos de 5seg en la intranet de Ford, tiempo en el que se presenta una SplashWindow), el usuario puede interaccionar completamente con los sistemas Ford, según vemos en la siguiente figura.

![WebImmersor Ford](/images/2000-webimmersion/image11.jpg)

Las comunicaciones se realizan bajo RMI entre los módulos y el servidor y vía Telnet entre el servidor y los sistemas Ford.

El servidor acepta múltiples usuarios e implementa técnicas de caché tanto en el cliente como en el servidor para minimizar el flujo de datos y reducir la carga de consulta a los sistemas Ford.

La percepción del usuario es la de trabajar con una aplicación perfectamente integrada de la que no sabe que casi nada de lo que ve se ha cargado en su máquina desde un servidor remoto. Sin embargo, sí sabe que cada vez que se conecta tiene nuevas opciones/módulos, los módulos han cambiado, se han eliminado o pulido pequeños fallos, etc. Todo se realiza desde el servidor y por el administrador del mismo.

En el caso de esta implementación de la tecnología, la utilización de entidades específicas (módulos específicos) es inevitable al tratarse de una solución a medida y para un propósito muy concreto. Además, no se ha prestado especial atención al desarrollo de interfaces que incorporaran su propio editor, pues el objetivo de estas entidades no es el desarrollo de mundos inmersivos de fácil construcción, sino simplemente proporcionar las ventajas de WebImmersión para la distribución y desarrollo de aplicaciones en red.

Actualmente el proyecto está en fase de implantación y son múltiples sus usuarios. Los principales problemas encontrados son los propios de cualquier aplicación convencional, con bugs en el código, etc. El hecho de que los módulos no sean locales no ocasiona nunca ningún problema, excepto si falla la red o el servidor cae, problemas característicos de cualquier sistema distribuido.
