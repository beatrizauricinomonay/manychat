import { listActiveFlowsByTrigger, recordRun } from "./flowsRepo";
import {
  sendImageMessage,
  sendQuickReplies,
  sendTextMessage,
  replyToComment,
} from "./instagram";
import type { Flow, FlowNode } from "./types";

const MAX_DELAY_SECONDS = 10; // limite de segurança em ambiente serverless

export interface IncomingDirectMessage {
  kind: "message";
  senderId: string;
  text: string;
}

export interface IncomingComment {
  kind: "comment";
  commentId: string;
  commenterId: string;
  text: string;
}

export type IncomingEvent = IncomingDirectMessage | IncomingComment;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function findNode(flow: Flow, id: string): FlowNode | undefined {
  return flow.nodes.find((n) => n.id === id);
}

function nextNode(flow: Flow, currentId: string): FlowNode | undefined {
  const edge = flow.edges.find((e) => e.source === currentId);
  if (!edge) return undefined;
  return findNode(flow, edge.target);
}

function matchesFlow(flow: Flow, event: IncomingEvent): boolean {
  if (!flow.active) return false;

  if (event.kind === "message") {
    if (flow.triggerType === "new_message") return true;
    if (flow.triggerType === "keyword") {
      if (!flow.triggerValue.trim()) return false;
      return event.text.toLowerCase().includes(flow.triggerValue.toLowerCase());
    }
    return false;
  }

  if (event.kind === "comment") {
    if (flow.triggerType !== "comment_keyword") return false;
    if (!flow.triggerValue.trim()) return true;
    return event.text.toLowerCase().includes(flow.triggerValue.toLowerCase());
  }

  return false;
}

async function runActionChain(flow: Flow, event: IncomingEvent) {
  const triggerNode = flow.nodes.find((n) => n.data.kind === "trigger");
  if (!triggerNode) {
    recordRun({
      flowId: flow.id,
      flowName: flow.name,
      status: "skipped",
      detail: "Fluxo sem nó de gatilho configurado.",
    });
    return;
  }

  const recipientId =
    event.kind === "message" ? event.senderId : event.commenterId;

  let current = nextNode(flow, triggerNode.id);
  let stepsRun = 0;

  try {
    while (current) {
      stepsRun += 1;
      if (stepsRun > 50) break; // evita loops infinitos em fluxos mal formados

      switch (current.data.kind) {
        case "send_text":
          if (current.data.text) {
            if (event.kind === "comment") {
              await replyToComment(event.commentId, current.data.text);
            } else {
              await sendTextMessage(recipientId, current.data.text);
            }
          }
          break;
        case "send_image":
          if (current.data.imageUrl && event.kind === "message") {
            await sendImageMessage(recipientId, current.data.imageUrl);
          }
          break;
        case "quick_replies":
          if (
            current.data.text &&
            current.data.replies?.length &&
            event.kind === "message"
          ) {
            await sendQuickReplies(
              recipientId,
              current.data.text,
              current.data.replies
            );
          }
          break;
        case "delay": {
          const seconds = Math.min(
            current.data.seconds ?? 0,
            MAX_DELAY_SECONDS
          );
          if (seconds > 0) await sleep(seconds * 1000);
          break;
        }
        case "add_tag":
          // Gestão de contatos/tags fica para uma iteração futura; registramos a intenção.
          break;
        default:
          break;
      }

      current = nextNode(flow, current.id);
    }

    recordRun({
      flowId: flow.id,
      flowName: flow.name,
      recipientId,
      triggerSummary: event.kind === "message" ? event.text : event.text,
      status: "success",
    });
  } catch (error) {
    recordRun({
      flowId: flow.id,
      flowName: flow.name,
      recipientId,
      triggerSummary: event.kind === "message" ? event.text : event.text,
      status: "error",
      detail: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleIncomingEvent(event: IncomingEvent) {
  const triggerType = event.kind === "message" ? "keyword" : "comment_keyword";
  const candidateTriggerTypes =
    event.kind === "message"
      ? (["new_message", "keyword"] as const)
      : (["comment_keyword"] as const);

  const flows = candidateTriggerTypes.flatMap((t) =>
    listActiveFlowsByTrigger(t)
  );

  const matched = flows.filter((flow) => matchesFlow(flow, event));

  await Promise.all(matched.map((flow) => runActionChain(flow, event)));

  return { matchedCount: matched.length, triggerType };
}
