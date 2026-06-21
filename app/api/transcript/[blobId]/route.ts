import { NextRequest, NextResponse } from "next/server";
import { readBlob } from "@/lib/walrus";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ blobId: string }> }
) {
  try {
    const { blobId } = await params;
    const transcript = await readBlob(blobId);
    return NextResponse.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to read blob";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
