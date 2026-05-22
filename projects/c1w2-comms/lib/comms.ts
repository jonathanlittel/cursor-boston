export interface Channel {
  id: ChannelId;
  name: string;
  description: string;
}

export type ChannelId = "general" | "cursor-help" | "app-feedback";

export interface Message {
  id: string;
  channelId: ChannelId;
  authorHandle: string;
  body: string;
  createdAt: string;
}

export const DEFAULT_CHANNELS: Channel[] = [
  {
    id: "general",
    name: "general",
    description: "Cohort-wide discussion.",
  },
  {
    id: "cursor-help",
    name: "cursor-help",
    description: "Questions about Cursor.",
  },
  {
    id: "app-feedback",
    name: "app-feedback",
    description: "Testing or feedback requests for your app.",
  },
];

export const SESSION_HANDLE_KEY = "c1w2-comms-handle";

export const MESSAGE_MAX_LENGTH = 2000;

export const COHORT_COMMS_COLLECTION = "cohortCommsMessages";

export function isChannelId(value: string): value is ChannelId {
  return DEFAULT_CHANNELS.some((channel) => channel.id === value);
}

export function normalizeHandle(handle: string): string {
  return handle.trim().replace(/^@/, "").toLowerCase();
}

export function getStoredHandle(): string | null {
  if (typeof window === "undefined") return null;
  const raw = window.sessionStorage.getItem(SESSION_HANDLE_KEY);
  if (!raw) return null;
  const normalized = normalizeHandle(raw);
  return normalized.length > 0 ? normalized : null;
}

export function setStoredHandle(handle: string): void {
  window.sessionStorage.setItem(SESSION_HANDLE_KEY, normalizeHandle(handle));
}

export function clearStoredHandle(): void {
  window.sessionStorage.removeItem(SESSION_HANDLE_KEY);
}
