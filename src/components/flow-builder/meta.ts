import type { ActionKind } from "@/lib/types";

export const ACTION_META: Record<
  ActionKind,
  { label: string; icon: string; color: string; description: string }
> = {
  send_text: {
    label: "Enviar texto",
    icon: "💬",
    color: "border-sky-300 bg-sky-50",
    description: "Envia uma mensagem de texto",
  },
  send_image: {
    label: "Enviar imagem",
    icon: "🖼️",
    color: "border-violet-300 bg-violet-50",
    description: "Envia uma imagem por URL",
  },
  quick_replies: {
    label: "Respostas rápidas",
    icon: "🔘",
    color: "border-emerald-300 bg-emerald-50",
    description: "Mensagem com botões de resposta",
  },
  delay: {
    label: "Aguardar",
    icon: "⏱️",
    color: "border-amber-300 bg-amber-50",
    description: "Espera alguns segundos",
  },
  add_tag: {
    label: "Adicionar tag",
    icon: "🏷️",
    color: "border-rose-300 bg-rose-50",
    description: "Marca o contato com uma tag",
  },
};

export const ACTION_KINDS: ActionKind[] = [
  "send_text",
  "send_image",
  "quick_replies",
  "delay",
  "add_tag",
];
