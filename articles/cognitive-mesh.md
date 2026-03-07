# Cognitive Mesh

It all started about a year ago. Maybe a bit more.

I was stuck in that classic loop: banging my head against the wall trying to steer AI models to do exactly what I wanted. Back then, I was running the basic $10/month GitHub Copilot subscription, trying to get the "most bang for my buck" because, honestly, I didn't fully trust the tech yet. I'd spend my time opening new chat windows constantly just to clear the context—hoping the model wouldn't "derail" and start hallucinating halfway through a task.

But it always did. It would start strong, then completely lose the plot.

Caralho.

---

## The Era of the "Executor Lusitano"

I started reading papers. Methodology. Steering. At the time, "Personas" were the big thing. So, being me, I decided to inject a bit of the old Portuguese Empire into the AI's brain. I created a chatmode called `executor_lusitano`.

I gave it a "Council of Reasoning" based on four archetypes:

**Camões** (The Explorer): To define the mission and the "Why."

**Pessoa** (The Strategist): To generate multiple paths and avoid linear thinking.

**Vieira** (The Architect): For clean, irrefutable logic and code.

**Agostinho** (The Facilitator): For Socratic verification—testing the limits.

And surprise, surprise... it actually worked. The AI started giving me better answers. It had "depth." It felt like I was getting more value out of that tenner than anyone else. But even then, I knew I was just waiting for the models to catch up with the context windows I actually needed.

---

## The Vertigo of Autonomy

Fast forward. I moved away from the cheap seats. Thanks to my friend Lucas, I jumped from a $30 to a $90 subscription. I started playing with Claude Code and Opus. If you're reading this, you're probably as much of a nerd as I am... so you know the dream: **Autonomous Systems**.

I started building CLIs to mimic that shelved "Empire" way of thinking, but I kept hitting the same wall: **Context Rot**. The AI would get tired. It would get confused.

Then, I saw a guy online talking about "Ralph Loops." It clicked. I went back to basics. I stripped away the fluff. I removed the personas. I followed the philosophy like a disciple. I built and rebuilt five different versions of autonomous systems. It was wild—I'm talking physical vertigo from lack of sleep and pure mental fatigue.

---

## The Fusion: BDI + OODA

When Claude 4.x models dropped, I noticed they still had gaps. They needed a "final check." I realized that the models were now smart enough that they didn't need me to tell them to act like a 16th-century architect. They just needed the **structure**.

I took my old Lusitano logic and meshed it with two heavy-duty cognitive frameworks:

### BDI (Belief, Desire, Intention)

**Beliefs**: What do we know about the code *now*?

**Desires**: What is the *goal*?

**Intentions**: What is the *immediate plan* we're committing to?

### OODA Loop (Observe, Orient, Decide, Act)

A military-grade cycle for reacting to changing environments.

I didn't invent these. But I **meshed** them. They are perfectly connectable. BDI handles the "internal state" of the agent, while OODA handles the "external execution."

---

## Why It Works

Now, instead of a persona, I use a **Cognitive Mesh**.

If I have a massive issue, I don't just ask for a fix. I tell the system:

> "Analyze this issue using BDI and OODA loops. Trigger agents to look for gaps, TODOs, and half-implemented features."

By using these terminologies, the AI dissects the problem with surgical precision. It uses the **Observe/Orient** phase to find the "Beliefs" (the context) and doesn't **Act** until the **Intention** is perfectly aligned with the **Desire**.

It's high-signal, low-verbosity. It's the evolution from "make-believe" personas to "hard-coded" cognitive protocols.

---

## The Mesh in Action

**Traditional Prompting:**
```
"Fix the authentication bug in my app"
```

**Cognitive Mesh:**
```
TASK: Analyze authentication failure

OBSERVE (Beliefs):
- What is the actual error?
- What does the code currently do?
- What's the state of the database?

ORIENT (Context):
- Where does the flow break?
- What are the relevant files?
- What's the expected vs actual?

DECIDE (Intentions):
- Plan: Update validation function
- Files: auth.ts, validators.ts
- Risk: Low, isolated change

ACT:
- Execute the plan
- Verify the fix
- Run tests

DESIRES (Goals):
- Users can log in with valid credentials
- Invalid credentials are rejected
- No regression to existing users
```

The AI doesn't just "fix." It **observes**, **orients**, **decides**, and **acts**. With **beliefs**, **desires**, and **intentions** guiding every step.

---

## The Protocol

```
[COGNITIVE MESH: ACTIVE]

┌─────────────────────────────────────────┐
│          BDI LAYER (Internal)           │
├─────────────────────────────────────────┤
│  BELIEFS   → What we know is true       │
│  DESIRES   → What we want to achieve    │
│  INTENTIONS → What we commit to doing   │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│         OODA LAYER (External)           │
├─────────────────────────────────────────┤
│  OBSERVE  → Gather ground truth         │
│  ORIENT   → Analyze context             │
│  DECIDE   → Form intentions             │
│  ACT      → Execute and verify          │
└─────────────────────────────────────────┘
```

BDI feeds OODA. OODA updates BDI. The mesh tightens with every iteration.

---

## From Personas to Protocols

If you're building autonomous tools and you're hitting a wall, stop trying to make the AI "feel" like a person.

**Personas** are make-believe. They're roleplay. They're fun, but they're soft.

**Protocols** are hard-coded cognitive structures. They're how actual minds—artificial or biological—process complex problems.

Give it a loop. Give it a mesh.

The AI doesn't need to *be* Camões or Vieira. It needs to **think** in structures that work.

---

## The Evolution

**Phase 1:** Magic prompts and prayer

**Phase 2:** Personas and roleplay (Executor Lusitano)

**Phase 3:** Explicit loops (Ralph)

**Phase 4:** Cognitive Mesh (BDI × OODA)

Each phase stripped away pretense. Each phase got closer to how actual cognition works.

The future isn't smarter prompts. It's **cognitive architectures** that reliably process complexity.

---

## Clap if you like! :)

---

## References

- Previous: [The Fog](/articles/the-fog) - Context discipline
- Previous: [The Agent Heartbeat](/articles/the-agent-heartbeat) - The execution loop
- Next: [The Sandbox Principle](/articles/the-sandbox-principle) - How to give agents power without danger
