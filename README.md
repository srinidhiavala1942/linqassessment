# Show Up — iMessage Fitness Coach
### Built on the Linq Partner API v3

Hiiiii! So firstly, why Show Up? I went from 85kg to 50kg over two years, just by showing up every single day. That kind of consistency takes real perseverance, and what helped me most was having structure: knowing exactly what I was doing that day without having to search YouTube or spend 20 minutes deciding. When you work out alone, that clarity is everything!

I built Show Up because I wanted that for everyone. It lives in iMessage, no app, no friction. Text it, get your workout, log it with DONE. If it sees you read the message and go quiet, it checks in once. Just like a good training partner would.

(Also yes, you get workouts over iMessage. Isn't that the best thing!?)

---

## How it works

Show Up is a Node.js server that listens for Linq webhooks whenever something happens in iMessage: a message, a read receipt, a tapback reaction. It uses the Claude API to understand what the user is saying in plain English and to generate personalised workouts, and pulls live weather from OpenWeatherMap to make every session context-aware.

**Linq** handles iMessage delivery, read receipts, reactions, and typing indicators.

**Claude** handles natural language understanding, dynamic workout generation, fitness Q&A, personalised nudges, progress assessments, and weekly summaries.

**OpenWeatherMap** provides live weather that gets factored into every workout.

---

## Prerequisites

- Node.js 18+
- A Linq sandbox account — contact the Linq team for access
- An Anthropic API key — get one at console.anthropic.com (free credits on signup)
- An OpenWeatherMap API key — get one at openweathermap.org (free tier)
- ngrok — to expose your local server for webhooks

---

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment**

Create a `.env` file:
```
LINQ_API_KEY=your_bearer_token_from_linq
LINQ_PHONE_NUMBER=+12223334444
WEBHOOK_SECRET=
PORT=3000
PUBLIC_URL=
ANTHROPIC_API_KEY=your_anthropic_key
OPENWEATHER_API_KEY=your_openweather_key
```

`ANTHROPIC_API_KEY` and `OPENWEATHER_API_KEY` are optional. The app runs without them using static workouts and rule-based parsing as fallbacks.

**3. Start ngrok**
```bash
ngrok http 3000
```

Copy the `https://` URL and set it as `PUBLIC_URL` in `.env`.

**4. Register your webhook**
```bash
npx tsx src/scripts/register-webhook.ts
```

Copy the `signing_secret` from the output into `.env` as `WEBHOOK_SECRET`, then restart the server.

**5. Start the server**
```bash
npm run dev
```

---

## Testing the sandbox features

Text the Linq phone number from your iPhone to start.

---

### Test 1 — Onboarding

Text `hi`. Show Up asks for your name, goal, fitness level, and city. Natural language works throughout — "I want to lose some weight lol" maps correctly, not just numbered options. Once you give your city, it fetches live weather and confirms it before asking home or gym.

**Logs to watch:**
```
[webhook] ← message.received
[msg] From +15556667777: "hi"
[weather] London: 18°C, light rain
[coach] Workout sent to +15556667777 (home / upper / beginner)
```

---

### Test 2 — Workout completion and streak tracking

After receiving a workout, text `DONE`. Show Up logs the completion and updates your streak. Milestone messages fire at day 3, 7, 14, and 30 with iMessage fireworks and confetti effects at the bigger ones.

Text `STATS` to see your streak, total sessions, and this week's count.

Text `SKIP` to log a rest day. Streak resets. If you already completed today, skip is blocked. If you skipped and then complete a later workout, the skip stands.

---

### Test 3 — Read receipts and the nudge

Request a workout, then open it on your iPhone without replying. This fires `message.read`.

If you do not reply within 30 seconds (sandbox timer, 4 hours in production), Show Up sends one personalised nudge written by Claude based on your name, streak, and workout focus.

**Logs to watch:**
```
[read] +15556667777 read their workout at 2026-05-14T14:23:00.000Z
[nudge] Sending nudge to +15556667777
```

The nudge fires once and cancels if you reply before the timer expires.

---

### Test 4 — Reactions

Long-press the workout message on your iPhone and tap a tapback:
- ❤️ or 👍 logs the workout as completed, same as DONE
- 👎 logs a skip

**Logs to watch:**
```
[webhook] ← reaction.added
```

---

### Test 5 — Fitness Q&A

Ask anything mid-conversation. "How long should I rest between sets?", "what should I eat before a workout?", "is this too hard for me?" — Claude answers based on your fitness level and goal. Real answers, not scripted responses.

---

### Test 6 — Progress tracking

After your 10th session as a beginner (or 20th as intermediate), Claude sends a level-up suggestion with your stats. Reply YES to upgrade your level immediately. Reply NO to stay put. The check only happens once per threshold, no repeated nudging.

---

### Test 7 — Weekly summary

Every Monday at midnight, anyone who completed at least one session that week gets a personalised recap from Claude. Sessions count, focuses hit, current streak, one closing line for the new week. Resets after sending.

---

## How workouts are generated

When Claude API is available, every workout is generated fresh based on your level, location, focus, goal, recent session history, and live weather. Nice day with cardio selected means going outside gets suggested. Raining means indoor alternatives. Hot means a hydration note.

Without `ANTHROPIC_API_KEY`, Show Up falls back to a static library of 48 workouts — 2 variations per combination of location, focus, and level. Variations alternate based on how many times you have completed that focus so you never get the same session twice in a row.

The app blocks the same focus two days in a row for muscle recovery. Text `OVERRIDE` to bypass this.

---

## Daily cron

At 7am every day, Show Up texts all active users with the current weather and asks home or gym. Users who already completed that day are skipped.

Weekly counts reset every Monday at midnight after summaries are sent.

---

## User commands

| Command | What happens |
|---------|-------------|
| `DONE` | Logs workout complete, updates streak |
| `SKIP` | Logs rest day, resets streak |
| `STATS` | Shows streak, total sessions, and weekly count |
| `WORKOUT` | Starts a new workout session |
| `PAUSE` | Pauses daily messages |
| `RESUME` | Resumes after pausing |
| `OVERRIDE` | Bypasses the repeat-focus block |
| `HELP` | Lists available commands |
| ❤️ reaction | Same as DONE |
| 👎 reaction | Same as SKIP |
| Any question | Claude answers it |

---

## Project structure

```
show-up/
├── src/
│   ├── index.ts       — Express server, webhook endpoint, cron jobs
│   ├── coach.ts       — Conversation logic and event handling
│   ├── state.ts       — In-memory user state
│   ├── workouts.ts    — 48 static workouts (fallback library)
│   ├── ai.ts          — Claude: intent parsing, workouts, nudges, Q&A, progression, summaries
│   ├── weather.ts     — OpenWeatherMap integration
│   └── scripts/
│       └── register-webhook.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Troubleshooting

**Webhook not firing** — make sure ngrok is running and `PUBLIC_URL` matches. Re-run `register-webhook.ts` after ngrok restarts since the URL changes on the free plan.

**401 from Linq** — check `LINQ_API_KEY` in `.env`.

**Invalid signature warnings** — make sure `WEBHOOK_SECRET` matches the `signing_secret` from registration. Set it to blank to skip verification during development.

**Claude not generating workouts** — check `ANTHROPIC_API_KEY`. The app falls back to static workouts if the key is missing or the call fails.

**Weather not showing** — check `OPENWEATHER_API_KEY`. If a city lookup fails, weather is silently skipped and the workout still sends.
