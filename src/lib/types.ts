export type TriggerType = "new_message" | "keyword" | "comment_keyword";

export type ActionKind =
  | "send_text"
  | "send_image"
  | "quick_replies"
  | "delay"
  | "add_tag";

export interface FlowNodeData {
  label: string;
  kind: "trigger" | ActionKind;
  // Trigger config
  triggerType?: TriggerType;
  keyword?: string;
  // send_text
  text?: string;
  // send_image
  imageUrl?: string;
  // quick_replies
  replies?: string[];
  // delay
  seconds?: number;
  // add_tag
  tag?: string;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
}

export interface Flow {
  id: string;
  name: string;
  triggerType: TriggerType;
  triggerValue: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlowRun {
  id: string;
  flowId: string;
  flowName: string;
  recipientId: string | null;
  triggerSummary: string | null;
  status: "success" | "error" | "skipped";
  detail: string | null;
  createdAt: string;
}
