import { nanoid } from "nanoid";
import { db } from "./db";
import type { Flow, FlowEdge, FlowNode, FlowRun, TriggerType } from "./types";

interface FlowRow {
  id: string;
  name: string;
  trigger_type: TriggerType;
  trigger_value: string;
  nodes: string;
  edges: string;
  active: number;
  created_at: string;
  updated_at: string;
}

function rowToFlow(row: FlowRow): Flow {
  return {
    id: row.id,
    name: row.name,
    triggerType: row.trigger_type,
    triggerValue: row.trigger_value,
    nodes: JSON.parse(row.nodes) as FlowNode[],
    edges: JSON.parse(row.edges) as FlowEdge[],
    active: Boolean(row.active),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function listFlows(): Flow[] {
  const rows = db
    .prepare("SELECT * FROM flows ORDER BY updated_at DESC")
    .all() as FlowRow[];
  return rows.map(rowToFlow);
}

export function getFlow(id: string): Flow | null {
  const row = db.prepare("SELECT * FROM flows WHERE id = ?").get(id) as
    | FlowRow
    | undefined;
  return row ? rowToFlow(row) : null;
}

export function listActiveFlowsByTrigger(triggerType: TriggerType): Flow[] {
  const rows = db
    .prepare("SELECT * FROM flows WHERE active = 1 AND trigger_type = ?")
    .all(triggerType) as FlowRow[];
  return rows.map(rowToFlow);
}

export function createFlow(input: {
  name: string;
  triggerType: TriggerType;
  triggerValue?: string;
}): Flow {
  const now = new Date().toISOString();
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

  db.prepare(
    `INSERT INTO flows (id, name, trigger_type, trigger_value, nodes, edges, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, 0, ?, ?)`
  ).run(
    id,
    input.name,
    input.triggerType,
    input.triggerValue ?? "",
    JSON.stringify([triggerNode]),
    JSON.stringify([]),
    now,
    now
  );

  return getFlow(id)!;
}

export function updateFlow(
  id: string,
  input: Partial<{
    name: string;
    triggerType: TriggerType;
    triggerValue: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    active: boolean;
  }>
): Flow | null {
  const existing = getFlow(id);
  if (!existing) return null;

  const merged = {
    name: input.name ?? existing.name,
    triggerType: input.triggerType ?? existing.triggerType,
    triggerValue: input.triggerValue ?? existing.triggerValue,
    nodes: input.nodes ?? existing.nodes,
    edges: input.edges ?? existing.edges,
    active: input.active ?? existing.active,
  };

  db.prepare(
    `UPDATE flows SET name = ?, trigger_type = ?, trigger_value = ?, nodes = ?, edges = ?, active = ?, updated_at = ?
     WHERE id = ?`
  ).run(
    merged.name,
    merged.triggerType,
    merged.triggerValue,
    JSON.stringify(merged.nodes),
    JSON.stringify(merged.edges),
    merged.active ? 1 : 0,
    new Date().toISOString(),
    id
  );

  return getFlow(id);
}

export function deleteFlow(id: string): boolean {
  const result = db.prepare("DELETE FROM flows WHERE id = ?").run(id);
  return result.changes > 0;
}

export function recordRun(input: {
  flowId: string;
  flowName: string;
  recipientId?: string | null;
  triggerSummary?: string | null;
  status: "success" | "error" | "skipped";
  detail?: string | null;
}): void {
  db.prepare(
    `INSERT INTO runs (id, flow_id, flow_name, recipient_id, trigger_summary, status, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    nanoid(10),
    input.flowId,
    input.flowName,
    input.recipientId ?? null,
    input.triggerSummary ?? null,
    input.status,
    input.detail ?? null,
    new Date().toISOString()
  );
}

export function listRuns(limit = 50): FlowRun[] {
  const rows = db
    .prepare("SELECT * FROM runs ORDER BY created_at DESC LIMIT ?")
    .all(limit) as {
    id: string;
    flow_id: string;
    flow_name: string;
    recipient_id: string | null;
    trigger_summary: string | null;
    status: "success" | "error" | "skipped";
    detail: string | null;
    created_at: string;
  }[];

  return rows.map((row) => ({
    id: row.id,
    flowId: row.flow_id,
    flowName: row.flow_name,
    recipientId: row.recipient_id,
    triggerSummary: row.trigger_summary,
    status: row.status,
    detail: row.detail,
    createdAt: row.created_at,
  }));
}
