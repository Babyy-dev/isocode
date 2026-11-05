"use client";

import { useState, useTransition } from "react";
import { demoConsultants } from "@/features/demo/data";
import type { Booking } from "@/features/bookings/types";
import { changeLead } from "./actions";
import { AssistantPanel } from "@/features/ai/assistant-panel";
import type { LeadChange } from "./update-rules";

export function LeadDetail({ lead }: { lead: Booking }) {
  const [pending, startTransition] = useTransition();
  const [reply, setReply] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [message, setMessage] = useState("");
  const eligible = demoConsultants.filter(
    (person) =>
      person.showroom === lead.showroom &&
      (person.models.includes(lead.carId) || !person.models.length),
  );

  function update(change: LeadChange) {
    startTransition(async () => {
      try {
        const result = await changeLead(lead.id, change);
        setMessage(result.error ?? "Lead updated.");
        if (!result.error && change.kind === "reply") {
          setReply("");
          setReviewed(false);
          setMessage(
            "Reply saved to the simulated outbox. No external message sent.",
          );
        }
      } catch {
        setMessage("Unable to update this lead. Please try again.");
      }
    });
  }

  return (
    <section className="space-y-6 border border-line p-6">
      <div>
        <h2 className="text-2xl">{lead.buyer}</h2>
        <p className="mt-2 break-all text-sm">
          Account email: {lead.buyerEmail}
        </p>
        <p className="mt-2 text-sm text-muted">
          {lead.showroom} · {lead.date} {lead.time} IST · {lead.status}
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="field-label">
          Assigned consultant
          <select
            disabled={pending}
            className="field"
            value={lead.consultant}
            onChange={(event) =>
              update({ kind: "assign", value: event.target.value })
            }
          >
            {eligible.map((person) => (
              <option key={person.name}>{person.name}</option>
            ))}
          </select>
        </label>
        <label className="field-label">
          Lead status
          <select
            disabled={pending}
            className="field"
            value={lead.leadStatus}
            onChange={(event) =>
              update({ kind: "status", value: event.target.value })
            }
          >
            {["New", "Contacted", "Won", "Lost"].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
      </div>
      <button
        className="button-primary disabled:opacity-50"
        disabled={pending || !!lead.contactedAt}
        onClick={() => update({ kind: "contact" })}
      >
        {lead.contactedAt
          ? "First contact recorded"
          : "Record first human contact"}
      </button>
      <div className="bg-surface p-5">
        <h3 className="text-sm font-semibold">Buyer needs · original input</h3>
        <p className="mt-3 whitespace-pre-wrap text-sm">
          {lead.needs || "No preferences provided."}
        </p>
      </div>
      <AssistantPanel
        key={`${lead.id}-${lead.ai?.generatedAt ?? 0}`}
        lead={lead}
        onUseDraft={(draft) => {
          setReply(draft);
          setReviewed(false);
        }}
      />
      <label className="field-label">
        Reply editor · review before sending
        <textarea
          className="field min-h-32"
          value={reply}
          maxLength={2000}
          onChange={(event) => {
            setReply(event.target.value);
            setReviewed(false);
          }}
        />
      </label>
      <label className="flex gap-3 text-sm">
        <input
          type="checkbox"
          checked={reviewed}
          onChange={(event) => setReviewed(event.target.checked)}
        />
        I reviewed this reply for accuracy and removed discount promises.
      </label>
      <button
        className="button-primary disabled:opacity-40"
        disabled={pending || !reviewed || !reply.trim() || lead.optedOut}
        onClick={() => update({ kind: "reply", value: reply, reviewed })}
      >
        Send simulated reply
      </button>
      {lead.optedOut && (
        <p className="text-sm text-muted">
          Buyer opted out. Reply sending is suppressed.
        </p>
      )}
      <p role="status" className="text-sm text-accent">
        {message}
      </p>
      <div>
        <h3 className="text-sm font-semibold">Simulated message history</h3>
        {lead.messages.map((body, index) => (
          <p
            className="mt-3 border-t border-line pt-3 text-xs leading-5"
            key={index}
          >
            {body}
          </p>
        ))}
      </div>
    </section>
  );
}
