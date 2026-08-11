import { NextResponse } from "next/server";
import { listRuns } from "@/lib/flowsRepo";

export async function GET() {
  return NextResponse.json({ runs: await listRuns() });
}
