---
title: Programming Pseudoconcurrent Processes
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

This article originally appeared in the Spanish magazine **RPP (Revista Profesional para Programadores)** and was my first serious attempt at asynchronous programming back in 1996. DOS machines were strictly single-task, yet I wanted UI components that felt alive, animations that didn’t freeze the rest of the program, and background jobs that did not block user interaction. The solution was to build a tiny kernel capable of **pseudoconcurrent tasks**—cooperative routines that yield control explicitly so several flows can interleave on a single CPU.

What follows is a faithful translation of that text, updated with light clarifications.

---

## Why bother with “pseudoconcurrency”?

Most of us started programming on humble machines such as the ZX Spectrum, Amstrad CPC, Commodore 64, or MSX. You powered them on and began coding, squeezing every byte because the hardware was slow and RAM was scarce. Modern PCs are the opposite: plenty of memory, plenty of MHz. Optimisation only matters for heavy simulations or commercial games, so we willingly “waste” CPU cycles if it buys clarity.

That mindset has a limit. Classic, sequential programming models—do A, then B, then C—struggle when the program needs to react to multiple things at once. Event loops help, but the real game changer is **multiprogramming**: running several processes that share the CPU, isolated from each other except for short message exchanges.

Under DOS we never had true multitasking, so we learned to solve everything with a single, monolithic control flow. Still, we can mimic multitasking well enough to enjoy most of its benefits. The trick is to create a scheduler that slices execution time between independent routines. They are not truly concurrent, but they *look* that way. I called these cooperative routines **Tareas** (“tasks”).

---

## Programming with Tasks: the essentials

The core of the system lives in `TAREA.CPP`. It defines:

- A `CtrlTareas` controller that owns the scheduler loop.
- A base class `CTarea` describing a single pseudoconcurrent task.

Every task derives from `CTarea` and overrides the `Control()` method. Inside `Control()` you implement the behaviour and call `Ceder()` whenever you want to yield control back to the scheduler. The scheduler then wakes up the next runnable task, giving each one the illusion of independence.

### Hello, world! with tasks

The following snippet shows the canonical “hello world” adapted to cooperative tasks. We include the kernel, derive a custom task, and start the scheduler. The task calls `Ceder()` repeatedly so that the scheduler can return control to the main loop in between character prints.

```cpp
#include "TAREA.CPP"

class TareaPrincipal : public CTarea {
public:
  void Control() {
    for (int i = 0; i < 3; ++i) {
      cout << "Hello from iteration " << i << endl;
      Ceder(); // give the CPU back to the scheduler
    }
  }
} tareaPrincipal;

int main() {
  CtrlTareas.Ejecuta(&tareaPrincipal);
  return 0;
}
```

### How the kernel works

`CtrlTareas` keeps a list of tasks. Each task has:

- A state (`Lista`, `Bloqueada`, `Muerta`…).
- A stack frame saved at the moment it yielded control.
- Optional timing information to implement sleeps.

When you call `CtrlTareas.Ejecuta()`, the scheduler enters a loop that:

1. Picks the next runnable task.
2. Restores its CPU registers and stack pointer.
3. Jumps back into the point where the task last yielded.

When the task calls `Ceder()`, control jumps to the scheduler again, which can then resume somebody else.

Because DOS offers no memory protection we must be disciplined: tasks share the same address space, so one bug can crash everything. On the plus side, context switches are extremely cheap.

### Blocking and sleeping

Sometimes a task must wait for an external event. Tareas provides helpers:

- `Bloquear()` marks the task as blocked.
- `Desbloquear(CTarea*)` wakes it up.
- `Dormir(int milis)` yields and schedules a wake-up after a given delay.

These primitives are enough to implement finite state machines, background calculators, UI refreshers, or cooperative network clients.

---

## Scheduling strategies

The scheduler provided in the magazine article was deliberately simple:

- **Round-robin:** iterate over the task list and run each runnable task in order.
- **Priorities:** tasks carry a priority value; higher priority tasks are given more slots.
- **Time slicing:** `CtrlTareas` tracks how long each task has executed and forces a `Ceder()` once a maximum quantum is hit.

Because tasks must call `Ceder()` voluntarily, starvation is a real hazard. The recommendation is to:

1. Keep each quantum of work short.
2. Explicitly yield inside long loops.
3. Never perform blocking I/O without calling `Dormir()` first.

---

## Tips for real projects

1. **Design tasks around responsibilities.** Separate UI refresh, keyboard handling, physics, AI, etc. Let each have its own cooperative loop.
2. **Communicate via queues.** Introduce lightweight message queues so tasks exchange data without stepping on each other.
3. **Instrument the scheduler.** Log task state transitions; it makes debugging much easier.
4. **Plan for errors.** If a task throws or returns unexpectedly, mark it as dead and allow the system to recover gracefully.

Even today I smile when reading the old code. It was naïve in many ways, but it taught me how to reason about asynchronous workflows long before mainstream languages offered `async/await`. Cooperative multitasking is still relevant in embedded systems, game loops, and anywhere you control the full runtime and want deterministic scheduling.

If you want to dig into the original Spanish source, the scanned article includes the full implementation of `TAREA.CPP` plus a gallery of examples ranging from sprite animation to keyboard-driven menus. The principles remain timeless: **structure your program as composable tasks, yield often, and let a simple scheduler orchestrate the show.**
