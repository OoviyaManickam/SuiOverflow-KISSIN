import { NextRequest, NextResponse } from "next/server";
import { storeBlob } from "@/lib/walrus";
import { DebateTranscript } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { transcript, walrusOnly }: { transcript: DebateTranscript; walrusOnly?: boolean } = await req.json();

    let blobId: string | undefined = transcript.walrusBlobId;
    if (!blobId) {
      try {
        blobId = await storeBlob(transcript);
      } catch (err) {
        console.warn("[mint] Walrus store failed:", err);
      }
    }

    if (walrusOnly) {
      return NextResponse.json({ blobId });
    }

    return NextResponse.json({ blobId, capsuleId: null });
  } catch (err) {
    console.error("[mint] failed:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Mint failed" },
      { status: 500 }
    );
  }
}
