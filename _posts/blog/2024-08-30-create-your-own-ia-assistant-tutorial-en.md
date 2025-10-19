---
title: Build Your Own AI Personal Assistant (Tutorial)
excerpt: "A tutorial where we create a personal AI assistant that learns from you, can proactively remind you of things, and is accessible from Telegram."
tags: [ai, chatbots]
lang: en
ref: create-ia-assistant
modified: 2025-10-19
comments: true
permalink: /en/blog/create-your-own-ai-assistant/
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

# Introduction

A personal AI assistant is a chatbot designed to relieve you of everyday tasks. The capabilities that a personal assistant can have will determine the perceived quality of the assistant: learning from you and your tastes, managing your schedule, reminding you of important events, proactively proposing actions, executing routine actions on your behalf, etc.

> In this article, I will explore the creation of an AI assistant with some basic features: learning, curiosity, and schedule/reminder management. We will also talk about the ethical and security implications of this type of assistant, which will soon be ubiquitous.

The article is intended for profiles with basic technical knowledge in Generative AI. It can also serve as an intro for technical profiles in Python who have never worked with generative AI, as it shows a practical and non-trivial applied case of GAI, but I would recommend them to first take an [introductory course](https://www.deeplearning.ai/courses/generative-ai-for-everyone/).

# Creating my own Jarvis

Siri, Alexa, or the Google Assistant promised to be the perfect personal assistant. They were not. Their interaction left much to be desired, as did their capabilities.

When ChatGPT appeared at the end of 2022, natural language interaction improved dramatically. The conversations were fluid and of high quality, and its knowledge was vast. However, the initial product (and the current one, as of the end of August 2024) was not designed as a personal assistant.

They have recently incorporated "memory" into ChatGPT - for users outside the EU - so that it learns from you and personalizes future responses with that knowledge. It is a great step, but as a personal assistant, I miss many things. Some of them:

1.  The first is that I want it to **learn from the interaction with me**. If I tell it that I have a programmer brother [soywiz](https://soywiz.com/), I want it to remember it in the future.
2.  I also want it to **be interested in me and my things**. There is no better way to get to know someone than to be interested in them through genuine questions.
3.  Also, **that it reminds me of events** or things so that I don't forget them. In general, that it keeps track of everything I have on my plate, to be able to recommend what things to address in the short, medium, and long term, etc.
4.  That it has the **ability to act on its own**: that it knows how to create a work plan, execute, evaluate results, adjust the plan, and repeat until finished.
5.  That it **reflects on what it has learned** or done during the day, and **generates new ideas** (which includes thinking about what it has learned and questioning it) to discuss them with me later.

In this article, I will describe how to address the first three points - at least in a basic way - with which we will already have our own [Jarvis](https://en.wikipedia.org/wiki/J.A.R.V.I.S.) with minimal capabilities.

As I indicated in the [introduction](#introduction), this is not a "step-by-step" tutorial on how to program it in Python (although you DO have the [complete code](#appendix-a-the-complete-code) to try it out), but an explanation of what really matters in the generative AI paradigm: the prompting strategy.

# Prompting Strategy

We can model our Jarvis as an AI assistant with tools (aka [function calling](https://platform.openai.com/docs/guides/function-calling)) to register new knowledge and reminders, with in-context access to the database of facts and reminders. To complete Jarvis's proactivity so that it notifies us when the time comes to remind us of something, we will have a timer that searches for and sends overdue reminders pending notification.

Let's look at each of these key points, starting with the configuration of the LLM to act as a personal assistant with the characteristics we want (system prompt).

## SYSTEM PROMPT

In the system prompt, we are going to give it a role (personal AI assistant), capabilities (learning new knowledge), general behavioral traits (curiosity, "inquisitive" mode), and instructions ("register everything", "include details", etc.)

Note that we also give it the context of the current date and time, and who it is talking to in order to respond with their name and register data associated with that person.

{% highlight text %}
- You are a personal AI assistant capable of learning new knowledge through interaction with your users.
- You show genuine curiosity, and ask relevant questions.
- Register everything you can from the conversations:
  - everything related to the user's professional life, including career changes, projects they have worked on, and success in these initiatives.
  - any user preferences or suggestions,
  - anecdotes from their personal life,
  - interests and hobbies,
  - etc.
- Register personal goals, plans, associated tasks, etc. Save all the details to be able to do a proper follow-up in the following days.
- Include temporal details, such as vacations, events, and personal activities, when they may be relevant to the context in future conversations.
- Show curiosity not only for professional and permanent objectives, but also for fleeting experiences, such as travel and leisure activities.
- Register personal experiences that, although temporary, add value or context to future interactions and understanding of the user's current state.
- Include abundant context in your records: the facts must be self-contained whenever possible.
- The current date and time is {now}. You are talking to the user {self.username}.
{knowledge_base}
{% endhighlight %}

## TOOL "add_fact": learn and register to notify in the future

The *tool* that we are going to give the chatbot is `add_fact(date, remember, fact, details)`, which allows it to register entries in the knowledge base. Some considerations:

- It would be good to create functions to update and delete memories, but they are omitted for simplicity.
- Note that the date has a specific (but very standard) format, as this will allow us to parse it to manipulate it with code.
- The "remember" field is a marker to indicate that the fact (a reminder) should be communicated to the user.

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
            "additionalProperties": false
        }
    }
}
{% endhighlight %}

## The Knowledge Base

The *knowledge base* is simply a markdown table with the data collected by the [`add_fact()` tool](#tool-add_fact-learn-and-register-to-notify-in-the-future) that is included at the end of the [SYSTEM prompt](#system-prompt).

{% highlight markdown %}
<KB>
|id|fact|who_told_you|at|details|remember|
|---|---|---|---|---|---|
|1|Mike is an AI enthusiast|Mike|2024-08-30 17:59|Mike is an AI enthusiast and enjoys exploring its possibilities to solve problems|false|
|2|Mike has a dentist appointment|Mike|2024-09-02 10:30|Mike has a dentist appointment next Monday at 11:30, and wants to be reminded an hour before|true|
</KB>
{% endhighlight %}

Note that fact `2` is a future reminder, and is marked with `remember=true`, so it is a reminder that the assistant must make on the indicated date and time.

# Connection with Telegram

A personal assistant should always be at hand, and should be able to communicate with you. Telegram offers a simple API to create bots, and connecting it with our assistant is very simple: we just need to get an access `TOKEN`, which you can get with the following steps:

1.  Create a Telegram account: If you don't have an account, sign up for Telegram and download the application on your device.
2.  Search for the BotFather: This is the official Telegram bot for creating and managing bots. In the Telegram search bar, type `@BotFather` and select the verified bot.
3.  Start a conversation with BotFather:
    -   Type `/start` to see the available commands.
    -   To create a new bot, type `/newbot`.
4.  Follow BotFather's instructions:
    -   It will ask you to choose a name for your bot. This is the name that users will see.
    -   Then, it will ask you to choose a username for the bot. This must be unique and end in “bot” (for example, `MyFirstBot` or `MyTestBot_bot`).
5.  Get the token:
    -   Once you have created the bot, BotFather will provide you with an API token. This token is a string of characters that you need to interact with the Telegram API and control your bot.
    -   This is the token to put in `TELEGRAM_API_KEY` in the [complete code](#appendix-a-the-complete-code).

# Ethical and security considerations

There is no doubt that a personal assistant like the one we have presented here is a great tool. However, there are important considerations regarding ethics and security if we wanted to move from a toy to a consumer product.

## Risks associated with the collection and use of private data

An assistant of this type is collecting a lot of personal information from the user, potentially very sensitive, such as medical conditions, or religious or political inclinations.

Imagine that we have the *knowledge base* of thousands of users. We would be able to sell them products, services, or even ideas, in the most persuasive way for each one. It would be enough to inject "reminders" aimed at personalized sales, attacking their personal interests and objectives or those of close relatives.

### Centralized consumer products

It is not easy for me to conceive of a consumer product that does not have as its main interest "exploiting" private data, either as a direct advertising platform or to sell it to interested clients. I suppose that payment plans could be offered with "guarantees" (you have to trust them) that your data is kept private and will not be used for sale. In any case, a centralized system has bad properties to mitigate the risk of misuse of the collected information.

### On-device consumer products

The clearest alternative for products like Siri or Google Assistant is to offer hosting and manipulation of your data locally, and access to extended capabilities with remote models. That is, your interaction is with a local LLM that:
- Has tools to manipulate a local [Knowledge Base](#the-knowledge-base)
- Performs inference/intelligence locally on the device, obviously less "powerful" than an LLM in the cloud
- Has tools to ask for help from more powerful models in the cloud when what it has to answer exceeds its capabilities. This is precisely where the key to mitigation lies: it can be asked to resolve the request without filtering any personal information in the knowledge base ("it's for a friend")

### Open Source Products

An open source product that runs and stores information on a local device (computer, mobile, tablet) has, without a doubt, the best security properties. The example development in [APPENDIX A](#appendix-a-the-complete-code) has these characteristics, although it is not a finished product by any means.

# Conclusion

We have seen that creating a toy personal assistant is not difficult with current GAI tools.

It is very likely that at the end of 2024 or the beginning of 2025 we will see the main players release versions of their consumer assistants (Siri, Alexa, Google Assistant) with capabilities closer to what we have seen here, but with [on-device approaches similar to those presented previously](#on-device-consumer-products). Knowing how they will work and their risks in advance puts us in a privileged position to make informed decisions.

# APPENDIX A: The complete code

Make sure you have the dependencies installed:

{% highlight bash %}
pip install "python-telegram-bot==20.*"
pip install openai
{% endhighlight %}

Then create a `main.py` file with the following content (NOTE: remember to enter your OpenAI API access key `OPENAI_API_KEY` and your bot's key in Telegram `TELEGRAM_API_KEY` (follow the [steps above](#connection-with-telegram)), which appear empty in the code):

[The full code is available in the original Spanish post if you need to copy it, but it is omitted here for brevity as this post focuses on the concepts.]