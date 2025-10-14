import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Körs på Edge för snabbare streaming
export const runtime = "edge";

// --- Konfiguration ---
const redis = Redis.fromEnv();
const rl = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(60, "3600 s"), // 60 rättningar / timme per IP
  analytics: false,
  prefix: "rl_mamosta",
});

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const MAX = 10000;

// --- API handler ---
export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "0.0.0.0";

    if (typeof text !== "string" || !text.trim()) {
      return NextResponse.json({ error: "Ingen text angiven." }, { status: 400 });
    }

    if (text.length > MAX) {
      return NextResponse.json(
        { error: `Texten får vara max ${MAX} tecken.` },
        { status: 400 }
      );
    }

    // --- Rate limit ---
    const { success, remaining } = await rl.limit(`ip:${ip}`);
    const used = 60 - remaining;
    if (!success) {
      await safeLog(ip, false, text.length, "rate_limit");
      return NextResponse.json(
        { error: "Begränsning nådd: försök igen om en stund." },
        { status: 429 }
      );
    }

    const usageNotice =
      used >= 48 ? `Obs! Du har använt ${used}/60 rättningar den här timmen.` : "";

    // --- OpenAI prompt ---
    const system =
      "Du är en svensk korrekturläsare. Korrigera stavning, grammatik och versaler utan att ändra betydelsen. Bevara person- och platsnamn som egennamn. Svara endast med den korrigerade texten utan förklaringar.";

    // --- Skapa streaming-svar ---
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: text },
      ],
      temperature: 0.2,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) controller.enqueue(encoder.encode(delta));
          }
        } catch (err) {
          console.error("Stream error:", err);
          controller.enqueue(encoder.encode("\n[Fel vid strömning av svar]"));
        } finally {
          controller.close();
          await safeLog(ip, true, text.length);
        }
      },
    });

    // --- Skicka som textström ---
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Usage-Notice": usageNotice,
      },
    });
  } catch (err) {
    console.error("API error:", err);
    return NextResponse.json(
      { error: "Serverfel i /api/correct" },
      { status: 500 }
    );
  }
}

// --- Loggning ---
async function safeLog(ip: string, ok: boolean, len: number, code?: string) {
  try {
    const key = `log:${Date.now()}:${ip}`;
    await Redis.fromEnv().hset(key, {
      ok: ok ? "1" : "0",
      len: String(len),
      code: code || "",
    });
    await Redis.fromEnv().expire(key, 172800); // 2 dagar
  } catch (err) {
    console.warn("Log error:", err);
  }
}
