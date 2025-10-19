---
title: Java Technology (II) – Inside the JVM
excerpt: "Second article in the 1997 RPP series, translating my deep dive into the .class file format, bytecode set, and the design goals of the JVM."
tags: [rpp, java]
lang: en
ref: tecnologia-java-2
modified: 2025-10-19
comments: true
image:
  feature: 1997-tecnologia-java/cover-2.jpg
permalink: /en/blog/java-technology-2/
---

This is a translated and lightly annotated version of the second piece I wrote for **RPP** in late 1997. Whereas Part I covered the high-level idea of the Java Platform, this instalment zoomed into the machinery that makes it work: the `.class` file format, the constant pool, the bytecode instruction set, and the tricks the JVM uses to balance portability with performance.

---

## Reading a `.class` file

Every Java source file is compiled into one or more `.class` binaries—one per class or interface. A `.class` file is a stream of 8-bit quantities that follow a rigid structure:

1. **Magic number** (`0xCAFEBABE`)  
2. **Minor/Major version** numbers  
3. **Constant pool** – a table holding strings, class names, field/method descriptors, literals…  
4. **Access flags** (`ACC_PUBLIC`, `ACC_FINAL`, `ACC_INTERFACE`, `ACC_ABSTRACT`)  
5. **This class / Super class** indexes into the constant pool  
6. **Interfaces**, **fields**, **methods**, **attributes**

The article walked through each block, emphasising why the constant pool matters: it is effectively the symbol table of the class and enables late binding, reflective inspection, and verifier checks.

For example, the beginning of a `.class` file looks like this when decoded with `DataInputStream`:

| Type | Size | Java method        |
|------|------|--------------------|
| U1   | 1 B  | `readUnsignedByte` |
| U2   | 2 B  | `readUnsignedShort`|
| U4   | 4 B  | `readInt`          |

Using only these primitive reads you can reconstruct the entire structure.

### The constant pool

Each entry starts with a tag that tells you what comes next: UTF-8 string, class reference, name-and-type descriptor, numeric literal… The pool is the reason the JVM can:

- Resolve symbolic references lazily (only when a class is first used).
- Enforce type safety during verification.
- Share structural information across different parts of the bytecode.

One anecdote from the original text: even the choice of the magic number `0xCAFEBABE` reflects Sun’s coffee obsession.

## The JVM instruction set

Version 1.0 of the JVM specified 164 opcodes (more bytes are used thanks to *accelerators*). Instructions are grouped by area:

- Loading/storing locals (`iload`, `istore`, …)
- Stack manipulation (`dup`, `swap`)
- Arithmetic (`iadd`, `fmul`, …)
- Control flow (`goto`, `if_icmpne`)
- Object operations (`new`, `getfield`, `invokevirtual`)
- Array instructions
- Synchronisation (`monitorenter`, `monitorexit`)

Because many methods only access a handful of locals, the JVM introduced **accelerator opcodes** such as `iload_0`, `iload_1`, `iload_2`, `iload_3`, which avoid the extra operand byte and speed up interpretation.

### Bytecode efficiency tricks

- **8-bit opcodes**: Using exactly one byte per instruction keeps decoding simple on mainstream CPUs.
- **Accelerators**: Spare opcode values are repurposed for the most common patterns so code stays compact and faster to interpret.
- **`wide` prefix**: When a method has more than 256 locals, the `wide` instruction extends the operand size, mirroring how compression algorithms treat rare events.
- **CISC-style operations**: Instructions such as `getfield` perform multiple low-level operations at once (object resolution, offset lookup, value push), trading interpreter simplicity for richer semantics better suited to an object-oriented VM.

### Security implications

The instruction set purposely omits raw memory access. Code can only interact with:

- Its own operand stack and local variables.
- Object fields through accessor bytecodes.
- Array elements via range-checked operations.

Jump instructions are constrained to the current method’s code block, preventing a malicious class from escaping into random memory. Combined with bytecode verification, this design made the sandbox credible for applets downloading across the Web.

---

At the end of the 1997 article I teased what would come in Part III: class loading, the security manager, and how native interfaces bridge Java with the underlying OS. If you enjoy diving deeper, the original Spanish scans live at `/images/1997-tecnologia-java/cover-2.jpg`, and the final article in the trilogy is available in both [Spanish](/blog/1997/12/01/tecnologia-java-3/) and now [English](/en/blog/java-technology-3/) as well.
