---
title: Java Technology (I) – Understanding the Platform
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

This post is an English adaptation of the first article I wrote for **Revista Profesional para Programadores (RPP)** back in October 1997. Sun’s hot new language had barely turned two, and the Web was still mostly static documents. The piece set the stage for a three-part series on the Java Platform, the virtual machine, and the APIs that sat on top of it.

---

## Why talk about “platforms”?

In the magazine I began with a pragmatic definition:

- A **platform** is the minimum stack you need to run software.  
- Concretely, it’s the combination of hardware + operating system + runtime libraries.  
- Two platforms are *different* if you must recompile code to move from one to the other.

Windows, UNIX, OS/2… each is its own universe. Java’s promise was to create a *virtual* universe that hides those differences.

## The Java Platform as a layer

To run Java code anywhere we first install a **Java Platform** tailored to the host device. Think of it as a layer on top of the native system:

![Java Platform](/images/1997-tecnologia-java/figura-a.jpg)

> The Java layer turns a heterogeneous network into a mesh of identical virtual machines. Once the layer is in place, the same bytecode runs everywhere.

The result is deceptively simple: instead of compiling custom binaries for every target, we deploy bytecode once and let the platform adapt itself to the local hardware/OS. Just like the OSI networking model hides link-level differences, the Java layer hides the entire machine underneath.

## Two pillars: JVM + APIs

The Java Platform is made of:

1. **The Java Virtual Machine (JVM)** – responsible for portability. Each host implements the JVM so it can interpret and execute bytecode safely.
2. **The Java APIs** – a family of class libraries that expose standard functionality (I/O, networking, graphics, UI, security…).

All JVMs must behave the same, but the API surface can vary. That leads to three “flavours” of the platform:

- **Core API** (a.k.a. *applet API*): the minimal set defined by Sun’s JDK 1.0.2. If you only depend on this subset your program runs everywhere.
- **Standard extensions**: optional packages (Swing, JDBC, RMI at the time) that vendors may or may not ship. Over time successful extensions migrate into the core.
- **Embedded API**: a trimmed-down profile for constrained devices—set-top boxes, printers, early mobile phones—where memory, display and connectivity are limited.

## Real-world implementations (1997 snapshot)

The article reviewed common deployments:

- **Web browsers** (Netscape, IE) bundled a JVM capable of executing applets with a restricted API for security.
- **The JDK** packaged a full JVM + tooling (`java`, `javac`) so developers could run standalone applications on the desktop.
- **Consumer electronics** vendors were experimenting with hardware-assisted JVMs to accelerate bytecode execution on network computers, printers, etc.

The key takeaway: the *conceptual* platform was uniform, but the *implementations* were wildly different depending on the use case.

## What comes next

In the rest of the series (Parts II and III) I dove into:

- The internals of the JVM: class loading, bytecode verification, garbage collection, and the security sandbox.
- The then-nascent extension APIs such as JDBC, RMI, and the Abstract Window Toolkit.
- The implications for the future Web—moving from document browsing to distributed application platforms.

Two decades later the core message still holds: Java’s power lies in abstracting the hardware + OS stack so developers can focus on behaviour, not on porting. That idea has since influenced everything from the CLR to WebAssembly.

If you're curious about the original scans (Spanish only), the RPP issues are [still available](/images/1997-tecnologia-java/cover-1.jpg). Parts [II](/blog/1997/11/01/tecnologia-java-2/) and [III](/blog/1997/12/01/tecnologia-java-3/) dive deeper into the inner workings of the JVM and the ecosystem that surrounded it in 1997.
