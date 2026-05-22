"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { normalizeHandle } from "@/lib/comms";

interface LoginGateProps {
  onLogin: (handle: string) => void;
}

export function LoginGate({ onLogin }: LoginGateProps) {
  const [handle, setHandle] = useState("");
  const [roster, setRoster] = useState<string[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadRoster() {
      try {
        const response = await fetch("/api/roster");
        if (!response.ok) throw new Error("Failed to load roster");
        const payload = (await response.json()) as { handles?: string[] };
        if (!cancelled) {
          setRoster(Array.isArray(payload.handles) ? payload.handles : []);
        }
      } catch {
        if (!cancelled) {
          setError("Could not load cohort roster. Try again in a moment.");
        }
      } finally {
        if (!cancelled) setLoadingRoster(false);
      }
    }

    loadRoster();
    return () => {
      cancelled = true;
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = normalizeHandle(handle);
    if (!query) return roster.slice(0, 12);
    return roster.filter((entry) => entry.includes(query)).slice(0, 12);
  }, [handle, roster]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = normalizeHandle(handle);
    if (!normalized) {
      setError("Enter your GitHub handle.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/roster?handle=${encodeURIComponent(normalized)}`
      );
      if (!response.ok) throw new Error("Could not verify handle");
      const payload = (await response.json()) as { allowed?: boolean };
      if (!payload.allowed) {
        setError("That handle is not on the cohort roster yet.");
        return;
      }
      onLogin(normalized);
    } catch {
      setError("Could not verify handle. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="shell login-shell">
      <div className="login-card">
        <p className="eyebrow">Cursor Boston · Summer Cohort</p>
        <h1>Cohort Comms</h1>
        <p className="muted">
          Pick your GitHub handle to join the cohort chat. Only handles seen in
          cohort submission PRs can post.
        </p>

        <form className="login-form" onSubmit={handleSubmit}>
          <label className="field">
            <span>GitHub handle</span>
            <input
              value={handle}
              onChange={(event) => setHandle(event.target.value)}
              placeholder="your-handle"
              list="cohort-handles"
              autoComplete="off"
              disabled={submitting}
            />
            <datalist id="cohort-handles">
              {roster.map((entry) => (
                <option key={entry} value={entry} />
              ))}
            </datalist>
          </label>

          {!loadingRoster && suggestions.length > 0 ? (
            <div className="suggestions">
              {suggestions.map((entry) => (
                <button
                  key={entry}
                  type="button"
                  className="suggestion"
                  onClick={() => setHandle(entry)}
                >
                  @{entry}
                </button>
              ))}
            </div>
          ) : null}

          {error ? <p className="error">{error}</p> : null}

          <button type="submit" disabled={submitting || loadingRoster}>
            {submitting ? "Checking…" : "Continue"}
          </button>
        </form>

        {loadingRoster ? (
          <p className="muted roster-status">Loading cohort roster…</p>
        ) : (
          <p className="muted roster-status">{roster.length} handles on roster</p>
        )}
      </div>
    </main>
  );
}
