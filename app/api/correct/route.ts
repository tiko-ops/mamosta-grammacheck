import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const rl = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '3600 s'), // 60/h per IP
  analytics: false,
  prefix: 'rl_mamosta'
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX = 10000;

async function verifyTurnstile(token: string | null, ip: string) {
  if (!token) return false;
  const secret = process.env.TURNSTILE_SECRET_KEY!;
  const form = new URLSearchParams();
  form.append('secret', secret);
  form.append('response', token);
  form.append('remoteip', ip);
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    body: form,
  });
  const data = await r.json();
  return !!data.success;
}

export async function POST(req: NextRequest) {
  try {
    const { text, token } = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Ingen text angiven.' }, { status: 400 });
    }
    if (text.length > MAX) {
      return NextResponse.json({ error: `Texten får vara max ${MAX} tecken.` }, { status: 400 });
    }

    // Captcha
    const ok = await verifyTurnstile(token ?? null, ip);
    if (!ok) {
      return NextResponse.json({ error: 'Captcha kunde inte verifieras.' }, { status: 400 });
    }

    // Rate limit
    const { success, remaining } = await rl.limit(`ip:${ip}`);
    const used = 60 - remaining;
    if (!success) {
      await safeLog(ip, false, text.length, 'rate_limit');
      return NextResponse.json({ error: 'Begränsning nådd: försök igen om en stund.' }, { status: 429 });
    }
    const usageNotice = used >= 48 ? `Obs! Du har använt ${used}/60 rättningar den här timmen.` : undefined;

    // OpenAI – korrektur endast svenska, bevara namn
    const system = `Du är en svensk korrekturläsare. Korrigera stavning, grammatik och versaler utan att ändra betydelsen. Bevara person- och platsnamn som egennamn. Svara endast med den korrigerade texten utan
