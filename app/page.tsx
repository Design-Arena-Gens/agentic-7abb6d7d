"use client";

import { FormEvent, useMemo, useState } from "react";
import { analyzeMessage, type AnalysisResult } from "@/lib/analyzer";
import { clsx } from "clsx";

type ResultField = keyof AnalysisResult;

const orderedFields: { key: ResultField; label: string }[] = [
  { key: "riskLevel", label: "Risk Level" },
  { key: "reason", label: "Reason" },
  { key: "businessImpact", label: "Business Impact" },
  { key: "recommendedAction", label: "Recommended Action" },
  { key: "suggestedReply", label: "Suggested Reply (if applicable)" },
  { key: "leadQualityScore", label: "Lead Quality Score (if applicable)" },
  { key: "businessInsight", label: "Business Insight" }
];

const quickPrompts = [
  "Hi team, this is the CFO. Please wire $45,000 to the vendor immediately. Use the new account in the attached PDF and confirm within the hour.",
  "Hello, I’m interested in your enterprise analytics suite. We have budget approved for Q3 and need pricing plus implementation timeline this month.",
  "We’re seeing repeated outages on the API since yesterday. Our customers are angry—what is the ETA for a fix? Need escalation."
];

export default function Home() {
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const riskAccent = useMemo(() => {
    if (!result) return "border-slate-700";
    switch (result.riskLevel) {
      case "High Risk Fraud":
        return "border-red-500";
      case "Suspicious":
        return "border-amber-400";
      default:
        return "border-emerald-400";
    }
  }, [result]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!message.trim()) {
      setError("Provide a message to analyze.");
      setResult(null);
      return;
    }
    setError(null);
    const analysis = analyzeMessage(message);
    setResult(analysis);
  };

  return (
    <main className="flex min-h-screen flex-col gap-10 px-6 py-10 md:flex-row md:gap-16 md:px-16">
      <section className="md:w-1/2 space-y-6">
        <div>
          <h1 className="text-3xl font-semibold text-slate-50 md:text-4xl">
            Advanced Business Intelligence AI Agent
          </h1>
          <p className="mt-3 text-slate-300">
            Paste any business message, email, or inquiry. The agent surfaces risk, intent, and next
            steps instantly so your team can act with confidence.
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/70 p-6 shadow-lg backdrop-blur">
          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-slate-300">
              Incoming message
              <textarea
                className="mt-2 h-48 w-full rounded-lg border border-slate-700 bg-slate-950/80 p-3 text-slate-100 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/40"
                placeholder="Paste the email or chat transcript here..."
                value={message}
                onChange={event => setMessage(event.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-amber-400">{error}</p> : null}
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map(prompt => (
                <button
                  key={prompt.slice(0, 12)}
                  type="button"
                  onClick={() => {
                    setMessage(prompt);
                    setResult(analyzeMessage(prompt));
                    setError(null);
                  }}
                  className="rounded-full border border-slate-700 bg-slate-950/80 px-4 py-1.5 text-xs text-slate-300 transition hover:border-sky-400 hover:text-slate-100"
                >
                  Analyze sample
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-sky-400"
            >
              Analyze Message
            </button>
          </form>
        </div>
      </section>
      <section className="md:w-1/2">
        <div
          className={clsx(
            "rounded-2xl border bg-slate-900/50 p-8 shadow-2xl backdrop-blur",
            riskAccent
          )}
        >
          <h2 className="text-xl font-semibold text-slate-100">Decision Brief</h2>
          <p className="mt-1 text-sm text-slate-400">
            Structured summary ready to copy into your workflow.
          </p>
          <div className="mt-6 space-y-5">
            {orderedFields.map(field => (
              <ResultRow
                key={field.key}
                label={field.label}
                value={result ? result[field.key] : null}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ResultRow({
  label,
  value
}: {
  label: string;
  value: AnalysisResult[keyof AnalysisResult] | null;
}) {
  const displayValue =
    value === null || value === "" ? "N/A" : typeof value === "number" ? value.toString() : value;

  return (
    <div className="space-y-1 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}:</p>
      <p className="text-sm text-slate-100 leading-6">{displayValue}</p>
    </div>
  );
}
