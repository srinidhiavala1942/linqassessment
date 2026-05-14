import LinqAPIV3 from '@linqapp/sdk';
import * as state from './state';
import { getWorkout, formatWorkout, type Focus } from './workouts';
import {
    parseActiveIntent, parseLocation, parseFocus, parseLevel, parseGoal,
    generateWorkout as aiGenerateWorkout, generateNudge, answerFitnessQuestion,
    checkLevelProgression, generateWeeklySummary,
} from './ai';
import { getWeather, weatherSummary } from './weather';

export async function handleEvent(linq: LinqAPIV3, event: any): Promise<void> {
    const type: string = event.event_type;
    try {
        switch (type) {
            case 'message.received': await onMessageReceived(linq, event); break;
            case 'message.read': await onMessageRead(linq, event); break;
            case 'reaction.added': await onReactionAdded(linq, event); break;
            default: console.log(`[coach] Unhandled event: ${type}`);
        }
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[coach] ❌ Uncaught error in ${type}: ${msg}`);
        console.error(`[coach]    Payload: ${JSON.stringify(event.data).slice(0, 200)}`);
    }
}

async function onMessageReceived(linq: LinqAPIV3, event: any): Promise<void> {
    const data = event.data;
    const senderHandle = data.sender_handle?.handle as string;
    const chatId = data.chat?.id as string;
    const textPart = data.parts?.find((p: any) => p.type === 'text');
    const text: string = (textPart?.value ?? '').trim();

    if (!senderHandle || !chatId || data.direction === 'outbound') return;
    console.log(`[msg] From ${senderHandle}: "${text}"`);

    let user = state.getUser(senderHandle);

    if (!user) {
        user = state.upsertUser(senderHandle, chatId);
        await sendWelcome(linq, chatId, senderHandle);
        return;
    }

    state.clearNudgeTimer(senderHandle);
    state.updateUser(senderHandle, { nudgeSent: false });

    if (user.status === 'ONBOARDING') {
        await handleOnboarding(linq, user, chatId, senderHandle, text);
        return;
    }

    if (user.status === 'AWAITING_LOCATION') {
        await handleLocationAnswer(linq, user, chatId, senderHandle, text);
        return;
    }

    if (user.status === 'AWAITING_FOCUS') {
        await handleFocusAnswer(linq, user, chatId, senderHandle, text);
        return;
    }

    if (user.status === 'ACTIVE') {
        await handleActiveUser(linq, user, chatId, senderHandle, text);
        return;
    }

    if (user.status === 'PAUSED') {
        await handlePausedUser(linq, user, chatId, senderHandle, text);
        return;
    }
}

async function sendWelcome(linq: LinqAPIV3, chatId: string, phone: string): Promise<void> {
    await showTyping(linq, chatId);
    await sendMessage(linq, chatId,
        `Heyyy! Welcome to Show Up 🎉\n\nFirst, give yourself credit for showing up today. That already puts you ahead of most people.\n\nI am your AI fitness coach. I will send you a workout every day, track your streak, and check in if life gets in the way.\n\nWhat is your name?`
    );
    state.updateUser(phone, { onboardingStep: 'ASK_NAME' });
}

async function handleOnboarding(
    linq: LinqAPIV3,
    user: state.UserState,
    chatId: string,
    phone: string,
    text: string
): Promise<void> {
    const step = user.onboardingStep;

    if (step === 'ASK_NAME') {
        const name = text.split(' ')[0].trim();
        if (!name) {
            await sendMessage(linq, chatId, `I did not catch that 😅 What is your name?`);
            return;
        }
        state.updateUser(phone, { name, onboardingStep: 'ASK_GOAL' });
        await showTyping(linq, chatId);
        await sendMessage(linq, chatId,
            `${name}! Love it. Let us build your program 💪\n\nWhat is your main goal right now?\n\n1️⃣ Lose weight and burn fat\n2️⃣ Build muscle and get stronger\n3️⃣ Stay active and feel better\n4️⃣ Run faster and boost cardio\n\nJust type the number or tell me in your own words.`
        );
        return;
    }

    if (step === 'ASK_GOAL') {
        const goal = await parseGoal(text);

        if (goal === 'unknown') {
            await sendMessage(linq, chatId,
                `Got it — can you pick one of these?\n\n1️⃣ Lose weight and burn fat\n2️⃣ Build muscle and get stronger\n3️⃣ Stay active and feel better\n4️⃣ Run faster and boost cardio`
            );
            return;
        }

        const hype: Record<string, string> = {
            lose_weight: 'Fat loss mode activated 🔥',
            build_muscle: 'Building muscle? Let us get after it 💪',
            stay_active: 'Staying consistent is everything 🙌',
            run_faster: 'Cardio beast mode incoming 🏃',
        };
        state.updateUser(phone, { goal: goal as any, onboardingStep: 'ASK_LEVEL' });
        await showTyping(linq, chatId);
        await sendMessage(linq, chatId,
            `${hype[goal]}\n\nBe honest, where are you at right now?\n\n1️⃣ Beginner, just getting started\n2️⃣ Intermediate, I work out sometimes\n3️⃣ Advanced, I train hard regularly\n\nNo wrong answer. Your workouts get built around this.`
        );
        return;
    }

    if (step === 'ASK_LEVEL') {
        const level = await parseLevel(text);
        if (level === 'unknown') {
            await sendMessage(linq, chatId,
                `Can you pick one?\n\n1️⃣ Beginner\n2️⃣ Intermediate\n3️⃣ Advanced`
            );
            return;
        }
        state.updateUser(phone, { level, onboardingStep: 'ASK_CITY' });
        await showTyping(linq, chatId);
        await sendMessage(linq, chatId,
            `Last one — what city are you in? I will factor in the weather when planning your workouts 🌤️`
        );
        return;
    }

    if (step === 'ASK_CITY') {
        const city = text.trim();
        if (!city || city.length < 2) {
            await sendMessage(linq, chatId, `Just type your city name and we are good to go 🌍`);
            return;
        }
        const weather = await getWeather(city);
        const weatherLine = weather
            ? `Right now it is ${weatherSummary(weather)} in ${weather.city}. `
            : '';
        state.updateUser(phone, { city, status: 'AWAITING_LOCATION', onboardingStep: 'ASK_LOCATION' });
        await showTyping(linq, chatId);
        await sendMessage(linq, chatId,
            `${weatherLine}Let us get you your first workout 🚀\n\nHome or gym today?\n\n1️⃣ Home\n2️⃣ Gym`
        );
        return;
    }
}

async function handleLocationAnswer(
    linq: LinqAPIV3,
    user: state.UserState,
    chatId: string,
    phone: string,
    text: string
): Promise<void> {
    const location = await parseLocation(text);

    if (location === 'unknown') {
        await sendMessage(linq, chatId,
            `Home or gym today?\n\n1️⃣ Home\n2️⃣ Gym`
        );
        return;
    }

    state.updateUser(phone, { location, status: 'AWAITING_FOCUS' });
    await showTyping(linq, chatId);
    await sendMessage(linq, chatId,
        `${location === 'home' ? 'Home workout! Let us get it 🏠' : 'Gym session! Time to work 🏋️'}\n\nWhat do you want to focus on today?\n\n1️⃣ Upper body\n2️⃣ Glutes\n3️⃣ Abs and core\n4️⃣ Cardio`
    );
}

async function handleFocusAnswer(
    linq: LinqAPIV3,
    user: state.UserState,
    chatId: string,
    phone: string,
    text: string
): Promise<void> {
    const focus = await parseFocus(text);

    if (focus === 'unknown') {
        await sendMessage(linq, chatId,
            `What do you want to focus on?\n\n1️⃣ Upper body\n2️⃣ Glutes\n3️⃣ Abs and core\n4️⃣ Cardio`
        );
        return;
    }

    const location = user.location ?? 'home';
    const level = user.level ?? 'beginner';

    const yesterday = state.getYesterdayWorkout(phone);
    if (yesterday && yesterday.location === location && yesterday.focus === focus) {
        const focusLabels: Record<Focus, string> = {
            upper: 'upper body',
            glutes: 'glutes',
            abs: 'abs',
            cardio: 'cardio',
        };
        const alternatives: Record<Focus, string> = {
            upper: '2️⃣ Glutes, 3️⃣ Abs, or 4️⃣ Cardio',
            glutes: '1️⃣ Upper body, 3️⃣ Abs, or 4️⃣ Cardio',
            abs: '1️⃣ Upper body, 2️⃣ Glutes, or 4️⃣ Cardio',
            cardio: '1️⃣ Upper body, 2️⃣ Glutes, or 3️⃣ Abs',
        };
        await sendMessage(linq, chatId,
            `Hold on! We just hit ${focusLabels[focus]} yesterday! 🙅\n\nYour muscles need 48 hours to recover. Hitting the same group back to back slows your progress down.\n\nLet us switch it up today 💡 Try: ${alternatives[focus]}\n\nOr reply OVERRIDE if you really want to repeat it.`
        );
        return;
    }

    state.updateUser(phone, { focus, status: 'ACTIVE' });

    const focusCount = focus === 'upper' ? user.upperCompletions
        : focus === 'glutes' ? user.glutesCompletions
        : focus === 'abs' ? user.absCompletions
        : user.cardioCompletions;

    const weather = user.city ? await getWeather(user.city) : null;

    // Try AI-generated workout first, fall back to static library
    const aiWorkout = await aiGenerateWorkout({
        level, location, focus,
        goal: user.goal,
        name: user.name,
        history: user.workoutHistory,
        weather,
    });
    const message = aiWorkout ?? formatWorkout(getWorkout(level, location, focus, focusCount));

    await showTyping(linq, chatId);

    const result = await linq.chats.messages.send(chatId, {
        message: { parts: [{ type: 'text', value: message }] },
    } as any);

    const messageId = (result as any).message?.id;

    if (!messageId) {
        console.warn(`[coach] ⚠️  No message ID returned for ${phone} — nudge tracking disabled this session`);
    } else {
        console.log(`[coach] Workout sent to ${phone} — msgId: ${messageId} (${location} / ${focus} / ${level})`);
    }

    state.updateUser(phone, {
        lastWorkoutMessageId: messageId,
        lastWorkoutSentAt: new Date(),
        completedToday: false,
        nudgeSent: false,
        lastSkipDay: undefined,
    });
}

async function handleActiveUser(
    linq: LinqAPIV3,
    user: state.UserState,
    chatId: string,
    phone: string,
    text: string
): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Lazy midnight reset — clear completedToday and lastSkipDay once the calendar day changes
    if ((user.completedToday && user.lastWorkoutDay !== today) ||
        (user.lastSkipDay && user.lastSkipDay !== today)) {
        state.updateUser(phone, { completedToday: false, lastSkipDay: undefined });
        user = state.getUser(phone)!;
    }

    // Handle pending level-up confirmation before anything else
    if (user.levelUpPending) {
        const t = text.toLowerCase();
        const confirmed = t.includes('yes') || t.includes('yeah') || t.includes('sure') || t === 'y';
        const declined = t.includes('no') || t.includes('nope') || t.includes('stay') || t === 'n';

        if (confirmed || declined) {
            state.updateUser(phone, { levelUpPending: false });
            if (confirmed && user.level) {
                const nextLevel = user.level === 'beginner' ? 'intermediate' : 'advanced';
                state.updateUser(phone, { level: nextLevel });
                await sendMessage(linq, chatId,
                    `Level up confirmed. You are now ${nextLevel}. 🔥\n\nYour workouts just got harder — that is the point. Text WORKOUT when you are ready.`
                );
            } else {
                await sendMessage(linq, chatId,
                    `No problem — staying at ${user.level} for now. Keep showing up and we will check again soon 💪`
                );
            }
            return;
        }
    }

    const intent = await parseActiveIntent(text);

    switch (intent) {
        case 'help':
            await sendMessage(linq, chatId,
                `Here is what you can say 👇\n\n` +
                `WORKOUT to get today's session\n` +
                `DONE to log your workout complete ✅\n` +
                `SKIP to log a rest day\n` +
                `STATS to see your streak and totals\n` +
                `PAUSE to pause daily messages\n` +
                `RESUME to resume after a pause\n\n` +
                `Or just reply naturally, I will figure it out 💬`
            );
            return;

        case 'done':
            await onWorkoutCompleted(linq, user, chatId, phone);
            return;

        case 'override':
            state.updateUser(phone, { status: 'AWAITING_FOCUS' });
            await sendMessage(linq, chatId,
                `Your call! 💪 Which focus do you want?\n\n1️⃣ Upper body\n2️⃣ Glutes\n3️⃣ Abs and core\n4️⃣ Cardio`
            );
            const updated = state.getUser(phone);
            if (updated) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yDate = yesterday.toISOString().split('T')[0];
                state.updateUser(phone, {
                    workoutHistory: updated.workoutHistory.filter(h => h.date !== yDate),
                });
            }
            return;

        case 'skip':
            await onWorkoutSkipped(linq, user, chatId, phone);
            return;

        case 'pause':
            state.updateUser(phone, { status: 'PAUSED' });
            await sendMessage(linq, chatId, `Paused. 🤙\n\nText RESUME when you are ready to get back at it.`);
            return;

        case 'resume':
            state.updateUser(phone, { status: 'AWAITING_LOCATION' });
            await sendMessage(linq, chatId, `Welcome back! 🔥\n\nHome or gym today?\n\n1️⃣ Home\n2️⃣ Gym`);
            return;

        case 'workout':
            if (user.completedToday) {
                await sendMessage(linq, chatId, `You already crushed today's workout 💪 Come back tomorrow for your next session.`);
                return;
            }
            state.updateUser(phone, { status: 'AWAITING_LOCATION' });
            await sendMessage(linq, chatId, `Let us go! 💪\n\nHome or gym today?\n\n1️⃣ Home\n2️⃣ Gym`);
            return;

        case 'stats': {
            const name = user.name ?? 'you';
            await sendMessage(linq, chatId,
                `📊 ${name} Show Up Stats\n\n🔥 Streak: ${user.streakDays} days\n✅ Total sessions: ${user.totalCompletions}\n📅 This week: ${user.weeklyCompletions}\n\nShowing up beats being perfect every time.`
            );
            return;
        }

        case 'question': {
            await showTyping(linq, chatId);
            const answer = await answerFitnessQuestion(text, {
                name: user.name,
                level: user.level,
                goal: user.goal,
            });
            await sendMessage(linq, chatId, answer);
            return;
        }

        default:
            await showTyping(linq, chatId);
            await sendMessage(linq, chatId,
                `Reply DONE when you finish, SKIP to rest, or WORKOUT to get a new session 💪`
            );
    }
}

async function handlePausedUser(
    linq: LinqAPIV3,
    user: state.UserState,
    chatId: string,
    phone: string,
    text: string
): Promise<void> {
    const intent = await parseActiveIntent(text);

    if (intent === 'resume' || intent === 'workout') {
        state.updateUser(phone, { status: 'AWAITING_LOCATION' });
        await showTyping(linq, chatId);
        await sendMessage(linq, chatId,
            `Welcome back${user.name ? ', ' + user.name : ''}! 🔥 Let us get back at it.\n\nHome or gym today?\n\n1️⃣ Home\n2️⃣ Gym`
        );
        return;
    }

    if (intent === 'stats') {
        await sendMessage(linq, chatId,
            `📊 Stats\n\n🔥 Streak: ${user.streakDays} days\n✅ Total: ${user.totalCompletions}\n\nText RESUME to get back at it 💪`
        );
        return;
    }

    if (intent === 'help') {
        await sendMessage(linq, chatId,
            `Your workouts are paused. 😴\n\nText RESUME to get back at it 💪\nText STATS to see your progress 📊`
        );
        return;
    }

    await showTyping(linq, chatId);
    await sendMessage(linq, chatId,
        `Your workouts are currently paused. 😴\n\nText RESUME when you are ready to get back at it 💪`
    );
}

async function onWorkoutCompleted(
    linq: LinqAPIV3,
    _user: state.UserState,
    chatId: string,
    phone: string
): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    // Re-fetch for freshest state — closes the race condition window
    const current = state.getUser(phone);
    if (!current) return;

    if (current.completedToday && current.lastWorkoutDay === today) {
        await sendMessage(linq, chatId,
            `Already logged for today! ✅\n\nStreak: ${current.streakDays} days | Total: ${current.totalCompletions}`
        );
        return;
    }

    if (current.lastSkipDay === today) {
        await sendMessage(linq, chatId,
            `You marked today as a rest day 😴\n\nRest up — come back tomorrow to keep the streak going 💪`
        );
        return;
    }

    const isNewDay = current.lastWorkoutDay !== today;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split('T')[0];
    const missedDays = isNewDay && !!current.lastWorkoutDay && current.lastWorkoutDay !== yDate;
    const streakBase = missedDays ? 0 : current.streakDays;

    const newStreak = isNewDay ? streakBase + 1 : streakBase;
    const newTotal = isNewDay ? current.totalCompletions + 1 : current.totalCompletions;
    const newWeekly = isNewDay ? current.weeklyCompletions + 1 : current.weeklyCompletions;

    // Write synchronously before any await — prevents race condition on duplicate "done" messages
    state.updateUser(phone, {
        completedToday: true,
        lastWorkoutDay: today,
        streakDays: newStreak,
        totalCompletions: newTotal,
        weeklyCompletions: newWeekly,
    });

    if (isNewDay && current.location && current.focus) {
        state.logWorkoutToHistory(phone, current.location, current.focus);
        const focusKey = current.focus === 'upper' ? 'upperCompletions'
            : current.focus === 'glutes' ? 'glutesCompletions'
            : current.focus === 'abs' ? 'absCompletions'
            : 'cardioCompletions';
        state.updateUser(phone, { [focusKey]: (current as any)[focusKey] + 1 });
    }

    const name = current.name ?? '';
    await showTyping(linq, chatId);

    if (newStreak === 3) {
        await sendMessage(linq, chatId, `3 days in a row${name ? ', ' + name : ''}. 🔥\n\nShowing up is the hardest part. You are doing it.\n\nStreak: ${newStreak} days | Total: ${newTotal}`);
    } else if (newStreak === 7) {
        await sendMessage(linq, chatId, `${name ? name + ' showed up ' : 'You showed up '}7 days straight. 🔥🔥🔥\n\nThat is a whole week. Most people quit on day 2.\n\nStreak: ${newStreak} days 🏆 | Total: ${newTotal}`, 'fireworks');
    } else if (newStreak === 14) {
        await sendMessage(linq, chatId, `Two weeks${name ? ', ' + name : ''}. 🏆\n\nYou showed up 14 times when it would have been easier not to.\n\nStreak: ${newStreak} | Total: ${newTotal}`);
    } else if (newStreak === 30) {
        await sendMessage(linq, chatId, `30 days. 🎉\n\nThat is not a streak anymore. That is a habit.\n\nStreak: ${newStreak} 🏆 | Total: ${newTotal}`, 'confetti');
    } else if (newTotal % 10 === 0) {
        await sendMessage(linq, chatId, `${newTotal} sessions. ${newTotal} times you showed up. 💪\n\nStreak: ${newStreak} days`, 'confetti');
    } else if (newStreak > 1) {
        await sendMessage(linq, chatId, `Showed up. ✅\n\n${newStreak} days in a row 🔥 | Total: ${newTotal}\n\nText WORKOUT whenever you want your next session.`);
    } else {
        await sendMessage(linq, chatId, `You showed up. ✅\n\nDay 1 is the most important one.\n\nText WORKOUT when you are ready for your next session 💪`);
    }

    // Check for level progression at milestone completions
    const freshUser = state.getUser(phone);
    if (freshUser && freshUser.level && freshUser.level !== 'advanced' && !freshUser.levelUpPending) {
        const threshold = freshUser.level === 'beginner' ? 10 : 20;
        if (newTotal === threshold) {
            const suggestion = await checkLevelProgression({
                name: freshUser.name,
                currentLevel: freshUser.level,
                totalCompletions: newTotal,
                streakDays: newStreak,
                weeklyCompletions: newWeekly,
            });
            if (suggestion) {
                state.updateUser(phone, { levelUpPending: true });
                await delay(800);
                await sendMessage(linq, chatId, suggestion);
            }
        }
    }
}

async function onWorkoutSkipped(
    linq: LinqAPIV3,
    user: state.UserState,
    chatId: string,
    phone: string
): Promise<void> {
    if (user.completedToday) {
        await sendMessage(linq, chatId, `You already crushed a workout today 💪 Streak is safe. Rest up!`);
        return;
    }
    const today = new Date().toISOString().split('T')[0];
    state.updateUser(phone, { streakDays: 0, completedToday: false, nudgeSent: false, lastSkipDay: today });
    await showTyping(linq, chatId);
    await sendMessage(linq, chatId,
        `Rest day logged. 🙏\n\nStreak reset. Happens to everyone.\n\nShowing up tomorrow is what matters. Text WORKOUT when you are ready.`
    );
}

async function onMessageRead(linq: LinqAPIV3, event: any): Promise<void> {
    const data = event.data;
    const messageId = data.id as string;
    const chatId = data.chat?.id as string;
    if (!messageId || !chatId) return;

    const allUsers = state.getAllActiveUsers();
    const user = allUsers.find(u =>
        u.lastWorkoutMessageId === messageId &&
        u.chatId === chatId &&
        !u.completedToday &&
        !u.nudgeSent
    );
    if (!user) return;

    console.log(`[read] ${user.phone} read their workout at ${new Date().toISOString()}`);

    const NUDGE_DELAY_MS = 30 * 1000; // For sandbox testing
    // const NUDGE_DELAY_MS = 4 * 60 * 60 * 1000; // 4 hours — use in production

    const timer = setTimeout(async () => {
        const current = state.getUser(user.phone);
        if (!current || current.completedToday || current.nudgeSent) return;

        console.log(`[nudge] Sending nudge to ${user.phone}`);
        state.updateUser(user.phone, { nudgeSent: true });

        const nudge = await generateNudge({
            name: current.name,
            streakDays: current.streakDays,
            focus: current.focus,
        });

        await showTyping(linq, chatId);
        await sendMessage(linq, chatId, nudge);
    }, NUDGE_DELAY_MS);

    state.updateUser(user.phone, { nudgeTimer: timer });
}

async function onReactionAdded(linq: LinqAPIV3, event: any): Promise<void> {
    const data = event.data;
    const phone = (data.from_handle?.handle ?? data.from) as string;
    const reactionType = data.reaction_type as string;
    const emoji = data.custom_emoji as string;
    const chatId = data.chat_id as string;

    if (!phone || !chatId) {
        console.warn('[coach] reaction.added missing phone or chatId — ignoring');
        return;
    }

    const user = state.getUser(phone);
    if (!user || user.status !== 'ACTIVE') return;

    const isLove = reactionType === 'love' || emoji === '❤️';
    const isLike = reactionType === 'like' || emoji === '👍';
    const isDislike = reactionType === 'dislike' || emoji === '👎';

    if ((isLove || isLike) && !user.completedToday) {
        state.clearNudgeTimer(phone);
        await onWorkoutCompleted(linq, user, chatId, phone);
    }
    if (isDislike && !user.completedToday) {
        state.clearNudgeTimer(phone);
        await onWorkoutSkipped(linq, user, chatId, phone);
    }
}

async function sendMessage(linq: LinqAPIV3, chatId: string, text: string, effect?: string): Promise<void> {
    const messageContent: any = { parts: [{ type: 'text', value: text }] };
    if (effect) messageContent.effect = effect;
    await linq.chats.messages.send(chatId, { message: messageContent } as any);
}

async function showTyping(linq: LinqAPIV3, chatId: string): Promise<void> {
    try { await linq.chats.typing.start(chatId); } catch { }
    await delay(800 + Math.random() * 600);
}

function delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function sendWeeklySummaries(linq: LinqAPIV3): Promise<void> {
    const activeUsers = state.getAllActiveUsers();
    for (const user of activeUsers) {
        if (user.weeklyCompletions === 0) continue;
        try {
            const summary = await generateWeeklySummary({
                name: user.name,
                weeklyCompletions: user.weeklyCompletions,
                streakDays: user.streakDays,
                totalCompletions: user.totalCompletions,
                level: user.level,
                workoutHistory: user.workoutHistory,
            });
            await showTyping(linq, user.chatId);
            await sendMessage(linq, user.chatId, summary);
            console.log(`[cron] Weekly summary sent to ${user.phone}`);
        } catch (err) {
            console.error(`[cron] Failed to send weekly summary to ${user.phone}:`, err);
        }
        await delay(500);
    }
}

export async function askDailyWorkout(linq: LinqAPIV3, user: state.UserState): Promise<void> {
    state.updateUser(user.phone, { status: 'AWAITING_LOCATION' });

    const weather = user.city ? await getWeather(user.city) : null;
    const weatherLine = weather ? `${weatherSummary(weather)} in ${weather.city} today. ` : '';

    await showTyping(linq, user.chatId);
    await sendMessage(linq, user.chatId,
        `Good morning! ${weatherLine}Time to show up 💪\n\nHome or gym today?\n\n1️⃣ Home\n2️⃣ Gym`
    );
}
