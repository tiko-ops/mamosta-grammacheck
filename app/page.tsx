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

  const onClear = () => {
    setText('');
    setResult('');
    setError(null);
    setUsageInfo(null);
  };

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 16px' }}>
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

        {/* Rätta + Rensa, sida vid sida */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
          <button
            onClick={onSubmit}
            disabled={loading}
            style={{
              background: '#2196f3',
              color: '#ff
