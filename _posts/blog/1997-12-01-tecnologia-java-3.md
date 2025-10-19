---
title: Tecnología Java (y III) (ES)
excerpt: "This a 3 article serie about the early JVM, published also in RPP magazine"
tags: [rpp]
modified: 2015-11-21
comments: true
image:
  feature: 1996-04-01-256000-colores-en-tu-VGA/RPP-header.jpg
ref: tecnologia-java-3
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

This was my second publication in a professional magazine: RPP. RPP (Revista Profesional
de Programadores)

This is the third of a 3 articles serie. See the [1st](/blog/tecnologia-java-1/) an [2nd](/blog/tecnologia-java-2/) part.

<figure class="half">
    <a href="/images/1997-tecnologia-java/cover-3.jpg"><img src="/images/1997-tecnologia-java/cover-3.jpg"></a>
</figure>

----

> No sabemos cuanto tiempo dispondremos de Java como tal, pero lo que sí podemos asegurar es que su tecnología le sobrevivirá. Es una tecnología nueva y supone un modelo a seguir en el futuro. Java ha asentado unos precedentes de los que difícilmente podremos prescindir. Le cambiarán el nombre, será más rápido, más seguro, pero la tecnología será la misma. No es vano conocerla.

En los artículos anteriores de la serie hablamos de la Plataforma Java, de la estructura lógica interna de la MVJ, del formato binario .class y del conjunto de instrucciones de la Máquina Virtual Java. Conocemos ya bastante bien los
fundamentos del funcionamiento de la MVJ. Intentaremos
ahora completarlos con detalles sobre implementación y
ejecución.
Implementación de la MVJ. SubEpígrafe
No nos engañemos, no es fácil construir una MVJ. Por
fortuna, es poco probable que nuestro jefe nos pida que la
diseñemos. Fuera de bromas, aquél que haya seguido la serie
probablemente estará interesado en conocer cómo se
implementa una MVJ. A estos lectores está dedicado este
apartado.
Tomaremos como base la implementación de Sun (ver [1]). En
cualquier caso, aquí lo mejor es ser creativo (cada
implementación es diferente) y que cada uno le de su propio
enfoque.
Pensando en las estructuras de datos de la MVJ,
necesitaremos un Heap Java, un Área de Métodos y una pila
de ejecución por cada Thread. Hablemos un poco de cada una
de ellas.
Java es un lenguaje orientado a objetos: todo (o casi) en
Java son objetos. Una clase (class) define una serie de
campos y métodos que actúan sobre dichos campos. Los
métodos son los mismos para todos los objetos de la misma
clase, pero no los valores de los campos. Un objeto,
instancia de una clase, se caracteriza entonces por el
valor de sus campos y la clase a la que pertenece (donde se
definen los métodos). El Heap Java está organizado teniendo
esto en mente.
***********************************************
Figura A: Heap Java en la implementación de Sun.
***********************************************
En la Figura A podemos ver el Heap Java de Sun. Es un área
de memoria separado en dos grandes partes. En la primera
parte se guardan los handlers de los objetos. En la segunda
parte (zona de datos) se guardan los valores de los campos
de los objetos. Un handler no es más que una estructura de
datos con 2 punteros. El primero es un puntero a la tabla
de métodos del objeto. El segundo es un puntero a la zona
de datos del Heap, donde se encuentran los valores de los
campos de la instancia. En el artículo anterior hablábamos
de un objectref como una referencia a un objeto. Este
objectref no es más que un índice a la tabla de handlers
del Heap. Todo objeto tiene una referencia y, por tanto, su
handler. Dado el handler de un objeto, tenemos acceso a los
campos de la instancia y a los métodos que actúan sobre
ellos.
Cada clase se describe en un bloque de datos que contiene
el pozo de constantes de la clase, el código de los métodos
que implementa, una tabla de métodos y una tabla de
símbolos. Los métodos de la clase tienen unas firmas que
los identifican. El conjunto de firmas forma una tabla de
métodos para la clase, y cada entrada tiene asociado un
bloque que describe el método en cuestión (si es nativo o
no, la localización de los bytecodes, etc.). Las firmas de
los campos de la clase también constituyen una tabla de
campos, que tendrán asociados offsets en los datos de cada
objeto guardados en el Heap. Toda esta información la
guardaremos en el Área de Métodos.
Necesitaremos registrar las clases cargadas en la máquina.
Asociaremos al nombre de la clase el cargador (el cargador
standard lee del disco local en el CLASSPATH, pero podemos
hacer otro cargador que lea de la Red), un puntero al
bloque de descripción de la clase (que hemos comentado
antes), flags de acceso, etc.
Para cada Thread en funcionamiento, necesitaremos una pila
de ejecución. La pila de ejecución (ver Figura B) contiene
los frames de los métodos que todavía no han acabado.
Cuando a mitad de un método se llama a otro, un nuevo frame
es creado en esta pila. El nuevo frame contendrá las
variables locales, el entorno de ejecución y la pila de
operandos del método llamado.
***********************************************
Figura B: La pila de ejecución. Existe una por cada Thread
en funcionamiento.
***********************************************
Estas son, en líneas generales, las estructuras que maneja
la MVJ. Para conocer cómo opera con ellas, lo mejor es que
la veamos en acción…
Ejecutando la MVJ. SubEpígrafe
No hay nada más querido, por todos los que aprendemos día a
día, que un buen ejemplo. Que tan bueno será éste que sigue
no lo se, pero sí confío en que, al menos, será más ameno
para el lector que todo lo anterior.
Tomemos como ejemplo un sencillísimo fichero fuente Java
(ver el Listado 1). En él se definen dos clases, padre e
hijo. La primera clase (ClasePadre) contiene el método
main() y será la entrada al programa.
Los hijos son matemáticos un poco raritos, que suman
enteros que les dan al nacer y dan el resultado en formato
flotante. Por cierto, no hablan, sólo suman. El padre tiene
nada más empezar dos hijos, y en lugar de ver si lloran,
les pide que sumen los números. Nada extraño.
Cuando compilamos el fichero fuente, javac crea dos
ficheros .class: ClasePadre y ClaseHijo.
***********************************************
Listado 1: Programa fuente rpp.java
class ClasePadre{
 public static void main(String arg[]){
 ClaseHijo PrimerHijo = new ClaseHijo(3,7);
 ClaseHijo SegundoHijo = new ClaseHijo(1,2);
 System.out.println(PrimerHijo.Suma());
 System.out.println(SegundoHijo.Suma());
 }
}
class ClaseHijo{
 int NumeroA, NumeroB;
 float Resultado;
 public ClaseHijo(int A,int B){NumeroA=A; NumeroB=B;}
 public float Suma(){
 Resultado=NumeroA+NumeroB;
 return(Resultado);
 }
}
***********************************************
Aunque todos estaremos de acuerdo en que vamos a ver en
nuestro monitor los valores 10.0 y 3.0, probablemente no
sepamos con certeza qué ha hecho la MVJ durante el proceso.
Para explicarlo con mayor claridad, hemos desensamblado
(con javap) las clases ClasePadre (Listado 2) y ClaseHijo
(Listado 3).
Inicialmente tendremos una MVJ, vacía y ociosa, a la que se
le pide que ejecute el método main() de una clase llamada
ClasePadre. Esto es, en esencia, lo que hace el intérprete
de Java cuando lo lanzamos: llamar al main() de la clase
que le pasamos como argumento.
El proceso que realiza la MVJ entonces es siempre el mismo.
Busca en la tabla de clases cargadas si ya existe la clase
del método solicitado. En nuestro caso no la encuentra,
pues acabamos de comenzar: debe cargarla en memoria. Para
ello emplea el cargador de clases por defecto, que lee del
disco local. Nada impide crear un intérprete de Java con un
cargador de clases por defecto que lea de la red, algo muy
útil por ejemplo en Ordenadores de Red.
Tras cargar la clase ClasePadre, se crea un objeto de la
misma y se pasa el control al método <init>(), método que
se llama siempre cuando inicializamos un nuevo objeto.
Todos los objetos tienen como primera variable local el
objectref que identifica al objeto (es como si te dijeran
“toma, éste es tu D.N.I.”). El método <init>() de
ClasePadre (ver Listado 2), carga en la pila su objectref y
realiza una invocación especial (tipo de invocación de la
que no se habla en [2]) al <init>() de su clase superior
(java.lang.Objet). Esto es todo lo que hace para
inicializarse.
Ya tenemos el objeto creado. Ahora podemos llamar al método
main(). Siguiendo el Listado 2, lo primero que se hace es
crear un nuevo objeto (new) descrito por el ítem nº 1 del
pozo de constantes. El desensamblador nos escribe a la
derecha el ítem en cuestión (en este caso la clase
ClaseHijo). Tras la creación de la instancia, la pila
contiene el objectref del objeto creado.
A continuación duplica (dup) la referencia de dicha
instancia (pues la necesitará después).
En este punto tenemos un ejemplo de acelerador: iconst_3,
que sólo ocupa un byte, carga el entero 3 sobre la pila.
Como solo hay aceleradores hasta iconst_5, para meter un 7
en la pila se hace necesario usar bipush, que transforma el
siguiente byte (de valor 7 en nuestro caso) en un entero y
lo mete en la pila.
Con lo anterior, hemos creado un nuevo objeto ClaseHijo
(PrimerHijo en nuestro programa fuente) y hemos puesto en
la pila los enteros 3 y 7. Tras llamar al método <init> de
la ClaseHijo, la nueva instancia queda completada. La
referencia del objeto que todavía queda en la pila
(recuerdan el dup) se guarda en la variable local 1.
***********************************************
Listado 2: Desensamblado de ClasePadre.class
Compiled from rpp.java
class ClasePadre extends java.lang.Object
 /* ACC_SUPER bit set */
{
 public static main ([Ljava/lang/String;)V
/* Stack=4, Locals=3, Args_size=1 */
 <init> ()V
/* Stack=1, Locals=1, Args_size=1 */
Method main ([Ljava/lang/String;)V
 0 new #1 <Class ClaseHijo>
 3 dup
 4 iconst_3
 5 bipush 7
 7 invokespecial #7 <Method ClaseHijo.<init>(II)V>
 10 astore_1
 11 new #1 <Class ClaseHijo>
 14 dup
 15 iconst_1
 16 iconst_2
 17 invokespecial #7 <Method ClaseHijo.<init>(II)V>
 20 astore_2
 21 getstatic #9 <Field java.lang.System.out
Ljava/io/PrintStream;>
 24 aload_1
 25 invokevirtual #8 <Method ClaseHijo.Suma()F>
 28 invokevirtual #10 <Method
java.io.PrintStream.println(F)V>
 31 getstatic #9 <Field java.lang.System.out
Ljava/io/PrintStream;>
 34 aload_2
 35 invokevirtual #8 <Method ClaseHijo.Suma()F>
 38 invokevirtual #10 <Method
java.io.PrintStream.println(F)V>
 41 return
Method <init> ()V
 0 aload_0
 1 invokespecial #6 <Method java.lang.Object.<init>()V>
 4 return
}
***********************************************
Con exactamente la misma estructura se crea el SegundoHijo.
Por cierto, ¿vieron que para inicializar a los hijos se
llama a un método <init>(II)V? Los dos “II” dentro del
paréntesis significan (como muchos habrán adivinado) que
tiene dos argumentos enteros. La “V” del final indica que
el método es de tipo void.
En la posición 21 del código del método main() se carga en
la pila el contenido del campo Ljava/io/PrintStream (esto
es un ejemplo de firma, situada en la posición 9 del pozo
de constantes) de la clase java.lang.System.out.
A continuación cargamos en la pila el objeto PrimerHijo
(cuyo objectref guardábamos en la variable local 1) y
llamamos a uno de sus métodos: Suma(). Detengámonos un poco
aquí. La MVJ tiene es ese momento en la pila el objectref
de la instancia PrimerHijo y, por otro lado, un índice al
pozo de constantes donde se encuentra la firma del método
Suma(). Como ya vimos, multiplicando objectref por el
tamaño de un handler obtenemos un offset en el Heap Java
donde encontraremos un puntero a la tabla de métodos del
objeto y un puntero a los datos de la instancia. Lo que
ahora nos importa es que tenemos una tabla de métodos (la
del objeto) y un método pendiente de ejecutarse. Buscando
el método en dicha tabla, la MVJ encuentra la entrada
ClaseHijo.Suma()F. Asociado a esta entrada se encuentra un
puntero al bloque del método Suma(), donde se haya toda la
información del mismo (entre otras cosas, el código). Por
supuesto, todo esto es transparente para nosotros.
Por si alguien todavía no se ha dado cuenta, esto es lo que
conocemos habitualmente como enlace dinámico. Dado que no
es nada eficiente buscar coincidencias entre cadenas, una
vez que se ha realizado por primera vez, se puede sustituir
el ítem de firma de método en el pozo de constantes por un
ítem, válido sólo en tiempo de ejecución, que sea
directamente un puntero al bloque del método.
El resto del Listado 2 está bastante claro.
***********************************************
Listado 3: Desensamblado de ClaseHijo.class
Compiled from rpp.java
class ClaseHijo extends java.lang.Object
 /* ACC_SUPER bit set */
{
 NumeroA I
 NumeroB I
 Resultado F
 public <init> (II)V
/* Stack=2, Locals=3, Args_size=3 */
 public Suma ()F
/* Stack=3, Locals=1, Args_size=1 */
Method <init> (II)V
 0 aload_0
 1 invokespecial #4 <Method java.lang.Object.<init>()V>
 4 aload_0
 5 iload_1
 6 putfield #5 <Field ClaseHijo.NumeroA I>
 9 aload_0
 10 iload_2
 11 putfield #6 <Field ClaseHijo.NumeroB I>
 14 return
Method Suma ()F
 0 aload_0
 1 aload_0
 2 getfield #5 <Field ClaseHijo.NumeroA I>
 5 aload_0
 6 getfield #6 <Field ClaseHijo.NumeroB I>
 9 iadd
 10 i2f
 11 putfield #7 <Field ClaseHijo.Resultado F>
 14 aload_0
 15 getfield #7 <Field ClaseHijo.Resultado F>
 18 freturn
}
***********************************************
En el Listado 3 vemos el desensamblado de la ClaseHijo. En
esta ocasión el método de inicialización de las instancias
de la clase es más complejo. Como ya ocurría en la
ClasePadre, se inicializa primero la superclase. En segundo
lugar, se llenan los campos NumeroA y NumeroB de la
instancia con los valores que se pasan como argumentos.
Vemos aquí cómo se pasan estos: si la variable local 0
contenía el objectref de la instancia, las siguientes
variables locales contienen los argumentos que se pasan al
método.
En el código correspondiente al método Suma() de la clase
ClaseHijo, vemos el funcionamiento de la pila de operandos:
se sitúan sobre la pila los valores de NumeroA y NumeroB de
la instancia y luego los sumamos con un iadd.
Por cierto, ¿no creen que el código generado por javac es
mejorable? Se me antoja que, tanto empeño que pusieron en
hacer bytecodes eficientes, no servirá de nada si no
generan un código más pulido. Y les aseguro que un dup bien
puesto, es mucho más rápido (tal vez en un orden de
magnitud) que releer el campo Resultado (creo que me
entienden).
Pero sigamos, que aún quedan cosas por tratar.
Últimos detalles y consideraciones sobre seguridad.
SubEpígrafe
El Listado 4 es un fragmento del fichero File.java,
perteneciente al paquete java.io, donde se describe la
clase File. En dicho fragmento podemos ver algunos métodos
privados de la clase File que realizan operaciones sobre el
directorio local. Pueden ver que son métodos nativos.
Volvamos ahora sobre aquello que dijimos en el primer
artículo de la serie: ¿si la CPU no tiene E/S, cómo manejar
entonces tantos y tan variados dispositivos? Ya anticipamos
entonces que ‘los API sabían cómo hacer estas cosas’. Esta
vez seremos más claros.
La forma en que maneja la E/S la MVJ es a través de los
métodos nativos. Cuando la MVJ se encuentra una llamada a
un método nativo y le cede el control, la MVJ cesa de
ejecutar bytecodes. Una función con código máquina
específico de la plataforma base se carga desde una
librería de enlace dinámico, ejecutando el código nativo en
cuestión. Ya tenemos la E/S. Además es muy fácil de
extender: para cada nuevo dispositivo, basta con crear
funciones con el código nativo que realice la E/S, y una
interfaz (o clase, según gustos) para poder manejarlo desde
Java. Por supuesto, una implementación de la MVJ con un API
reducido y que sabemos que va a ser fijo (un dispositivo de
electrónica de consumo, por ejemplo) puede obviar la carga
dinámica de librerías nativas y tener implementado el
código nativo de E/S en la propia MVJ, acelerando bastante
el proceso.
Vale, ¿qué pasa con la seguridad? Como ya apuntábamos en el
artículo pasado, no es fácil crackerear la MVJ jugando con
los bytecodes (o, más general, con los ficheros binarios).
Vamos a suponer que todo lo que tenemos en nuestro
ordenador es fiable. Los problemas surgen cuando traemos
código Java de la Red, código que es no fiable. ¿Es esto
seguro?, ¿podemos fiarnos de estas operaciones? Pensemos un
poco… ¿qué viaja por la red? Parece que por la red sólo se
transfieren ficheros .class con clases Java. Pero estos
ficheros sólo contienen información que, como hemos visto
antes, no es en sí misma dañina, pues los bytecodes no
acceden ni a memoria ni a E/S. Parece obvio ya, que sólo
una llamada a un método nativo puede ocasionar daños en
nuestro sistema.
Imaginemos ahora que nos traemos a nuestra máquina una
clase Java remota no fiable y la ejecutamos. Puede que, sin
saberlo nos hayamos traído una clase con no muy buenas
intenciones. Si dicha clase pudiera acceder, por ejemplo,
al método delete0() (ver Listado 4) de la clase
java.io.File, podríamos tener grandes problemas. Por
fortuna, el método es privado (o así parece ser, según el
listado fuente) y no corremos riesgo. Cualquier intento de
borrar un fichero por parte de esta dañina clase tendría
que pasar por el método público (que actúa como “filtro”)
delete() de la clase java.io.File. Pero lo primero que hace
este método es preguntar al SecurityManager si se autoriza
la petición de borrado. Si somos precavidos, nuestro gestor
de seguridad no permitirá que clases remotas puedan borrar
ningún fichero.
Conclusión: nuestra seguridad será tan buena como lo sea
nuestro SecurityManager. Todos los accesos peligrosos (en
general cualquier método nativo) deberían implementarse
como privados y usar un segundo método público que
preguntase al SecurityManager si la operación está
permitida. Si se sigue este procedimiento, tenemos
garantizada una seguridad absoluta (al menos hasta que
algún aventajado cracker nos haga pensar de otra forma).
***********************************************
Listado 4: Fragmentos del fichero File.java, perteneciente
al paquete java.io.
private native boolean exists0();
private native boolean canWrite0();
private native boolean canRead0();
private native boolean isFile0();
private native boolean isDirectory0();
private native long lastModified0();
private native long length0();
private native boolean mkdir0();
private native boolean renameTo0(File dest);
private native boolean delete0();
private native boolean rmdir0(); // remove empty directory
/* Deletes the file specified by this object. */
public boolean delete() {
 SecurityManager security = System.getSecurityManager();
 if (security != null) {
 security.checkDelete(path);
 }
 if(isDirectory()) return rmdir0();
 else return delete0();
}
***********************************************
Revisión del modelo Cliente/Servidor. SubEpígrafe
Al principio de la serie les dije que haríamos algunas
cábalas sobre el desarrollo futuro de Java. Nada de lo que
sigue está contrastado (aunque no por ello es falso o
erróneo), así que pueden tomarlo como mera opinión. En
cualquier caso, dudo que les deje indiferentes.
Partiremos de las relaciones que es posible establecer
entre los dos conceptos siguientes: máquina donde se
ejecuta un cierto código, y máquina donde se localiza dicho
código. Como vamos a terminar hablando de computación
distribuida, aclararemos que llamaremos “local” a todo lo
que realice nuestra máquina (que actúa como cliente y
realiza la petición de ejecución) y “remoto” a lo que
realice otra máquina (que actúa como servidor y que
responde a la petición de ejecución).
Con un único ordenador, sólo es posible una relación entre
ambos conceptos: ejecución de código local en la máquina
local, como respuesta a peticiones (llamadas a funciones,
métodos, servicios, etc.) locales. Éste es el modo “normal”
(es decir, el más usado) de funcionamiento. Nuestros
programas llaman casi siempre a funciones que se encuentran
y ejecutan en nuestra propia máquina.
Cuando entran en juego dos o más máquinas (el modelo
cliente/servidor fija una relación o enlace entre dos
máquinas únicamente, pero se extiende con facilidad) las
posibilidades se amplían a cuatro. La Tabla A resume estas
relaciones.
De la primera relación ya hemos hablado y no hay más que
añadir; es lo de toda la vida.
La segunda relación nos habla de ejecución remota de código
remoto. Es el típico servicio de biblioteca, en el que
solicitamos un servicio y se nos proporcionan los
resultados. Es lo que ocurre cuando, por ejemplo, iniciamos
una conexión remota empleando Telnet. Las RPC’s también
entrarían dentro de esta relación.
Las dos primeras relaciones son las más usuales y
extendidas. Algunos imaginarán el por qué: la máquina que
ejecuta y que guarda el código a ejecutar es la misma, por
lo que el código será adecuado para la máquina en cuestión.
Además, podemos suponer que lo que está en tu propia
máquina es seguro, por lo que cuando se ejecute no causará
daños (aunque la petición de ejecución sea remota).
No ocurre así con las relaciones tercera y cuarta, donde el
código está en una máquina que no es la que acabará
ejecutándolo. En este caso, hay dos problemas. Por un lado,
una de las máquinas acaba ejecutando código no fiable, pues
el código no residía en ella. Por el otro, el código
binario no será compatible en la mayoría de los casos (el
mundo es muy diverso, en especial cuando a equipos
electrónicos se refiere).
Con la aparición de Java, las barreras para el desarrollo
de las dos últimas relaciones desaparece. Sun comienza a
desarrollar la tercera relación al introducir los applets
en todos los ficheros html del mundo. Por primera vez
puedes ejecutar código ajeno sin preocuparte de la
compatibilidad binaria; ésta está garantizada por Java (¿se
añadirá algún día al modelo OSI una capa de “máquina
virtual”, montada sobre la capa de aplicación y que dará
como resultado una Red de ordenadores virtuales
idénticos?).
Lo que está por desarrollar es la cuarta relación. Es la
más compleja, pero también la que más y más apasionantes
posibilidades ofrece. La cuarta relación propone lo
siguiente: el cliente solicita permiso al servidor para
transferirle código con el fin de que lo ejecute. Si
abstraemos el servidor, y suponemos que el programa cliente
es capaz de encontrar por sí mismo un servidor disponible,
simplemente pediríamos a la Red que ejecute nuestro código
y ésta nos devolvería el resultado de las operaciones.
Cualquier ordenador conectado a la red podría ser un
servidor que admitiese unas cuantas peticiones en
background. La computación se distribuiría a servidores que
estuviesen ‘ociosos’ y el rendimiento global sería mayor.
Si los propios programas solicitasen su autoenvío,
tendríamos agentes ‘viviendo’ en la Red.
En un futuro no muy lejano (dado el estado actual de Java,
sentar las bases de lo expuesto arriba sería un proyecto de
un sólo año para un grupo reducido, no más, por lo que es
presumible que antes o después alguien comience dicho
proyecto), no será extraño lanzar pequeños agentes
(programillas Java al estilo de los viejos applets) a la
Red para que nos localicen este o aquel documento mientras
nuestro ordenador está apagado, para entregárnoslo la
próxima vez que nos conectemos a la red. Tal vez los
servidores de Web se hagan más complejos y creen mundos
virtuales donde nuestros agentes lleguen, interactúen con
el entorno y con otros agentes, y nos envíen información
sobre lo que ven y escuchan (¿tal vez código VRML?). En
fin, todo conjeturas. Pero no digan que no les avisé.
***********************************************
Tabla A: Relaciones Cliente/Servidor a partir de los
conceptos de ejecución de código y ubicación del código. El
Cliente es local y quien solicita la ejecución del código.
El Servidor se supone remoto y ejecuta o proporciona el
código (según el caso).
Ejecución local de código local: Modelo clásico para una
única máquina. La máquina solicita la ejecución de un
fragmento de código que guarda y ejecuta ella misma.
Ejecución remota de código remoto: Éste es el típico
servicio que ofrecen aplicaciones como FTP, Telnet, etc. El
cliente solicita los resultados de la ejecución de una
función remota que también se guarda en el servidor.
Ejecución local de código remoto: Aquí entran, por ejemplo,
los applets Java. El cliente (browser de Web) solicita la
transferencia de código remoto para su ejecución local.
Ejecución remota de código local: Nada en el horizonte
(aunque se empiezan a cocer beans). El cliente solicita la
transferencia de código local para su ejecución remota en
el servidor. Futuro: agentes que viajan por la red.
***********************************************
Conclusión SubEpígrafe
La serie ha llegado a su fin. Tan solo espero que les haya
gustado y que les resulte provechoso (aunque sólo sea por
saciar su curiosidad).
Los comentarios y las críticas serán bienvenidas en mi email,
aunque si quieren pueden mandarme un agente que
espere pululando por ahí hasta que mi servidor esté en
funcionamiento y nos avise a ambos de que podemos iniciar
un talk interactivo.
Pido disculpas y les ruego que me perdonen por los posibles
errores que haya podido cometer a lo largo de la serie; son
todos míos.
No dejen de lado la Tecnología Java: supone el paso final a
la independencia de la máquina en un universo tan
heterogéneo. El futuro está en la computación distribuida,
pero sólo un esquema como el que propone Java permite
explorar el futuro que esconde la cuarta relación. Piensen
en ello. Hasta pronto.
***********************************************
Bibliografía:
Las referencias listadas a continuación se pueden encontrar
en formato .PDF en JavaSoft: http://www.javasoft.com/.
[1] runtime.PDF, Transparencias sacadas de las conferencias
JavaOne que Sun dio en el 1996. Son muy escuetas y no
vienen acompañadas de transcripción alguna de lo que allí
se dijo.
[2] The Java Virtual Machine Specification. Agosto, 1995.
Incluimos por tercera, y última vez, esta referencia. A ver
si por fin se deciden a echarle un vistazo. No hay nada
mejor que las fuentes originales.
***********************************************
