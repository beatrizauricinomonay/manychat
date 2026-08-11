import type { TriggerType } from "@/lib/types";

const LABELS: Record<TriggerType, string> = {
  new_message: "Nova mensagem",
  keyword: "Palavra-chave (DM)",
  comment_keyword: "Comentário",
};

const COLORS: Record<TriggerType, string> = {
  new_message: "bg-sky-100 text-sky-700",
  keyword: "bg-violet-100 text-violet-700",
  comment_keyword: "bg-amber-100 text-amber-700",
};

export function TriggerBadge({ type }: { type: TriggerType }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${COLORS[type]}`}
    >
      {LABELS[type]}
    </span>
  );
}
