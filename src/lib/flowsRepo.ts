import { nanoid } from "nanoid";
import { ensureSchema, sql } from "./db";
import type { Flow, FlowEdge, FlowNode, FlowRun, TriggerType } from "./types";

interface FlowRow {
  id: string;
  name: string;
  trigger_type: TriggerType;
  trigger_value: string;
  nodes: FlowNode[] | string;
  edges: FlowEdge[] | string;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

function asArray<T>(value: T[] | string): T[] {
  return typeof value === "string" ? JSON.parse(value) : value;
}

function rowToFlow(row: FlowRow): Flow {
  return {
    id: row.id,
    name: row.name,
    triggerType: row.trigger_type,
    triggerValue: row.trigger_value,
    nodes: asArray(row.nodes),
    edges: asArray(row.edges),
    active: row.active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export async function listFlows(): Promise<Flow[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM flows ORDER BY updated_at DESC
  `) as unknown as FlowRow[];
  return rows.map(rowToFlow);
}

export async function getFlow(id: string): Promise<Flow | null> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM flows WHERE id = ${id}
  `) as unknown as FlowRow[];
  return rows[0] ? rowToFlow(rows[0]) : null;
}

export async function listActiveFlowsByTrigger(
  triggerType: TriggerType
): Promise<Flow[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM flows WHERE active = true AND trigger_type = ${triggerType}
  `) as unknown as FlowRow[];
  return rows.map(rowToFlow);
}

export async function createFlow(input: {
  name: string;
  triggerType: TriggerType;
  triggerValue?: string;
}): Promise<Flow> {
  await ensureSchema();
  const now = new Date();
  const id = nanoid(10);
  const triggerNode: FlowNode = {
    id: "trigger-1",
    type: "trigger",
    position: { x: 40, y: 120 },
    data: {
      label:
        input.triggerType === "new_message"
          ? "Nova mensagem"
          : input.triggerType === "keyword"
          ? "Palavra-chave na DM"
          : "Comentário com palavra-chave",
      kind: "trigger",
      triggerType: input.triggerType,
      keyword: input.triggerValue ?? "",
    },
  };

  await sql`
    INSERT INTO flows (id, name, trigger_type, trigger_value, nodes, edges, active, created_at, updated_at)
    VALUES (
      ${id},
      ${input.name},
      ${input.triggerType},
      ${input.triggerValue ?? ""},
      ${JSON.stringify([triggerNode])}::jsonb,
      ${JSON.stringify([])}::jsonb,
      false,
      ${now},
      ${now}
    )
  `;

  return (await getFlow(id))!;
}

export async function updateFlow(
  id: string,
  input: Partial<{
    name: string;
    triggerType: TriggerType;
    triggerValue: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    active: boolean;
  }>
): Promise<Flow | null> {
  await ensureSchema();
  const existing = await getFlow(id);
  if (!existing) return null;

  const merged = {
    name: input.name ?? existing.name,
    triggerType: input.triggerType ?? existing.triggerType,
    triggerValue: input.triggerValue ?? existing.triggerValue,
    nodes: input.nodes ?? existing.nodes,
    edges: input.edges ?? existing.edges,
    active: input.active ?? existing.active,
  };

  await sql`
    UPDATE flows SET
      name = ${merged.name},
      trigger_type = ${merged.triggerType},
      trigger_value = ${merged.triggerValue},
      nodes = ${JSON.stringify(merged.nodes)}::jsonb,
      edges = ${JSON.stringify(merged.edges)}::jsonb,
      active = ${merged.active},
      updated_at = ${new Date()}
    WHERE id = ${id}
  `;

  return getFlow(id);
}

export async function deleteFlow(id: string): Promise<boolean> {
  await ensureSchema();
  const result = await sql`DELETE FROM flows WHERE id = ${id}`;
  return result.count > 0;
}

export async function recordRun(input: {
  flowId: string;
  flowName: string;
  recipientId?: string | null;
  triggerSummary?: string | null;
  status: "success" | "error" | "skipped";
  detail?: string | null;
}): Promise<void> {
  await ensureSchema();
  await sql`
    INSERT INTO runs (id, flow_id, flow_name, recipient_id, trigger_summary, status, detail, created_at)
    VALUES (
      ${nanoid(10)},
      ${input.flowId},
      ${input.flowName},
      ${input.recipientId ?? null},
      ${input.triggerSummary ?? null},
      ${input.status},
      ${input.detail ?? null},
      ${new Date()}
    )
  `;
}

export async function listRuns(limit = 50): Promise<FlowRun[]> {
  await ensureSchema();
  const rows = (await sql`
    SELECT * FROM runs ORDER BY created_at DESC LIMIT ${limit}
  `) as unknown as {
    id: string;
    flow_id: string;
    flow_name: string;
    recipient_id: string | null;
    trigger_summary: string | null;
    status: "success" | "error" | "skipped";
    detail: string | null;
    created_at: Date;
  }[];

  return rows.map((row) => ({
    id: row.id,
    flowId: row.flow_id,
    flowName: row.flow_name,
    recipientId: row.recipient_id,
    triggerSummary: row.trigger_summary,
    status: row.status,
    detail: row.detail,
    createdAt: row.created_at.toISOString(),
  }));
}
