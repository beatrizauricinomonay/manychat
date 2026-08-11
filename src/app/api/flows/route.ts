import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createFlow, listFlows } from "@/lib/flowsRepo";

const createFlowSchema = z.object({
  name: z.string().min(1).max(120),
  triggerType: z.enum(["new_message", "keyword", "comment_keyword"]),
  triggerValue: z.string().max(200).optional(),
});

export async function GET() {
  return NextResponse.json({ flows: listFlows() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = createFlowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const flow = createFlow(parsed.data);
  return NextResponse.json({ flow }, { status: 201 });
}
