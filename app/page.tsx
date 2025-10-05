//rebuild

'use client';
import { useState } from 'react';

const MAX = 10000;

export default function Page() {
  const [text, setText] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usageInfo, setUsageInfo] = useState<string | null>(null);

  async function onSubmit() {
    setError(null);
    setResult('');
    if (!text.trim()) return;
    if (text.length > MAX) {
      setError(`Texten är för lång. Max ${MAX.toLocaleString('sv-SE')} tecken.`);
      return;
    }

    setLoading(true);
    try {
      const r = await fetch('/api/correct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || 'Något gick fel');
      setResult(data.corrected);
      if (data.usageNotice) setUsageInfo(data.usageNotice);
    } catch (e: any) {
      setError(e.message || 'Något gick fel. Försök igen.');
    } finally {
      setLoading(false);
    }
  }

  function onClear() {
    setText('');
    setResult('');
    setError(null);
    setUsageInfo(null);
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 24 }}>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Rätta din svenska text</h1>
      <p style={{ marginBottom: 16 }}>
        Klistra in texten (max {MAX.toLocaleString('sv-SE')} tecken). Du får tillbaka en korrigerad version direkt nedanför.
      </p>

      <label htmlFor="input" style={{ fontWeight: 600, display: 'block', marginBottom: 8 }}>
        Din text
      </label>
      <textarea
        id="input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Skriv eller klistra in din text här..."
        style={{
          width: '100%',
          minHeight: 220,
          padding: 14,
          borderRadius: 10,
          border: '1px solid #ccc',
          fontSize: 16,
          lineHeight: 1.5,
          marginBottom: 12,
        }}
      />

      {/* Rätta + Rensa knappar */}
      <div
        style={{
          textAlign: 'center',
          display: 'flex',
          justifyContent: 'center',
          gap: 16,
          marginTop: 8,
          marginBottom: 20,
        }}
      >
        <button
          onClick={onSubmit}
          disabled={loading}
          style={{
            background: '#2196f3',
            color: '#fff',
            padding: '16px 40px',
            borderRadius: 999,
            border: 'none',
            fontSize: 18,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.25s, transform 0.1s, boxShadow 0.25s',
            boxShadow: '0 6px 16px rgba(33,150,243,0.25)',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#1976d2')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#2196f3')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          {loading ? 'Rättar…' : 'Rätta'}
        </button>

        <button
          onClick={onClear}
          style={{
            background: '#f5f5f5',
            color: '#333',
            padding: '16px 40px',
            borderRadius: 999,
            border: '1px solid #ccc',
            fontSize: 18,
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.25s, transform 0.1s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = '#e0e0e0')}
          onMouseLeave={(e) => (e.currentTarget.style.background = '#f5f5f5')}
          onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
          onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          Rensa
        </button>
      </div>

      {/* Felmeddelande eller info */}
      {usageInfo && (
        <div
          role="status"
          style={{
            background: '#fff3cd',
            color: '#664d03',
            border: '1px solid #ffe69c',
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
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
            border: '1px solid #f5c2c0',
            padding: 10,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {/* Resultatet */}
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
        }}
      />
    </div>
  );
}
//fix: close component + add clear button
