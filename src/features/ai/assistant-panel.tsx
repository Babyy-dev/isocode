"use client";

import { useState, useTransition } from "react";
import type { Booking } from "@/features/bookings/types";
import { generateBuyerAssistance, saveReviewedSummary } from "./actions";

export function AssistantPanel({
  lead,
  onUseDraft,
}: {
  lead: Booking;
  onUseDraft: (draft: string) => void;
}) {
  const [ai, setAi] = useState(lead.ai);
  const [summary, setSummary] = useState(lead.ai?.summary ?? "");
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const allowed =
    lead.aiConsent && !lead.optedOut && lead.status === "Confirmed";

  function generate() {
    startTransition(async () => {
      setMessage("");
      try {
        const result = await generateBuyerAssistance(lead.id, language);
        if (result.error) setMessage(result.error);
        else if (result.ai) {
          setAi(result.ai);
          setSummary(result.ai.summary);
          setMessage(
            "Generated. Check every statement against the buyer's original needs.",
          );
        }
      } catch {
        setMessage("AI request failed. Your manual reply is unchanged.");
      }
    });
  }

  function reviewSummary() {
    if (!ai) return;
    startTransition(async () => {
      try {
        const result = await saveReviewedSummary(
          lead.id,
          summary,
          ai.generatedAt,
        );
        setMessage(result.error ?? "Reviewed summary saved.");
      } catch {
        setMessage("Unable to save the summary. Please try again.");
      }
    });
  }

  return (
    <section
      className="space-y-4 border border-line bg-surface/40 p-5"
      aria-label="AI buyer assistance"
    >
      <div>
        <h3 className="font-semibold">AI buyer assistance</h3>
        <p className="mt-2 text-xs leading-5 text-muted">
          Generated suggestions can be wrong. Compare with the original needs;
          prices always come from the admin table.
        </p>
      </div>
      {!allowed && (
        <p className="text-sm text-muted">
          Generation requires the buyer’s AI permission, an active booking and
          follow-up permission. Buyers can manage this in My bookings.
        </p>
      )}
      <div className="flex flex-wrap items-end gap-4">
        <label className="field-label">
          Draft language
          <select
            className="field"
            disabled={pending}
            value={language}
            onChange={(event) => setLanguage(event.target.value as "en" | "hi")}
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
          </select>
        </label>
        <button
          type="button"
          className="button-primary disabled:opacity-40"
          disabled={pending || !allowed}
          onClick={generate}
        >
          {pending
            ? "Working…"
            : ai
              ? "Regenerate suggestions"
              : "Generate summary & draft"}
        </button>
      </div>
      {ai && (
        <>
          <p className="text-xs text-muted">
            AI-generated · {ai.model} · Human review required
          </p>
          <label className="field-label">
            Buyer summary · editable
            <textarea
              className="field min-h-28"
              value={summary}
              maxLength={1200}
              onChange={(event) => setSummary(event.target.value)}
            />
          </label>
          <button
            type="button"
            className="text-sm text-accent underline disabled:opacity-40"
            disabled={pending || !allowed || !summary.trim()}
            onClick={reviewSummary}
          >
            I checked this summary — save reviewed version
          </button>
          <div className="text-sm">
            <h4 className="font-semibold">Questions and uncertainties</h4>
            {ai.uncertainties.length ? (
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {ai.uncertainties.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-muted">
                No uncertainty was flagged by AI. You must still verify its
                claims.
              </p>
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold">First-reply draft</h4>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-6">
              {ai.draft}
            </p>
          </div>
          <button
            type="button"
            className="text-sm text-accent underline disabled:opacity-40"
            disabled={pending || !allowed}
            onClick={() => onUseDraft(ai.draft)}
          >
            Use draft in reply editor
          </button>
        </>
      )}
      <p role="status" className="text-sm text-accent">
        {message}
      </p>
    </section>
  );
}
