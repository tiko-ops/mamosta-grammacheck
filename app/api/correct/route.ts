import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();
const rl = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, '3600 s'), // 60/h per IP
  analytics: false,
  prefix: 'rl_mamosta',
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';
const MAX = 10000;

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '0.0.0.0';

    if (typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Ingen text angiven.' }, { status: 400 });
    }
    if (text.length > MAX) {
      return NextResponse.json({ error: `Texten får vara max ${MAX} tecken.` }, { status: 400 });
    }

    // Rate limit
    const { success, remaining } = await rl.limit(`ip:${ip}`);
    const used = 60 - remaining;
    if (!success) {
      await safeLog(ip, false, text.length, 'rate_limit');
      return NextResponse.json({ error: 'Begränsning nådd: försök igen om en stund.' }, { status: 429 });
    }
    const usageNotice =
      used >= 48 ? `Obs! Du har använt ${used}/60 rättningar den här timmen.` : undefined;

    // OpenAI – svensk korrektur, bevara namn
    const system =
      "Du är en svensk korrekturläsare. Korrigera stavning, grammatik och versaler utan att ändra betydelsen. Bevara person- och platsnamn som egennamn. Svara endast med den korrigerade texten utan förklaringar.";

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text },
      ],
      // gpt-4o-mini kräver standardtemp; sätt 1 för säkerhets skull
      temperature: 1,
    });

    const corrected = completion.choices[0]?.message?.content?.trim() || '';
    await safeLog(ip, true, text.length);
    return NextResponse.json({ corrected, usageNotice });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Serverfel i /api/correct' }, { status: 500 });
  }
}

async function safeLog(ip: string, ok: boolean, len: number, code?: string) {
  try {
    const key = `log:${Date.now()}:${ip}`;
    await Redis.fromEnv().hset(key, { ok: ok ? '1' : '0', len: String(len), code: code || '' });
    await Redis.fromEnv().expire(key, 172800); // 2 dagar
  } catch {}
}
