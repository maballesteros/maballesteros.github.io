---
title: Programación de procesos pseudoconcurrentes (ES)
excerpt: "This was my second publication (and also my first -and naive- approach to asynchronous programming)... I was so young"
tags: [rpp]
modified: 2015-11-15
comments: true
image:
  feature: 1996-04-01-256000-colores-en-tu-VGA/RPP-header.jpg
ref: pseudoconcurrent-processes
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

----

## Programación de procesos pseudoconcurrentes

Muchos de nosotros nos iniciamos en el mundo de la informática con aquel modesto Spectrum (léase Amstrad, Comodore, MSX). Todo era muy simple: enchufabas el ordenador y programabas lo que querías que hiciera. Además debías hacerlo de forma que fuera lo más rápido y corto posible, pues el ordenador era lento y la RAM pequeña. Hoy las cosas han cambiado. Los ordenadores son extremadamente rápidos y disponen de mucha memoria, por lo que la optimización sólo es relevante en juegos y aplicaciones de mucho cálculo. Te puedes permitir el lujo de ‘perder tiempo’ de procesador si eso te va a facilitar el trabajo de programar. Y cuando el programa es complejo, esto es muy importante.

### Estilos de programación

¿Qué es un estilo de programación? Se le puede llamar estilo, filosofía, o simplemente forma de programar. Lo importante es que hay estilos que nos facilitan de algún modo la programación.

Un ejemplo conocido por todos es la Programación Orientada a Objetos. Un programa en C++ podría hacerse perfectamente en C, pero posiblemente será más complicado si el programa si el programa original aprovecha (y aquí está la clave) todas las ventajas que C++ le ofrece. Pero el estilo es algo más que usar uno u otro lenguaje de programación: puedes llevar años programando en C++ y seguir planteando y resolviendo problemas al estilo de C.

### Procesos pseudoconcurrentes: Tareas

De lo anterior, debe haber quedado claro que diferentes enfoques (estilos, o como le quieras llamar) a la hora de programar permiten codificar, mejor o más rápido, la aplicación que buscamos.

Cuando aprendes a programar, lo primero que aprendes es una programación secuencial, en el sentido de que tus programas son secuencias de acciones que se ejecutan siguiendo un estricto orden, fijo e inmutable. Muchos programas se pueden hacer así, pero no serán muy vistosos.

Con el tiempo tomas el control de tu programa y lo haces más dinámico, haciendo uso de las keywords de control de flujo de programa. Añadiendo estas, ya puedes hacer casi todo, siempre que el programa no sea muy exigente.

Para una gran mayoría de las personas, la programación se acaba aquí y sólo resta perfeccionar lo conocido (y esto puede llevar mucho tiempo). Sin embargo, existe un escalón más en el arte de programar. Se llama multiprogramación y  se nos ha vedado a los que trabajamos habitualmente bajo DOS.

La multiprogramación presenta notables ventajas frente a la monoprogramación. Un programa inmerso en un sistema que le permita la multiprogramación, puede tener varios procesos corriendo al mismo tiempo, lo que le permite aislar tareas y reducir la interacción entre las mismas a un mínimo protocolo de mensajes. Las posibilidades se multiplican, pues la multiprogramación ya incluye la monotarea. La multiprogramación o multitarea permite hacer cosas que difícilmente se podrían hacer de otro modo.
Los usuarios de DOS no hemos disfrutado de este privilegio y hemos aprendido a resolver problemas empleando un enfoque monotarea, pensando que este era el único.
No podemos transformar DOS en un sistema operativo multitarea, pero podemos simularlo y aprovechar la mayor parte de sus ventajas. Para ello, he desarrollado un entorno que permite usar procesos pseudoconcurrentes: no serán concurrentes, pero con la técnica adecuada, una multiplexación en el tiempo, lo parecerán. A este entorno lo llamaré Tareas.

### Programando con Tareas: un primer ejemplo

Para poder realizar este tipo de programación con tareas es necesario crear un pequeño núcleo de control que gestione la creación, destrucción, etc. de las mismas. Este núcleo lo puedes encontrar en el fichero TAREA.CPP, y lo estudiaremos luego para ver qué se puede sacar de él.

Fijémonos en el Listado 1. Es el típico ‘Hello, world!’ pero siguiendo el estilo de Tareas. Vemos que incluye el fichero TAREA.CPP: esto debemos hacerlo siempre, pues contiene la definición de la clase del núcleo de control de tareas y crea el objeto global CtrlTareas derivado de la misma. Además en este fichero se define también la clase CTarea de la que derivará todo objeto que quiera poseer un proceso pseudoconcurrente.

A continuación se define la clase del objeto TareaPrincipal, que en este caso será la única tarea que se ejecutará. Como toda tarea, la clase deriva públicamente de la clase CTarea y tiene un miembro público llamado Control(), que será precisamente el proceso pseudoconcurrente a ejecutar. Una vez definida la clase se crea un objeto, de visibilidad global, derivado de esta.

Finalmente llegamos al punto de entrada del programa, en el que simplemente lanzamos el gestor del controlador de tareas, pasándole la tarea principal.

{% highlight cpp %}
{% raw %}
*************************************************
Listado 1: ‘Hello, world!’ basado en tareas.

#include <iostream.h>
#include "tarea.cpp"

//-----------------------------------------------
//Aquí creamos la clase del objeto TareaPrincipal
class CTareaPrincipal:public CTarea{
   //Miembros públicos
      public:
         void Control();
};
void CTareaPrincipal::Control(){
   // Actuamos en función del estado de la tarea
       switch(Estado){
          case E_INICIALIZACION:
               cout<<"\nHello, world!";
               CambiaAEstado(E_FINALIZACION);
               break;
          case E_FINALIZACION:
               Autodestruirse();
               break;
       }
}

//-----------------------------------------------
// Creamos el objeto TareaPrincipal
        CTareaPrincipal TareaPrincipal;

//-----------------------------------------------
// La función main() llama directamente al gestor
// pasándole el proceso padre
void main(){ CtrlTareas.Gestor(&TareaPrincipal);}
*************************************************
{% endraw %}
{% endhighlight %}

### Creando tareas

Ahora que ya hemos visto un programa basado en Tareas y empezamos a formarnos una idea de cómo funciona la cosa, vamos a ver con más detalle cómo crear un objeto derivado de CTarea y qué puede hacer.

El Listado 2 muestra la definición de la clase CTarea. Vemos que todos sus miembros son públicos.

Los cuatro primeros datos guardan la identificación de la tarea y la identificación del padre. El Id nos dice de que tipo (clase) es la tarea, mientras que Clon nos diferencia diferentes tareas con el mismo Id. Los datos del padre identifican a la tarea que los activó.

La variable Estado guarda el status interno del proceso. Permite recuperar la situación previa en la siguiente llamada.

La función miembro Control() es la función que se ejecutará cuando se le pase el control a la tarea. Cada clase derivada de CTarea debe re definir su propia función Control().

Finalmente quedan las operaciones básicas que pueden hacer las tareas. Pueden activarse, cambiar su estado interno, autodestruirse y destruir a sus hijos.

Todos los objetos derivados de CTarea deben tener una visibilidad global en el programa y deben ser creados antes de la función main(), o deben ser de tipo static. Pero el hecho de que el objeto haya sido creado, antes incluso del propio comienzo del programa, no significa que la tarea asociada esté activa. El espacio de objetos (objetos de C++) es independiente del espacio de tareas. Cuando en la función main() llamamos al gestor de tareas, sólo la tarea que le pasamos como argumento existe en el espacio de tareas. Y será esta, la tarea principal, la encargada de activar (o crear) a las demás tareas.

La función Control() suele comenzar con un chequeo a la variable Estado con el fin de saber por donde se quedó al abandonar el proceso. Una estructura switch/case es la elección más natural. Con CambiaAEstado() nos movemos entre los diferentes estados de la tarea.

También dentro de la función de control se incluyen los mensajes de autodestrucción y de destrucción de los hijos. Por ejemplo, el modo más rápido de terminar la ejecución de un programa basado en Tareas consiste en terminar la ejecución de la tarea principal destruyendo a sus hijos. Como la tarea principal crea (activa) a todas las demás, garantizamos que todas las tareas se eliminan. Si a continuación, la tarea principal se autodestruye, ya no quedan tareas que ejecutar y el programa finaliza.

La única que no se incluye dentro de la función Control() es Actívate(). El motivo es simple: una tarea no puede autocrearse. El proceso que envía este mensaje a un objeto derivado de CTarea se convierte en el padre de la nueva tarea.

{% highlight cpp %}
{% raw %}
*********************************************************
Listado 2: Definición de la clase CTarea.
class CTarea{
  // Miembros públicos
  public:
      // Datos de la tarea
         int Id;
         int Clon;
      // Datos del padre
         int Id_Padre;
         int Clon_Padre;
      // Estado interno
         int Estado;
      // Proceso pseudoconcurrente de la tarea: Control()
         virtual void Control(){};
      // Operaciones básicas:
         void CambiaAEstado(int NuevoE){Estado=NuevoE;}
         void Destruyete();
         void DestruyeHijos();
         void Activate(int,int);
};
*********************************************************
{% endraw %}
{% endhighlight %}

### El controlador de Tareas

Se llama CtrlTareas y es un objeto global derivado de la clase que se muestra en el Listado 3. Se crea cuando incluimos el fichero TAREA.CPP en nuestro programa, y es el núcleo que controla Tareas.

Vemos que en su interfaz aparecen funciones similares a las que vimos en la clase CTarea. Estas son mucho más potentes y no deben usarse a no ser que entendamos bien cómo funcionan (lo cual no es dificil).

Sin embargo, tiene un registro del tiempo transcurrido desde que se inició el programa, que sí podemos usar y es muy útil. Imaginemos que queremos que nuestra tarea realice algo cada cierto intervalo de tiempo. Lo primero que hay que hacer es capturar el tiempo actual. En las siguientes llamadas bastará con que comparemos el tiempo capturado con el actual (CtrlTareas.Tiempo). Cuando la diferencia supere el intervalo deseado, se ejecuta lo que queríamos y se vuelve a capturar el tiempo actual, con lo que se repite el ciclo.

Los datos miembros Id y Clon guardan la identificación de la tarea que se ejecuta en ese momento.

Si nos fijamos en la lista de los miembros privados, veremos que se define una matriz de punteros a CTarea. El número de elementos es NUMMAXTAREAS y es el número máximo de tareas que controla el gestor. Si queremos modificarlo, basta con re definir esta constante (con #define) justo antes de incluir el fichero TAREA.CPP.

Este controlador de tareas es muy simple. Si te gusta el tema no dudes en mejorarlo.

{% highlight cpp %}
{% raw %}
*************************************************
Listado 3: Definición de la clase del objeto controlador de tareas.
class CCtrlTareas{
   // Miembros públicos
   public:
     // Interfaz con el controlador
        void Gestor(CTarea *);
        void Crear(CTarea *,int,int);
        void Autodestruirse(){Destruir(PT);};
        void Destruir(int id,int clon);
        void DestruirHijos(int Num);
        void DestruirHijos(){DestruirHijos(PT);};
     // Registro del tiempo
        float   Tiempo;
     // Datos de la tarea actual
        int     Id;
        int     Clon;

   // Miembros privados
   private:
     // Lista de tareas
        CTarea  *ListaDeTareas[NUMMAXTAREAS];
     // Puntero (índice) de la tarea activa
        int   PT;
     // Numero de tareas activas
        int   NumTareasActivas;
     // Funciones privadas...
        int   Busca(int id,int clon);
        void  Destruir(int Num);
        void  CopiarTarea(int Org,int Dest);
        void  CopiarBloqueTareas(int Org,
int Dest,int Num);
};
*************************************************
{% endraw %}
{% endhighlight %}

### Una aplicación real

Si aún no has probado los ejecutables que acompañan al texto, es posible que te preguntes si realmente merece la pena usar Tareas. La respuesta es claramente afirmativa. Basta con que des un vistazo al código fuente del fichero DIBUJO.CPP y verás de qué forma tan simple se puede hacer un programa de lo más vistoso.

El programa define las clases de objetos CEstela, CCharlie, CBotonBonito y CTareaPrincipal. Además crea un objeto Estela, que crea un rastro de colores sobre el camino del ratón, dos objetos Charlie que miran atentamente donde el ratón apunta y un total de 68 botones con fines varios. Todos estas tareas son creadas y controlados por la tarea TareaPrincipal.

Para ver con un ejemplo cómo opera habitualmente una tarea, veamos cómo se define la clase CBotonBonito. El código se muestra en Listado 4.

{% highlight cpp %}
{% raw %}
*************************************************
Listado 4: Ejemplo de una tarea típica.
class CBotonBonito:public CTarea{
   //Miembros públicos
   public:
     CBotonBonito(){};
CBotonBonito(int,int,int,int,
   int,float,int);
     int  Presionado;
     void Inicializate();
     void Inicializate(int,int,int,int,
   int,float,int);
     void    Control();
   //Miembros privados
   private:
     int   Cx,Cy,Ancho,Alto;
     int   ColorFondo,ColorBorde,Dir;
     float Tiempo,Lapso;
};
//----------------------------------------------
CBotonBonito::CBotonBonito(int x,int y,int an,
int al,int cf,float lp,int cl){
      Cx=x;Cy=y;Ancho=an;Alto=al;
 ColorFondo=cf;Lapso=lp;Clon=cl;
}
//----------------------------------------------
void CBotonBonito::Inicializate(){
Activate(ID_BOTON,Clon);}
//----------------------------------------------
void CBotonBonito::Inicializate(int x,int y,
int an,int al,int cf,float lp,int cl){
Cx=x;Cy=y;Ancho=an;Alto=al;
ColorFondo=cf;Lapso=lp;Clon=cl;
     Activate(ID_BOTONBONITO,Clon);
}
//----------------------------------------------
void CBotonBonito::Control(){
     switch(Estado){
     case E_INICIALIZACION:
          Vga.SetColor(ColorFondo);
          Vga.DibujaCajaLlena(Cx,Cy,Ancho,Alto);
          Vga.SetColor(ColorBorde=0);
          Vga.DibujaCaja(Cx,Cy,Ancho,Alto);
          CambiaAEstado(E_ACTIVO);
          Tiempo=CtrlTareas.Tiempo;
          break;
     case E_ACTIVO:
          //Cambiamos el color del borde
          if((CtrlTareas.Tiempo-Tiempo)>Lapso){
             Tiempo=CtrlTareas.Tiempo;
             ColorBorde+=Dir;
             if(ColorBorde>=15) Dir=-1;
             if(ColorBorde<=0) Dir=1;
             Vga.SetColor(16+ColorBorde);
             if(Raton.DentroDe(Cx,Cy,
Cx+Ancho,Cy+Alto)){
Raton.Off();
               Vga.DibujaCaja(Cx,Cy,Ancho,Alto);
               Raton.On();
             }else{
 Vga.DibujaCaja(Cx,Cy,Ancho,Alto);
            }
          }
          //Si estamos dentro,
// marcar como presionado
          if(Raton.DentroDe(Cx,Cy,
             Cx+Ancho,Cy+Alto)&&
                  Raton.Estado==1){
   Presionado=TRUE;
          }else Presionado=FALSE;
          break;
     }
}
*************************************************
{% endraw %}
{% endhighlight %}

Como toda clase de objetos que quieran ser tareas, la clase CBotonBonito deriva públicamente de CTarea. Vemos también que re define la función miembro Control().

La función miembro Inicialízate() simplemente llama a la función Actívate(), pero pasándole un Id propio de la clase (ID_BOTON, que se define al principio del fichero). El resto de variables son autoexplicativas.

Fijémonos en la función de control de la tarea. Entra directamente en una estructura switch/case que chequea el valor de la variable Estado.

Toda tarea que acaba de ser activada entra en el estado E_INICIALIZACION (de esto se encarga la función Actívate()), por lo que el código de inicialización de la tarea debe escribirse aquí. En este caso simplemente dibuja el botón, inicializa el registro de tiempo y cambia al estado E_ACTIVO. Las clases de los objetos Vga y Raton, se incluyen junto a los ficheros fuente y su función, además de ser muy simple, es obvia. Se emplean para ganar velocidad; tu puedes emplear las funciones gráficas que quieras.

En el estado activo se hacen sólo dos comprobaciones. La primera es comprobar si se ha superado el lapso de tiempo prefijado para cambiar el color del borde: si es así, cambiarlo. La segunda es comprobar si se está pulsando dentro del botón, en cuyo caso la variable booleana Presionado se pone a verdadero. Algo fundamental, y que debemos tener muy presente, es que las acciones en el estado (o estados) activo deben ser mínimas. Lo mejor es orientar este estado ‘al evento’: esperar a que pase algo para realizar una acción computacionalmente más costosa.

Una vez la tarea CBotonBonito ha entrado en el estado activo no sale de el hasta que su padre la destruya. No posee ningun estado E_FINALIZACION.

### Conclusiones

En este artículo hemos visto cómo simular concurrencia de procesos en un sistema monotarea. Este enfoque nos ha permitido realizar un vistoso programa de forma sencilla.

Aunque la aplicación ha sido gráfica, Tareas pude hacer casi cualquier cosa que puedas imaginar. Es especialmente idóneo para simulaciones. Piensa, por ejemplo, en lo fácil que sería crear un programa de vida artificial, donde cada bicho sería una tarea moviéndose por un mundo virtual. Otra idea diferente podría ser un simulador de circuitos lógicos, donde cada ‘chip’ sería una tarea y las conexiones eléctricas simples variables de programa. Incluso un simulador de sistemas físicos, donde cada partícula fuera una tarea que debe encargarse de obtener la fuerza total que se ejerce sobre ella para calcular aceleración, velocidad y, finalmente, la nueva posición que ocupará (si quieres ver un programa que hace esto, busca en ftp.uv.es:pub/msdos/otros/gsf.zip. No está basado en Tareas pero podrás ver la idea).

Las posibilidades son muchas: no dudes en experimentar. Si mejoras (y es muy mejorable) el controlador o la propia filosofía de Tareas, por favor, hazmelo saber y envíame una copia.

### Una reflexión personal...

Al escribir este artículo he intentado, y espero haberlo conseguido, que el lector reflexione sobre cómo programa.

Es fácil darse cuenta de que todo programa puede escribirse de muchas formas, pero no lo es tanto entender qué formas son más eficientes para cada tipo de programa. Un buen programador debe emplear técnicas diferentes para cada problema, y no tratar de reducir siempre el problema a su estilo de programación. Abrirá horizontes y resolverá mejor cualquier tipo de problema/programa.

Y finalmente no me quiero despedir sin una reflexión personal. Si en lugar de hablar de procesos pseudoconcurrentes hubiese hablado de una técnica de programación basada en una topología de programa orientada a la multiplexación en el tiempo de procesos, habría escrito exactamente lo mismo. Lo primero lo entiende todo el mundo. Lo segundo requiere que te pares a pensar y te des cuenta de cómo has programado. Hasta pronto.
