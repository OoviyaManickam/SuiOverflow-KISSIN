import { NextRequest, NextResponse } from "next/server";
import { getUserCapsules, getCapsuleById } from "@/lib/sui";

export async function GET(req: NextRequest) {
  const address = req.nextUrl.searchParams.get("address");
  const objectId = req.nextUrl.searchParams.get("objectId");

  if (objectId) {
    try {
      const capsule = await getCapsuleById(objectId);
      return NextResponse.json({ capsule });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch capsule";
      return NextResponse.json({ error: message }, { status: 500 });
    }
  }

  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  try {
    const capsules = await getUserCapsules(address);
    return NextResponse.json({ capsules });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch capsules";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
