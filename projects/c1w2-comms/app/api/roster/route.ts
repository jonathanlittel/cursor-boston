import { NextRequest, NextResponse } from "next/server";
import { getCohortRoster, isHandleAllowed } from "@/lib/roster";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const handle = request.nextUrl.searchParams.get("handle");

    if (handle) {
      const allowed = await isHandleAllowed(handle);
      return NextResponse.json({ allowed });
    }

    const handles = await getCohortRoster();
    return NextResponse.json({ handles, count: handles.length });
  } catch (error) {
    console.error("[cohort-comms] roster fetch failed:", error);
    return NextResponse.json(
      { error: "Failed to load cohort roster" },
      { status: 500 }
    );
  }
}
