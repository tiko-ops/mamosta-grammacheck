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
    <div>
      <h1 style={{ fontSize: 28, marginBottom: 8 }}>Rätta din svenska text</h1>
      <p style={{ marginBottom: 16 }}>
        Klistra in texten (max {MAX.toLocaleString('sv-SE')} tecken). Du får tillbaka en korrigerad version direkt nedanför.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16 }}>
        <div id="editor" style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="input" style={{ fontWeight: 600 }}>Din text</label>
          <textarea
            id="input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX}
            placeholder="Skriv eller klistra in här..."
            style={{ width: '100%', minHeight: 200, padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 16 }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={onSubmit}
              disabled={loading}
              style={{ background: '#111', color: '#fff', padding: '10px 16px', borderRadius: 999, border: 'none', cursor: 'pointer' }}
            >
              {loading ? 'Rättar…' : 'Rätta'}
            </button>
            <span style={{ marginLeft: 'auto', fontSize: 12, color: '#666' }}>{text.length}/{MAX}</span>
          </div>
          {usageInfo && (
            <div role="status" style={{ background: '#fff3cd', color: '#664d03', border: '1px solid #ffe69c', padding: 8, borderRadius: 8 }}>
              {usageInfo}
            </div>
          )}
          {error && (
            <div role="alert" style={{ background: '#fde2e1', color: '#8a1c1c', border: '1px solid #f5c2c7', padding: 8, borderRadius: 8 }}>
              {error}
            </div>
          )}
        </div>

        <div id="output" style={{ display: 'grid', gap: 8 }}>
          <label htmlFor="result" style={{ fontWeight: 600 }}>Korrigerad text</label>
          <textarea
            id="result"
            readOnly
            value={result}
            placeholder="Resultatet visas här…"
            style={{ width: '100%', minHeight: 200, padding: 12, borderRadius: 8, border: '1px solid #ccc', fontSize: 16, background: '#fafafa' }}
          />
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              disabled={!result}
              style={{ border: '1px solid #ccc', background: '#fff', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
            >
              Kopiera
            </button>
            <button
              onClick={() => setResult('')}
              disabled={!result}
              style={{ border: '1px solid #ccc', background: '#fff', padding: '8px 12px', borderRadius: 8, cursor: 'pointer' }}
            >
              Rensa
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @media (min-width: 900px) {
          div > div { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
