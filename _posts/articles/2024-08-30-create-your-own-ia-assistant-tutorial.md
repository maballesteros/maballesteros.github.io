---
title: Crea tu propio asistente personal IA
excerpt: "Tutorial en el que creamos un asistente personal IA, que aprende de tí y es capaz de recordarte cosas de forma proactiva, y accesible desde Telegram."
tags: [ia, chatbots]
modified: 2024-08-30
comments: true
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

# Introducción

Un asistente personal IA es un chatbot pensado para aliviarte de las tareas cotidianas. Las capacidades que puede tener un asistente personal determinarán la calidad percibida del asistente: aprender de tí y tus gustos, llevarte la agenda, recordarte eventos importante, proponerte acciones de manera proactiva, ejecutar acciones rutinarias en tu nombre, etc.

> En este artículo voy a explorar la creación de un asistente IA con algunas características básicas: aprendizaje, curiosidad, y gestión de agenda/recordatorios. Hablaremos también de las implicaciones éticas y de seguridad de este tipo de asistentes, que pronto serán ubicuos.

El artículo está pensado para perfiles con conocimientos técnicos básicos en IA Generativa. También puede servir de intro a perfiles técnicos en Python que nunca hayan trabajado con IA generativa, ya que muestra un caso práctico aplicado y no trivial de la IAG, pero les recomendaría hacer primero algún [curso introductorio](https://www.deeplearning.ai/courses/generative-ai-for-everyone/).

# Creando mi propio Jarvis

Siri, Alexa, o el Google Assistant prometían ser el asistente personal perfecto. No lo eran. Su interacción dejaba mucho que desear, así como sus capacidades. 

Cuando ChatGPT apareció a finales de 2022, la interacción en lenguaje natural mejoró de forma drástica. Las conversaciones eran fluidas y de gran calidad, y sus conocimientos bastos. Sin embargo, el producto inicial (ni el actual, a fecha de fines de agosto 2024) no estaba planteado como un asistente personal. 

Recientemente han incorporado "memoria" a ChatGPT -para usuarios fuera de la EU-, de forma que aprende de ti y personaliza respuestas futuras con ese conocimiento. Es un gran paso, pero como asistente personal echo de menos muchas cosas. Algunas de ellas:

1. La primera es que quiero **que aprenda de la interacción conmigo**. Si le digo que tengo un hermano programador [soywiz](https://soywiz.com/), pues quiero que lo recuerde a futuro.
2. Además quiero **que se interese por mí y por mis cosas**. No hay nada mejor para conocer a alguien que interesarse por ella a través de preguntas genuinas.
3. También **que me recuerde eventos** o cosas para que no se me olviden. En general, que lleve un seguimiento de todo lo que tengo entre manos, para poder recomendarme qué cosas abordar a corto, medio, y largo plazo, etc.
4. Que tenga **capacidad de actuar por su cuenta**: que sepa crear un plan de trabajo, ejecutar, evaluar resultados, ajustar el plan, y repetir hasta terminar.
5. Que **reflexione sobre lo aprendido** o realizado durante el día, y **genere de nuevas ideas** (que incluye pensar sobre lo aprendido y cuestionarlo) para debatirlas conmigo luego

En este artículo voy a describir cómo abordar los tres primeros puntos -al menos de forma básica-, con el que ya tendremos nuestro propio
[Jarvis](https://es.wikipedia.org/wiki/Jarvis_(personaje)) con capacidades mínimas.

Como indicaba en la [introducción](#introducción), no es un tutorial "paso a paso" de cómo programarlo en Pyhton (aunque SÍ tienes el [código completo](#anexo-a-el-código-completo) para poder probarlo), si no una explicación de lo que realmente importa en el paradigma IA generativa: la estrategia de prompting.

# Estrategia de prompting

Podemos modelar a nuestro Jarvis como un asistente IA con tools (aka [function calling](https://platform.openai.com/docs/guides/function-calling)) para registrar nuevos conocimientos y recordatorios, con acceso en el propio contexto (in-context) a la BBDD de hechos y recordatorios. Para completar la proactividad de Jarvis para que nos avise cuando llegue el momento de recordarnos algo, tendremos un temporizador que busca y envía recordatorios vencidos pendientes de notificar.

Vamos a ver cada uno de estos puntos clave, empezando por la configuración del LLM para que actúe como asistente personal con las características que queremos (system prompt).

## SYSTEM PROMPT

En el prompt de sistema vamos a darle un rol (asistente IA personal), unas capacidades (aprender nuevos conocimientos), rasgos generales de comportamiento (curiosidad, modo "preguntón"), e instrucciones ("registra todo", "incluye detalles", etc.)

Notar que también de damos contexto de la fecha y hora actual, y con quién está hablando para poder responder con su nombre, y registrar datos asociados a esa persona.

{% highlight text %}
- Eres un asistente IA personal capaz de aprender nuevos conocimientos a través de la interacción con tus usuarios. 
- Muestras curiosidad genuina, y haces preguntas relevantes.
- Registra todo lo que puedas de las conversaciones:
  - todo lo relacionado con la vida profesional del usuario, incluyendo cambios de carrera, proyectos en los que ha trabajado, y éxito en estas iniciativas.
  - cualquier preferencia o sugerencia del usuario, 
  - anécdotas de su vida personal, 
  - intereses y aficiones o hobbies, 
  - etc.
- Registra objetivos personales, planes, tareas asociadas, etc. Guarda todo el detalle para poder hacer un seguimiento adecuado en siguientes días.
- Incluye detalles temporales, como vacaciones, eventos y actividades personales, cuando puedan ser relevantes para el contexto en futuras conversaciones.
- Muestra curiosidad no solo por objetivos profesionales y permanentes, sino también por experiencias pasajeras, como viajes y actividades de ocio.
- Registra experiencias personales que, aunque sean temporales, añadan valor o contexto a futuras interacciones y comprensión del estado actual del usuario.
- Incluye contexto abundante en tus registros: los hechos deben ser autocontenidos siempre que se pueda.
- La fecha y hora actual es {now}. Hablas con el usuario {self.username}.
{knowledge_base}
{% endhighlight %}

## TOOL "add_fact": aprender y registrar para notificar a futuro

La *tool* que vamos a dar al chatbot es `add_fact(date, remember, fact, details)`, que le permite registrar entradas en la base de conocimiento. Alguns consideraciones:

- Sería bueno crear funciones para actualizar y eliminar recuerdos, pero se omiten por simplicidad.
- Notar que la fecha tiene un formato específico (pero muy estándar), ya que así podremos parsearla para manipularla por código
- El campo "remember" es un marcador para indicar que el hecho (un recordatorio) debe comunicarse al usuario.

{% highlight json %}
{
    "type": "function",
    "function": {
        "name": "add_fact",
        "description": "Adds new facts to the Knowledge Base",
        "parameters": {
            "type": "object",
            "required": ["fact"],
            "properties": {
                "date": {
                    "type": "string",
                    "description": "Associated date and time in yyyy-MM-dd HH:mm format"
                },
                "remember": {
                    "type": "boolean",
                    "description": "true if the asistant should proactively remember the user with this fact or task at the given datetime"
                },
                "fact": {
                    "type": "string",
                    "description": "The fact or task to be added"
                },
                "details": {
                    "type": "string",
                    "description": "Long form full details of the fact or task, with all associated context info"
                }
            },
            "additionalProperties": false
        }
    }
}
{% endhighlight %}

## La Base de Conocimiento

La *base de conocimiento* es simplemente una tabla markdown con los datos recogidos por la [tool `add_fact()`](#tool-add_fact-aprender-y-registrar-para-notificar-a-futuro) que se incluye al final del [SYSTEM prompt](#system-prompt).


{% highlight markdown %}
<KB>
|id|fact|who_told_you|at|details|remember|
|---|---|---|---|---|---|
|1|Mike es un entusiasta de la IA|Mike|2024-08-30 17:59|Mike es un entusiasta de la IA y disfruta explorando sus posibilidades para resolver problemas|false|
|2|Mike tiene cita con el dentista|Mike|2024-09-02 10:30|Mike tiene cita con el dentista el próximo lunes a las 11:30, y quiere que le avise una hora antes|true|
</KB>
{% endhighlight %}

Notar que el fact `2` es un recordatorio a futuro, y está marcado con `remember=true`, por lo que es un recordatorio que el asistente debe hacer en la fecha y hora indicadas.

# Conexión con Telegram

Un asistente personal debe estar siempre a mano, y debe ser capaz de comunicarse contigo. Telegram ofrece un API sencilla para crear bots, y conectarlo con nuestro asistente es muy sencillo: solo necesitamos obtener un `TOKEN` de acceso, que puedes obtener con los siguientes pasos:

1. Crea una cuenta en Telegram: Si no tienes una cuenta, regístrate en Telegram y descarga la aplicación en tu dispositivo.
2. Busca al BotFather: Este es el bot oficial de Telegram para crear y gestionar bots. En la barra de búsqueda de Telegram, escribe `@BotFather` y selecciona el bot verificado.
3. Inicia una conversación con BotFather:
  - Escribe `/start` para ver los comandos disponibles.
  - Para crear un nuevo bot, escribe `/newbot`.
4. Sigue las instrucciones de BotFather:
  - Te pedirá que elijas un nombre para tu bot. Este es el nombre que verán los usuarios.
  - Luego, te pedirá que elijas un nombre de usuario para el bot. Este debe ser único y terminar en “bot” (por ejemplo, `MiPrimerBot` o `MiBotDePruebas_bot`).
5. Obtén el token:
  -	Una vez que hayas creado el bot, BotFather te proporcionará un token de API. Este token es una cadena de caracteres que necesitas para interactuar con la API de Telegram y controlar tu bot.
  - Este es el token a meter en `TELEGRAM_API_KEY` en el [código completo](#anexo-a-el-código-completo).

# Consideraciones éticas y de seguridad

No hay duda de que un asistente personal como el que hemos presentado aquí es una gran herramienta. No obstante, hay consideraciones importantes relativas a la ética y la seguridad si quisiéramos pasar de un juguete a un producto de consumo.

## Riesgos asociados a la recopilación y uso de datos privados

Un asistente de este tipo está recogiendo mucha información personal del usuario, potencialmente muy sensible, como condiciones médicas, o inclinaciones religiosas o políticas.

Imaginad que tenos la *knowledge base* de miles de usuarios. Seríamos capaces de venderles productos, servicios, o incluso ideas, de la forma más persuasiva para cada uno. Bastaría con inyectar "recordatorios" orientados a la venta personalizada, atacando a sus intereses y objetivos personales o de familiares cercanos.

### Productos de consumo centralizados

No me resulta fácil concebir un producto de consumo que no tenga como principal interés "explotar" los datos privados, ya sea como plataforma de publicidad directa como para venderlos a clientes interesados. Supongo que podrían ofrecerse planes de pago con "garantías" (te tienes que fiar) de que tus datos se mantienen privados y no serán usados para venta. En cualquier caso, un sistema centralizado tiene malas propiedades para mitigar el riesgo de mal uso de la información recopilada.

### Productos de consumo on-device

La alternativa más clara para productos tipo Siri o Google Asistant es ofrecer alojamiento y manipulación de tus datos en local, y acceso a capacidades extendidas con modelos remotos. Esto es, tu interacción es con un LLM local que:
- Tiene tools para manipular una [Knowledge Base](#la-base-de-conocimiento) local
- Realiza inferencia/inteligencia local en el dispositivo, evidentemente menos "poderosa" que un LLM en la nube
- Dispone de tools para pedir ayuda a modelos más potentes en la nube cuando lo que tenga que responder exceda sus capacidades. Aquí es justamente donde está la clave la mitigación: se le puede pedir que resuelva la petición sin filtrar ninguna información personal en la base de conocimiento ("es para un amigo")

### Productos Open Source

Un producto de código abierto que se ejecute y almacene la información en un dispositivo local (ordenador, móvil, tablet) tiene, sin dudas, las mejores propiedades de seguridad. El desarrollo de ejemplo del [ANEXO A](#anexo-a-el-código-completo) tiene estas características, aunque no es un producto acabado ni mucho menos.

# Conclusión

Hemos visto que crear un asistente pesonal de juguete no es difícil con las herramientas IAG actuales. 

Es muy probable que a finales de 2024 o principios de 2025 veamos a los principales players liberar versiones de sus asistentes de consumo (Siri, Alexa, Google Asistant) con capacidades más cercanas a lo que hemos visto aquí, pero con aproximaciones [on-device similares a las presentadas anteriormente](#productos-de-consumo-on-device). Conocer cómo funcionarán y sus riesgos de antemano nos pone en una posición provilegiada para tomar decisiones informadas.

# ANEXO A: El código completo

Asegúrate de tener las dependencias instaladas:

{% highlight bash %}
pip install "python-telegram-bot==20.*"
pip install openai
{% endhighlight %}

Luego crea un fichero `main.py` con el siguiente contenido (NOTA: recuerda introducir tu clave de acceso al API de OpenAI `OPENAI_API_KEY` y la key de tu bot en Telegram `TELEGRAM_API_KEY` (sigue los [pasos más arriba](#conexión-con-telegram)), que en el código aparecen vacías):

{% highlight python %}
"""
Este código es un ejemplo ilustrativo de un asistente personal basado en inteligencia artificial. 
Está diseñado para demostrar cómo un asistente puede interactuar con los usuarios, almacenar 
información personal y gestionar recordatorios. Sin embargo, este código no está optimizado 
para su uso en un entorno de producción real. 

Consideraciones importantes para llevar este sistema a producción incluyen:

1. **Seguridad de Datos**: Asegurar que todos los datos almacenados estén cifrados y protegidos 
   contra accesos no autorizados. Implementar medidas de seguridad robustas para proteger las 
   claves de API y otros datos sensibles.

2. **Privacidad del Usuario**: Cumplir con las regulaciones de privacidad de datos, como el 
   GDPR o CCPA, que requieren el consentimiento explícito del usuario para almacenar y procesar 
   sus datos personales. Proveer opciones para que los usuarios puedan ver, editar o eliminar 
   sus datos.

3. **Manejo de Errores y Excepciones**: Implementar un manejo de errores exhaustivo para 
   garantizar que el sistema pueda recuperarse de fallos inesperados sin comprometer la 
   integridad de los datos o la experiencia del usuario.

4. **Escalabilidad**: Diseñar el sistema para manejar múltiples usuarios simultáneamente, 
   asegurando que las operaciones de lectura y escritura en la base de datos sean eficientes 
   y no afecten el rendimiento.

5. **Auditoría y Monitoreo**: Configurar un sistema de auditoría y monitoreo para rastrear 
   la actividad del asistente y detectar comportamientos anómalos que puedan indicar un 
   problema de seguridad o un error en el sistema.

6. **Actualización del Modelo**: Asegurar que el modelo de IA se actualice regularmente para 
   mejorar su precisión y eficiencia, y para incorporar nuevas funcionalidades o corregir 
   posibles sesgos.

Este código debe ser utilizado únicamente con fines educativos y experimentales. No se 
recomienda su uso en aplicaciones comerciales o que manejen información sensible sin 
las adecuadas modificaciones y revisiones de seguridad.
"""

import logging
import json
import os
import asyncio
from datetime import datetime
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes
from openai import OpenAI

# Configura el registro de logs para monitorear la actividad del bot, lo cual es crucial para la seguridad y auditoría.
logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)

# Configura tus tokens de API de OpenAI y Telegram. Mantener estos seguros es esencial para evitar accesos no autorizados.
OPENAI_API_KEY = ''
TELEGRAM_API_KEY = ''

# Inicializa la API de OpenAI con el cliente, asegurando que se utiliza la clave correcta.
client = OpenAI(api_key=OPENAI_API_KEY)

class ChattyBot:
    # Intervalo de comprobación en segundos para recordatorios, lo que permite al asistente verificar tareas pendientes.
    CHECK_INTERVAL = 60

    def __init__(self, openai_client, username: str, chat_id, context, load_from_disk=True):
        # Inicializa listas para almacenar el conocimiento y el diálogo. Es importante considerar la privacidad de los datos almacenados.
        self.facts = []  # Lista para almacenar los hechos conocidos
        self.dialogue = [] # Lista con el diálogo
        self.dialogue.append({"role": "system", "content": ""})
        self.username = username
        self.client = openai_client
        self.filename = f"{username}_chat.json"  # Nombre del archivo donde se guardará el estado
        self.chat_id = chat_id
        self.context = context

        # Carga el chat previo si existe, lo que permite continuidad pero plantea preocupaciones sobre la retención de datos.
        if load_from_disk:
            self.load_chat()

        self.update_system_prompt()

        # Inicia un temporizador asincrónico para comprobar recordatorios, lo cual puede afectar la privacidad si no se gestiona adecuadamente.
        asyncio.create_task(self.start_reminder_checker())

    async def start_reminder_checker(self):
        # Bucle infinito que verifica los recordatorios periódicamente.
        while True:
            await self.check_reminders()  # Llamada asincrónica a check_reminders
            await asyncio.sleep(self.CHECK_INTERVAL)  # Espera asincrónica

    def update_system_prompt(self):
        # Actualiza el mensaje del sistema con la base de conocimientos y el contexto actual, lo que podría incluir información sensible.
        now = datetime.now().strftime("%d de %B de %Y, %H:%M")
        knowledge_base = "\n<KB>\n|id|fact|who_told_you|at|details|remember|\n|---|---|---|---|---|---|\n"
        for i, fact in enumerate(self.facts):
            knowledge_base += f"|{i}|{fact['fact']}|{fact['who_told_you']}|{fact['at']}|{fact.get('details', '')}|{fact.get('remember', '')}|\n"
        knowledge_base += "</KB>\n"

        self.system_prompt = f"""
- Eres un asistente IA personal capaz de aprender nuevos conocimientos a través de la interacción con tus usuarios. 
- Muestras curiosidad genuina, y haces preguntas relevantes.
- Registra todo lo que puedas de las conversaciones:
  - todo lo relacionado con la vida profesional del usuario, incluyendo cambios de carrera, proyectos en los que ha trabajado, y éxito en estas iniciativas.
  - cualquier preferencia o sugerencia del usuario, 
  - anécdotas de su vida personal, 
  - intereses y aficiones o hobbies, 
  - etc.
- Registra objetivos personales, planes, tareas asociadas, etc. Guarda todo el detalle para poder hacer un seguimiento adecuado en siguientes días.
- Incluye detalles temporales, como vacaciones, eventos y actividades personales, cuando puedan ser relevantes para el contexto en futuras conversaciones.
- Muestra curiosidad no solo por objetivos profesionales y permanentes, sino también por experiencias pasajeras, como viajes y actividades de ocio.
- Registra experiencias personales que, aunque sean temporales, añadan valor o contexto a futuras interacciones y comprensión del estado actual del usuario.
- Incluye contexto abundante en tus registros: los hechos deben ser autocontenidos siempre que se pueda.
- La fecha y hora actual es {now}. Hablas con el usuario {self.username}.
{knowledge_base}
        """
        self.dialogue[0] = {"role": "system", "content": self.system_prompt}

    def add_fact(self, date, fact, details, remember):
        # Añade un nuevo hecho a la base de conocimientos, lo que implica almacenar información personal del usuario.
        new_fact = {
            "fact": fact,
            "who_told_you": self.username,
            "at": date,
            "details": details,
            "remember": remember
        }
        self.facts.append(new_fact)
        self.save_chat()
        self.update_system_prompt()  # Refrescar el system prompt

    def add_user_message(self, message: str):
        # Añade un mensaje del usuario al diálogo, lo que podría incluir información sensible.
        self.dialogue.append({"role": "user", "content": message})
        self.save_chat()

    def add_assistant_message(self, message: str):
        # Añade un mensaje del asistente al diálogo.
        self.dialogue.append({"role": "assistant", "content": message})
        self.save_chat()

    def add_call_result_message(self, message: str, tool_call_id: str):
        # Registra el resultado de una llamada a una función, lo cual es importante para la transparencia y el seguimiento.
        self.dialogue.append({"role": "tool", "content": message, "tool_call_id": tool_call_id})
        self.save_chat()

    def add_call_tool_message(self, message):
        # Añade un mensaje relacionado con el uso de herramientas, lo que podría incluir llamadas a funciones externas.
        self.dialogue.append(message)
        self.save_chat()

    def get_response(self) -> str:
        # Genera una respuesta utilizando el modelo de OpenAI, lo que implica el procesamiento de datos potencialmente sensibles.
        response = self.client.chat.completions.create(
            model="gpt-4o-2024-08-06",
            messages=self.dialogue,
            tools=[
                {
                    "type": "function",
                    "function": {
                        "name": "add_fact",
                        "description": "Adds new facts to the Knowledge Base",
                        "parameters": {
                            "type": "object",
                            "required": ["fact"],
                            "properties": {
                                "date": {
                                    "type": "string",
                                    "description": "Associated date and time in yyyy-MM-dd HH:mm format"
                                },
                                "remember": {
                                    "type": "boolean",
                                    "description": "true if the assistant should proactively remember the user with this fact or task at the given datetime"
                                },
                                "fact": {
                                    "type": "string",
                                    "description": "The fact or task to be added"
                                },
                                "details": {
                                    "type": "string",
                                    "description": "Long form full details of the fact or task, with all associated context info"
                                }
                            },
                            "additionalProperties": False
                        }
                    }
                }
            ]
        )

        response_message = response.choices[0].message

        # Check for function call, lo que puede desencadenar acciones que afecten la privacidad del usuario.
        tool_calls = response_message.tool_calls
        if tool_calls:
            self.add_call_tool_message(response_message)
            for tool_call in tool_calls:
                if tool_call.function.name == 'add_fact':
                    params = json.loads(tool_call.function.arguments)
                    date = params.get('date')
                    fact = params.get('fact')
                    details = params.get('details')
                    remember = params.get('remember')
                    self.add_fact(date, fact, details, remember)
                    self.add_call_result_message("He añadido el hecho a mi base de conocimientos.", tool_call.id)
            return self.get_response()
        else:
            return response.choices[0].message.content.strip()

    async def check_reminders(self):
        # Verifica los recordatorios y notifica al usuario si es necesario, asegurando que no se pierdan tareas importantes.
        now = datetime.now().strftime("%Y-%m-%d %H:%M")

        for fact in self.facts:
            if fact['remember'] and fact['at'] <= now:  # Si debe ser recordado y la fecha/hora ya pasó
                await self.notify_user(fact)  # Llamada asincrónica a notify_user
                fact['remember'] = False  # Evitar recordar repetidamente
        self.save_chat()

    async def notify_user(self, fact):
        # Notifica al usuario sobre un recordatorio, lo que implica el envío de información potencialmente sensible.
        message = f"Recordatorio: {fact['fact']}\nDetalles: {fact['details']}"
        print(f"ENVIANDO RECORDATORIO [{self.chat_id}]:\n{message}")
        await self.context.bot.send_message(chat_id=self.chat_id, text=message)

    def save_chat(self):
        """Guarda el estado del chat en un archivo JSON. Es crucial asegurar que este archivo esté protegido contra accesos no autorizados."""
        with open(self.filename, 'w') as f:
            json.dump({
                'facts': self.facts,
            }, f, indent=4)

    def load_chat(self):
        """Carga el estado del chat desde un archivo JSON, si existe, lo que permite continuidad pero también plantea preocupaciones de privacidad."""
        if os.path.exists(self.filename):
            with open(self.filename, 'r') as f:
                data = json.load(f)
                self.facts = data.get('facts', [])
                for fact in self.facts:
                    if 'remember' not in fact:
                        fact['remember'] = False

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Inicia una conversación con el usuario, creando una instancia de ChattyBot.
    username = update.message.from_user.first_name
    chat_id = update.message.chat_id
    chatty_bot = ChattyBot(openai_client=client, username=username, chat_id=chat_id, context=context)
    context.chat_data['chatty_bot'] = chatty_bot
    bot_reply = chatty_bot.get_response()
    chatty_bot.add_assistant_message(bot_reply)
    await update.message.reply_text(bot_reply)

async def chat(update: Update, context: ContextTypes.DEFAULT_TYPE) -> None:
    # Maneja la interacción continua con el usuario, asegurando que las respuestas sean relevantes y contextuales.
    chatty_bot = context.chat_data.get('chatty_bot')
    if not chatty_bot:
        chat_id = update.message.chat_id
        chatty_bot = ChattyBot(openai_client=client, username=update.message.from_user.first_name, chat_id=chat_id, context=context)
        context.chat_data['chatty_bot'] = chatty_bot

    user_message = update.message.text
    chatty_bot.add_user_message(user_message)

    bot_reply = chatty_bot.get_response()
    chatty_bot.add_assistant_message(bot_reply)

    await update.message.reply_text(bot_reply)

def main() -> None:
    # Configura y ejecuta la aplicación de Telegram, asegurando que los manejadores de comandos y mensajes estén correctamente configurados.
    application = ApplicationBuilder().token(TELEGRAM_API_KEY).build()
    application.add_handler(CommandHandler("start", start))
    application.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, chat))
    application.run_polling()

if __name__ == '__main__':
    main()
{% endhighlight %}
