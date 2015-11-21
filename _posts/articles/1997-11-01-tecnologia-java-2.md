---
title: Tecnología Java (II) (ES)
excerpt: "This a 3 article serie about the early JVM, published also in RPP magazine"
tags: [rpp]
modified: 2015-11-21
comments: true
image:
  feature: 1996-04-01-256000-colores-en-tu-VGA/RPP-header.jpg
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

This is the second of a 3 articles serie. See the [1st](/articles/tecnologia-java-1/) an [3rd](/articles/tecnologia-java-3/) part.

<figure class="half">
    <a href="/images/1997-tecnologia-java/cover-2.jpg"><img src="/images/1997-tecnologia-java/cover-2.jpg"></a>
</figure>

----

> Es una regla general que no es posible entender perfectamente el funcionamiento de ninguna máquina sin entrar en pequeños detalles. Estos son los que, a menudo, aportan la mayor información sobre las posibilidades de la máquina que estamos analizando. A ellos, a los pequeños detalles de la MVJ, les dedicaremos el presente artículo.

En el segundo artículo de la serie seguiremos profundizando en el funcionamiento de la Máquina Virtual Java. Analizaremos el conjunto de instrucciones de la MVJ y el formato “.class”. Me ha resultado especialmente difícil encontrar un punto intermedio entre el detalle absoluto y una descripción general poco profunda. Finalmente me he inclinado por una presentación bastante detallada, pero que resalte aquello que (en mi opinión, claro está) es más importante.

Comenzaremos en primer lugar por el formato de almacenamiento binario de las aplicaciones Java.

### Formato .class

Cuando comencé a estudiar el funcionamiento interno de la MVJ, encontré que las especificaciones técnicas (ver [1]) explicaban con muchísimo detalle el formato de almacenamiento binario en el que se guardaban los bytecodes de cada clase. En un principio pensé que las especificaciones estaban orientadas tanto a personas o equipos interesados en implementar la propia máquina, como a aquellos que deseasen desarrollar compiladores y herramientas similares. Creía que tal vez como un apéndice o algo así estaría bien, pero no veía justificada su explicación en el cuerpo principal de las especificaciones: no incluso antes que el conjunto de instrucciones. Pronto me di cuenta de mi error. El formato .class esconde muchos de los secretos del funcionamiento interno de la MVJ. Lo veremos a lo largo del artículo.

Toda aplicación Java parte de un fichero con el código fuente. Tras pasar por el compilador se desglosa en varios ficheros binarios, uno por cada clase o interface definidos en el fichero fuente. Estos ficheros, de extensión .class, contienen toda la información que define la clase y son los ficheros que carga el intérprete para ejecutar las aplicaciones.

Un fichero binario Java consiste en un flujo de bytes en el que los valores numéricos que superan los 8-bit se disponen de mayor a menor peso (esto es, 256 se codifica con el par de bytes {1,0}). Este formato es soportado por clases como java.io.DataInputStream y java.io.DataOutputStream. Muchas de las cantidades contenidas en el fichero son cantidades de 1, 2 o 4 bytes, que representaremos por U1, U2 y U4 (de hecho, un fichero .class contiene sólo cantidades de estos tipos y cadenas de caracteres…, nada más). La Tabla A muestra cómo se pueden leer en Java estas cantidades.

---
**Tabla A: Acceso a ficheros `.class`**. Se emplean las clases `java.io.DataInputStream` y `java.io.DataOutputStream` y los métodos siguientes:

| Tipo | Tamaño  | Método empleado
|:----:|:-------:|:--------------:
| U1   | 1 byte  | readUnsignedByte
| U2   | 2 bytes | readUnsignedShort
| U4   | 4 bytes | readInt

---

La estructura básica del formato `.class` se muestra en la Figura A.

![Estructura del formato .class](/images/1997-tecnologia-java/figura-2a.jpg)

La obsesión de estos señores por el café es, cuanto menos, curiosa. Todo fichero binario Java comienza con un U4 (4 bytes) de valor constante que en hexadecimal se representa por 0xCAFEBABE. Es el número “mágico” que identifica el fichero como un fichero binario Java.


Este número se sigue por dos números de tipo short que representan los números de versión menor y mayor.

A continuación viene el pozo de constantes. Este pozo no es más que una tabla de valores donde se guardan cadenas de caracteres, identificadores de campos, métodos y clases, valores constantes, etc. Por su importancia, hablaremos más tarde de él.

Los flags de acceso vienen tras el pozo de constantes. Una clase puede tener los siguientes atributos: ACC_PUBLIC (visible a todo el mundo), ACC_FINAL (no se puede derivar, sobrecargar, etc.), ACC_INTERFACE (la clase es un interface) y ACC_ABSTRACT.

La clase actual y la superclase son dos índices (U2) al pozo de constantes. En las posiciones apuntadas por estos índices encontramos los items o referencias a dichas clases. El concepto de item se entenderá completamente cuando hablemos del pozo de constantes. Por ahora podemos pensar en ellos como cadenas de caracteres con el nombre completo de la clase.

El array de interfaces implementados es un array de U2 con índices al pozo de constantes, donde encontramos los items o referencias a dichos interfaces.

El array de descriptores de campos es una matriz de estructuras que guardan información sobre los campos contenidos en cada clase. Se almacena información de acceso, un índice (al pozo de constantes) a una cadena con el nombre del campo, otro índice que apunta a la firma del campo (ver el cuadro FIRMAS (SIGNATURES)) y atributos. El único atributo propio de un campo de clase es el atributo “ConstantValue”, que indica que el campo es una constante numérica estática y tiene asociado dicho valor numérico.

> FIRMAS (SIGNATURES)
>Son cadenas que representan un método, un campo o un array de forma abreviada. Por ejemplo, una matriz de enteros int[][] tendría la firma “[[I”. Un vector Thread[] se firmaría con la cadena “[Ljava.lang.Thread”.

Un descriptor del array de descriptores de métodos contiene: los flags de acceso al método, un índice (en el pozo) al nombre del método, otro índice a la firma del método, y unos atributos. En este caso los atributos son más variados. Se reconocen dos tipos de atributos: “Code” y “Exceptions”. El atributo “Code” tiene asociado un bloque de bytes con los bytecodes del método. El atributo “Exceptions” tiene asociada información sobre las excepciones que pueden resultar de la ejecución del método.

Finalmente queda el array de descriptores de atributos. En este caso los atributos hacen referencia a la clase y, en las especificaciones iniciales de Sun, sólo puede ser un único atributo con el nombre “SourceFile”, que tiene asociado el nombre del fichero fuente Java.

Todos los atributos presentan la misma estructura. En el cuadro ATRIBUTOS se muestran los diferentes tipos de atributos, la mayoría de ellos ya mencionados, explicados con cierto detalle.

---

**ATRIBUTOS**

Todos los atributos presentan idéntica estructura. Comienzan con un U2, índice al pozo de constantes, que apunta a una cadena con el nombre del atributo (por ejemplo a la cadena “Code”). Este índice se sigue por un U4 que contiene la longitud de los datos. El contenido de estos datos se interpreta según el tipo de atributo que sea. A continuación se describen algunos de estos tipos:

  - “SourceFile”: Los datos son simplemente un U2, índice que apunta a una cadena con el nombre del fichero fuente.
  - “ConstantValue”: Un U2 índice que apunta a un CONSTANT_Long, CONSTANT_Float, CONSTANT_Double o CONSTANT_Integer (descritos en el pozo de ponstantes).
  - “Code”: Dos U2 con el tamaño de la pila y del espacio de variables locales que requiere el método. Les sigue un U4 con la longitud de los bytecodes del método y un bloque de U1 con los bytecodes. Al código le sigue un U2 con el número de excepciones y un array de descriptores de estas excepciones. Un descriptor de excepción consta de dos U2 con la dirección del código de principio y de fin de la actividad del manejador de la excepción. Le sigue un U2 con la dirección en el código (los bytecodes) donde comienza la rutina manejadora de la interrupción. Finalmente, el descriptor termina con un índice (U2) al pozo de constantes donde se encuentra una referencia a la excepción (es decir, una clase derivada de Throwable). Todo se refiere al comienzo del código. Tras los descriptores de excepciones hay un espacio para atributos adicionales, como “LineNumberTable” y “LocalVariableTable” para información de depurado.
  - “Exceptions”: Un U2 con el número de excepciones que puede lanzar el método. Un array de U2, índices al pozo, que apuntan a las diferentes excepciones.
  - “LineNumberTable”: Se utiliza por los depuradores para determinar a qué parte del código binario corresponde una posición dada en el código fuente.
  - “LocalVariableTable”: Lo utilizan los depuradores para determinar el valor de una variable local dada, durante la ejecución dinámica del método.

---

### El pozo de constantes

El pozo de constantes (ver la Tabla B) tiene una especial importancia en la MVJ. Del fichero .class, la mayoría de las estructuras de datos se emplean para rellenar tablas de símbolos y demás. El pozo de constantes, sin embargo, es un bloque de datos que se asocia con cada clase en ejecución y que se copia tal cual en memoria. Su importancia reside en que, en muchas ocasiones, las instrucciones de la MVJ tienen operandos que son índices a este pozo. Por tanto, el funcionamiento de la MVJ está ligado al propio pozo de constantes.

En el pozo de constantes podemos encontrar básicamente tres cosas: cadenas de caracteres (no objetos Strings, simplemente cadenas), referencias y valores numéricos constantes. Las referencias pueden ser a clases, métodos, campos, interfaces y Strings. En muchos casos estas referencias no son mas que índices a cadenas de caracteres en el propio pozo de constantes. La utilidad de las referencias se entiende mejor con un ejemplo.

Imaginemos que en un programa Java se quiere leer el valor de uno de los campos de una clase. La instrucción a emplear es getfield. Esta instrucción tiene un único operando que es un índice al pozo de constantes. Al ejecutar la instrucción, se lee de la pila una referencia al objeto del que queremos extraer el valor del campo. En la posición indicada del pozo de constantes encontramos un tag del tipo CONSTANT_Field (ver Tabla B). La referencia o ítem hallado es consecuente (esperábamos encontrar este tag y no otro).

Tras el tag encontramos dos índices al pozo: el primero apunta a un CONSTANT_Class y el segundo a un CONSTANT_NameAndType). Del ítem CONSTANT_Class extraemos la cadena con el nombre de la clase y comprobamos que es coherente con el objeto cuya referencia hemos extraído de la pila. Finalmente, del ítem CONSTANT_NameAndType, sacamos la firma del campo, que pasaremos a buscar en la tabla de campos de la clase. Una vez localizada la posición, obtenemos un offset en la estructura de datos de la instancia. De allí sacaremos el valor del campo. Este ejemplo se adelanta al próximo artículo de esta serie (en el que hablaremos de la ejecución en la MVJ), pero se incluye porque constituye un buen ejemplo de cómo funciona la MVJ en relación al pozo de constantes (el ejemplo ha omitido premeditadamente algunos detalles que aceleran posteriores accesos al campo).

---

**Tabla B: Constantes que podemos encontrar en el pozo.**

Todas las entradas en el pozo de constante comienzan con un tag (U1) que indica el tipo de constante almacenada en esa entrada.

| Tipo             | Descripción     |
|------------------|------------------|
|CONSTANT_Class    | Tras el U1 del tag (que indica que es una clase), viene un índice (U2) a una cadena Utf8 con el nombre completo de la clase. Esta constante es una referencia a una clase.
|CONSTANT_Utf8, CONSTANT_Unicode | Es una cadena de caracteres. Tras el tag que la identifica como cadena Utf8, vienen los datos según el formato UTF-8. Similar en el caso de Unicode.
|CONSTANT_Fielref, CONSTANT_Methodref, CONSTANT_InterfaceMethodref | Tras el tag viene un índice (U2) que apunta a un CONSTANT_Class que referencia a la clase a la que pertenece el método, campo o interface. Un segundo índice apunta e un CONSTANT_NameAndType, que guarda el nombre y la firma del método, campo o interface.|
|CONSTANT_String | Representa a objetos tipo String. Tras el tag va un índice a una cadena Utf8 con la que se inicializará el objeto String.|
|CONSTANT_Integer, CONSTANT_Float | Representa ctes. de 4 bytes, por lo que tras el tag hay un U4 con el valor correspondiente.|
|CONSTANT_Long, CONSTANT_Double | Representa ctes. de 8 bytes, por lo que tras el tag hay dos U4 con el valor correspondiente.
|CONSTANT_NameAndType | Representan a un campo o a un método, pero sin indicar la clase a la que pertenecen. Tras el tag, un índice (U2) apunta a una Utf8 con el nombre y otro índice a otra Utf8 con la firma.

---

### Conjunto de instrucciones de la MVJ

En las especificaciones de la MVJ 1.0 encontramos un total de 164 instrucciones (aunque hay más bytecodes debido a los aceleradores). Estas instrucciones cubren áreas muy diferentes, como podemos ver en la Tabla C.

De todo el conjunto de instrucciones un porcentaje elevado son aceleradores. Los aceleradores son instrucciones que usualmente requieren dos o más bytecodes se reducen a uno solo. Esto es posible hacerlo porque “sobran” bytecodes.

Un ejemplo de instrucción y sus aceleradores es iload, del área de carga de variables locales sobre la pila (ver la segunda área en la Tabla C). La instrucción iload tiene asociado el bytecode 21 y va seguido de otro byte vindex.

Esta instrucción carga en la pila el entero situado en la posición vindex del espacio de variables locales del método. En muchos de los casos, un método no tendrá más de 3 o 4 variables locales, y además éstas se suelen usar bastante. Por ello, la instrucción iload tiene instrucciones aceleradoras iload_0, iload_1, iload_2 e iload_3, con bytecodes asociados 26, 27, 28 y 29 respectivamente. Como es fácil imaginar, estas instrucciones aceleradoras cargan en la pila las primeras 4 variables locales. Como sólo ocupan 1 bytecode, el código resultante es más compacto y la ejecución más veloz.

El ejemplo que acabamos de exponer nos lleva a analizar la eficiencia de los bytecodes. Fueron diseñados para ser eficientemente almacenados y ejecutados. Pero, ¿cómo
intentan alcanzar estos objetivos? Veamos algunas claves.

### Eficiencia de los bytecodes

Quedó claro desde un principio que el mejor modo de codificar Java era usar un código de 8 bits. Prácticamente la totalidad de los microprocesadores emplean como unidad mínima de procesamiento el byte, por lo que era una buena elección ya que evitaba el procesamiento posterior del flujo de bits. Además, aunque habría sido deseable bytecodes con menos bits (para reducir el tamaño del código), 7 bits (128 posibilidades) no son suficientes para codificar todas las instrucciones de la MVJ.

Con 256 palabras código y unas 150 instrucciones, se desperdicia ancho de banda (recordemos que Java ganó fuerza en Internet, y la transmisión de bytecodes debía ser lo más eficiente posible). Podemos aprovechar las palabras código libres para introducir aceleradores: las instrucciones, o conjuntos de ellas, más empleadas se pueden codificar con bytecodes únicos. Si la MVJ es interpretada (es decir, no usa un compilador JIT), tenemos el beneficio adicional de que la interpretación es más rápida.

En la misma línea se orienta la instrucción wide (ver área cuarta de la Tabla C). La táctica es la misma que encontramos al buscar una codificación óptima de un bloque de datos: lo más frecuente debemos codificarlo para que ocupe poco espacio. Por el contrario, aquello que ocurra en pocas ocasiones podemos codificarlo con secuencias largas.

La eficiencia de los bytecodes se intenta conseguir también usando instrucciones CISC de gran complejidad. Ya vimos con un ejemplo la cantidad de operaciones que realizaba la MVJ cuando ejecutaba la instrucción getfield. Instrucciones como ésta no son propias de los microprocesadores usuales.

La MVJ simula un procesador diseñado específicamente para ejecutar programas basados en objetos (¿conoce alguien un micro con una instrucción llamada invokevirtual?).

La creación de estructuras de datos tan complejas como arrays de objetos está también reflejada en instrucciones de la MVJ.

### Un apunte sobre seguridad

Tampoco hay instrucciones para el manejo de la memoria. Todo acceso a memoria es transparente al usuario, lo que proporciona un elevado nivel de seguridad. Cuando un método está en ejecución, un cracker (que haya introducido bytecodes consistentes con la MVJ, y que por tanto superará el proceso de verificación) sólo puede acceder a la pila, al espacio de variables locales, a arrays y a campos de otros objetos. El código del método está encerrado en un espacio dedicado específicamente para él, del que no es posible salir con instrucciones de control de flujo. De hecho, todas las instrucciones de salto toman como referencia el inicio del código del método.

---

**Tabla C: CONJUNTO DE INSTRUCCIONES DE LA MVJ.**

Las instrucciones están separadas en las siguientes áreas (el número entre paréntesis es el número de instrucciones):

  - **Movimiento de constantes a la pila (11)**: Este conjunto de instrucciones sitúan constantes sobre la pila: valores de 8 y 16 bits que son expandidos a enteros, items del pozo de constantes (p.e. una cadena de caracteres), valores long y double del pozo y valores constantes fijos inmediatos.

  - **Carga de variables locales sobre pila (10)**: Estas instrucciones van seguidas de un índice sobre el área de variables locales del frame actual (recordar que frame era el espacio reservado para las variables locales, el entorno de ejecución y la pila de operandos). El tipo de la variable que allí se encuentra queda definido por la instrucción (dload carga una variable float de doble precisión sobre la pila).

  - **Descarga de pila sobre variables locales (11)**: Es el caso duál al anterior. En ambos casos el índice es de 1 byte (desplazamiento máximo o número máximo de variables locales de 256, pero ver el apartado siguiente). También se incluye una instrucción para el incremento de variables locales enteras.

  - **Extensión de índice para carga, descarga e incremento (1)**: (wide) Permite ampliar los índices de 1 byte a 2 bytes. La instrucción es wide y va seguida del byte alto del índice. El uso de la instrucción wide para extender los índices, frente al uso de 2 bytes en todos los casos, se debe a que los desplazamientos de 1 byte son estadísticamente más numerosos, por lo que el uso de esta técnica produce código más compacto y acelera la interpretación.

  - **Manejo de arrays (20)**: Permiten crear arrays (ya sean arrays de tipos básicos o arrays de objetos), obtener sus dimensiones, así como leer y escribir en posiciones concretas del array. Se tratan como objetos especiales (tienen asociado un objetcref como cualquier otro objeto, pero el acceso a un array tiene instrucciones específicas).

  - **Instrucciones para el manejo de la pila (10)**: Eliminar datos de la pila (pop), duplicar (dup) e intercambiar (swap). Todas estas instrucciones se refieren al elemento situado en lo alto de la pila (TOS) y al siguiente.

  - **Instrucciones aritméticas (24)**: Suma, resta, multiplicación, división, resto y negación. Hay instrucciones para cada tipo de datos (int, long, float y double).

  - **Instrucciones lógicas (12)**: Desplazamientos lógicos y aritméticos, funciones lógicas AND, OR y XOR.

  - **Conversión de tipos (15)**: Las conversiones son:
    - int -> (long, float, double)
    - long -> (int, float, double)
    - float -> (int, long, double)
    - double -> (int, long, float)
    - int -> (signed byte 8 bits, char, short)

  - **Control de flujo (27)**: Cambian el contenido de PC según el contenido de la pila (si el TOS es cero, si dos enteros coinciden, si el objeto referenciado es “null”, etc.). Hay saltos incondicionales (goto) y saltos a subrutinas (jsr) con sus correspondientes retornos (ret).

  - **Retorno de métodos (7)**: Introducen valores en la pila del entorno de ejecución del método que llamó al actual y le devuelven el control. Estas instrucciones finalizan el método. El frame actual se deshecha y se sigue en el anterior (frame del método llamador).

  - **Tablas de salto (2)**: Permiten implementar estructuras de salto condicional complejas (como estructuras tipo case).

  - **Manipulación de campos de objetos (4)**: Permiten leer y escribir valores en los diferentes campos de una clase. Se les pasa un índice al pozo de constantes. Allí debe encontrarse una referencia a un campo de alguna clase.

  - **Invocación de métodos (4)**: Hay cuatro tipos de invocación de métodos: invokevirtual, invokenonvirtual, invokestatic v invokeinterface. Se acompañan de un índice al pozo de constantes donde debemos encontrar el item o referencia a dicho método. En la pila se encontrará la referencia al objeto cuyo método estamos llamando. Todos acaban localizando el bloque del método a ejecutar, donde se indica si el método es nativo, sincronizado, etc. En el próximo artículo hablaremos más sobre invocación de métodos.

  - **Manipulación de excepciones (1)**: (athrow) Lanza una excepción o error. Cuando la MVJ se encuentra esta instrucción, busca un manipulador capaz de manejar la excepción generada (cuya referencia se encuentra en la pila). Si se encuentra un manipulador en el entorno de ejecución actual, el PC salta a la dirección de comienzo de la rutina manejadora.

  - **Creación de instancias y chequeo de tipos (3)**: Instrucciones que crea un nuevo objeto (reserva espacio en el heap, le asigna un handler, etc.) y comprueban si los tipos coinciden.

  - **Monitorización de objetos (2)**: (monitorenter y monitorexit) Permiten obtener un acceso exclusivo al objeto especificado. Si ya existe otro Thread monitorizando dicho objeto, el Thread actual queda en espera hasta que aquel libere el objeto.

---

### El próximo artículo

Con el próximo artículo finalizaremos la serie sobre Tecnología Java. Hablaremos de la MVJ en ejecución (con ejemplos prácticos) y sobre las estructuras de datos necesarias para implementarla. Estaremos entonces en disposición de hablar sobre seguridad en Java, y lo haremos. Para finalizar la serie exploraremos las cuatro relaciones posibles ligadas con la ejecución de métodos según el modelo cliente/servidor. El objetivo será mostrar al lector como sólo tres de ellas se utilizan habitualmente y como Java (más que Java, su MVJ) nos da la llave para desarrollar la inexplorada cuarta relación (la más interesante y compleja de todas).


---
Bibliografía:

Las referencias listadas a continuación se pueden encontrar en formato .PDF en JavaSoft: [http://www.javasoft.com/](http://www.javasoft.com/).

[1] The Java Virtual Machine Specification. Agosto, 1995. Aquí encontrará perfectamente detallado el formato binario Java y el conjunto de instrucciones. No espere encontrar sin embargo, comentarios, justificaciones de lo expuesto o grandes explicaciones aclaratorias; después de todo, son especificaciones técnicas.
