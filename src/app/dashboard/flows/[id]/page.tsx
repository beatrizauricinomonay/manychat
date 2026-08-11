"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactFlow, {
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlowProvider,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
  type NodeChange,
  type EdgeChange,
} from "reactflow";
import { customAlphabet } from "nanoid";
import type { ActionKind, Flow, FlowNodeData } from "@/lib/types";
import { nodeTypes } from "@/components/flow-builder/nodes";
import { Palette } from "@/components/flow-builder/Palette";
import { Inspector } from "@/components/flow-builder/Inspector";
import { ACTION_META } from "@/components/flow-builder/meta";

const genId = customAlphabet("abcdefghijklmnopqrstuvwxyz0123456789", 8);

function defaultDataFor(kind: ActionKind): FlowNodeData {
  const base = { label: ACTION_META[kind].label, kind };
  if (kind === "delay") return { ...base, seconds: 2 };
  return base;
}

function Builder({ flowId }: { flowId: string }) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();

  const [flow, setFlow] = useState<Flow | null>(null);
  const [nodes, setNodes] = useState<Node<FlowNodeData>[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");

  useEffect(() => {
    fetch(`/api/flows/${flowId}`)
      .then((res) => res.json())
      .then((data: { flow: Flow }) => {
        setFlow(data.flow);
        setNodes(data.flow.nodes as Node<FlowNodeData>[]);
        setEdges(data.flow.edges as Edge[]);
      });
  }, [flowId]);

  const onNodesChange = useCallback(
    (changes: NodeChange[]) =>
      setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) =>
      setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback((connection: Connection) => {
    setEdges((eds) => {
      // mantém o fluxo linear: só uma conexão de saída por bloco
      const withoutExisting = eds.filter(
        (e) => e.source !== connection.source
      );
      return addEdge({ ...connection, id: genId() }, withoutExisting);
    });
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const kind = event.dataTransfer.getData(
        "application/x-flow-action"
      ) as ActionKind;
      if (!kind) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node<FlowNodeData> = {
        id: genId(),
        type: "action",
        position,
        data: defaultDataFor(kind),
      };
      setNodes((nds) => [...nds, newNode]);
    },
    [screenToFlowPosition]
  );

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  function updateSelectedNodeData(patch: Partial<FlowNodeData>) {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === selectedId ? { ...n, data: { ...n.data, ...patch } } : n
      )
    );
  }

  function deleteSelectedNode() {
    setNodes((nds) => nds.filter((n) => n.id !== selectedId));
    setEdges((eds) =>
      eds.filter((e) => e.source !== selectedId && e.target !== selectedId)
    );
    setSelectedId(null);
  }

  async function save() {
    if (!flow) return;
    setSaving("saving");
    const triggerNode = nodes.find((n) => n.data.kind === "trigger");
    const res = await fetch(`/api/flows/${flow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nodes,
        edges,
        triggerValue: triggerNode?.data.keyword ?? flow.triggerValue,
      }),
    });
    if (res.ok) {
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 1500);
    } else {
      setSaving("idle");
    }
  }

  async function toggleActive() {
    if (!flow) return;
    const res = await fetch(`/api/flows/${flow.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !flow.active }),
    });
    const data = await res.json();
    setFlow(data.flow);
  }

  if (!flow) {
    return <p className="p-8 text-sm text-slate-400">Carregando fluxo...</p>;
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            ← Automações
          </button>
          <span className="text-sm font-semibold text-slate-900">
            {flow.name}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {saving === "saving" && "Salvando..."}
            {saving === "saved" && "Salvo ✓"}
          </span>
          <button
            onClick={toggleActive}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              flow.active
                ? "bg-emerald-100 text-emerald-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {flow.active ? "Ativo" : "Inativo"}
          </button>
          <button
            onClick={save}
            className="rounded-lg bg-gradient-to-br from-fuchsia-500 to-orange-400 px-4 py-1.5 text-sm font-semibold text-white"
          >
            Salvar
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <Palette />
        <div
          ref={wrapperRef}
          className="flex-1 bg-slate-50"
          onDrop={onDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onNodeClick={(_, node) => setSelectedId(node.id)}
            onPaneClick={() => setSelectedId(null)}
            fitView
          >
            <Background />
            <Controls />
          </ReactFlow>
        </div>
        <Inspector
          node={selectedNode}
          onChange={updateSelectedNodeData}
          onDelete={deleteSelectedNode}
        />
      </div>
    </div>
  );
}

export default function FlowBuilderPage() {
  const params = useParams<{ id: string }>();
  return (
    <ReactFlowProvider>
      <Builder flowId={params.id} />
    </ReactFlowProvider>
  );
}
