---
title: Programming Pseudoconcurrent Processes (EN)
excerpt: "My second RPP article explored how to fake multitasking under DOS by multiplexing lightweight \"tasks\" in C++."
tags: [rpp]
lang: en
ref: pseudoconcurrent-processes
modified: 2025-10-19
comments: true
image:
  feature: 1996-04-01-256000-colores-en-tu-VGA/RPP-header.jpg
permalink: /en/blog/pseudoconcurrent-processes/
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

This was my second publication in a professional magazine: RPP (Revista Profesional de Programadores).

---

## Programming Pseudoconcurrent Processes

Many of us started in the world of computing with that modest Spectrum (read Amstrad, Commodore, MSX). Everything was very simple: you plugged in the computer and programmed what you wanted it to do. You also had to do it in a way that was as fast and short as possible, because the computer was slow and the RAM was small. Today things have changed. Computers are extremely fast and have a lot of memory, so optimization is only relevant in games and calculation-heavy applications. You can afford the luxury of ‘wasting’ processor time if it will make your programming work easier. And when the program is complex, this is very important.

### Programming Styles

What is a programming style? You can call it a style, a philosophy, or simply a way of programming. The important thing is that there are styles that facilitate programming in some way.

A well-known example is Object-Oriented Programming. A program in C++ could be perfectly done in C, but it will possibly be more complicated if the original program takes advantage (and here is the key) of all the advantages that C++ offers. But style is more than just using one programming language or another: you can have been programming in C++ for years and still be planning and solving problems in the C style.

### Pseudoconcurrent Processes: Tasks

From the above, it should be clear that different approaches (styles, or whatever you want to call them) when programming allow you to code, better or faster, the application you are looking for.

When you learn to program, the first thing you learn is sequential programming, in the sense that your programs are sequences of actions that are executed in a strict, fixed, and immutable order. Many programs can be done this way, but they will not be very showy.

Over time, you take control of your program and make it more dynamic, using the program flow control keywords. By adding these, you can do almost anything, as long as the program is not too demanding.

For a large majority of people, programming ends here and all that remains is to perfect what is known (and this can take a lot of time). However, there is one more step in the art of programming. It is called multiprogramming and it has been forbidden to those of us who usually work under DOS.

Multiprogramming has notable advantages over monoprogramming. A program immersed in a system that allows multiprogramming can have several processes running at the same time, which allows it to isolate tasks and reduce the interaction between them to a minimum message protocol. The possibilities are multiplied, as multiprogramming already includes monotasking. Multiprogramming or multitasking allows you to do things that could hardly be done otherwise.
DOS users have not enjoyed this privilege and have learned to solve problems using a monotasking approach, thinking that this was the only one.
We cannot transform DOS into a multitasking operating system, but we can simulate it and take advantage of most of its advantages. To do this, I have developed an environment that allows the use of pseudoconcurrent processes: they will not be concurrent, but with the right technique, time multiplexing, they will seem so. I will call this environment Tasks.

### Programming with Tasks: a first example

To be able to perform this type of programming with tasks, it is necessary to create a small control kernel that manages their creation, destruction, etc. You can find this kernel in the `TAREA.CPP` file, and we will study it later to see what can be gotten out of it.

Let\'s look at Listing 1. It is the typical ‘Hello, world!’ but following the Tasks style. We see that it includes the `TAREA.CPP` file: we must always do this, as it contains the definition of the task control kernel class and creates the global object `CtrlTareas` derived from it. In addition, this file also defines the `CTarea` class from which every object that wants to have a pseudoconcurrent process will derive.

Next, the class of the `TareaPrincipal` object is defined, which in this case will be the only task to be executed. Like any task, the class publicly derives from the `CTarea` class and has a public member called `Control()`, which will be precisely the pseudoconcurrent process to be executed. Once the class is defined, an object of global visibility is created, derived from it.

Finally, we arrive at the entry point of the program, where we simply launch the task controller manager, passing it the main task.

{% highlight cpp %}
{% raw %}
/*************************************************
Listing 1: ‘Hello, world!’ based on tasks.

#include <iostream.h>
#include "tarea.cpp"

//-----------------------------------------------
//Here we create the class of the TareaPrincipal object
class CTareaPrincipal:public CTarea{
   //Public members
      public:
         void Control();
};
void CTareaPrincipal::Control(){
   // We act based on the state of the task
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
// We create the TareaPrincipal object
        CTareaPrincipal TareaPrincipal;

//-----------------------------------------------
// The main() function directly calls the manager
// passing it the parent process
void main(){ CtrlTareas.Gestor(&TareaPrincipal);}
*************************************************/
{% endraw %}
{% endhighlight %}

### Creating tasks

Now that we have seen a program based on Tasks and are beginning to form an idea of how it works, let\'s look in more detail at how to create an object derived from `CTarea` and what it can do.

Listing 2 shows the definition of the `CTarea` class. We see that all its members are public.

The first four data members store the task identification and the parent\'s identification. The `Id` tells us what type (class) the task is, while `Clon` differentiates different tasks with the same `Id`. The parent\'s data identifies the task that activated them.

The `Estado` variable stores the internal status of the process. It allows recovering the previous situation in the next call.

The `Control()` member function is the function that will be executed when control is passed to the task. Each class derived from `CTarea` must redefine its own `Control()` function.

Finally, there are the basic operations that tasks can do. They can be activated, change their internal state, self-destruct, and destroy their children.

All objects derived from `CTarea` must have global visibility in the program and must be created before the `main()` function, or they must be of type `static`. But the fact that the object has been created, even before the program itself begins, does not mean that the associated task is active. The object space (C++ objects) is independent of the task space. When we call the task manager in the `main()` function, only the task that we pass as an argument exists in the task space. And it will be this, the main task, that is in charge of activating (or creating) the other tasks.

The `Control()` function usually begins with a check of the `Estado` variable in order to know where it left off when it left the process. A `switch/case` structure is the most natural choice. With `CambiaAEstado()`, we move between the different states of the task.

Also within the control function are the self-destruction and child destruction messages. For example, the fastest way to end the execution of a program based on Tasks is to end the execution of the main task by destroying its children. Since the main task creates (activates) all the others, we guarantee that all tasks are eliminated. If the main task then self-destructs, there are no more tasks to execute and the program ends.

The only one that is not included within the `Control()` function is `Activate()`. The reason is simple: a task cannot create itself. The process that sends this message to an object derived from `CTarea` becomes the parent of the new task.

{% highlight cpp %}
{% raw %}
/*********************************************************
Listing 2: Definition of the CTarea class.
class CTarea{
  // Public members
  public:
      // Task data
         int Id;
         int Clon;
      // Parent data
         int Id_Padre;
         int Clon_Padre;
      // Internal state
         int Estado;
      // Pseudoconcurrent process of the task: Control()
         virtual void Control(){};
      // Basic operations:
         void CambiaAEstado(int NuevoE){Estado=NuevoE;}
         void Destruyete();
         void DestruyeHijos();
         void Activate(int,int);
};
*********************************************************/
{% endraw %}
{% endhighlight %}

### The Task Controller

It is called `CtrlTareas` and it is a global object derived from the class shown in Listing 3. It is created when we include the `TAREA.CPP` file in our program, and it is the kernel that controls Tasks.

We see that in its interface there are functions similar to the ones we saw in the `CTarea` class. These are much more powerful and should not be used unless we understand well how they work (which is not difficult).

However, it has a record of the time elapsed since the program started, which we can use and is very useful. Imagine that we want our task to do something every certain time interval. The first thing to do is to capture the current time. In the following calls, it will be enough to compare the captured time with the current one (`CtrlTareas.Tiempo`). When the difference exceeds the desired interval, what we wanted is executed and the current time is captured again, with which the cycle is repeated.

The `Id` and `Clon` data members store the identification of the task that is currently running.

If we look at the list of private members, we will see that a matrix of pointers to `CTarea` is defined. The number of elements is `NUMMAXTAREAS` and it is the maximum number of tasks that the manager controls. If we want to modify it, it is enough to redefine this constant (with `#define`) just before including the `TAREA.CPP` file.

This task controller is very simple. If you like the topic, do not hesitate to improve it.

{% highlight cpp %}
{% raw %}
/*************************************************
Listing 3: Definition of the task controller object class.
class CCtrlTareas{
   // Public members
   public:
     // Interface with the controller
        void Gestor(CTarea *);
        void Crear(CTarea *,int,int);
        void Autodestruirse(){Destruir(PT);};
        void Destruir(int id,int clon);
        void DestruirHijos(int Num);
        void DestruirHijos(){DestruirHijos(PT);};
     // Time record
        float   Tiempo;
     // Data of the current task
        int     Id;
        int     Clon;

   // Private members
   private:
     // List of tasks
        CTarea  *ListaDeTareas[NUMMAXTAREAS];
     // Pointer (index) of the active task
        int   PT;
     // Number of active tasks
        int   NumTareasActivas;
     // Private functions...
        int   Busca(int id,int clon);
        void  Destruir(int Num);
        void  CopiarTarea(int Org,int Dest);
        void  CopiarBloqueTareas(int Org,
int Dest,int Num);
};
*************************************************/
{% endraw %}
{% endhighlight %}

### A real application

If you have not yet tried the executables that accompany the text, you may be wondering if it is really worth using Tasks. The answer is clearly affirmative. Just take a look at the source code of the `DIBUJO.CPP` file and you will see how simply you can make a most attractive program.

The program defines the object classes `CEstela`, `CCharlie`, `CBotonBonito`, and `CTareaPrincipal`. It also creates an `Estela` object, which creates a trail of colors on the mouse path, two `Charlie` objects that watch attentively where the mouse points, and a total of 68 buttons for various purposes. All these tasks are created and controlled by the `TareaPrincipal` task.

To see with an example how a task usually operates, let\'s see how the `CBotonBonito` class is defined. The code is shown in Listing 4.

{% highlight cpp %}
{% raw %}
/*************************************************
Listing 4: Example of a typical task.
class CBotonBonito:public CTarea{
   //Public members
   public:
     CBotonBonito(){};
CBotonBonito(int,int,int,int,
   int,float,int);
     int  Presionado;
     void Inicializate();
     void Inicializate(int,int,int,int,
   int,float,int);
     void    Control();
   //Private members
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
          //We change the border color
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
          //If we are inside,
// mark as pressed
          if(Raton.DentroDe(Cx,Cy,
             Cx+Ancho,Cy+Alto)&&
                  Raton.Estado==1){
   Presionado=TRUE;
          }else Presionado=FALSE;
          break;
     }
}
*************************************************/
{% endraw %}
{% endhighlight %}

Like any class of objects that want to be tasks, the `CBotonBonito` class publicly derives from `CTarea`. We also see that it redefines the `Control()` member function.

The `Inicializate()` member function simply calls the `Activate()` function, but passing it an `Id` specific to the class (`ID_BOTON`, which is defined at the beginning of the file). The rest of the variables are self-explanatory.

Let\'s look at the task\'s control function. It directly enters a `switch/case` structure that checks the value of the `Estado` variable.

Every task that has just been activated enters the `E_INICIALIZACION` state (the `Activate()` function takes care of this), so the task\'s initialization code must be written here. In this case, it simply draws the button, initializes the time record, and changes to the `E_ACTIVO` state. The classes of the `Vga` and `Raton` objects are included with the source files and their function, in addition to being very simple, is obvious. They are used to gain speed; you can use the graphic functions you want.

In the active state, only two checks are made. The first is to check if the preset time lapse to change the border color has been exceeded: if so, change it. The second is to check if the button is being pressed inside, in which case the boolean variable `Presionado` is set to true. Something fundamental, and that we must keep in mind, is that the actions in the active state (or states) must be minimal. It is best to orient this state ‘to the event’: wait for something to happen to perform a computationally more expensive action.

Once the `CBotonBonito` task has entered the active state, it does not leave it until its parent destroys it. It does not have any `E_FINALIZACION` state.

### Conclusions

In this article, we have seen how to simulate process concurrency in a monotasking system. This approach has allowed us to make an attractive program in a simple way.

Although the application has been graphic, Tasks can do almost anything you can imagine. It is especially suitable for simulations. Think, for example, of how easy it would be to create an artificial life program, where each creature would be a task moving through a virtual world. Another different idea could be a logic circuit simulator, where each ‘chip’ would be a task and the electrical connections simple program variables. Even a physical systems simulator, where each particle was a task that must be in charge of obtaining the total force exerted on it to calculate acceleration, velocity, and, finally, the new position it will occupy (if you want to see a program that does this, look in `ftp.uv.es:pub/msdos/otros/gsf.zip`. It is not based on Tasks but you can see the idea).

The possibilities are many: do not hesitate to experiment. If you improve (and it is very improvable) the controller or the philosophy of Tasks itself, please let me know and send me a copy.

### A personal reflection...

In writing this article, I have tried, and I hope I have succeeded, to make the reader reflect on how they program.

It is easy to realize that every program can be written in many ways, but it is not so easy to understand which ways are more efficient for each type of program. A good programmer should use different techniques for each problem, and not always try to reduce the problem to their programming style. They will open horizons and solve any type of problem/program better.

And finally, I do not want to say goodbye without a personal reflection. If instead of talking about pseudoconcurrent processes I had talked about a programming technique based on a program topology oriented to the time multiplexing of processes, I would have written exactly the same thing. The first is understood by everyone. The second requires you to stop and think and realize how you have programmed. See you soon.