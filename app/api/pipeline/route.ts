import { NextRequest, NextResponse } from "next/server";
import { runPipeline } from "@/lib/pipeline";
import { UserProfile } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const user: UserProfile = body.user;
    if (!user?.address) {
      return NextResponse.json({ error: "Missing user profile" }, { status: 400 });
    }
    const transcript = await runPipeline(user);
    return NextResponse.json({ transcript });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
