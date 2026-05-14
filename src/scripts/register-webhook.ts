// src/scripts/register-webhook.ts
// Run this ONCE to register your webhook subscription with Linq.
// Usage: npx tsx src/scripts/register-webhook.ts

import 'dotenv/config';
import LinqAPIV3 from '@linqapp/sdk';

async function registerWebhook() {
    const linq = new LinqAPIV3({ apiKey: process.env.LINQ_API_KEY! });
    const publicUrl = process.env.PUBLIC_URL;

    if (!publicUrl || publicUrl.includes('your-ngrok-url')) {
        console.error('❌ Set PUBLIC_URL in your .env file first.');
        console.error('   Example: PUBLIC_URL=https://abc123.ngrok.io');
        process.exit(1);
    }

    const targetUrl = `${publicUrl}/webhook?version=2026-02-03`;
    console.log(`\n📡 Registering webhook at: ${targetUrl}`);

    const subscription = await linq.webhookSubscriptions.create({
        target_url: targetUrl,
        subscribed_events: [
            'message.sent',
            'message.received',
            'message.delivered',
            'message.read',
            'message.failed',
            'reaction.added',
            'reaction.removed',
            'chat.typing_indicator.started',
            'chat.typing_indicator.stopped',
        ] as any,
    });

    console.log('\n✅ Webhook registered successfully!');
    console.log(`   ID: ${(subscription as any).id}`);
    console.log(`   Signing secret: ${(subscription as any).signing_secret}`);
    console.log('\n⚠️  IMPORTANT: Copy the signing_secret above into your .env:');
    console.log(`   WEBHOOK_SECRET=${(subscription as any).signing_secret}`);
    console.log('\nThen restart your server.\n');
}

registerWebhook().catch(err => {
    console.error('❌ Failed to register webhook:', err?.message ?? err);
    process.exit(1);
});