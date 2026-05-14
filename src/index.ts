import 'dotenv/config';
import express from 'express';
import crypto from 'crypto';
import cron from 'node-cron';
import LinqAPIV3 from '@linqapp/sdk';
import { handleEvent, askDailyWorkout } from './coach';
import { getAllActiveUsers, resetAllWeeklyCompletions } from './state';

const required = ['LINQ_API_KEY', 'LINQ_PHONE_NUMBER'];
for (const key of required) {
    if (!process.env[key]) {
        console.error(`❌ Missing required env var: ${key}`);
        console.error(`   Copy .env.example to .env and fill in your values.`);
        process.exit(1);
    }
}

const app = express();
const PORT = process.env.PORT ?? 3000;
const linq = new LinqAPIV3({ apiKey: process.env.LINQ_API_KEY! });

// express.raw() must come before express.json() — we need raw bytes for HMAC verification
app.post(
    '/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
        res.status(200).send('OK');

        const timestamp = req.headers['x-webhook-timestamp'] as string;
        const signature = req.headers['x-webhook-signature'] as string;
        const rawBody = req.body.toString('utf8');

        if (process.env.WEBHOOK_SECRET && !verifySignature(rawBody, timestamp, signature)) {
            console.warn('[webhook] ⚠️  Invalid signature — ignoring event');
            return;
        }

        let event: any;
        try {
            event = JSON.parse(rawBody);
        } catch {
            console.warn('[webhook] ⚠️  Failed to parse JSON body — ignoring');
            return;
        }

        if (!event || typeof event !== 'object') {
            console.warn('[webhook] ⚠️  Payload is not an object — ignoring');
            return;
        }
        if (!event.event_type || typeof event.event_type !== 'string') {
            console.warn('[webhook] ⚠️  Missing event_type — ignoring', JSON.stringify(event).slice(0, 100));
            return;
        }
        if (!event.data || typeof event.data !== 'object') {
            console.warn(`[webhook] ⚠️  Missing data field on ${event.event_type} — ignoring`);
            return;
        }

        console.log(`\n[webhook] ← ${event.event_type} (${event.event_id?.slice(0, 8)}...)`);

        handleEvent(linq, event).catch(err => {
            const msg = err instanceof Error ? err.message : String(err);
            console.error(`[webhook] ❌ Error on ${event.event_type}: ${msg}`);
        });
    }
);

app.get('/', (req, res) => {
    res.json({
        status: '💪 Show Up is running',
        webhook: `POST ${req.protocol}://${req.get('host')}/webhook`,
        phone: process.env.LINQ_PHONE_NUMBER,
    });
});

function verifySignature(rawBody: string, timestamp: string, signature: string): boolean {
    if (!timestamp || !signature) return false;
    const signedData = `${timestamp}.${rawBody}`;
    const expected = crypto
        .createHmac('sha256', process.env.WEBHOOK_SECRET!)
        .update(signedData)
        .digest('hex');
    try {
        return crypto.timingSafeEqual(
            Buffer.from(expected, 'hex'),
            Buffer.from(signature, 'hex')
        );
    } catch {
        return false;
    }
}

// Monday midnight — reset weekly completion counts
cron.schedule('0 0 * * 1', () => {
    console.log('\n[cron] 🗓️  Monday midnight — resetting weekly completions');
    resetAllWeeklyCompletions();
});

// 7am daily — ask active users for location and focus, then send their workout
cron.schedule('0 7 * * *', async () => {
    const activeUsers = getAllActiveUsers();
    console.log(`\n[cron] 🌅 7am — sending workouts to ${activeUsers.length} users`);

    const today = new Date().toISOString().split('T')[0];
    for (const user of activeUsers) {
        if (user.completedToday && user.lastWorkoutDay === today) {
            console.log(`[cron] ⏭️  Skipped ${user.phone} — already completed today`);
            continue;
        }
        try {
            await askDailyWorkout(linq, user);
            console.log(`[cron] ✅ Sent to ${user.phone}`);
        } catch (err) {
            console.error(`[cron] ❌ Failed to send to ${user.phone}:`, err);
        }
        await new Promise(r => setTimeout(r, 500));
    }
});

app.listen(PORT, () => {
    console.log(`\n✅ Show Up server running on http://localhost:${PORT}`);
    console.log(`\n📋 Next steps:`);
    console.log(`   1. Run ngrok: ngrok http ${PORT}`);
    console.log(`   2. Copy the https URL from ngrok`);
    console.log(`   3. Register your webhook (see README step 4)`);
    console.log(`   4. Text your Linq number to start testing!\n`);
});
