"use client";

import { useCallback, useEffect, useState } from "react";
import type { Flow } from "@/lib/types";
import { NewFlowDialog } from "@/components/dashboard/NewFlowDialog";
import { FlowCard } from "@/components/dashboard/FlowCard";

export default function DashboardPage() {
  const [flows, setFlows] = useState<Flow[] | null>(null);

  const [reloadToken, setReloadToken] = useState(0);
  const load = useCallback(() => setReloadToken((t) => t + 1), []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/flows")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setFlows(data.flows);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Automações</h1>
          <p className="mt-1 text-sm text-slate-500">
            Crie fluxos de resposta automática para DMs e comentários do
            Instagram.
          </p>
        </div>
        <NewFlowDialog />
      </div>

      <div className="mt-6 space-y-3">
        {flows === null && (
          <p className="text-sm text-slate-400">Carregando...</p>
        )}
        {flows?.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-medium text-slate-700">
              Nenhuma automação ainda
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Clique em &quot;Nova automação&quot; para criar seu primeiro fluxo.
            </p>
          </div>
        )}
        {flows?.map((flow) => (
          <FlowCard key={flow.id} flow={flow} onChange={load} />
        ))}
      </div>
    </div>
  );
}
