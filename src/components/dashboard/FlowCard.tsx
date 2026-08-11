"use client";

import Link from "next/link";
import { useState } from "react";
import type { Flow } from "@/lib/types";
import { TriggerBadge } from "./TriggerBadge";

export function FlowCard({
  flow,
  onChange,
}: {
  flow: Flow;
  onChange: () => void;
}) {
  const [busy, setBusy] = useState(false);

  async function toggleActive() {
    setBusy(true);
    await fetch(`/api/flows/${flow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !flow.active }),
    });
    setBusy(false);
    onChange();
  }

  async function remove() {
    if (!confirm(`Excluir a automação "${flow.name}"?`)) return;
    setBusy(true);
    await fetch(`/api/flows/${flow.id}`, { method: "DELETE" });
    setBusy(false);
    onChange();
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/flows/${flow.id}`}
            className="truncate font-semibold text-slate-900 hover:underline"
          >
            {flow.name}
          </Link>
          <TriggerBadge type={flow.triggerType} />
        </div>
        {flow.triggerValue && (
          <p className="mt-1 text-sm text-slate-500">
            Gatilho: &quot;{flow.triggerValue}&quot;
          </p>
        )}
        <p className="mt-1 text-xs text-slate-400">
          {flow.nodes.length - 1 > 0
            ? `${flow.nodes.length - 1} ação(ões)`
            : "Nenhuma ação configurada ainda"}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <button
          onClick={toggleActive}
          disabled={busy}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            flow.active ? "bg-emerald-500" : "bg-slate-300"
          }`}
          aria-label="Ativar/desativar automação"
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
              flow.active ? "translate-x-5" : "translate-x-0.5"
            }`}
          />
        </button>
        <Link
          href={`/dashboard/flows/${flow.id}`}
          className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Editar
        </Link>
        <button
          onClick={remove}
          disabled={busy}
          className="rounded-lg border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          Excluir
        </button>
      </div>
    </div>
  );
}
