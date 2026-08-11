import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { deleteFlow, getFlow, updateFlow } from "@/lib/flowsRepo";

const nodeDataSchema = z.object({
  label: z.string(),
  kind: z.enum([
    "trigger",
    "send_text",
    "send_image",
    "quick_replies",
    "delay",
    "add_tag",
  ]),
  triggerType: z.enum(["new_message", "keyword", "comment_keyword"]).optional(),
  keyword: z.string().optional(),
  text: z.string().optional(),
  imageUrl: z.string().optional(),
  replies: z.array(z.string()).optional(),
  seconds: z.number().optional(),
  tag: z.string().optional(),
});

const nodeSchema = z.object({
  id: z.string(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }),
  data: nodeDataSchema,
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
});

const updateFlowSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  triggerType: z.enum(["new_message", "keyword", "comment_keyword"]).optional(),
  triggerValue: z.string().max(200).optional(),
  nodes: z.array(nodeSchema).optional(),
  edges: z.array(edgeSchema).optional(),
  active: z.boolean().optional(),
});

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const flow = getFlow(id);
  if (!flow) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ flow });
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const parsed = updateFlowSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const flow = updateFlow(id, parsed.data);
  if (!flow) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ flow });
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const ok = deleteFlow(id);
  if (!ok) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
