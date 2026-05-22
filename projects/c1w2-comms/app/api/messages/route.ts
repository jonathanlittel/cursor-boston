import { FieldValue } from "firebase-admin/firestore";
import { NextRequest, NextResponse } from "next/server";
import {
  COHORT_COMMS_COLLECTION,
  isChannelId,
  MESSAGE_MAX_LENGTH,
  normalizeHandle,
} from "@/lib/comms";
import { getAdminDb } from "@/lib/firebase-admin";
import { isHandleAllowed } from "@/lib/roster";
import { sanitizeText } from "@/lib/sanitize";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const db = getAdminDb();
    if (!db) {
      return NextResponse.json(
        { error: "Server not configured for messaging" },
        { status: 500 }
      );
    }

    const body = (await request.json()) as Record<string, unknown>;
    const authorHandle = normalizeHandle(
      typeof body.authorHandle === "string" ? body.authorHandle : ""
    );
    const channelId =
      typeof body.channelId === "string" ? body.channelId.trim() : "";
    const messageBody = sanitizeText(
      typeof body.body === "string" ? body.body : ""
    );

    if (!authorHandle) {
      return NextResponse.json({ error: "authorHandle is required" }, { status: 400 });
    }

    if (!(await isHandleAllowed(authorHandle))) {
      return NextResponse.json({ error: "Handle not in cohort roster" }, { status: 403 });
    }

    if (!isChannelId(channelId)) {
      return NextResponse.json({ error: "Invalid channelId" }, { status: 400 });
    }

    if (messageBody.length === 0) {
      return NextResponse.json({ error: "Message body is required" }, { status: 400 });
    }

    if (messageBody.length > MESSAGE_MAX_LENGTH) {
      return NextResponse.json(
        { error: `Message must be at most ${MESSAGE_MAX_LENGTH} characters` },
        { status: 400 }
      );
    }

    const docRef = db.collection(COHORT_COMMS_COLLECTION).doc();
    await docRef.set({
      channelId,
      authorHandle,
      body: messageBody,
      createdAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: docRef.id, ok: true });
  } catch (error) {
    console.error("[cohort-comms] message post failed:", error);
    return NextResponse.json({ error: "Failed to post message" }, { status: 500 });
  }
}
