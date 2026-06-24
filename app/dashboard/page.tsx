"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AgentCard from "@/components/pipeline/AgentCard";
import { AGENTS, TOTAL_WEIGHT } from "@/lib/agents.config";
import { AgentId, AgentState } from "@/types";
import { useRouter } from "next/navigation";

const NICHES = [
  "AI Tools & Automation",
  "Personal Finance & Investing",
  "Health & Fitness",
  "Make Money Online",
  "Self Improvement",
  "Ecommerce & Etsy",
  "Tech Reviews",
  "Miami Lifestyle",
  "Real Estate",
  "Digital Marketing",
];

function initialAgentStates(): Record<AgentId, AgentState> {
  return Object.fromEntries(
    AGENTS.map((a) => [a.id, { id: a.id as AgentId, status: "idle", retryCount: 0 }])
  ) as Record<AgentId, AgentState>;
}

export default function DashboardPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [agentStates, setAgentStates] = useState<Record<AgentId, AgentState>>(initialAgentStates());
  const [runId, setRunId] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState<Record<AgentId, number>>({} as Record<AgentId, number>);
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<{ ts: string; msg: string; type: "info" | "success" | "error" | "agent" }[]>([]);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const startRef = useRef<Record<AgentId, number>>({} as Record<AgentId, number>);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, type: "info" | "success" | "error" | "agent" = "info") => {
    const ts = new Date().toTimeString().slice(0, 8);
    setLogs((p) => [...p, { ts, msg, type }]);
  }, []);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const pollRun = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/run/${id}`);
      const data = await res.json();
      const run = data.run;
      const outputs = data.outputs;

      setProgress(run.progress || 0);

      const agentOutputMap: Record<string, boolean> = {
        research: !!outputs.research,
        scoring: !!outputs.scoring,
        script: !!outputs.script,
        viewmax: !!outputs.viewmax,
        thumbnail: !!outputs.thumbnail,
        seo: !!outputs.seo,
        qa: !!outputs.qa,
      };

      setAgentStates((prev) => {
        const next = { ...prev };
        for (const agent of AGENTS) {
          const id = agent.id as AgentId;
          if (agentOutputMap[id]) {
            if (next[id].status !== "done") {
              next[id] = { ...next[id], status: "done", completedAt: Date.now() };
              addLog(`${agent.label} completed ✓`, "success");
            }
          } else if (run.current_agent === id) {
            if (next[id].status !== "running") {
              next[id] = { ...next[id], status: "running", startedAt: Date.now() };
              startRef.current[id] = Date.now();
              addLog(`${agent.label} started`, "agent");
            }
          }
        }
        return next;
      });

      if (run.status === "complete" || run.status === "partial") {
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        addLog(run.status === "complete" ? "✅ Production complete! All outputs ready." : "⚠️ Production complete with partial results.", run.status === "complete" ? "success" : "error");
        setProgress(100);
        setTimeout(() => router.push(`/library?run=${id}`), 1500);
      }

      if (run.status === "error") {
        if (pollRef.current) clearInterval(pollRef.current);
        if (timerRef.current) clearInterval(timerRef.current);
        setRunning(false);
        setError(run.error_message || "Pipeline failed");
        addLog(`Error: ${run.error_message}`, "error");
      }
    } catch (e) {
      addLog("Poll error — retrying...", "error");
    }
  }, [addLog, router]);

  const startProduction = async () => {
    const finalNiche = customNiche.trim() || niche;
    if (!finalNiche) return;

    setRunning(true);
    setError(null);
    setLogs([]);
    setProgress(0);
    setAgentStates(initialAgentStates());

    addLog(`Starting production for niche: "${finalNiche}"`, "info");

    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: finalNiche }),
      });
      const data = await res.json();
      if (!data.run_id) throw new Error("No run ID returned");

      setRunId(data.run_id);
      addLog(`Run created: ${data.run_id.slice(0, 8)}...`, "info");

      timerRef.current = setInterval(() => {
        setElapsed((prev) => {
          const next = { ...prev };
          for (const id of Object.keys(startRef.current) as AgentId[]) {
            if (startRef.current[id]) {
              next[id] = Math.floor((Date.now() - startRef.current[id]) / 1000);
            }
          }
          return next;
        });
      }, 1000);

      pollRef.current = setInterval(() => pollRun(data.run_id), 3000);
    } catch (e) {
      setRunning(false);
      setError(String(e));
      addLog(`Failed to start: ${e}`, "error");
    }
  };

  const reset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setRunId(null);
    setProgress(0);
    setAgentStates(initialAgentStates());
    setLogs([]);
    setError(null);
    setElapsed({} as Record<AgentId, number>);
    startRef.current = {} as Record<AgentId, number>;
  };

  const logColors = { info: "#555", success: "#1D9E75", error: "#E24B4A", agent: "#EF9F27" };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#f1f1f1] mb-1">Production Pipeline</h1>
          <p className="text-[13px] text-[#555]">Enter a niche and the factory produces ready-to-publish video assets</p>
        </div>
        <div className="flex gap-2">
          <button onClick={reset} disabled={running} className="px-4 py-2 text-[13px] text-[#666] border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] disabled:opacity-40 transition-colors">
            Reset
          </button>
          <button
            onClick={startProduction}
            disabled={running || (!niche && !customNiche.trim())}
            className="flex items-center gap-2 px-5 py-2 bg-[#E24B4A] text-white text-[14px] font-medium rounded-lg hover:bg-[#c93f3e] disabled:opacity-40 transition-colors"
          >
            {running ? <><span className="animate-spin inline-block">↻</span> Producing...</> : <>▶ Produce video</>}
          </button>
        </div>
      </div>

      <div className="mb-6 space-y-3">
        <div>
          <p className="text-[11px] text-[#555] uppercase tracking-wider mb-2">Select niche</p>
          <div className="flex flex-wrap gap-2">
            {NICHES.map((n) => (
              <button
                key={n}
                onClick={() => { setNiche(n); setCustomNiche(""); }}
                disabled={running}
                className={`px-3 py-1.5 text-[12px] rounded-lg border transition-all ${
                  niche === n && !customNiche
                    ? "bg-[#E24B4A15] border-[#E24B4A55] text-[#E24B4A]"
                    : "border-[#2a2a2a] text-[#666] hover:border-[#3a3a3a] hover:text-[#aaa]"
                } disabled:opacity-40`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <input
            value={customNiche}
            onChange={(e) => { setCustomNiche(e.target.value); setNiche(""); }}
            placeholder="Or type a custom niche..."
            disabled={running}
            className="flex-1 bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-[13px] text-[#f1f1f1] placeholder:text-[#444] outline-none focus:border-[#E24B4A] disabled:opacity-40 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-[#1a0808] border border-[#E24B4A33] rounded-lg px-4 py-3 text-[13px] text-[#E24B4A]">
          ✕ {error}
        </div>
      )}

      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] text-[#555]">Progress</p>
          <p className="text-[11px] text-[#555]">{progress}%</p>
        </div>
        <div className="h-1 bg-[#1e1e1e] rounded-full overflow-hidden">
          <div className="h-full bg-[#E24B4A] rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {AGENTS.map((agent, i) => (
          <div key={agent.id}>
            {i > 0 && <div className="flex justify-center h-4 items-center text-[#2a2a2a] text-xs">↓</div>}
            <AgentCard
              agent={agent}
              index={i}
              status={agentStates[agent.id as AgentId]?.status || "idle"}
              elapsed={elapsed[agent.id as AgentId]}
            />
          </div>
        ))}
      </div>

      <div className="border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d0d0d] border-b border-[#1e1e1e]">
          <span className="text-[11px] text-[#444]">⬛</span>
          <p className="text-[12px] text-[#555]">Factory log</p>
          <span className="text-[10px] text-[#333] ml-auto">{logs.length} events</span>
        </div>
        <div className="p-4 bg-[#080808] h-40 overflow-y-auto font-mono text-[11px] leading-6">
          {logs.length === 0 ? (
            <p className="text-[#333]">Factory idle. Select a niche and produce a video.</p>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-[#333] flex-shrink-0">{l.ts}</span>
                <span style={{ color: logColors[l.type] }}>{l.msg}</span>
              </div>
            ))
          )}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
