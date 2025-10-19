---
title: Java Technology (III) – Implementing and Running the JVM
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

To close the trilogy I wrote for **RPP** in 1997, this translated post explains how a Java Virtual Machine is implemented and what actually happens when bytecode runs. The original Spanish piece dissected Sun’s reference implementation at the time; this adaptation keeps the core explanations while updating the terminology slightly.

---

## Key data structures

The JVM manages three major memory regions:

1. **Java Heap** – stores all object instances. In Sun’s design each entry consists of a *handle* pointing to:
   - The object’s method table.
   - The block of instance data (field values).
2. **Method Area** – describes every loaded class: constant pool, bytecode of each method, method/field tables, access flags, and metadata.
3. **Execution Stacks** – one per Java thread. Each stack holds **frames**; a frame contains the local variables, operand stack, and bookkeeping for the currently executing method.

When you see `objectref` in bytecode, it is essentially an index into the heap’s handle table. From the handle you can jump to the correct method table and data block.

## Class loading lifecycle

Running `java ClasePadre` triggers the following:

1. **Bootstrap** – the JVM initialises internal classes and readies the bootstrap class loader.
2. **Class loading** – `ClasePadre` is requested; the loader locates the `.class`, parses it, validates the constant pool, and places the metadata in the Method Area.
3. **Linking** – symbolic references are resolved, field offsets assigned, default values prepared.
4. **Initialisation** – static blocks run, static fields receive their initial values.

If `ClasePadre` references `ClaseHijo`, the process repeats for the child class the first time it is needed. Custom class loaders (network, encrypted archives, etc.) simply replace the “locate the `.class`” step.

## Stepping through an example

The magazine article used a simple program:

```java
class ClasePadre {
  public static void main(String[] args) {
    ClaseHijo primero = new ClaseHijo(3, 7);
    ClaseHijo segundo = new ClaseHijo(1, 2);
    System.out.println(primero.suma());
    System.out.println(segundo.suma());
  }
}

class ClaseHijo {
  int numeroA, numeroB;
  float resultado;

  public ClaseHijo(int a, int b) { numeroA = a; numeroB = b; }

  public float suma() {
    resultado = numeroA + numeroB;
    return resultado;
  }
}
```

Once compiled, the JVM proceeds as follows:

1. **Create main frame** – a new frame for `ClasePadre.main` appears on the main thread stack.
2. **`new` bytecode** – allocates a handle in the heap, initialises fields to defaults, pushes the reference.
3. **`invokespecial`** – calls the constructor, pushing a new frame with its own locals and operand stack.
4. **Field assignments** – bytecodes like `putfield` store constructor arguments into the object’s data block.
5. **Method return** – the constructor frame pops off, control goes back to `main`.
6. **Method invocation** – `invokevirtual` on `suma` creates another frame, adds `numeroA` and `numeroB`, stores the float result, and returns it to the caller.

Print statements eventually call into native methods (`java.io.PrintStream.println`), demonstrating how the JVM bridges Java bytecode with host libraries via the Java Native Interface (JNI).

## Garbage collection

Although the original text only touched on it briefly, the takeaway was:

- Objects are eligible for collection once no frame or static field holds a reference to their handle.
- The collector can compact the heap, updating handles to point to the new data locations, which keeps references stable.

## Concurrency

Each Java thread maintains its own execution stack. Synchronisation primitives (`monitorenter`/`monitorexit`) act on object monitors stored alongside the heap handles, ensuring mutual exclusion without exposing raw OS mutexes to bytecode.

---

### Why this still matters

Even if today’s JVMs sport JIT compilers, tiered execution, and sophisticated garbage collectors, the fundamental architecture described in 1997 remains intact: handles, constant pools, frames, class loaders, and bytecodes acting as the lingua franca between source languages and the managed runtime.

If you want the nostalgic flavour, the original magazine scan is available at `/images/1997-tecnologia-java/cover-3.jpg`. Together, the trilogy—[Part I](/en/blog/java-technology-1/), [Part II](/en/blog/java-technology-2/), and this post—captures the excitement of discovering a platform that promised “write once, run anywhere” and largely delivered on it.
