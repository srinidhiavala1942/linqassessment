// src/state.ts

export type OnboardingStep = 'ASK_NAME' | 'ASK_GOAL' | 'ASK_LEVEL' | 'ASK_CITY' | 'ASK_LOCATION' | 'ASK_FOCUS' | 'DONE';
export type FitnessLevel = 'beginner' | 'intermediate' | 'advanced';
export type FitnessGoal = 'lose_weight' | 'build_muscle' | 'stay_active' | 'run_faster';
export type WorkoutLocation = 'home' | 'gym';
export type WorkoutFocus = 'upper' | 'glutes' | 'abs' | 'cardio';

export interface UserState {
    phone: string;
    chatId: string;
    name?: string;
    city?: string;
    goal?: FitnessGoal;
    level?: FitnessLevel;

    // Per-session (reset each time they request a workout)
    location?: WorkoutLocation;
    focus?: WorkoutFocus;

    // Status
    status: 'ONBOARDING' | 'ACTIVE' | 'PAUSED' | 'AWAITING_LOCATION' | 'AWAITING_FOCUS';
    onboardingStep?: OnboardingStep;

    // Workout tracking
    streakDays: number;
    completedToday: boolean;
    totalCompletions: number;
    weeklyCompletions: number;
    lastWorkoutDay?: string;

    // Per-focus completion counts — used to alternate workout variations
    upperCompletions: number;
    glutesCompletions: number;
    absCompletions: number;
    cardioCompletions: number;

    // Workout history — last 7 sessions
    workoutHistory: Array<{
        date: string;         // YYYY-MM-DD
        location: WorkoutLocation;
        focus: WorkoutFocus;
    }>;

    // Read-receipt nudge
    lastWorkoutMessageId?: string;
    lastWorkoutSentAt?: Date;
    nudgeSent: boolean;
    nudgeTimer?: ReturnType<typeof setTimeout>;

    lastSkipDay?: string;
}

const users = new Map<string, UserState>();

export function getUser(phone: string): UserState | undefined {
    return users.get(phone);
}

export function upsertUser(phone: string, chatId: string): UserState {
    const existing = users.get(phone);
    if (existing) return existing;
    const newUser: UserState = {
        phone, chatId,
        status: 'ONBOARDING',
        onboardingStep: 'ASK_NAME',
        streakDays: 0,
        completedToday: false,
        totalCompletions: 0,
        weeklyCompletions: 0,
        upperCompletions: 0,
        glutesCompletions: 0,
        absCompletions: 0,
        cardioCompletions: 0,
        workoutHistory: [],
        nudgeSent: false,
    };
    users.set(phone, newUser);
    return newUser;
}

export function updateUser(phone: string, updates: Partial<UserState>): UserState | null {
    const user = users.get(phone);
    if (!user) return null;
    const updated = { ...user, ...updates };
    users.set(phone, updated);
    return updated;
}

export function getAllActiveUsers(): UserState[] {
    return [...users.values()].filter(u => u.status === 'ACTIVE');
}

export function getAllUsers(): UserState[] {
    return [...users.values()];
}

export function resetAllWeeklyCompletions(): void {
    for (const user of users.values()) {
        users.set(user.phone, { ...user, weeklyCompletions: 0 });
    }
}

export function clearNudgeTimer(phone: string): void {
    const user = users.get(phone);
    if (user?.nudgeTimer) {
        clearTimeout(user.nudgeTimer);
        updateUser(phone, { nudgeTimer: undefined });
    }
}

export function logWorkoutToHistory(phone: string, location: WorkoutLocation, focus: WorkoutFocus): void {
    const user = users.get(phone);
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const history = [
        { date: today, location, focus },
        ...user.workoutHistory.filter(h => h.date !== today), // no duplicates for same day
    ].slice(0, 7); // keep last 7
    updateUser(phone, { workoutHistory: history });
}

export function getYesterdayWorkout(phone: string): { location: WorkoutLocation; focus: WorkoutFocus } | null {
    const user = users.get(phone);
    if (!user) return null;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yDate = yesterday.toISOString().split('T')[0];
    return user.workoutHistory.find(h => h.date === yDate) ?? null;
}