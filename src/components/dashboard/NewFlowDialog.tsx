"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TriggerType } from "@/lib/types";

const TRIGGER_OPTIONS: { value: TriggerType; label: string; hint: string }[] = [
  {
    value: "new_message",
    label: "Nova mensagem direta",
    hint: "Dispara para qualquer DM recebida",
  },
  {
    value: "keyword",
    label: "Palavra-chave na DM",
    hint: "Dispara quando a mensagem contém um termo",
  },
  {
    value: "comment_keyword",
    label: "Comentário em publicação",
    hint: "Dispara quando um comentário contém um termo",
  },
];

export function NewFlowDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [triggerType, setTriggerType] = useState<TriggerType>("new_message");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    if (!name.trim()) {
      setError("Dê um nome para a automação.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/flows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          triggerType,
          triggerValue: triggerType === "new_message" ? "" : keyword,
        }),
      });
      if (!res.ok) throw new Error("Falha ao criar automação");
      const { flow } = await res.json();
      setOpen(false);
      router.push(`/dashboard/flows/${flow.id}`);
    } catch {
      setError("Não foi possível criar a automação. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90"
      >
        + Nova automação
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Nova automação
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Defina o nome e o gatilho. Você monta o fluxo de ações no passo
              seguinte.
            </p>

            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">
                  Nome
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Boas-vindas na DM"
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">
                  Gatilho
                </label>
                <div className="mt-2 space-y-2">
                  {TRIGGER_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-sm ${
                        triggerType === opt.value
                          ? "border-fuchsia-500 bg-fuchsia-50"
                          : "border-slate-200"
                      }`}
                    >
                      <input
                        type="radio"
                        className="mt-1"
                        checked={triggerType === opt.value}
                        onChange={() => setTriggerType(opt.value)}
                      />
                      <span>
                        <span className="block font-medium text-slate-800">
                          {opt.label}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {opt.hint}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {triggerType !== "new_message" && (
                <div>
                  <label className="text-sm font-medium text-slate-700">
                    Palavra-chave
                  </label>
                  <input
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    placeholder="Ex: preço"
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-fuchsia-500"
                  />
                </div>
              )}

              {error && <p className="text-sm text-red-600">{error}</p>}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={loading}
                className="rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-400 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Criando..." : "Criar e editar fluxo"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
