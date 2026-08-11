import { Handle, Position, type NodeProps } from "reactflow";
import type { FlowNodeData } from "@/lib/types";
import { ACTION_META } from "./meta";

const TRIGGER_LABELS: Record<string, string> = {
  new_message: "Qualquer nova DM",
  keyword: "DM contém palavra-chave",
  comment_keyword: "Comentário contém palavra-chave",
};

export function TriggerNode({ data }: NodeProps<FlowNodeData>) {
  return (
    <div className="w-64 rounded-xl border-2 border-fuchsia-400 bg-white shadow-md">
      <div className="rounded-t-[10px] bg-gradient-to-r from-fuchsia-500 to-orange-400 px-3 py-2 text-xs font-semibold text-white">
        ⚡ GATILHO
      </div>
      <div className="px-3 py-3">
        <p className="text-sm font-medium text-slate-800">
          {data.triggerType ? TRIGGER_LABELS[data.triggerType] : "Gatilho"}
        </p>
        {data.keyword && (
          <p className="mt-1 truncate text-xs text-slate-500">
            &quot;{data.keyword}&quot;
          </p>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-fuchsia-500" />
    </div>
  );
}

export function ActionNode({ data, selected }: NodeProps<FlowNodeData>) {
  const meta = ACTION_META[data.kind as keyof typeof ACTION_META];
  if (!meta) return null;

  return (
    <div
      className={`w-64 rounded-xl border-2 bg-white shadow-sm ${meta.color} ${
        selected ? "ring-2 ring-fuchsia-400" : ""
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-500" />
      <div className="flex items-center gap-2 px-3 py-2">
        <span className="text-lg">{meta.icon}</span>
        <span className="text-sm font-semibold text-slate-800">
          {meta.label}
        </span>
      </div>
      <div className="border-t border-black/5 px-3 py-2 text-xs text-slate-600">
        {previewText(data)}
      </div>
      <Handle type="source" position={Position.Right} className="!bg-slate-500" />
    </div>
  );
}

function previewText(data: FlowNodeData): string {
  switch (data.kind) {
    case "send_text":
      return data.text || "Clique para configurar a mensagem";
    case "send_image":
      return data.imageUrl || "Clique para definir a URL da imagem";
    case "quick_replies":
      return data.replies?.length
        ? `${data.text ?? ""} — ${data.replies.join(", ")}`
        : "Clique para configurar as opções";
    case "delay":
      return data.seconds ? `${data.seconds}s de espera` : "Definir tempo de espera";
    case "add_tag":
      return data.tag || "Clique para definir a tag";
    default:
      return "";
  }
}

export const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
};
