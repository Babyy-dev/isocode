import type { Language } from "@/lib/i18n/language";
import { messagingCopy } from "../copy";
import type { LeadMessage } from "../types";

export function MessageTimeline({
  messages,
  title,
  language = "en",
}: {
  messages: LeadMessage[];
  title: string;
  language?: Language;
}) {
  const copy = messagingCopy[language];
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {messages.length ? (
        <ol className="mt-3 space-y-4 border-l border-line pl-4">
          {messages.map((message, index) => (
            <MessageItem key={`${message.sentAt}-${index}`} message={message} language={language} />
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-xs text-muted">{copy.empty}</p>
      )}
      <p className="mt-4 text-xs text-muted">
        {copy.simulated}
      </p>
    </div>
  );
}

function MessageItem({ message, language }: { message: LeadMessage; language: Language }) {
  const copy = messagingCopy[language];
  const automatic = message.sentBy === "system";
  return (
    <li className="relative">
      <span aria-hidden className="absolute -left-[1.3rem] top-1.5 size-2 rounded-full bg-accent" />
      <p className="text-xs text-muted">
        <span className="font-medium text-ink">{message.channel}</span>
        {" · "}
        {automatic ? copy.automatic : copy.replyBy(message.sentBy)}
        {" · "}
        <time dateTime={new Date(message.sentAt).toISOString()}>
          {formatSentAt(message.sentAt, language)}
        </time>
      </p>
      <p className="mt-1 text-sm leading-6">{message.body}</p>
      {message.template && (
        <p className="mt-1 text-[0.7rem] text-muted">
          {copy.template} {message.template}
        </p>
      )}
    </li>
  );
}

function formatSentAt(timestamp: number, language: Language) {
  return new Intl.DateTimeFormat(language === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(timestamp);
}
