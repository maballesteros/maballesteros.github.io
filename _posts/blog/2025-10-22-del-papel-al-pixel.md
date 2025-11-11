---
title: "Del papel al píxel: el making of de la app para aprender español"
excerpt: "Cómo convertí unas fichas caseras en Vocabulario, una app viva para aprender español con niveles, práctica y una mascota 3D."
tags: [ia, educacion, producto, vocabulario]
date: 2025-10-22
modified: 2025-10-22
comments: true
---

Todo empezó con una ficha. Bueno, con varias. Cristina, mi mujer, tiene un alumno extranjero recién llegado a la [ESO](https://es.wikipedia.org/wiki/Educaci%C3%B3n_Secundaria_Obligatoria) que no sabía una palabra de español. Me pidió unas [láminas visuales](https://es.wikipedia.org/wiki/Tarjeta_did%C3%A1ctica) con vocabulario básico —de esas con letra grande, dibujos sencillos y palabras en inglés y en castellano— para ayudarle a arrancar. Hice un par, pero enseguida me di cuenta de que aquello era un túnel sin salida: cada ficha llevaba tiempo, los temas se multiplicaban y cualquier cambio implicaba volver a maquetar todo. En resumen: un rollo.

Lo esencial es que el problema no era de diseño, sino de escala. La [IA](/blog/create-your-own-ia-assistant-tutorial/) ya me permite generar contenido flexible, estructurado y visual sin repetir trabajo manual. Así que decidí transformar las fichas en una pequeña [aplicación web](https://maballesteros.com/vocabulario/) que organizara el vocabulario por niveles y temas, y que sirviera tanto para aprender como para practicar. El alumno podía elegir al inicio qué quería hacer —“aprender” o “practicar”— y avanzar por decenas de listas bilingües.

El primer paso fue diseñar la arquitectura del contenido: más de 50 temas, cada uno con entre 10 y 20 palabras. Agrupé los niveles como si fueran misiones de un juego: *Level 1 – Explorer*, *Level 2 – Urban explorer*, *Level 3 – Classroom strategist*… Esa estructura por niveles daba sensación de progreso sin complicar la interfaz. Cada botón abría una lista temática (el aula, la ropa, los transportes, las comidas, etc.) y mostraba las palabras en inglés y español.

Después vino la [gamificación](https://en.wikipedia.org/wiki/Gamification). Quería que el alumno sintiera que avanzaba, que cada tema superado le acercaba a la siguiente etapa. Añadí medallas, contadores y un personaje que evoluciona con la puntuación —una especie de criatura 3D estilo Pixar, simple pero expresiva, que pasa del 1 al 10 en estado de ánimo y energía.

En paralelo, afiné la lógica de práctica: nada de traducciones automáticas sin sentido. Cada pregunta presenta una palabra en un idioma y cuatro opciones en el otro, siempre con la correcta incluida, y un refuerzo inmediato cuando aciertas o fallas. La idea era que la app respondiera como un profesor que sonríe o corrige con naturalidad.

Lo interesante es que no escribí apenas código “a mano”. Usé [ChatGPT](https://chat.openai.com/) como copiloto para generar los textos, los conjuntos de palabras, la estructura HTML y los ajustes visuales. A medida que iteraba, la app pasó de ser una simple lista de vocabulario a un entorno de aprendizaje con fases, niveles y sentido de progreso.

En la práctica, esto cambió algo más que la herramienta: transformó el proceso educativo de Cris. Ya no depende de PDFs estáticos, sino de una plataforma viva que puede ampliar con nuevos temas, imágenes o sonidos. Y su alumno —que al principio no entendía ni el cartel de la puerta— ahora puede aprender, practicar y ver cómo su “mascota” crece con él.

Al final, este pequeño proyecto nació de una necesidad doméstica y acabó siendo una lección sobre cómo la IA puede liberar tiempo para lo importante: enseñar, acompañar y crear. Si algo tan cotidiano como una ficha de vocabulario puede reinventarse así, ¿cuántas otras pequeñas tareas docentes podrían transformarse también?
