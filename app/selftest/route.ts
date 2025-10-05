import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET() {
  try {
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    // Gör en enkel completion för att verifiera nyckeln
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'Svara endast med ordet OK.' },
        { role: 'user', content: 'Test' }
      ],
      temperature: 1,
    });
    const txt = completion.choices[0]?.message?.content?.trim() || '';
    return NextResponse.json({ ok: true, reply: txt });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
