---
title: Java Technology (I) – Understanding the Platform (EN)
excerpt: "First article in my 1997 RPP series explaining why the Java Platform matters, how the VM and APIs fit together, and where Java was headed at the time."
tags: [rpp, java]
lang: en
ref: tecnologia-java-1
modified: 2025-10-19
comments: true
image:
  feature: 1997-tecnologia-java/cover-1.jpg
permalink: /en/blog/java-technology-1/
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

This is the first of a 3-part series. See the [2nd](/blog/tecnologia-java-2/) and [3rd](/blog/tecnologia-java-3/) parts.

<figure class="half">
    <a href="/images/1997-tecnologia-java/cover-1.jpg"><img src="/images/1997-tecnologia-java/cover-1.jpg"></a>
</figure>

---

> It has been two years since Java was released. During all this time, it has evolved in many aspects, becoming a key factor in the development of the Internet. Since it seems that we are going to have much more Java in the future, it is worth solidly reviewing its fundamentals. Knowing them will place us in a privileged position to understand its future evolution.

First of all, we must be clear about what we are going to talk about and what we are not. Throughout the series, we will talk about the Java Platform, its Virtual Machine and how it is implemented, and, in general, about technical specifications. Although we will talk about the APIs, we will not see how to program with them, but we will try to explain the reason for said APIs. It is a series about Java technology and its implications, not about programming.

### The Java Platform

Every interpreter, server, WWW browser, and soon cellular phones, photocopiers, printers (and who knows if one day toasters) that use Java technology, base their operation on the Java Platform [1]. This is the origin and where we will begin.

What is a platform? In abstract terms, a platform is the essential support on which we can run an application. In simpler (and reduced) terms, we can see it as the sum of hardware and an OS mounted on it. To know if two platforms are the same, it is enough to ask yourself if you need to recompile the applications developed for one when you want to run them on the other. If the answer is affirmative, the platforms are different (at least at the code execution level, as I see that some of the readers complain that Windows NT is a platform and runs on diverse hardware).

Microsoft Windows, UNIX, OS/2, etc. are examples of platforms that are different from each other.

Now that we know what a platform is, what is the Java Platform? Well, in view of what has been explained above, the Java Platform is the necessary support so that a Java application can be executed, and that ensures that wherever it is installed we can run the same code and expect identical results.

If we want to execute Java code on any equipment (be it a computer or a telephone), the first thing we will have to do is install a Java Platform specifically designed for said device. It is typically mounted, as a layer, on the existing base platform on the computer (Figure A).

![Java Platform](/images/1997-tecnologia-java/figura-a.jpg)

> **Figure A**: The Java Platform abstracts the lower layers.
> In this sense, the Network loses its heterogeneity and we have a virtual Network of identical machines (with the advantages that this may entail).

Thanks to this conception of the Java Platform as a layer, the independence of the platform it is based on is achieved, something of vital importance in a world of such heterogeneous technology as ours. Just as the OSI model for interconnection of network systems adds layers that abstract the lower layers, in order to make them transparent, the Java Platform makes the entire equipment transparent, resulting in an identical virtual equipment regardless of what is underneath.

Thus, where before we had many platforms and specific applications for them, which cannot run on the others, now we have a single platform (although implemented differently for each base platform). This allows us to run the same application anywhere without having to port and recompile the code.

### Parts of the platform: JVM and API

The Java Platform consists of two parts: the Java Virtual Machine and the ‘Java Application Programming Interfaces’ (Java APIs). The Virtual Machine is responsible for the portability of Java code. Each platform implements its own Virtual Machine, which interprets and executes the bytecodes written for it. The APIs are a set of predefined classes that allow us to write and develop Java code by providing it with basic functionalities for general use.

Although every Java Platform uses the same Virtual Machine, not all of them have the same APIs. This may sound paradoxical, as it seems to break with the platform independence that Java boasts so much about. In fact, it does. The trick that apparently saves everything is the distinction between different APIs.

The ‘core API’ (also known as the ‘base API’ or ‘applet API’) is the one that EVERY Java platform must include as a minimum and which is constituted by the API of Sun’s JDK 1.0.2. An application that only makes use of these APIs will work anywhere.

On the other hand, there are the standard extensions of the API that are optional but that, over time, may become part of the base API.

Finally, there is the Embedded API, intended for consumer electronics devices with fewer resources (small memory, no screen, no network connection, etc.) such as Network Computers, printers, photocopiers, and cellular phones. It seems that Java will finally end up fulfilling the mission for which it was created (although Sun is surely still amazed).

### Examples of Java platforms

To establish ideas, let's talk about some possible implementations of the platform.

The first one we can think of is the one we have (if we really like Java) installed on our computer. In fact, we have several. One will be the one provided by our Web browser, which includes a Virtual Machine and the necessary, sufficient, and restricted-use API, so that we can see applets swarming on the screen. Another will be the one included in our Java application development system (JDK), with the complete API. In this last implementation, the way to execute a program will be to launch the interpreter, passing it the application we want to run as an argument. The interpreter will emulate the Virtual Machine to which it will pass the code, so that it can execute it. In all these implementations, the JVM is emulated by software.

Another possible realization of the Java Platform is that of consumer devices. In this one, the software implementation of the Virtual Machine is replaced by a hardware implementation based on a Java microprocessor that executes the same bytecodes, but much faster. Sun's proposal in this regard is picoJava, a set of specifications on how to bring Java to silicon chips. These integrated circuits (of the JavaChips family) are supported by JavaOS, an operating system written entirely in Java (or so Sun says) and which performs the typical tasks of process scheduling and resource management, in addition to providing graphic window functionalities, network access, file system, etc.

As we can see, the possibilities are multiple and are constantly expanding, but the basic idea (the Java Platform) is the same. Let's not be impressed by such abundance (rather, let's be glad) and let's continue with the review.

### The Java Virtual Machine

We already know the platform and its parts, but how is all that implemented and how does it work in practice? We will see it more clearly after talking about the Java Virtual Machine (JVM).

The Java Virtual Machine is an imaginary machine that is typically implemented by software emulation on a real machine (for example, a computer). This machine executes bytecodes, a machine code specific to the JVM, designed to be efficiently interpreted. In any case, the current trend is the JIT compilation of bytecodes to native code or, as we saw before, their execution with hardware support.

If we take a look at the specifications of the Java Virtual Machine [2], we will find three parts: architecture, the format of the .class files, and the instruction set.

### Architecture of the Virtual Machine

All computer machines are usually segmented into three functional blocks: CPU, memory, and I/O. In the case of the JVM, it is not easy to make this separation. While it is easy to find the CPU, it is not so easy to find clearly defined memory, much less I/O. In any case, a separation into classic blocks of the JVM will help us to understand it better, and that is what we are going to do.

### The CPU: the heart of the JVM

The JVM (in addition to many other high-level tasks) emulates a CPU, half RISC, half CISC, 32-bit and with only 4 registers, which performs stack-based operations.

The instruction cycle consists of 2 phases, opcode search (operation code) and its execution. This cycle is repeated indefinitely by the JVM until its completion, a characteristic of every CPU.

All the instructions it executes consist of a single-byte operation code and optional operands, so the number of instructions is small (less than 256 for obvious reasons). Some of these instructions perform high-level operations, such as conditional jump structures of the case type, while others are very simple, such as loading a value onto the stack. We will see more details when we talk about the instruction set in the next article of the series.

The four registers available to the CPU (PC, vars, optop, frame) are 32-bit memory references (4-byte registers), so only a maximum of 4Gb can be addressed.

The PC (program counter) register always points, as in all CPUs, to the next bytecode to be executed. This bytecode will belong to the currently executing method, which should lead us to think of the obviousness that a Java program is nothing more than a succession of method calls, in which sequences of bytecodes are executed. And yet, despite the obviousness, we must keep it very much in mind from now on. But let's continue with our business…

The vars register points to the data space (which the specifications call the Local Variables space). The CPU has instructions that allow moving data from this space to the stack and back. This memory space stores the variables that are local to the executing method. When the method finishes, these variables are lost.

The optop register points to the top of the stack. This structure is used to perform all the typical CPU operations (arithmetic and logical, among others).

The data types that this CPU can work with are the basic ones of Java (byte, short, int, long, float, double, and char) and two new types: Object and returnAddress, both of 4 bytes. Object (although we will refer to these types as objectref from now on) is a reference to a Java object (a 32-bit pointer to an object handler in Sun's implementation, but it could be an index to a table or anything else). returnAddress is a data type used by instructions dedicated to handling subroutines.

The frame register points to the execution environment of the active method. This data structure stores information about dynamic linking, normal method return, and error propagation, as well as information about the class to which it belongs, its name, etc. Unlike the previous ones, frame is not a typical register in a CPU. In fact, and as we will see shortly, it is very closely linked to Java.

Basically, this is the CPU that the JVM emulates. But the JVM is much more than a CPU that executes bytecodes. Java is an object-oriented language and this is reflected in the JVM.

The software unit in Java is the class. At the execution level, however, the fundamental unit is no longer the class but the method (did anyone still doubt it?). The JVM executes at all times a single method. Each method has its own local variable space (which will be freed when the method finishes), as well as its own stack and its own execution environment.

### Memory: needs and distribution

We already know the JVM's CPU, what about the memory?

We know that it has a 32-bit memory, as this is the width of the CPU's address registers. As for how it is organized, the matter is more difficult and depends heavily on the implementation of the JVM (that is, on the software house that developed it). However, we can infer abundant and valuable information from the technical specifications of the JVM (see [2]).

Java implements dynamic linking based on symbolic references. This means that when a class, a method, or a field of a class is referenced, an absolute address is not used (no linking), nor is an offset to a specific base at runtime (linking). What is used is a character string with the full name of what is referenced (actually, and as we will see in the next article, a “signature” is used that uniquely identifies the class, method, or field).

It must, therefore, have a symbol table with names of classes, methods, and fields, accompanied by their position in memory, access flags, type identification, etc. When an object is referenced for the first time, this table is searched. If it is found, all subsequent references to this object will directly use the associated memory address, and not the string with its name.

In addition to the symbol table, the JVM must have a space where the definitions of the classes loaded by the machine, the code of their methods, the static fields, and the constants defined in it are stored (constant pool, according to the .class format).

A space dedicated to local variables, the execution environment, and the operand stack is also necessary. The size required by these data structures can be calculated at compile time. They are grouped into a block known as a frame in Sun's implementation. Each time a method is called, a new frame must be created. It is, therefore, a dynamic memory space that adapts very well to the mode of operation of a stack (Sun defines a stack of frames for each running Thread, but we will see this later).

Finally, we would find the Java heap. This is the dynamic memory space where the instances of the classes are located. It is in this area where the garbage collector acts, an instrument that the JVM uses to automatically eliminate instances that are no longer referenced and, therefore, are unnecessary and can be deleted.

### JVM I/O

We have the CPU and the memory: let's go for the I/O. Every typical CPU has a set of instructions that allows handling the I/O space, either directly or through memory. These instructions do not exist in the CPU that the JVM implements (the areas covered by the instruction set can be seen in Table A). How does it manage then to use peripherals (screen, keyboard, mouse, etc.)? For now, we will only say that by making use of API calls. Later, when we talk about how a Java program is executed, we will understand this point perfectly. For the moment, it is enough to say that the APIs ‘know how to do these things’. In any case, any alert mind will realize that if the JVM's CPU does not have I/O but Java is capable, for example, of reading from disk, it must necessarily execute native code that knows how to handle this device.

### JVM Limitations

In addition to a 4Gb memory limitation (32 bits), the JVM has other limitations.

The constant pool of each class is limited to a maximum of 65535 entries, which imposes limits on the maximum complexity of a class. This limitation is imposed by the size of the indices (2 bytes) to the constant pool, which some instructions of the JVM's CPU use (we will talk more about the constant pool when we see the .class format).

The amount of code per method is also limited to 64Kb, because the indices of the exception table, line number table, and local variable table are 2 bytes.

To finish with the limitations, we will also say that the arguments passed to a method must not exceed 255 words.

---

{% highlight text %}
{% raw %}
Table A: JVM Instruction Set.
Areas covered:
- Moving constants to the stack.
- Loading local variables onto the stack.
- Unloading stack onto local variables.
- Index extension for loading, unloading, and incrementing.
- Array handling.
- Stack handling instructions.
- Arithmetic instructions.
- Logical instructions.
- Type conversion.
- Flow control.
- Method return.
- Jump tables.
- Manipulation of object fields.
- Method invocation.
- Exception handling.
- Instance creation and type checking.
- Object monitoring.
{% endraw %}
{% endhighlight %}

---

### More next month

In this first article, we have seen the Java Platform as the minimum essential support to execute Java applications, placing special emphasis on the multiple forms in which it can be found.

And, to begin to understand how Java works, we have taken a tourist visit through the architecture of the Virtual Machine. We even know its limitations. However, we still have things to investigate.

In the next article, we will analyze more carefully the instruction set outlined in Table A.

We will talk about the format of the .class files and how they are loaded into the JVM. We will talk about how the JVM works at runtime in the third and final article of the series. And, based on a simple example program, we will put into practice everything we have learned so far. If there is time, we will talk a little about how the Java Platform is currently being developed (although for that, nothing better than the articles by Ricardo Devis, in this same magazine) and its possible repercussions in the future (we will make some conjectures, although well-founded).

But all this will be in future issues. Until then.

---

Bibliography:

The references listed below can be found in .PDF format at JavaSoft: http://www.javasoft.com/. As technical specifications that they are, they will not become universal classics, but it must be recognized that they are quite well cared for.

[1] The Java Platform, a White Paper. May, 1996. Its reading is highly advisable (it is only 24 pages) to get to know Java with a global perspective: everything that is cooking (or was cooking in mid-96) is here. It is curious to see how they place the API as a layer on the JVM, when the API deals directly with the OS when making native calls. I imagine that this way it looks more elegant, although in my opinion it only confuses.

[2] The Java Virtual Machine Specification. August, 1995. These are the specs of the JVM (about 83 pages). They cover the necessary areas to guarantee the compatibility of third-party implementations, but of design guides, nothing at all (that is, we will have to use a lot of imagination in the internal design, but it must comply with what it says there). It was predictable.