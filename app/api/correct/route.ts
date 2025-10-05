import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

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
  const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body: form });
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

    const ok = await verifyTurnstile(token ?? null, ip);
    if (!ok) return NextResponse.json({ error: 'Captcha kunde inte verifieras.' }, { status: 400 });

    const system =
      "Du är en svensk korrekturläsare. Korrigera stavning, grammatik och versaler utan att ändra betydelsen. Bevara person- och platsnamn som egennamn. Svara endast med den korrigerade texten utan förklaringar.";

    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: text }
      ],
      temperature: 0.2,
    });

    const corrected = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ corrected });
  } catch (err) {
    console.error('API error:', err);
    return NextResponse.json({ error: 'Serverfel i /api/correct' }, { status: 500 });
  }
}
