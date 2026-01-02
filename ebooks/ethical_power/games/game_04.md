# Game 4: Joke or Disqualification

> **Objective**: Train the "Covert Aggression Detector" to quickly distinguish between a friendly joke and a status attack, and react proportionally.

## Players and Roles
*   **Role A (The Screenwriter)**: Reads phrases from a list (some neutral, others rude).
*   **Role B (The Detector)**: Classifies and responds.

## Quick Set-up: The Script

The **Screenwriter** reads one of these phrases. The **Detector** must shout the color.

| Phrase | Tone / Intention | Correct Color |
| :--- | :--- | :--- |
| "Hey, that shirt looks good on you." | Sincere / Compliment | **GREEN** |
| "Wow, how brave coming dressed like that..." | Sarcasm / Judgment | **RED** |
| "Pass me the salt, please?" | Neutral request | **GREEN** |
| "Let's see if you learn to pass the salt without spilling it." | Paternalism / Scolding | **RED** |
| "You look a bit tired, are you okay?" | Real concern | **GREEN** |
| "You look terrible today, don't you?" | False concern / Attack | **RED** |
| "Thanks for the report, good job." | Gratitude | **GREEN** |
| "Finally you deliver something decent." | Praise with implicit insult | **RED** |
| "Can we talk for a moment?" | Conversation proposal | **GREEN** |
| "We need to talk (sigh)..." | Anxiety generation | **RED** |

## Mechanics
1.  The Screenwriter says a phrase with ambiguous tone.
    *   Ex 1: "Some hair you have today".
    *   Ex 2: "Thank goodness you are here, Einstein".
2.  The Detector must shout **"GREEN"** (Friendly) or **"RED"** (Attack) in less than 2 seconds.
    *   If GREEN: Smile and continue.
    *   If RED: Launch a neutral meta-comment ("That comment is unnecessary", "Where is that coming from?", "I ignore the tone").

## Debriefing (Closing questions)
*   Is it harder to detect or respond?
*   Were you afraid of seeming "too sensitive" when marking a RED?

### Variant
Play with eyes closed to guide yourself only by the tone of voice (paralanguage).

### Train this theory
*   [Chapter 1.6: Right to speak and micro-faults](../part_01/1_6.md)
*   [Chapter 4.3: Anti-disqualifying joke](../part_04/4_3.md)

### AI Sparring Partner
If you don't have a human partner, copy and paste this prompt into ChatGPT/Claude to practice alone:

```text
Act as a "Screenwriter of Ambiguous Tones". We are going to play "Covert Aggression Detector".
Your goal is to train my ability to distinguish between harmless comments and covert attacks.

RULES:
1. You generate short phrases that can be framed as "Green" (Sincere/Neutral) or "Red" (Passive-Aggressive/Sarcastic/Attack).
2. Examples of Red: "Wow, how brave coming dressed like that...", "Finally you deliver something decent."
3. Examples of Green: "Hey, that shirt looks good on you", "Thanks for the report."
4. I must classify them as GREEN or RED.
   - If RED, I must also provide a Neutral Meta-comment response (e.g., "I ignore the tone").
5. If I classify correctly, say "✅ POINT" and give me another phrase.
6. If I fail (e.g., calling a compliment an attack), explain the nuance.

START THE CONVERSATION NOW BY:
1. Saying "Welcome to the Detector. Put on your radar."
2. Throwing the first ambiguous phrase.
```
