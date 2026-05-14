// src/workouts.ts
// Workouts organized by location (home/gym) x focus (upper/glutes/abs/cardio) x level
// Each slot has 2 variations — alternates based on focus completion count

export interface Workout {
    title: string;
    emoji: string;
    duration: string;
    benefit: string;
    exercises: string[];
    tip: string;
    videoUrl: string;
}

export type Level = 'beginner' | 'intermediate' | 'advanced';
export type Location = 'home' | 'gym';
export type Focus = 'upper' | 'glutes' | 'abs' | 'cardio';

const YT = (q: string) => `https://youtube.com/results?search_query=${encodeURIComponent(q)}`;

type WorkoutDB = Record<Location, Record<Focus, Record<Level, [Workout, Workout]>>>;

const WORKOUTS: WorkoutDB = {
    home: {
        upper: {
            beginner: [
                {
                    title: 'Home Upper Body', emoji: '💪', duration: '25 min',
                    benefit: 'No equipment needed — just your bodyweight. These moves build real pushing and pulling strength from scratch.',
                    exercises: [
                        'Wall push-ups: 3x12 (chest to wall, core tight)',
                        'Incline push-ups on a chair: 3x10',
                        'Tricep dips on chair: 3x10',
                        'Superman hold: 3x10 (back strength)',
                        'Arm circles: 3x20 each direction',
                    ],
                    tip: 'Do not rush. 2 seconds down, pause, push up. That tempo is where the strength comes from.',
                    videoUrl: YT('beginner upper body workout at home no equipment'),
                },
                {
                    title: 'Home Upper Body', emoji: '💪', duration: '25 min',
                    benefit: 'Push-up negatives build more strength than regular push-ups — lowering slowly forces every muscle fiber to work.',
                    exercises: [
                        'Push-up negatives: 3x8 (5 seconds down, drop and reset)',
                        'Incline push-ups wide grip: 3x10',
                        'Shoulder tap plank: 3x10 each side',
                        'Y-T-W raises lying face down: 3x10 each',
                        'Towel pull-apart: 3x15 (hold towel taut, pull ends apart)',
                    ],
                    tip: 'On push-up negatives, go as slow as you possibly can on the way down. That is the whole workout.',
                    videoUrl: YT('beginner upper body push up negative Y T W raise home'),
                },
            ],
            intermediate: [
                {
                    title: 'Home Upper Body', emoji: '💪', duration: '35 min',
                    benefit: 'Push-pull balance is everything. This hits chest, shoulders, back, and arms without touching a gym.',
                    exercises: [
                        'Standard push-ups: 4x15 (3 sec descent)',
                        'Wide push-ups: 3x12 (more chest)',
                        'Diamond push-ups: 3x10 (triceps)',
                        'Doorframe rows: 3x12 (pull yourself in)',
                        'Pike push-ups: 3x10 (shoulder press alternative)',
                        'Plank shoulder taps: 3x20',
                    ],
                    tip: 'Vary your hand width on push-ups — each position hits a different muscle.',
                    videoUrl: YT('intermediate upper body home workout push pull'),
                },
                {
                    title: 'Home Upper Body', emoji: '💪', duration: '35 min',
                    benefit: 'Tempo training and inverted rows challenge your muscles in ways standard push-ups cannot.',
                    exercises: [
                        'Tempo push-ups (3s down, 1s hold): 4x12',
                        'Pseudo planche push-ups: 3x10 (lean forward, hands by hips)',
                        'Inverted row under a table: 3x12',
                        'Close-grip push-ups: 3x12',
                        'Pike push-up hold at bottom: 3x8',
                        'Superman row: 3x12',
                    ],
                    tip: 'Inverted rows under a table are a hidden gem. Pull your chest all the way to the edge.',
                    videoUrl: YT('intermediate upper body tempo push up inverted row home'),
                },
            ],
            advanced: [
                {
                    title: 'Home Upper Body — Max', emoji: '🔥', duration: '45 min',
                    benefit: 'Explosive push-ups and archer variations are as hard as anything you will do in a gym.',
                    exercises: [
                        'Archer push-ups: 4x8 each side (single arm loading)',
                        'Explosive clap push-ups: 4x10',
                        'Pike push-ups: 4x12 (slow and controlled)',
                        'Decline push-ups (feet on chair): 4x15',
                        'Tricep push-ups: 3x15',
                        'Plank to downward dog: 3x12',
                    ],
                    tip: 'Archer push-ups are harder than they look. Lower slowly — that is the whole workout.',
                    videoUrl: YT('advanced home upper body calisthenics workout'),
                },
                {
                    title: 'Home Upper Body — Power', emoji: '🔥', duration: '45 min',
                    benefit: 'Typewriter push-ups and one-arm progressions train strength at angles most people never reach.',
                    exercises: [
                        'Typewriter push-ups: 4x8 each side',
                        'One-arm push-up negatives (elevated): 4x6 each side',
                        'Hindu push-ups: 3x15',
                        'Handstand wall hold: 3x20s',
                        'Planche lean hold: 3x20s',
                        'Tuck planche hold: 3x15s',
                    ],
                    tip: 'For one-arm negatives, start with your hand on a raised surface. Lower as slow as you can.',
                    videoUrl: YT('advanced home upper body typewriter push up one arm handstand'),
                },
            ],
        },
        glutes: {
            beginner: [
                {
                    title: 'Home Glute Builder', emoji: '🍑', duration: '25 min',
                    benefit: 'Strong glutes protect your knees and lower back — and are the most undertrained muscle for most people.',
                    exercises: [
                        'Glute bridges: 3x20 (squeeze hard at top)',
                        'Bodyweight squats: 3x15 (sit back, not down)',
                        'Donkey kicks: 3x15 each side',
                        'Fire hydrants: 3x15 each side',
                        'Standing glute kickbacks: 3x15 each side',
                    ],
                    tip: 'Squeeze your glutes at the TOP of every single rep. That is the whole point.',
                    videoUrl: YT('beginner glute workout at home no equipment'),
                },
                {
                    title: 'Home Glute Builder', emoji: '🍑', duration: '25 min',
                    benefit: 'Slow controlled reps with holds activate deep glute fibers that fast reps miss entirely.',
                    exercises: [
                        'Single-leg glute bridge: 3x12 each side (2s squeeze at top)',
                        'Sumo squat with 3s hold at bottom: 3x12',
                        'Reverse lunge: 3x10 each side',
                        'Standing hip abduction: 3x15 each side',
                        'Glute bridge pulse: 3x20',
                    ],
                    tip: 'The 2-second squeeze at the top of each bridge is where the glute actually gets trained.',
                    videoUrl: YT('beginner glute workout single leg bridge sumo squat hold home'),
                },
            ],
            intermediate: [
                {
                    title: 'Home Glute Builder', emoji: '🍑', duration: '40 min',
                    benefit: 'Single-leg work forces each side to work independently — fixing imbalances and building serious strength.',
                    exercises: [
                        'Single-leg glute bridges: 4x15 each side',
                        'Sumo squats: 4x15 (wide stance, toes out)',
                        'Reverse lunges: 3x12 each leg',
                        'Bulgarian split squats (rear foot on chair): 3x10 each',
                        'Banded clamshells: 3x20 each side (use a band if you have one)',
                        'Glute bridge hold: 3x30s (isometric)',
                    ],
                    tip: 'Bulgarian split squats are humbling. Go slow, go deep, feel it in the working glute.',
                    videoUrl: YT('intermediate glute workout at home single leg'),
                },
                {
                    title: 'Home Glute Builder', emoji: '🍑', duration: '40 min',
                    benefit: 'Explosive movements recruit fast-twitch glute fibers for a different kind of burn than slow reps.',
                    exercises: [
                        'Squat jumps: 4x12 (land soft, load the glutes)',
                        'Curtsy lunges: 4x12 each side',
                        'Hip thrust with 3s hold: 4x12',
                        'Step-up on stairs: 3x12 each leg',
                        'Side-lying hip abduction: 3x20 each side',
                        'Glute bridge walkout: 3x10',
                    ],
                    tip: 'Curtsy lunges hit the gluteus medius — the side of your glutes that most people completely miss.',
                    videoUrl: YT('intermediate glute workout home curtsy lunge squat jump explosive'),
                },
            ],
            advanced: [
                {
                    title: 'Home Glutes — Max Burn', emoji: '🔥', duration: '45 min',
                    benefit: 'Pistol squats and single-leg hinges build glute strength that transfers to every athletic movement.',
                    exercises: [
                        'Pistol squat (assisted if needed): 4x8 each side',
                        'Single-leg Romanian deadlift: 4x10 each (balance challenge)',
                        'Elevated single-leg bridge: 4x15 each side',
                        'Jump squats: 3x15 (explosive)',
                        'Sumo squat to calf raise: 3x15',
                        'Glute bridge march: 3x20 alternating',
                    ],
                    tip: 'Keep your hips square on single-leg movements. Rotation means your glute is not working.',
                    videoUrl: YT('advanced glute workout at home pistol squat'),
                },
                {
                    title: 'Home Glutes — Max Power', emoji: '🔥', duration: '45 min',
                    benefit: 'Nordic curls and jumping lunges train the glutes and hamstrings explosively — the combination that builds real athletic power.',
                    exercises: [
                        'Nordic hamstring curl (feet under sofa): 4x6 (slow negative)',
                        'Jumping split squat: 4x10 each side',
                        'Single-leg hip thrust: 4x12 each side',
                        'Frog pump: 3x25 (feet together, knees out)',
                        'Explosive step-up: 3x10 each side',
                        'Wall sit: 3x45s',
                    ],
                    tip: 'Nordic curls are the hardest bodyweight hamstring exercise. Use your arms to break the fall at the bottom.',
                    videoUrl: YT('advanced glute workout home nordic curl jumping split squat'),
                },
            ],
        },
        abs: {
            beginner: [
                {
                    title: 'Home Abs', emoji: '⚡', duration: '20 min',
                    benefit: 'A strong core protects your spine and makes every movement more powerful. This is your foundation.',
                    exercises: [
                        'Plank hold: 3x20s (build to 60s)',
                        'Crunches: 3x15 (exhale at the top)',
                        'Leg raises: 3x10 (lower back pressed flat)',
                        'Dead bug: 3x8 each side (slow and controlled)',
                        'Side plank: 2x15s each side',
                    ],
                    tip: 'Every rep should be intentional. Slow and controlled beats fast and sloppy every time.',
                    videoUrl: YT('beginner ab workout home core strengthening'),
                },
                {
                    title: 'Home Abs', emoji: '⚡', duration: '20 min',
                    benefit: 'Functional core work — anti-rotation and balance — protects your spine in real everyday movements.',
                    exercises: [
                        'Bird dog: 3x10 each side (slow and controlled)',
                        'Hollow body hold: 3x15s (arms and legs extended)',
                        'Glute bridge march: 3x10 each side',
                        'Modified V-sit: 3x10',
                        'Plank with knee tap: 3x10 each side',
                    ],
                    tip: 'Hollow body hold is harder than it looks. Keep your lower back pressed flat to the floor the entire time.',
                    videoUrl: YT('beginner core workout home bird dog hollow body hold'),
                },
            ],
            intermediate: [
                {
                    title: 'Home Abs', emoji: '⚡', duration: '30 min',
                    benefit: 'Rotation and anti-rotation work trains your core the way it actually functions in real life.',
                    exercises: [
                        'Plank: 3x45s',
                        'Bicycle crunches: 3x20 (full rotation, slow)',
                        'Reverse crunches: 3x15 (hips off floor)',
                        'Russian twists: 3x20 (feet off floor)',
                        'Mountain climbers: 3x30s (controlled)',
                        'V-ups: 3x12',
                    ],
                    tip: 'Russian twists with feet off the floor double the intensity. Try it.',
                    videoUrl: YT('intermediate ab workout home core rotation'),
                },
                {
                    title: 'Home Abs', emoji: '⚡', duration: '30 min',
                    benefit: 'Core endurance work means your abs can support you through an entire workout, not just the first few reps.',
                    exercises: [
                        'Hollow body rock: 3x20',
                        'Single-leg lowering: 3x10 each side (slow)',
                        'Side plank with hip dip: 3x12 each side',
                        'Toe touches: 3x20',
                        'Bear crawl: 3x20s (knees 2 inches off floor)',
                        'Plank to elbow: 3x12 each side',
                    ],
                    tip: 'Bear crawl looks easy. Keep your knees 2 inches off the ground the whole time — you will feel it everywhere.',
                    videoUrl: YT('intermediate core workout home hollow body rock bear crawl'),
                },
            ],
            advanced: [
                {
                    title: 'Home Abs — Brutalist Edition', emoji: '💀', duration: '35 min',
                    benefit: 'These movements challenge your core through full range — not just crunching, but controlling.',
                    exercises: [
                        'Ab wheel rollout: 4x10 (if you have one, or use a towel on a hard floor)',
                        'L-sit hold: 3x15s (on floor or chairs)',
                        'Tuck to extend: 3x12',
                        'Side plank with rotation: 3x10 each',
                        'Dragon flag negatives: 3x6 (slow descent only)',
                        'Plank to pike: 3x12',
                    ],
                    tip: 'Dragon flag negatives are elite-level core work. Lower as slowly as you possibly can.',
                    videoUrl: YT('advanced ab workout home dragon flag l-sit'),
                },
                {
                    title: 'Home Abs — Strength Edition', emoji: '💀', duration: '35 min',
                    benefit: 'Heavy bodyweight core work builds dense functional abs that actually support lifting and athletic movement.',
                    exercises: [
                        'Tuck planche hold: 4x15s',
                        'Windshield wipers (lying): 4x10 each side',
                        'Single-leg V-up: 3x10 each side',
                        'Copenhagen plank: 3x20s each side',
                        'Reverse plank: 3x30s',
                        'Ab wheel rollout: 4x10',
                    ],
                    tip: 'Copenhagen plank trains the inner thighs and core together — a combo almost nobody does but everyone needs.',
                    videoUrl: YT('advanced core workout home windshield wipers copenhagen plank'),
                },
            ],
        },
        cardio: {
            beginner: [
                {
                    title: 'Home Cardio', emoji: '🏃', duration: '20 min',
                    benefit: 'Getting your heart rate up at home is 100% possible — and burns more calories than most people expect.',
                    exercises: [
                        'March in place: 2 min (warm up)',
                        'Step touches side to side: 3 min',
                        'Bodyweight squats x20, rest 30s: x3 rounds',
                        'Modified jumping jacks (low impact): 3 min',
                        'Walk outside or around your home: 10 min brisk',
                    ],
                    tip: 'Low impact does not mean low effort. Move with intention.',
                    videoUrl: YT('beginner low impact home cardio workout'),
                },
                {
                    title: 'Home Cardio', emoji: '🏃', duration: '20 min',
                    benefit: 'Consistent low-impact movement builds your aerobic base without stressing your joints.',
                    exercises: [
                        'March in place with arm swings: 3 min',
                        'Standing side steps: 3 min',
                        'Standing knee raises: 3 min',
                        'Slow squat to stand: 3x15',
                        'Cool down walk: 8 min brisk',
                    ],
                    tip: 'The goal is elevated heart rate, not pain. If you can hold a conversation, you are at the right intensity.',
                    videoUrl: YT('beginner low impact home cardio standing movements'),
                },
            ],
            intermediate: [
                {
                    title: 'Home Cardio Circuit', emoji: '🏃', duration: '30 min',
                    benefit: 'HIIT burns calories for hours after you finish — way more efficient than steady-state cardio.',
                    exercises: [
                        'Jumping jacks: 45s on, 15s rest x3',
                        'High knees: 45s on, 15s rest x3',
                        'Burpees: 10 reps x4 (full range)',
                        'Jump squats: 15 reps x3',
                        'Speed skaters: 45s on, 15s rest x3',
                        'Finisher: 5 min jog in place',
                    ],
                    tip: 'Go ALL OUT on the work intervals. The rest is there — use it.',
                    videoUrl: YT('intermediate HIIT cardio workout at home'),
                },
                {
                    title: 'Home Cardio Circuit', emoji: '🏃', duration: '30 min',
                    benefit: 'Full-body circuit training burns more calories than single-exercise cardio because every muscle is working.',
                    exercises: [
                        'Inchworm to push-up: 10 reps x4',
                        'Lateral shuffles: 45s on, 15s rest x3',
                        'Squat jumps: 15 reps x3',
                        'Plank jacks: 45s on, 15s rest x3',
                        'Bear crawl forward and back: 30s x3',
                        'Finisher: 3 min max burpees',
                    ],
                    tip: 'Plank jacks keep your core engaged the whole time — way harder than regular jumping jacks.',
                    videoUrl: YT('intermediate home cardio full body circuit inchworm lateral shuffle'),
                },
            ],
            advanced: [
                {
                    title: 'Home Cardio — Maximum Burn', emoji: '🔥', duration: '40 min',
                    benefit: 'Tabata-style intervals push your VO2 max higher than almost any other training method.',
                    exercises: [
                        'Tabata burpees: 8 rounds (20s on, 10s off)',
                        'Tabata jump squats: 8 rounds',
                        'Tabata mountain climbers: 8 rounds',
                        'Tabata high knees: 8 rounds',
                        'Cool down jog: 5 min',
                    ],
                    tip: 'Tabata is 4 minutes per exercise. It will feel like forever. That is the point.',
                    videoUrl: YT('advanced tabata HIIT workout home cardio'),
                },
                {
                    title: 'Home Cardio — Endurance', emoji: '🔥', duration: '40 min',
                    benefit: 'Longer intervals build lactate threshold — your ability to sustain hard effort without fading.',
                    exercises: [
                        'EMOM 10 min: 10 burpees at the top of every minute',
                        'AMRAP 10 min: 15 jump squats, 10 push-ups, 5 tuck jumps',
                        'Tabata sprints in place: 8 rounds (20s on, 10s off)',
                        'Cool down walk: 5 min',
                    ],
                    tip: 'EMOM means Every Minute On the Minute. Start the reps at 0:00, rest whatever is left of the minute.',
                    videoUrl: YT('advanced home cardio EMOM AMRAP endurance workout'),
                },
            ],
        },
    },

    gym: {
        upper: {
            beginner: [
                {
                    title: 'Gym Upper Body', emoji: '💪', duration: '40 min',
                    benefit: 'Machines are perfect for beginners — they guide your movement so you can feel the muscles without worrying about form.',
                    exercises: [
                        'Chest press machine: 3x12 (moderate weight)',
                        'Lat pulldown machine: 3x12 (full range)',
                        'Seated shoulder press machine: 3x12',
                        'Cable bicep curl: 3x12',
                        'Tricep pushdown: 3x12',
                    ],
                    tip: 'Ask a gym staff member to set up the machines for you if this is your first time. That is what they are there for.',
                    videoUrl: YT('beginner gym upper body machine workout'),
                },
                {
                    title: 'Gym Upper Body', emoji: '💪', duration: '40 min',
                    benefit: 'Cable machines allow full range of motion and constant tension — perfect for building the mind-muscle connection.',
                    exercises: [
                        'Cable chest fly: 3x15 (light, full stretch)',
                        'Seated cable row: 3x12',
                        'Lateral raise machine: 3x15',
                        'Cable tricep pushdown (rope): 3x12',
                        'Cable bicep curl: 3x12',
                    ],
                    tip: 'Cable flys have a stretch at the bottom that a machine press never gives you. Go light and feel it.',
                    videoUrl: YT('beginner gym upper body cable fly seated row machine'),
                },
            ],
            intermediate: [
                {
                    title: 'Gym Upper Body', emoji: '💪', duration: '50 min',
                    benefit: 'Free weights force your stabilizer muscles to work — building real-world strength that machines alone cannot.',
                    exercises: [
                        'Bench press: 4x10 (spotter if going heavy)',
                        'Dumbbell rows: 4x12 each arm',
                        'Overhead press: 3x10',
                        'Pull-ups or lat pulldown: 3x10',
                        'Face pulls: 3x15 (shoulder health)',
                        'Dumbbell curls: 3x12',
                    ],
                    tip: 'Bench press first while your chest is fresh. Rows second. Always push before you pull.',
                    videoUrl: YT('intermediate gym upper body push pull workout'),
                },
                {
                    title: 'Gym Upper Body', emoji: '💪', duration: '50 min',
                    benefit: 'Incline and cable angles hit different portions of the muscle — training the full chest and shoulder, not just the middle.',
                    exercises: [
                        'Incline dumbbell press: 4x12',
                        'Cable rows (wide grip): 4x12',
                        'Arnold press: 3x10',
                        'Incline dumbbell curl: 3x12',
                        'Overhead tricep extension: 3x12',
                        'Cable lateral raise: 3x15',
                    ],
                    tip: 'Arnold press rotates through the full shoulder range. Slower is better — feel every degree of the movement.',
                    videoUrl: YT('intermediate gym upper body incline dumbbell arnold press cable'),
                },
            ],
            advanced: [
                {
                    title: 'Gym Upper Body — Heavy', emoji: '🔥', duration: '60 min',
                    benefit: 'Compound lifts with heavy weight build the kind of strength and muscle density you cannot get any other way.',
                    exercises: [
                        'Barbell bench press: 5x5 (heavy — leave 1 rep in tank)',
                        'Weighted pull-ups: 4x8',
                        'Barbell overhead press: 4x8',
                        'Barbell rows: 4x10',
                        'Incline DB press: 3x12',
                        'Cable face pulls: 3x15',
                        'Superset: Barbell curls + Skull crushers: 3x10 each',
                    ],
                    tip: 'Bench press + barbell rows is the classic push-pull superset. Do them back to back if the gym is not packed.',
                    videoUrl: YT('advanced gym upper body heavy barbell workout'),
                },
                {
                    title: 'Gym Upper Body — Volume', emoji: '🔥', duration: '60 min',
                    benefit: 'High-volume training with moderate weight creates metabolic stress — the driver of muscle size alongside heavy compound work.',
                    exercises: [
                        'Incline barbell press: 4x10',
                        'Weighted chin-ups: 4x8',
                        'Cable crossover: 4x15 (full squeeze)',
                        'Single-arm DB row: 4x12 each',
                        'Lateral raise dropset: 4x15 (drop weight on last set)',
                        'Superset: EZ bar curl + Close-grip bench: 3x10 each',
                    ],
                    tip: 'Dropset the last set of lateral raises — go to failure, drop the weight by half, go to failure again.',
                    videoUrl: YT('advanced gym upper body volume training incline press cable crossover'),
                },
            ],
        },
        glutes: {
            beginner: [
                {
                    title: 'Gym Glute Day', emoji: '🍑', duration: '40 min',
                    benefit: 'The gym gives you access to the hip thrust machine — the single best exercise for glute activation.',
                    exercises: [
                        'Hip thrust machine (or barbell on bench): 4x15',
                        'Leg press (feet high and wide): 3x15',
                        'Cable kickbacks: 3x15 each side',
                        'Abductor machine: 3x20',
                        'Romanian deadlift (light): 3x12',
                    ],
                    tip: 'Hip thrusts are the most important exercise on this list. Master them before going heavy.',
                    videoUrl: YT('beginner gym glute workout hip thrust machine'),
                },
                {
                    title: 'Gym Glute Day', emoji: '🍑', duration: '40 min',
                    benefit: 'Resistance machines isolate individual glute muscles safely — ideal for learning what activation actually feels like.',
                    exercises: [
                        'Glute kickback machine: 4x15 each side',
                        'Abductor machine: 3x20',
                        'Leg press (high and wide): 3x15',
                        'Smith machine squat: 3x12',
                        'Seated hip adductor machine: 3x15',
                    ],
                    tip: 'Before each set, squeeze your glute hard for 5 seconds. It primes the muscle and helps you feel it during the set.',
                    videoUrl: YT('beginner gym glutes machine workout abductor kickback smith squat'),
                },
            ],
            intermediate: [
                {
                    title: 'Gym Glute Day', emoji: '🍑', duration: '50 min',
                    benefit: 'Loading the glutes with barbells and cables creates muscle growth that bodyweight alone cannot achieve.',
                    exercises: [
                        'Barbell hip thrust: 4x12 (heavy)',
                        'Romanian deadlift: 4x10 (feel the hamstring stretch)',
                        'Sumo squats with DB: 4x12',
                        'Cable kickbacks: 3x15 each',
                        'Bulgarian split squat: 3x10 each',
                        'Abductor machine: 3x20 (burnout)',
                    ],
                    tip: 'Barbell hip thrusts should be your heaviest lift of the day. Load it up.',
                    videoUrl: YT('intermediate gym glute workout barbell hip thrust'),
                },
                {
                    title: 'Gym Glute Day', emoji: '🍑', duration: '50 min',
                    benefit: 'Paused reps and tempo training increase time under tension — the key driver of glute growth beyond just moving weight.',
                    exercises: [
                        'Barbell hip thrust with 2s pause: 4x10',
                        'Dumbbell walking lunges: 4x12 each',
                        'Leg press (feet high): 4x15',
                        'Cable pull-through: 3x15',
                        'Hip abductor machine: 3x20',
                        'Single-leg Romanian deadlift: 3x10 each',
                    ],
                    tip: 'The 2-second pause on hip thrusts removes momentum entirely. Every rep is earned.',
                    videoUrl: YT('intermediate gym glute workout paused hip thrust walking lunge'),
                },
            ],
            advanced: [
                {
                    title: 'Gym Glutes — Max Load', emoji: '🔥', duration: '55 min',
                    benefit: 'Heavy barbell work plus isolation finishers hits every fiber of your glutes — from deep to superficial.',
                    exercises: [
                        'Barbell hip thrust: 5x8 (as heavy as possible)',
                        'Barbell Romanian deadlift: 4x8 (heavy)',
                        'Walking lunges with dumbbells: 4x12 each',
                        'Single-leg press: 3x12 each',
                        'Cable pull-throughs: 3x15',
                        'Banded clamshells: 3x20 each (finisher)',
                    ],
                    tip: 'Pause at the top of every hip thrust for 1 second and really squeeze. It doubles the effectiveness.',
                    videoUrl: YT('advanced gym glute workout heavy barbell hip thrust'),
                },
                {
                    title: 'Gym Glutes — Hypertrophy', emoji: '🔥', duration: '55 min',
                    benefit: 'Combining heavy compound lifts with isolation finishers hits every glute fiber — deep, surface, and sides.',
                    exercises: [
                        'Barbell squat (wide stance): 5x6 (heavy)',
                        'Barbell Romanian deadlift: 4x10',
                        'Barbell hip thrust: 4x10',
                        'Cable kickback: 3x15 each side',
                        'Sumo deadlift: 3x8',
                        'Monster walks with band: 3x20 steps each direction',
                    ],
                    tip: 'Sumo deadlifts shift the load to the glutes and inner thighs more than conventional. Pull the floor apart with your feet.',
                    videoUrl: YT('advanced gym glute hypertrophy barbell squat sumo deadlift'),
                },
            ],
        },
        abs: {
            beginner: [
                {
                    title: 'Gym Abs', emoji: '⚡', duration: '25 min',
                    benefit: 'Cable machines allow you to load your abs progressively — something you cannot do with bodyweight alone.',
                    exercises: [
                        'Cable crunch: 3x15 (light weight, full range)',
                        'Plank hold: 3x30s',
                        'Seated ab machine: 3x15',
                        'Leg raises on captain chair: 3x10',
                        'Side bends with DB: 3x12 each',
                    ],
                    tip: 'Keep the weight light on cable crunches. This is about feeling your abs — not lifting.',
                    videoUrl: YT('beginner gym abs workout cable machine'),
                },
                {
                    title: 'Gym Abs', emoji: '⚡', duration: '25 min',
                    benefit: 'Variety in angles and movements ensures all parts of the core get trained — not just the surface abs.',
                    exercises: [
                        'Rope cable crunch: 3x15',
                        'Lying leg raise: 3x12',
                        'Oblique crunch on decline bench: 3x12 each side',
                        'Plank: 3x30s',
                        'Woodchop (cable, light): 3x12 each side',
                    ],
                    tip: 'Woodchops train rotation — the way your core actually works in real life. Keep arms straight and rotate from the torso.',
                    videoUrl: YT('beginner gym abs woodchop oblique decline bench cable crunch'),
                },
            ],
            intermediate: [
                {
                    title: 'Gym Abs', emoji: '⚡', duration: '30 min',
                    benefit: 'Heavy cable work plus hanging exercises builds the thick, strong core that actually shows.',
                    exercises: [
                        'Cable crunch: 4x15 (add weight progressively)',
                        'Hanging knee raises: 3x15',
                        'Russian twists with plate: 3x20',
                        'Pallof press: 3x12 each side (anti-rotation)',
                        'Plank: 3x45s',
                        'Ab wheel: 3x10',
                    ],
                    tip: 'Pallof press is the most underrated ab exercise in the gym. Try it.',
                    videoUrl: YT('intermediate gym abs workout cable hanging raises'),
                },
                {
                    title: 'Gym Abs', emoji: '⚡', duration: '30 min',
                    benefit: 'Combining stability work with loaded movements builds a core that can brace heavy and move powerfully.',
                    exercises: [
                        'Hanging knee raises: 4x15',
                        'Cable woodchop: 4x12 each side',
                        'Decline sit-up with rotation: 3x15',
                        'Pallof press: 3x12 each side',
                        'Plank with cable pull: 3x10 each side',
                        'Ab rollout: 3x10',
                    ],
                    tip: 'Plank with cable pull is as hard as it sounds. Stay square, do not rotate, pull smooth.',
                    videoUrl: YT('intermediate gym abs cable woodchop hanging knee raise pallof press'),
                },
            ],
            advanced: [
                {
                    title: 'Gym Abs — Elite', emoji: '💀', duration: '35 min',
                    benefit: 'Hanging leg raises and heavy cable work build functional core strength that transfers to every other lift.',
                    exercises: [
                        'Hanging straight leg raises: 4x12',
                        'Cable crunch (heavy): 4x15',
                        'Pallof press: 4x12 each side',
                        'Ab wheel rollout: 4x10',
                        'Decline weighted crunch: 3x15',
                        'Dragon flag: 3x6 (slow negatives)',
                    ],
                    tip: 'Dragon flags will reveal every weakness in your core. They are worth it.',
                    videoUrl: YT('advanced gym abs workout hanging dragon flag cable'),
                },
                {
                    title: 'Gym Abs — Power', emoji: '💀', duration: '35 min',
                    benefit: 'Heavy loaded core work trains the abs to resist and generate force — essential for any heavy compound lifting.',
                    exercises: [
                        'Weighted hanging leg raise: 4x10 (hold dumbbell between feet)',
                        'Heavy cable crunch: 4x15',
                        'Landmine rotation: 4x10 each side',
                        'Ab wheel rollout: 4x10',
                        'Suitcase carry: 3x30s each side (heavy dumbbell)',
                        'Dragon flag: 3x6',
                    ],
                    tip: 'Suitcase carries train your obliques to resist lateral bend. Walk slow and stay perfectly tall.',
                    videoUrl: YT('advanced gym abs weighted hanging leg raise landmine rotation suitcase carry'),
                },
            ],
        },
        cardio: {
            beginner: [
                {
                    title: 'Gym Cardio', emoji: '🏃', duration: '25 min',
                    benefit: 'Low-impact cardio machines are easy on your joints while still getting your heart rate up effectively.',
                    exercises: [
                        'Treadmill walk (incline 5-8): 15 min',
                        'Stationary bike (moderate resistance): 10 min',
                        'Stretch and cool down: 5 min',
                    ],
                    tip: 'Incline walking burns almost as many calories as jogging but is much easier on your knees.',
                    videoUrl: YT('beginner gym cardio treadmill incline walk'),
                },
                {
                    title: 'Gym Cardio', emoji: '🏃', duration: '25 min',
                    benefit: 'Elliptical and rowing build cardiovascular base without the impact stress of running — better for your joints long-term.',
                    exercises: [
                        'Elliptical (moderate resistance): 15 min',
                        'Row machine (easy pace): 10 min',
                        'Stretch and cool down: 5 min',
                    ],
                    tip: 'On the elliptical, push through your heels and squeeze your glutes. It is not just a leg movement.',
                    videoUrl: YT('beginner gym cardio elliptical rowing machine low impact'),
                },
            ],
            intermediate: [
                {
                    title: 'Gym Cardio Circuit', emoji: '🏃', duration: '35 min',
                    benefit: 'Mixing machines with HIIT intervals keeps your heart rate elevated and burns more than single-machine cardio.',
                    exercises: [
                        'Treadmill intervals: 1 min sprint, 1 min walk x8',
                        'Row machine: 10 min (consistent pace)',
                        'Stairmaster: 10 min (moderate)',
                        'Cool down walk: 5 min',
                    ],
                    tip: 'The row machine is the most underused piece of cardio equipment in every gym. It burns everything.',
                    videoUrl: YT('intermediate gym cardio intervals treadmill rowing machine'),
                },
                {
                    title: 'Gym Cardio Circuit', emoji: '🏃', duration: '35 min',
                    benefit: 'Alternating between upper and lower body cardio machines keeps the heart rate elevated without fatiguing one muscle group.',
                    exercises: [
                        'Rowing machine: 5 min hard, 2 min easy x3',
                        'Elliptical intervals: 1 min hard, 1 min easy x8',
                        'Stairmaster: 5 min (top speed you can hold)',
                        'Cool down treadmill walk: 5 min',
                    ],
                    tip: 'Rowing machine intervals build your back and legs while doing cardio. It is the most efficient machine in the gym.',
                    videoUrl: YT('intermediate gym cardio rowing elliptical stairmaster intervals'),
                },
            ],
            advanced: [
                {
                    title: 'Gym Cardio — Destroyer', emoji: '🔥', duration: '45 min',
                    benefit: 'Multi-modal cardio challenges your body in different ways — preventing adaptation and maximizing burn.',
                    exercises: [
                        'Assault bike: 10 min (as hard as you can hold)',
                        'Treadmill 5K: target sub-25 min',
                        'Row machine: 2000m for time',
                        'Stairmaster: 10 min (top speed you can hold)',
                    ],
                    tip: 'Assault bike is the hardest cardio machine in the gym. 10 minutes on it will humble you.',
                    videoUrl: YT('advanced gym cardio assault bike rowing 5k'),
                },
                {
                    title: 'Gym Cardio — Max Effort', emoji: '🔥', duration: '45 min',
                    benefit: 'Threshold training — sustained hard effort just below max — builds the engine that powers every other workout you do.',
                    exercises: [
                        'Row machine: 3x1000m (target under 4:30 each)',
                        'Assault bike: 5 min max effort',
                        'Treadmill incline run (10% grade): 15 min',
                        'Cool down walk: 5 min',
                    ],
                    tip: 'Incline running at 10% grade is 50% harder than flat. Cut your pace, not your effort.',
                    videoUrl: YT('advanced gym cardio threshold training rowing incline treadmill'),
                },
            ],
        },
    },
};

export function getWorkout(level: Level, location: Location, focus: Focus, focusCount: number): Workout {
    return WORKOUTS[location][focus][level][focusCount % 2];
}

export function formatWorkout(workout: Workout): string {
    const exerciseList = workout.exercises.map(e => `→ ${e}`).join('\n');

    return [
        `${workout.emoji} ${workout.title} (${workout.duration})`,
        '',
        `🎯 Why this works:`,
        workout.benefit,
        '',
        exerciseList,
        '',
        `💡 ${workout.tip}`,
        '',
        `🎥 Watch the form: ${workout.videoUrl}`,
        '',
        `Reply DONE when you crush it ✅`,
        `Or react ❤️ to log it instantly.`,
    ].join('\n');
}

export function getLevelFromText(text: string): Level | null {
    const t = text.toLowerCase().trim();
    if (t === '1' || t.includes('beginner') || t.includes('start') || t.includes('new')) return 'beginner';
    if (t === '2' || t.includes('intermediate') || t.includes('some') || t.includes('occasionally')) return 'intermediate';
    if (t === '3' || t.includes('advanced') || t.includes('regular') || t.includes('athlete')) return 'advanced';
    return null;
}

export function getGoalFromText(text: string): string | null {
    const t = text.toLowerCase();
    if (t.includes('weight') || t.includes('lose') || t.includes('fat') || t === '1') return 'lose_weight';
    if (t.includes('muscle') || t.includes('strong') || t.includes('bulk') || t === '2') return 'build_muscle';
    if (t.includes('active') || t.includes('health') || t === '3') return 'stay_active';
    if (t.includes('run') || t.includes('cardio') || t.includes('endur') || t === '4') return 'run_faster';
    return null;
}

export function getLocationFromText(text: string): Location | null {
    const t = text.toLowerCase();
    if (t.includes('home') || t.includes('house') || t.includes('apartment') || t === '1' || t.includes('here')) return 'home';
    if (t.includes('gym') || t.includes('studio') || t.includes('fitness') || t === '2') return 'gym';
    return null;
}

export function getFocusFromText(text: string): Focus | null {
    const t = text.toLowerCase();
    if (t.includes('upper') || t.includes('chest') || t.includes('arm') || t.includes('shoulder') || t.includes('back') || t === '1') return 'upper';
    if (t.includes('glute') || t.includes('booty') || t.includes('butt') || t.includes('leg') || t.includes('lower') || t === '2') return 'glutes';
    if (t.includes('ab') || t.includes('core') || t.includes('stomach') || t.includes('belly') || t === '3') return 'abs';
    if (t.includes('cardio') || t.includes('run') || t.includes('sweat') || t.includes('burn') || t === '4') return 'cardio';
    return null;
}
