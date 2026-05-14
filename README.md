# Show Up — iMessage Fitness Coach
### Built on the Linq Partner API v3

Hiiiii! So firstly, why Show Up? I went from 85kg to 50kg over two years, just by showing up every single day. That kind of consistency takes real perseverance, and what helped me most was having structure: knowing exactly what I was doing that day without having to search YouTube or spend 20 minutes deciding. When you work out alone, that clarity is everything!

I built Show Up because I wanted that for everyone. It lives in iMessage that means no app, no friction. Text it, get your workout, log it with DONE. If it sees you read the message and go quiet, it checks in once. Just like a good training partner would.

(Also yes, you get workouts over iMessage. Isn't that the best thing!?)
 *still a work in progress but this is what I have so far*
---

## Prerequisites

- **Node.js 18+**
- **A Linq sandbox account** — contact the Linq team for access
- **ngrok** — to expose your local server for webhooks

---

## Setup

**1. Install dependencies**
```bash
npm install
```

**2. Configure environment**
```bash
cp .env.example .env
```

Fill in your `.env`:
```
LINQ_API_KEY=your_bearer_token_from_linq
LINQ_PHONE_NUMBER=+12223334444
WEBHOOK_SECRET=
PORT=3000
PUBLIC_URL=
```

**3. Start ngrok**
```bash
ngrok http 3000
```

Copy the `https://` URL and add it to `.env` as `PUBLIC_URL`.

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

### Test 1 — Onboarding and inbound messages

Text `hi` to your Linq number. Show Up walks you through 3 questions (goal, fitness level, home or gym) and sends your first workout.

**Logs to watch:**
```
[webhook] ← message.received
[msg] From +15556667777: "hi"
[coach] Workout sent to +15556667777 (home / upper / beginner)
```

---

### Test 2 — Workout completion and streak tracking

After receiving a workout, text `DONE`. Show Up logs the completion, updates your streak, and sends a milestone message if applicable (day 3, 7, 14, 30).

Text `STATS` to see your streak, total sessions, and this week's count.

Text `SKIP` to log a rest day — streak resets. If you already completed today, skip is blocked. If you skipped and then change your mind and request a new workout, you can still complete it.

---

### Test 3 — Read receipts and the nudge

Request a workout by texting `WORKOUT`, then pick a location and focus. Open the workout message on your iPhone — this fires `message.read`.

If you do not reply within 30 seconds (sandbox timer), Show Up sends one nudge:
> "Hey! I can see today's workout landed. 👀 You still showing up today?"

**Logs to watch:**
```
[read] +15556667777 read their workout at 2026-05-14T14:23:00.000Z
[nudge] Sending nudge to +15556667777
```

The nudge only fires once and is cancelled if you reply before the timer expires.

---

### Test 4 — Reactions

Long-press the workout message on your iPhone and tap a tapback:
- ❤️ or 👍 — logs the workout as completed, same as typing DONE
- 👎 — logs a skip

**Logs to watch:**
```
[webhook] ← reaction.added
```

---

## How workouts are selected

Each combination of location (home/gym), focus (upper/glutes/abs/cardio), and level (beginner/intermediate/advanced) has 2 workout variations — 48 total. Show Up alternates between them based on how many times you have completed that specific focus, so you never get the same session back to back.

The app also blocks the same focus two days in a row to encourage muscle recovery. Typing OVERRIDE bypasses this if you want to repeat.

---

## Daily cron

At 7am every day, Show Up texts all active users asking for their location and focus, then sends a tailored workout. Users who already completed a workout that day are skipped.

Weekly completion counts reset every Monday at midnight.

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

---

## Project structure

```
show-up/
├── src/
│   ├── index.ts       — Express server, webhook endpoint, cron jobs
│   ├── coach.ts       — Conversation logic and event handling
│   ├── state.ts       — In-memory user state
│   ├── workouts.ts    — 48 workouts across all levels, locations, and focuses
│   └── scripts/
│       └── register-webhook.ts
├── .env.example
├── package.json
└── tsconfig.json
```

---

## Troubleshooting

**Webhook not firing** — make sure ngrok is running and `PUBLIC_URL` matches. Re-run `register-webhook.ts` after ngrok restarts (the URL changes on the free plan).

**401 from Linq** — check `LINQ_API_KEY` in `.env`.

**Invalid signature warnings** — make sure `WEBHOOK_SECRET` matches the `signing_secret` from registration. Set it to blank to skip verification during development.
