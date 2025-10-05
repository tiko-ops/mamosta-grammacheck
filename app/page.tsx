'use client';
import { useState } from 'react';

const MAX = 10000;

export default function Page() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<string | null>(null);

  const onSubmit = async () => {
    setError(null);
    setResult('');
    if (!text.trim()) return;
    if (text.length > MAX) {
      setError(`Texten är för lång. Max ${MAX.toLocaleString('sv-SE')} tecken.`);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Något gick fel');
      setResult(data.corrected);
      if (data.usageNotice) setUsageInfo(data.usageNotice);
    } catch (e: any) {
      setError(e.message || 'Något gick fel. Försök igen.');
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="max-w-5xl mx-auto px-4 py-10">
    <h1 style={{ fontSize: 28, marginBottom: 8 }}>Rätta din svenska text</h1>
    <p style={{ marginBottom: 24 }}>
      Klistra in texten (max {MAX.toLocaleString('sv-SE')} tecken). Du får tillbaka en korrigerad version direkt nedanför.
    </p>

    {/* Din text */}
    <div style={{ marginBottom: 24 }}>
      <label htmlFor="input" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
        Din text
      </label>
      <textarea
        id="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={MAX}
        placeholder="Skriv eller klistra in här..."
        style={{
          width: '100%',
          minHeight: 220,
          padding: 14,
          borderRadius: 10,
          border: '1px solid #ccc',
          fontSize: 16,
          marginBottom: 12,
        }}
      />

      {/* Större rätta-knapp */}
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            background: '#000',
            color: '#fff',
            padding: '14px 36px',
            borderRadius: 999,
            border: 'none',
            fontSize: 18,
            cursor: 'pointer',
            fontWeight: 600,
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Rättar…' : 'Rätta'}
        </button>
      </div>

      <div style={{ marginTop: 8, textAlign: 'right', fontSize: 13, color: '#777' }}>
        {text.length}/{MAX}
      </div>

      {usageInfo && (
        <div
          role="status"
          style={{
            background: '#fff3cd',
            color: '#664d03',
            border: '1px solid #ffe69c',
            padding: 8,
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          {usageInfo}
        </div>
      )}
      {error && (
        <div
          role="alert"
          style={{
            background: '#fde2e1',
            color: '#8a1c1c',
            border: '1px solid #f5c2c7',
            padding: 8,
            borderRadius: 8,
            marginTop: 10,
          }}
        >
          {error}
        </div>
      )}
    </div>

    {/* Korrigerad text */}
    <div>
      <label htmlFor="result" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
        Korrigerad text
      </label>
      <textarea
        id="result"
        readOnly
        value={result}
        placeholder="Resultatet visas här…"
        style={{
          width: '100%',
          minHeight: 220,
          padding: 14,
          borderRadius: 10,
          border: '1px solid #ccc',
          fontSize: 16,
          background: '#fafafa',
          marginBottom: 10,
        }}
      />

      {/* Kopiera och Rensa – närmare rutan */}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-start' }}>
        <button
          onClick={() => navigator.clipboard.writeText(result)}
          disabled={!result}
          style={{
            border: '1px solid #ccc',
            background: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: result ? 'pointer' : 'not-allowed',
          }}
        >
          Kopiera
        </button>
        <button
          onClick={() => setResult('')}
          disabled={!result}
          style={{
            border: '1px solid #ccc',
            background: '#fff',
            padding: '10px 16px',
            borderRadius: 8,
            cursor: result ? 'pointer' : 'not-allowed',
          }}
        >
          Rensa
        </button>
      </div>
    </div>
  </div>
);

