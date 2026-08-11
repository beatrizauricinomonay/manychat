"use client";

import { useEffect, useState } from "react";
import type { FlowRun } from "@/lib/types";

const STATUS_STYLES: Record<FlowRun["status"], string> = {
  success: "bg-emerald-100 text-emerald-700",
  error: "bg-red-100 text-red-700",
  skipped: "bg-slate-100 text-slate-600",
};

export default function RunsPage() {
  const [runs, setRuns] = useState<FlowRun[] | null>(null);

  useEffect(() => {
    fetch("/api/runs")
      .then((res) => res.json())
      .then((data) => setRuns(data.runs));
  }, []);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Execuções</h1>
      <p className="mt-1 text-sm text-slate-500">
        Histórico de disparos das automações a partir de eventos reais do
        Instagram.
      </p>

      <div className="mt-6 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {runs === null && (
          <p className="p-6 text-sm text-slate-400">Carregando...</p>
        )}
        {runs?.length === 0 && (
          <p className="p-6 text-sm text-slate-400">
            Nenhuma execução registrada ainda. Assim que o webhook receber
            eventos do Instagram, eles aparecerão aqui.
          </p>
        )}
        {runs?.map((run) => (
          <div
            key={run.id}
            className="flex items-center justify-between border-b border-slate-100 px-5 py-3 last:border-0"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-slate-800">
                  {run.flowName}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[run.status]}`}
                >
                  {run.status}
                </span>
              </div>
              {run.triggerSummary && (
                <p className="truncate text-sm text-slate-500">
                  &quot;{run.triggerSummary}&quot;
                </p>
              )}
              {run.detail && (
                <p className="truncate text-xs text-red-500">{run.detail}</p>
              )}
            </div>
            <span className="shrink-0 text-xs text-slate-400">
              {new Date(run.createdAt).toLocaleString("pt-BR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
