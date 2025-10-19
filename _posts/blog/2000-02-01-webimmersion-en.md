---
title: WebImmersion – Rethinking the Web (English Overview)
excerpt: "An English adaptation of my 2000 vision for an object-oriented Web built on the Web Immersion Protocol."
tags: [webimmersion]
lang: en
ref: webimmersion
modified: 2025-10-19
comments: true
permalink: /en/blog/webimmersion/
---

This is a condensed English version of the whitepaper I wrote in 2000 about **WebImmersion**, a proposal to evolve the Web from hyperlinked documents into a live fabric of interoperable Java objects. I was 26, the dot‑com boom was in full swing, and everything felt possible.

---

## From HTTP to WIP

In the paper I compared the relationship between HTTP and files with the one I imagined for WebImmersion:

> *A file is to HTTP what a Java object is to WIP (Web Immersion Protocol).* 

Instead of serving static HTML, a WebImmersion host would expose **objects**: services with state, behaviour, and well-defined interfaces. Clients would interact with those objects through the Web Immersion Protocol, invoking methods, subscribing to events, or composing behaviours in real time.

The ambitious promise was to turn the Web into “a living community of Java objects that communicate, interoperate, and create immersive worlds where users can manipulate services as if they were tangible things.”

## Historical context

- **1995**: Java appears. The young Web adopts multimedia, browsers ship plug‑ins, and applets tease richer interactions.
- **Late 90s**: Enterprise JavaBeans, CORBA, and distributed objects become fashionable, yet integration remains painful.
- **Hypothesis**: marry the dynamic object model of Java with the reach of the Web to create a ubiquitous runtime for interactive applications.

## Related technologies

WebImmersion drew inspiration from several ecosystems:

- **HTTP/HTML** – the existing web fabric and its stateless request/response semantics.
- **EJB** – component models and transactional services.
- **Jini** – network discovery, leasing, and service lookup.
- **CORBA / ORBs** – method invocation across heterogeneous systems.

Rather than replacing them, WebImmersion tried to **recombine** their strengths: use HTTP as the transport, Java’s security sandbox for execution, and an object directory (similar to Jini) for discovery.

## Core ideas

1. **Everything is an object** – Worlds, rooms, avatars, data feeds, business services… all exposed as Java objects.
2. **Immersive clients** – Browsers capable of rendering 2D/3D scenes, binding UI components directly to remote object interfaces.
3. **Scripting over objects** – Developers orchestrate behaviour by composing object graphs rather than building monolithic web apps.
4. **Extensibility** – Third parties can drop new object types into the network, instantly consumable by any compliant client.

I envisioned use cases ranging from e-commerce configurators to collaborative virtual spaces. If the Web was a hyperlinked library, WebImmersion wanted it to feel like a programmable city.

## What I underestimated

- **Security**: letting arbitrary objects roam between hosts raises sandboxing, authentication, and trust challenges that only became tractable years later.
- **Bandwidth & latency**: the early 2000s Web was still dial-up for many people. Streaming object interactions at scale would have required infrastructure that simply didn’t exist yet.
- **Developer ergonomics**: the tooling was nowhere near the level we take for granted today. Distributing SDKs, debugging remote objects, and handling partial failures would have been brutal.

## Lessons that aged well

- The desire to move computation closer to data has reappeared in serverless, edge runtimes, and WebAssembly.
- Rich client-side apps mixing offline capability with cloud sync (think Figma or Notion) align with the immersive goals I had in mind.
- Discoverability and dynamic composition—the ideas popularised later by service meshes and LLM toolchains—echo the service directory I described.

Two decades on, WebImmersion reads like a time capsule from the early Internet exuberance, but the pattern of *objects + network + live composition* keeps coming back in new forms.
