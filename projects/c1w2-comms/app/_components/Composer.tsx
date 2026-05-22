"use client";

import { FormEvent, useState } from "react";
import { MESSAGE_MAX_LENGTH } from "@/lib/comms";

interface ComposerProps {
  channelName: string;
  authorHandle: string;
  posting: boolean;
  onSend: (body: string) => Promise<void>;
}

export function Composer({
  channelName,
  authorHandle,
  posting,
  onSend,
}: ComposerProps) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!body) return;

    setError(null);
    try {
      await onSend(body);
      setDraft("");
    } catch (submitError) {
      const message =
        submitError instanceof Error ? submitError.message : "Failed to send message";
      setError(message);
    }
  }

  return (
    <form className="composer" onSubmit={handleSubmit}>
      <textarea
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        placeholder={`Message #${channelName}`}
        rows={3}
        maxLength={MESSAGE_MAX_LENGTH}
        disabled={posting}
      />
      <div className="composer-actions">
        <span className="muted">Posting as @{authorHandle}</span>
        <button type="submit" disabled={posting || !draft.trim()}>
          {posting ? "Sending…" : "Send"}
        </button>
      </div>
      {error ? <p className="error">{error}</p> : null}
    </form>
  );
}
