"use client";

import { useEffect, useMemo, useState } from "react";
import { ChannelSidebar } from "@/app/_components/ChannelSidebar";
import { Composer } from "@/app/_components/Composer";
import { LoginGate } from "@/app/_components/LoginGate";
import { MessageList } from "@/app/_components/MessageList";
import { useComms } from "@/hooks/useComms";
import {
  clearStoredHandle,
  DEFAULT_CHANNELS,
  getStoredHandle,
  setStoredHandle,
  type ChannelId,
} from "@/lib/comms";

export default function HomePage() {
  const [handle, setHandle] = useState<string | null>(null);
  const [activeChannelId, setActiveChannelId] = useState<ChannelId>("general");
  const { messages, loading, error, posting, postMessage } =
    useComms(activeChannelId);

  useEffect(() => {
    setHandle(getStoredHandle());
  }, []);

  const activeChannel = useMemo(
    () =>
      DEFAULT_CHANNELS.find((channel) => channel.id === activeChannelId) ??
      DEFAULT_CHANNELS[0],
    [activeChannelId]
  );

  function handleLogin(nextHandle: string) {
    setStoredHandle(nextHandle);
    setHandle(nextHandle);
  }

  function handleSwitchUser() {
    clearStoredHandle();
    setHandle(null);
  }

  if (!handle) {
    return <LoginGate onLogin={handleLogin} />;
  }

  return (
    <main className="shell">
      <header className="header">
        <div>
          <p className="eyebrow">Cursor Boston · Summer Cohort</p>
          <h1>Cohort Comms</h1>
          <p className="muted">
            Three focused channels for the build cohort. Messages sync live for
            everyone on the roster.
          </p>
        </div>
        <div className="header-actions">
          <span className="user-chip">@{handle}</span>
          <button type="button" className="link-button" onClick={handleSwitchUser}>
            Switch user
          </button>
        </div>
      </header>

      <div className="layout">
        <ChannelSidebar
          activeChannelId={activeChannelId}
          onSelect={setActiveChannelId}
        />

        <section className="panel" aria-label={`${activeChannel.name} channel`}>
          <div className="panel-header">
            <div>
              <h2>#{activeChannel.name}</h2>
              <p className="muted">{activeChannel.description}</p>
            </div>
          </div>

          <div className="messages" role="log" aria-live="polite">
            <MessageList messages={messages} loading={loading} />
          </div>

          {error ? <p className="error panel-error">{error}</p> : null}

          <Composer
            channelName={activeChannel.name}
            authorHandle={handle}
            posting={posting}
            onSend={(body) => postMessage(handle, body)}
          />
        </section>
      </div>
    </main>
  );
}
