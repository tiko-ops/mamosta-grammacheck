"use client";

import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [usageNotice, setUsageNotice] = useState<string | null>(null);

  const handleCheck = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setOutput("");
    setUsageNotice(null);

    try {
      const response = await fetch("/api/correct", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input }),
      });

      if (!response.ok) {
        const data = await response.json();
        setOutput(data.error || "Något gick fel.");
        setLoading(false);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Ingen ström tillgänglig");

      const decoder = new TextDecoder();
      let result = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        result += chunk;
        setOutput(result);
      }

      const usageHeader = response.headers.get("X-Usage-Notice");
      if (usageHeader) setUsageNotice(usageHeader);
    } catch (err) {
      console.error(err);
      setOutput("Ett fel uppstod vid rättning.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setInput("");
    setOutput("");
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-50 py-12 px-4">
      <div className="w-full max-w-3xl bg-white p-8 rounded-2xl shadow-md">
        <div className="flex flex-col gap-6">
          {/* Rubrik */}
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Mamosta Grammatik-kontroll
          </h1>

          {/* Textinput */}
          <textarea
            className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-gray-800 resize-none"
            rows={8}
            placeholder="Skriv eller klistra in din text här..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />

          {/* Knappar */}
          <div className="flex gap-4 justify-center">
            <button
              onClick={handleCheck}
              disabled={loading}
              className={`px-8 py-2 rounded-lg text-white font-semibold shadow-sm transition-all ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? "Rättar..." : "Rätta"}
            </button>

            <button
              onClick={handleClear}
              disabled={loading}
              className="px-8 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-all"
            >
              Rensa
            </button>
          </div>

          {/* Output */}
          <div>
            <h2 className="text-xl font-semibold text-gray-700 mb-3">
              Korrigerad text
            </h2>
            <textarea
              className="w-full p-4 border rounded-lg bg-gray-50 text-gray-800 focus:outline-none resize-none"
              rows={8}
              readOnly
              value={output}
            />
          </div>

          {/* Usage notice */}
          {usageNotice && (
            <p className="text-sm text-yellow-600 text-center mt-2">
              {usageNotice}
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
