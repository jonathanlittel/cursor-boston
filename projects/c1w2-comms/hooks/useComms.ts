"use client";

import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  type Timestamp,
} from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  COHORT_COMMS_COLLECTION,
  type ChannelId,
  type Message,
} from "@/lib/comms";
import { db } from "@/lib/firebase";

function timestampToIso(value: unknown): string {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in value &&
    typeof (value as Timestamp).toDate === "function"
  ) {
    return (value as Timestamp).toDate().toISOString();
  }
  if (typeof value === "string") return value;
  return new Date().toISOString();
}

export function useComms(channelId: ChannelId) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    if (!db) {
      setLoading(false);
      setError("Firebase is not configured.");
      return;
    }

    setLoading(true);
    setError(null);

    const messagesRef = collection(db, COHORT_COMMS_COLLECTION);
    const q = query(
      messagesRef,
      where("channelId", "==", channelId),
      orderBy("createdAt", "asc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const nextMessages = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            channelId: data.channelId as ChannelId,
            authorHandle:
              typeof data.authorHandle === "string" ? data.authorHandle : "unknown",
            body: typeof data.body === "string" ? data.body : "",
            createdAt: timestampToIso(data.createdAt),
          } satisfies Message;
        });
        setMessages(nextMessages);
        setLoading(false);
      },
      (snapshotError) => {
        console.error("[cohort-comms] snapshot failed:", snapshotError);
        setError("Failed to load messages.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [channelId]);

  const postMessage = useCallback(
    async (authorHandle: string, body: string) => {
      setPosting(true);
      setError(null);

      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ authorHandle, channelId, body }),
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as
            | { error?: string }
            | null;
          throw new Error(payload?.error || "Failed to post message");
        }
      } catch (postError) {
        const message =
          postError instanceof Error ? postError.message : "Failed to post message";
        setError(message);
        throw postError;
      } finally {
        setPosting(false);
      }
    },
    [channelId]
  );

  return { messages, loading, error, posting, postMessage };
}
