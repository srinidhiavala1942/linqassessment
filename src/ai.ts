import Anthropic from '@anthropic-ai/sdk';
import type { Focus, Level, Location } from './workouts';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export type ActiveIntent =
    'done' | 'skip' | 'workout' | 'stats' | 'pause' | 'resume' | 'help' | 'override' | 'question' | 'unknown';
export type LocationIntent = 'home' | 'gym' | 'unknown';
export type FocusIntent = Focus | 'unknown';
export type LevelIntent = Level | 'unknown';
export type GoalIntent = 'lose_weight' | 'build_muscle' | 'stay_active' | 'run_faster' | 'unknown';

const VALID_ACTIVE: ActiveIntent[] = ['done', 'skip', 'workout', 'stats', 'pause', 'resume', 'help', 'override', 'question', 'unknown'];

const SYSTEM_ACTIVE = `You classify iMessage texts sent to a fitness coach app. The user is active (already onboarded).
Reply with exactly one word from this list:

done = finished workout (done, finished, crushed it, did it, completed, ✅, 💪, just did it)
skip = rest day or can't workout (skip, rest, can't, tired, busy, not today, too sore)
workout = wants a new workout session
stats = wants streak or progress info
pause = wants to stop receiving daily messages
resume = wants to start receiving messages again
help = wants list of commands
override = wants to repeat the same muscle group as yesterday
question = asking about fitness, form, nutrition, or recovery
unknown = anything else

Return only the single word, nothing else.`;

const SYSTEM_WORKOUT: Anthropic.TextBlockParam[] = [
    {
        type: 'text',
        text: `You are Show Up, a direct iMessage fitness coach. Generate practical, specific workouts.
No markdown formatting — no **, no ##, no ---. Follow the format template exactly.
Form cues should be specific and useful, not generic. The tip should be surprising and non-obvious.`,
        // @ts-ignore — cache_control is valid in API but not yet in SDK types
        cache_control: { type: 'ephemeral' },
    },
];

const SYSTEM_ANSWER: Anthropic.TextBlockParam[] = [
    {
        type: 'text',
        text: `You are Show Up, an iMessage fitness coach. Answer fitness questions in 3-4 lines max.
No markdown. Be specific and practical. End with a short encouragement or actionable next step.`,
        // @ts-ignore
        cache_control: { type: 'ephemeral' },
    },
];

export async function parseActiveIntent(text: string): Promise<ActiveIntent> {
    if (!process.env.ANTHROPIC_API_KEY) return fallbackActive(text);
    try {
        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 10,
            system: SYSTEM_ACTIVE,
            messages: [{ role: 'user', content: text }],
        });
        const raw = (res.content[0] as Anthropic.TextBlock).text.trim().toLowerCase() as ActiveIntent;
        return VALID_ACTIVE.includes(raw) ? raw : 'unknown';
    } catch (err) {
        console.warn('[ai] parseActiveIntent failed:', (err as Error).message);
        return fallbackActive(text);
    }
}

export async function parseLocation(text: string): Promise<LocationIntent> {
    if (!process.env.ANTHROPIC_API_KEY) return fallbackLocation(text);
    try {
        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 5,
            system: 'Reply with only: home, gym, or unknown — based on where the user wants to work out.',
            messages: [{ role: 'user', content: text }],
        });
        const raw = (res.content[0] as Anthropic.TextBlock).text.trim().toLowerCase();
        return (['home', 'gym'].includes(raw) ? raw : 'unknown') as LocationIntent;
    } catch {
        return fallbackLocation(text);
    }
}

export async function parseFocus(text: string): Promise<FocusIntent> {
    if (!process.env.ANTHROPIC_API_KEY) return fallbackFocus(text);
    try {
        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 5,
            system: `Reply with only: upper, glutes, abs, cardio, or unknown — based on the user's workout focus area.
upper = upper body, chest, arms, shoulders, back
glutes = glutes, butt, legs, lower body
abs = abs, core, stomach
cardio = cardio, running, sweat, burn`,
            messages: [{ role: 'user', content: text }],
        });
        const raw = (res.content[0] as Anthropic.TextBlock).text.trim().toLowerCase();
        return (['upper', 'glutes', 'abs', 'cardio'].includes(raw) ? raw : 'unknown') as FocusIntent;
    } catch {
        return fallbackFocus(text);
    }
}

export async function parseLevel(text: string): Promise<LevelIntent> {
    if (!process.env.ANTHROPIC_API_KEY) return fallbackLevel(text);
    try {
        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 5,
            system: `Reply with only: beginner, intermediate, advanced, or unknown — based on the user's fitness level.
beginner = just starting, new to working out, not very active
intermediate = works out sometimes, some experience
advanced = trains regularly, experienced`,
            messages: [{ role: 'user', content: text }],
        });
        const raw = (res.content[0] as Anthropic.TextBlock).text.trim().toLowerCase();
        return (['beginner', 'intermediate', 'advanced'].includes(raw) ? raw : 'unknown') as LevelIntent;
    } catch {
        return fallbackLevel(text);
    }
}

export async function parseGoal(text: string): Promise<GoalIntent> {
    if (!process.env.ANTHROPIC_API_KEY) return fallbackGoal(text);
    try {
        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 10,
            system: `Reply with only one of: lose_weight build_muscle stay_active run_faster unknown

lose_weight = lose weight, burn fat, get lean, slim down
build_muscle = build muscle, get stronger, tone, bulk
stay_active = stay healthy, feel better, general fitness, be consistent
run_faster = improve cardio, run faster, endurance, stamina`,
            messages: [{ role: 'user', content: text }],
        });
        const raw = (res.content[0] as Anthropic.TextBlock).text.trim().toLowerCase();
        return (['lose_weight', 'build_muscle', 'stay_active', 'run_faster'].includes(raw) ? raw : 'unknown') as GoalIntent;
    } catch {
        return fallbackGoal(text);
    }
}

export async function generateWorkout(params: {
    level: Level;
    location: Location;
    focus: Focus;
    goal?: string;
    name?: string;
    history: Array<{ date: string; focus: string; location: string }>;
}): Promise<string | null> {
    if (!process.env.ANTHROPIC_API_KEY) return null;

    const emoji = { upper: '💪', glutes: '🍑', abs: '⚡', cardio: '🏃' }[params.focus];
    const focusLabel = { upper: 'upper body', glutes: 'glutes', abs: 'abs and core', cardio: 'cardio' }[params.focus];
    const goalLabel = params.goal
        ? ({ lose_weight: 'lose weight and burn fat', build_muscle: 'build muscle and get stronger', stay_active: 'stay active and feel better', run_faster: 'improve cardio' } as Record<string, string>)[params.goal] ?? params.goal
        : 'general fitness';
    const equipment = params.location === 'home' ? 'bodyweight only — no gym equipment' : 'full gym access with machines and free weights';
    const recentFocuses = params.history.slice(0, 3).map(h => h.focus).join(', ') || 'none yet';

    const prompt = `Generate a ${params.level} ${focusLabel} workout.
Location: ${params.location} (${equipment})
Goal: ${goalLabel}
Recent sessions: ${recentFocuses}${params.name ? `\nUser: ${params.name}` : ''}

Use this EXACT format — no deviations:

${emoji} [Workout Title] ([Duration])

🎯 Why this works:
[One specific sentence about the science or benefit — not generic]

→ [Exercise 1: sets x reps (specific form cue)]
→ [Exercise 2: sets x reps (specific form cue)]
→ [Exercise 3: sets x reps (specific form cue)]
→ [Exercise 4: sets x reps (specific form cue)]
→ [Exercise 5: sets x reps (specific form cue)]

💡 [One specific, non-obvious tip]

Reply DONE when you crush it ✅
Or react ❤️ to log it instantly.`;

    try {
        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 500,
            system: SYSTEM_WORKOUT,
            messages: [{ role: 'user', content: prompt }],
        });
        const text = (res.content[0] as Anthropic.TextBlock).text.trim();
        console.log(`[ai] Workout generated (${res.usage.input_tokens} in / ${res.usage.output_tokens} out)`);
        return text;
    } catch (err) {
        console.warn('[ai] generateWorkout failed, using static fallback:', (err as Error).message);
        return null;
    }
}

export async function generateNudge(params: {
    name?: string;
    streakDays: number;
    focus?: Focus;
}): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) return defaultNudge();

    const focusLabel = params.focus
        ? { upper: 'upper body', glutes: 'glutes', abs: 'abs and core', cardio: 'cardio' }[params.focus]
        : 'workout';
    const streakLine = params.streakDays > 0
        ? `They have a ${params.streakDays}-day streak right now.`
        : 'They are just getting started.';

    try {
        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 80,
            system: `You are Show Up, a supportive iMessage fitness coach. Write a 2-3 line nudge to someone who read their ${focusLabel} workout but has not logged it yet.${params.name ? ` Their name is ${params.name}.` : ''} ${streakLine} Be warm but not pushy. No emoji on every line. End with: reply DONE when finished or SKIP if you need the rest.`,
            messages: [{ role: 'user', content: 'nudge' }],
        });
        return (res.content[0] as Anthropic.TextBlock).text.trim();
    } catch {
        return defaultNudge();
    }
}

export async function answerFitnessQuestion(question: string, params: {
    name?: string;
    level?: string;
    goal?: string;
}): Promise<string> {
    if (!process.env.ANTHROPIC_API_KEY) {
        return `Good question! Text WORKOUT to get today's session or STATS to check your progress 💪`;
    }
    try {
        const ctx = [
            params.name ? `Name: ${params.name}` : '',
            params.level ? `Level: ${params.level}` : '',
            params.goal ? `Goal: ${params.goal}` : '',
        ].filter(Boolean).join(', ');

        const res = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 150,
            system: SYSTEM_ANSWER,
            messages: [{
                role: 'user',
                content: ctx ? `[${ctx}]\n${question}` : question,
            }],
        });
        return (res.content[0] as Anthropic.TextBlock).text.trim();
    } catch {
        return `Good question! Text WORKOUT to get today's session or STATS to check your progress 💪`;
    }
}

// Static fallbacks — used when ANTHROPIC_API_KEY is not set or a Claude call fails

function fallbackActive(text: string): ActiveIntent {
    const t = text.toLowerCase();
    if (t.includes('done') || t.includes('finished') || t.includes('complete') || t.includes('did it') || t.includes('crushed')) return 'done';
    if (t.includes('skip') || t.includes('rest') || t.includes('cant') || t.includes("can't") || t.includes('not today') || t.includes('tired')) return 'skip';
    if (t.includes('workout') || t.includes('send') || t.includes('new') || t.includes('today') || t.includes('ready')) return 'workout';
    if (t.includes('stats') || t.includes('streak') || t.includes('progress') || t.includes('how am i')) return 'stats';
    if (t.includes('pause') || t.includes('stop')) return 'pause';
    if (t.includes('resume') || t.includes('back') || t.includes('start')) return 'resume';
    if (t === 'help' || t === '?' || t.includes('commands')) return 'help';
    if (t.includes('override')) return 'override';
    return 'unknown';
}

function fallbackLocation(text: string): LocationIntent {
    const t = text.toLowerCase();
    if (t.includes('home') || t.includes('house') || t === '1') return 'home';
    if (t.includes('gym') || t.includes('studio') || t === '2') return 'gym';
    return 'unknown';
}

function fallbackFocus(text: string): FocusIntent {
    const t = text.toLowerCase();
    if (t.includes('upper') || t.includes('chest') || t.includes('arm') || t.includes('shoulder') || t === '1') return 'upper';
    if (t.includes('glute') || t.includes('butt') || t.includes('leg') || t === '2') return 'glutes';
    if (t.includes('ab') || t.includes('core') || t === '3') return 'abs';
    if (t.includes('cardio') || t.includes('run') || t === '4') return 'cardio';
    return 'unknown';
}

function fallbackLevel(text: string): LevelIntent {
    const t = text.toLowerCase();
    if (t === '1' || t.includes('beginner') || t.includes('start') || t.includes('new')) return 'beginner';
    if (t === '2' || t.includes('intermediate') || t.includes('some')) return 'intermediate';
    if (t === '3' || t.includes('advanced') || t.includes('regular')) return 'advanced';
    return 'unknown';
}

function fallbackGoal(text: string): GoalIntent {
    const t = text.toLowerCase();
    if (t.includes('weight') || t.includes('lose') || t.includes('fat') || t === '1') return 'lose_weight';
    if (t.includes('muscle') || t.includes('strong') || t.includes('bulk') || t === '2') return 'build_muscle';
    if (t.includes('active') || t.includes('health') || t === '3') return 'stay_active';
    if (t.includes('run') || t.includes('cardio') || t === '4') return 'run_faster';
    return 'unknown';
}

function defaultNudge(): string {
    return `Hey! I can see today's workout landed. 👀\n\nYou still showing up today?\n\nEven 20 minutes counts. Reply DONE when finished, or SKIP if you need the rest.`;
}
