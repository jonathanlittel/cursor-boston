import type { Message } from "@/lib/comms";

interface MessageListProps {
  messages: Message[];
  loading: boolean;
}

function formatTime(iso: string): string {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function MessageList({ messages, loading }: MessageListProps) {
  if (loading) {
    return <p className="muted empty">Loading messages…</p>;
  }

  if (messages.length === 0) {
    return <p className="muted empty">No messages yet. Start the thread.</p>;
  }

  return (
    <>
      {messages.map((message) => (
        <article key={message.id} className="message">
          <div className="message-meta">
            <strong>@{message.authorHandle}</strong>
            <time dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
          </div>
          <p>{message.body}</p>
        </article>
      ))}
    </>
  );
}
