import type { LeadMessage } from "../types";

export function MessageTimeline({
  messages,
  title = "Messages",
}: {
  messages: LeadMessage[];
  title?: string;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      {messages.length ? (
        <ol className="mt-3 space-y-4 border-l border-line pl-4">
          {messages.map((message, index) => (
            <MessageItem key={`${message.sentAt}-${index}`} message={message} />
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-xs text-muted">No messages yet.</p>
      )}
      <p className="mt-4 text-xs text-muted">
        Delivery is simulated in this demo: messages are recorded, not sent.
      </p>
    </div>
  );
}

function MessageItem({ message }: { message: LeadMessage }) {
  const automatic = message.sentBy === "system";
  return (
    <li className="relative">
      <span aria-hidden className="absolute -left-[1.3rem] top-1.5 size-2 rounded-full bg-accent" />
      <p className="text-xs text-muted">
        <span className="font-medium text-ink">{message.channel}</span>
        {" · "}
        {automatic ? "Automatic acknowledgement" : `Reply by ${message.sentBy}`}
        {" · "}
        <time dateTime={new Date(message.sentAt).toISOString()}>{formatSentAt(message.sentAt)}</time>
      </p>
      <p className="mt-1 text-sm leading-6">{message.body}</p>
      {message.template && (
        <p className="mt-1 text-[0.7rem] text-muted">Template {message.template}</p>
      )}
    </li>
  );
}

function formatSentAt(timestamp: number) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  }).format(timestamp);
}
