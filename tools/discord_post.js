#!/usr/bin/env node
/**
 * Discord Webhook Poster
 * 
 * Usage: 
 *   DISCORD_WEBHOOK_URL=<your-url> node tools/discord_post.js "Your message here"
 * 
 * Example:
 *   DISCORD_WEBHOOK_URL=$WEBHOOK npm run post-discord -- "Added new combat system"
 */

const [,, ...args] = process.argv;
const message = args.join(' ') || 'Aethervine: quick update';

const webhook = process.env.DISCORD_WEBHOOK_URL;

if (!webhook) {
  console.error('❌ ERROR: DISCORD_WEBHOOK_URL environment variable is not set.');
  console.error('');
  console.error('Usage:');
  console.error('  DISCORD_WEBHOOK_URL=<your-webhook-url> node tools/discord_post.js "Your message"');
  console.error('');
  process.exit(1);
}

(async () => {
  try {
    const body = JSON.stringify({ 
      content: `⚔️ **Aethervine Update**\n${message}` 
    });
    
    const res = await fetch(webhook, { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body 
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Failed to post to Discord:', res.status, errorText);
      process.exit(1);
    }
    
    console.log('✅ Posted to Discord successfully.');
  } catch (err) {
    console.error('❌ Error posting to Discord:', err);
    process.exit(1);
  }
})();
