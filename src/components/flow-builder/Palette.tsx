import type { ActionKind } from "@/lib/types";
import { ACTION_KINDS, ACTION_META } from "./meta";

export function Palette() {
  function onDragStart(event: React.DragEvent, kind: ActionKind) {
    event.dataTransfer.setData("application/x-flow-action", kind);
    event.dataTransfer.effectAllowed = "move";
  }

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 bg-white p-4">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-400">
        Ações
      </h3>
      <p className="mt-1 text-xs text-slate-400">
        Arraste um bloco para o canvas e conecte ao gatilho.
      </p>
      <div className="mt-4 space-y-2">
        {ACTION_KINDS.map((kind) => {
          const meta = ACTION_META[kind];
          return (
            <div
              key={kind}
              draggable
              onDragStart={(e) => onDragStart(e, kind)}
              className={`flex cursor-grab items-center gap-2 rounded-lg border px-3 py-2 text-sm active:cursor-grabbing ${meta.color}`}
            >
              <span className="text-lg">{meta.icon}</span>
              <div>
                <p className="font-medium text-slate-800">{meta.label}</p>
                <p className="text-xs text-slate-500">{meta.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
