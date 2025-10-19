---
title: Java Technology (III) – Implementing and Running the JVM (EN)
excerpt: "Final article in the 1997 series, translating my walkthrough of Sun's JVM data structures, class loading process, and execution model."
tags: [rpp, java]
lang: en
ref: tecnologia-java-3
modified: 2025-10-19
comments: true
image:
  feature: 1997-tecnologia-java/cover-3.jpg
permalink: /en/blog/java-technology-3/
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

This is the third of a 3-part series. See the [1st](/blog/tecnologia-java-1/) and [2nd](/blog/tecnologia-java-2/) parts.

<figure class="half">
    <a href="/images/1997-tecnologia-java/cover-3.jpg"><img src="/images/1997-tecnologia-java/cover-3.jpg"></a>
</figure>

---

> We don't know how long we will have Java as such, but what we can be sure of is that its technology will survive it. It is a new technology and represents a model to follow in the future. Java has set precedents that we can hardly do without. They will change its name, it will be faster, more secure, but the technology will be the same. It is not in vain to know it.

In the previous articles of the series, we talked about the Java Platform, the internal logical structure of the JVM, the .class binary format, and the instruction set of the Java Virtual Machine. We already know the fundamentals of how the JVM works quite well. We will now try to complete them with details on implementation and execution.

### JVM Implementation

Let's not deceive ourselves, it is not easy to build a JVM. Fortunately, it is unlikely that our boss will ask us to design one. Jokes aside, those who have followed the series will probably be interested in knowing how a JVM is implemented. This section is dedicated to those readers.

We will take Sun's implementation as a basis (see [1]). In any case, the best thing here is to be creative (each implementation is different) and for each one to give it their own approach.

Thinking about the JVM's data structures, we will need a Java Heap, a Method Area, and an execution stack for each Thread. Let's talk a little about each of them.

Java is an object-oriented language: everything (or almost everything) in Java are objects. A class defines a series of fields and methods that act on those fields. The methods are the same for all objects of the same class, but not the values of the fields. An object, an instance of a class, is then characterized by the value of its fields and the class to which it belongs (where the methods are defined). The Java Heap is organized with this in mind.

In Figure A, we can see Sun's Java Heap. It is a memory area divided into two large parts. In the first part, the object handlers are stored. In the second part (data area), the values of the object's fields are stored. A handler is nothing more than a data structure with 2 pointers. The first is a pointer to the object's method table. The second is a pointer to the data area of the Heap, where the values of the instance's fields are located. In the previous article, we talked about an `objectref` as a reference to an object. This `objectref` is nothing more than an index to the Heap's handler table. Every object has a reference and, therefore, its handler. Given an object's handler, we have access to the instance's fields and the methods that act on them.

Each class is described in a data block that contains the class's constant pool, the code of the methods it implements, a method table, and a symbol table. The class's methods have signatures that identify them. The set of signatures forms a method table for the class, and each entry has an associated block that describes the method in question (whether it is native or not, the location of the bytecodes, etc.). The signatures of the class's fields also constitute a field table, which will have associated offsets in the data of each object stored in the Heap. All this information will be stored in the Method Area.

We will need to register the classes loaded in the machine. We will associate the class name with the loader (the standard loader reads from the local disk in the CLASSPATH, but we can make another loader that reads from the network), a pointer to the class description block (which we mentioned before), access flags, etc.

For each running Thread, we will need an execution stack. The execution stack (see Figure B) contains the frames of the methods that have not yet finished. When another method is called in the middle of a method, a new frame is created on this stack. The new frame will contain the local variables, the execution environment, and the operand stack of the called method.

These are, in general terms, the structures that the JVM handles. To know how it operates with them, it is best that we see it in action…

### Running the JVM

There is nothing more cherished, by all of us who learn every day, than a good example. I don't know how good the following one will be, but I am confident that, at least, it will be more entertaining for the reader than everything that has come before.

Let's take as an example a very simple Java source file (see Listing 1). It defines two classes, parent and child. The first class (`ClasePadre`) contains the `main()` method and will be the entry point to the program.

The children are somewhat strange mathematicians, who add integers given to them at birth and give the result in floating-point format. By the way, they don't talk, they only add. The father has two children right from the start, and instead of seeing if they cry, he asks them to add the numbers. Nothing strange.

When we compile the source file, `javac` creates two .class files: `ClasePadre` and `ClaseHijo`.

**Listing 1: Source program rpp.java**
```java
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
```

Although we will all agree that we are going to see the values 10.0 and 3.0 on our monitor, we probably do not know for sure what the JVM has done during the process. To explain it more clearly, we have disassembled (with `javap`) the `ClasePadre` (Listing 2) and `ClaseHijo` (Listing 3) classes.

Initially, we will have an empty and idle JVM, which is asked to execute the `main()` method of a class called `ClasePadre`. This is, in essence, what the Java interpreter does when we launch it: call the `main()` of the class we pass as an argument.

The process that the JVM then performs is always the same. It searches the table of loaded classes to see if the class of the requested method already exists. In our case, it does not find it, as we have just started: it must load it into memory. To do this, it uses the default class loader, which reads from the local disk. Nothing prevents creating a Java interpreter with a default class loader that reads from the network, something very useful, for example, in Network Computers.

After loading the `ClasePadre` class, an object of the same is created and control is passed to the `<init>()` method, a method that is always called when we initialize a new object. All objects have as their first local variable the `objectref` that identifies the object (it's as if they told you “here, this is your ID”). The `<init>()` method of `ClasePadre` (see Listing 2), loads its `objectref` onto the stack and performs a special invocation (a type of invocation not discussed in [2]) to the `<init>()` of its superclass (`java.lang.Object`). This is all it does to initialize itself.

We already have the object created. Now we can call the `main()` method. Following Listing 2, the first thing that is done is to create a new object (`new`) described by item #1 of the constant pool. The disassembler writes the item in question to the right (in this case, the `ClaseHijo` class). After the instance is created, the stack contains the `objectref` of the created object.

Next, it duplicates (`dup`) the reference of said instance (as it will need it later).

At this point, we have an example of an accelerator: `iconst_3`, which only occupies one byte, loads the integer 3 onto the stack. As there are only accelerators up to `iconst_5`, to put a 7 on the stack it is necessary to use `bipush`, which transforms the next byte (with a value of 7 in our case) into an integer and puts it on the stack.

With the above, we have created a new `ClaseHijo` object (`PrimerHijo` in our source program) and we have put the integers 3 and 7 on the stack. After calling the `<init>` method of the `ClaseHijo`, the new instance is completed. The object reference that still remains on the stack (remember the `dup`) is stored in local variable 1.

**Listing 2: Disassembly of ClasePadre.class**
```
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
 21 getstatic #9 <Field java.lang.System.out Ljava/io/PrintStream;>
 24 aload_1
 25 invokevirtual #8 <Method ClaseHijo.Suma()F>
 28 invokevirtual #10 <Method java.io.PrintStream.println(F)V>
 31 getstatic #9 <Field java.lang.System.out Ljava/io/PrintStream;>
 34 aload_2
 35 invokevirtual #8 <Method ClaseHijo.Suma()F>
 38 invokevirtual #10 <Method java.io.PrintStream.println(F)V>
 41 return
Method <init> ()V
 0 aload_0
 1 invokespecial #6 <Method java.lang.Object.<init>()V>
 4 return
}
```

The `SegundoHijo` is created with exactly the same structure. By the way, did you see that to initialize the children, a method `<init>(II)V` is called? The two “II” inside the parentheses mean (as many will have guessed) that it has two integer arguments. The “V” at the end indicates that the method is of type `void`.

At position 21 of the `main()` method's code, the content of the `Ljava/io/PrintStream` field (this is an example of a signature, located at position 9 of the constant pool) of the `java.lang.System.out` class is loaded onto the stack.

Next, we load the `PrimerHijo` object onto the stack (whose `objectref` we stored in local variable 1) and call one of its methods: `Suma()`. Let's stop here for a moment. The JVM has at that moment on the stack the `objectref` of the `PrimerHijo` instance and, on the other hand, an index to the constant pool where the signature of the `Suma()` method is located. As we already saw, by multiplying `objectref` by the size of a handler, we get an offset in the Java Heap where we will find a pointer to the object's method table and a pointer to the instance's data. What matters to us now is that we have a method table (the object's) and a method pending execution. Searching for the method in said table, the JVM finds the entry `ClaseHijo.Suma()F`. Associated with this entry is a pointer to the `Suma()` method block, where all its information is located (among other things, the code). Of course, all this is transparent to us.

In case someone has not yet realized, this is what we usually know as dynamic linking. Since it is not very efficient to search for string matches, once it has been done for the first time, the method signature item in the constant pool can be replaced by an item, valid only at runtime, which is directly a pointer to the method block.

The rest of Listing 2 is quite clear.

**Listing 3: Disassembly of ClaseHijo.class**
```
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
```

In Listing 3, we see the disassembly of the `ClaseHijo` class. This time, the initialization method of the class instances is more complex. As was the case in the `ClasePadre`, the superclass is initialized first. Second, the `NumeroA` and `NumeroB` fields of the instance are filled with the values passed as arguments. We see here how these are passed: if local variable 0 contained the `objectref` of the instance, the following local variables contain the arguments passed to the method.

In the code corresponding to the `Suma()` method of the `ClaseHijo` class, we see the operation of the operand stack: the values of `NumeroA` and `NumeroB` of the instance are placed on the stack and then we add them with an `iadd`.

### Final details and security considerations

The way the JVM handles I/O is through native methods. When the JVM encounters a call to a native method and gives it control, the JVM ceases to execute bytecodes. A function with machine code specific to the base platform is loaded from a dynamic link library, executing the native code in question. We already have I/O. It is also very easy to extend: for each new device, it is enough to create functions with the native code that performs the I/O, and an interface (or class, depending on taste) to be able to handle it from Java.

Okay, what about security? As we already pointed out in the last article, it is not easy to crack the JVM by playing with the bytecodes (or, more generally, with the binary files). We are going to assume that everything we have on our computer is reliable. The problems arise when we bring Java code from the network, code that is not reliable. Is this safe? Can we trust these operations? Let's think a little… what travels over the network? It seems that only .class files with Java classes are transferred over the network. But these files only contain information that, as we have seen before, is not in itself harmful, since the bytecodes do not access either memory or I/O. It seems obvious now that only a call to a native method can cause damage to our system.

Conclusion: our security will be as good as our `SecurityManager` is. All dangerous accesses (in general, any native method) should be implemented as private and use a second public method that asks the `SecurityManager` if the operation is allowed. If this procedure is followed, we are guaranteed absolute security (at least until some advanced cracker makes us think otherwise).

### Conclusion

The series has come to an end. I just hope you liked it and that you find it useful (if only to satisfy your curiosity).

Comments and criticisms will be welcome in my email, although if you want you can send me an agent that waits around until my server is up and running and notifies us both that we can start an interactive talk.

I apologize and I beg you to forgive me for any mistakes I may have made throughout the series; they are all mine.

Do not neglect Java Technology: it represents the final step towards machine independence in such a heterogeneous universe. The future is in distributed computing, but only a scheme like the one proposed by Java allows exploring the future hidden in the fourth relationship. Think about it. See you soon.

### Bibliography:

The references listed below can be found in .PDF format at JavaSoft: http://www.javasoft.com/.

[1] runtime.PDF, Transparencies taken from the JavaOne conferences that Sun gave in 1996. They are very brief and are not accompanied by any transcription of what was said there.

[2] The Java Virtual Machine Specification. August, 1995. We include this reference for the third and last time. Let's see if you finally decide to take a look at it. There is nothing better than the original sources.