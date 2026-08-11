import type { Node } from "reactflow";
import type { FlowNodeData } from "@/lib/types";
import { ACTION_META } from "./meta";

export function Inspector({
  node,
  onChange,
  onDelete,
}: {
  node: Node<FlowNodeData> | null;
  onChange: (data: Partial<FlowNodeData>) => void;
  onDelete: () => void;
}) {
  if (!node) {
    return (
      <aside className="w-72 shrink-0 border-l border-slate-200 bg-white p-4">
        <p className="text-sm text-slate-400">
          Selecione um bloco no canvas para configurá-lo.
        </p>
      </aside>
    );
  }

  const isTrigger = node.data.kind === "trigger";

  return (
    <aside className="w-72 shrink-0 border-l border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800">
          {isTrigger
            ? "Gatilho"
            : ACTION_META[node.data.kind as keyof typeof ACTION_META]?.label}
        </h3>
        {!isTrigger && (
          <button
            onClick={onDelete}
            className="text-xs font-medium text-red-500 hover:underline"
          >
            Remover
          </button>
        )}
      </div>

      <div className="mt-4 space-y-4">
        {isTrigger && node.data.triggerType !== "new_message" && (
          <Field label="Palavra-chave">
            <input
              className="input"
              value={node.data.keyword ?? ""}
              onChange={(e) => onChange({ keyword: e.target.value })}
              placeholder="Ex: preço"
            />
          </Field>
        )}

        {node.data.kind === "send_text" && (
          <Field label="Mensagem">
            <textarea
              className="input min-h-24"
              value={node.data.text ?? ""}
              onChange={(e) => onChange({ text: e.target.value })}
              placeholder="Digite a mensagem que será enviada"
            />
          </Field>
        )}

        {node.data.kind === "send_image" && (
          <Field label="URL da imagem">
            <input
              className="input"
              value={node.data.imageUrl ?? ""}
              onChange={(e) => onChange({ imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </Field>
        )}

        {node.data.kind === "quick_replies" && (
          <>
            <Field label="Mensagem">
              <textarea
                className="input min-h-20"
                value={node.data.text ?? ""}
                onChange={(e) => onChange({ text: e.target.value })}
                placeholder="Escolha uma opção:"
              />
            </Field>
            <Field label="Opções (uma por linha)">
              <textarea
                className="input min-h-20"
                value={(node.data.replies ?? []).join("\n")}
                onChange={(e) =>
                  onChange({
                    replies: e.target.value
                      .split("\n")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
                placeholder={"Sim\nNão"}
              />
            </Field>
          </>
        )}

        {node.data.kind === "delay" && (
          <Field label="Segundos de espera (máx. 10)">
            <input
              type="number"
              min={1}
              max={10}
              className="input"
              value={node.data.seconds ?? 1}
              onChange={(e) =>
                onChange({ seconds: Number(e.target.value) })
              }
            />
          </Field>
        )}

        {node.data.kind === "add_tag" && (
          <Field label="Tag">
            <input
              className="input"
              value={node.data.tag ?? ""}
              onChange={(e) => onChange({ tag: e.target.value })}
              placeholder="Ex: cliente-interessado"
            />
          </Field>
        )}
      </div>
    </aside>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-500">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
