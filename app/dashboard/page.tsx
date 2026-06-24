"use client";

import { useState, useRef, useCallback } from "react";
import AgentCard from "@/components/pipeline/AgentCard";
import { AGENTS } from "@/lib/agents.config";
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

function initStates(): Record<AgentId, AgentState> {
  return Object.fromEntries(
    AGENTS.map((a) => [a.id, { id: a.id as AgentId, status: "idle", retryCount: 0 }])
  ) as Record<AgentId, AgentState>;
}

type LogType = "info" | "success" | "error" | "agent";

interface LogEntry { ts: string; msg: string; type: LogType; }

const logColors: Record<LogType, string> = {
  info: "#555",
  success: "#1D9E75",
  error: "#E24B4A",
  agent: "#EF9F27",
};

async function callAgent(path: string, body: object, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`/api/agents/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) return res;
      const err = await res.text();
      if (attempt === retries) throw new Error(`HTTP ${res.status}: ${err}`);
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
  }
  throw new Error(`Agent ${path} failed`);
}

export default function DashboardPage() {
  const router = useRouter();
  const [niche, setNiche] = useState("");
  const [customNiche, setCustomNiche] = useState("");
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [agentStates, setAgentStates] = useState<Record<AgentId, AgentState>>(initStates());
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<Record<string, NodeJS.Timeout>>({});

  const addLog = useCallback((msg: string, type: LogType = "info") => {
    const ts = new Date().toTimeString().slice(0, 8);
    setLogs((p) => [...p, { ts, msg, type }]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  const setAgent = useCallback((id: AgentId, status: AgentState["status"]) => {
    setAgentStates((prev) => ({ ...prev, [id]: { ...prev[id], status } }));
  }, []);

  const startTimer = (id: string) => {
    const start = Date.now();
    timerRef.current[id] = setInterval(() => {
      setElapsed((prev) => ({ ...prev, [id]: Math.floor((Date.now() - start) / 1000) }));
    }, 1000);
  };

  const stopTimer = (id: string) => {
    clearInterval(timerRef.current[id]);
    delete timerRef.current[id];
  };

  const reset = () => {
    Object.values(timerRef.current).forEach(clearInterval);
    timerRef.current = {};
    setRunning(false);
    setProgress(0);
    setAgentStates(initStates());
    setElapsed({});
    setError(null);
    setLogs([]);
  };

  const startProduction = async () => {
    const finalNiche = customNiche.trim() || niche;
    if (!finalNiche || running) return;

    setRunning(true);
    setError(null);
    setLogs([]);
    setProgress(0);
    setAgentStates(initStates());
    setElapsed({});

    addLog(`Starting YouTube Factory AI — niche: "${finalNiche}"`, "info");

    // ── Step 1: Create run record ──────────────────────────────────────────────
    let run_id: string;
    try {
      const res = await fetch("/api/orchestrate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche: finalNiche }),
      });
      const data = await res.json();
      if (!res.ok || !data.run_id) throw new Error(data.error || "No run ID returned");
      run_id = data.run_id;
      addLog(`Run created: ${run_id.slice(0, 8)}...`, "info");
    } catch (e) {
      setError(String(e));
      addLog(`Failed to start: ${e}`, "error");
      setRunning(false);
      return;
    }

    // ── Step 2: Run all 7 agents client-side in sequence ──────────────────────
    const PROGRESS_STEPS = [10, 20, 40, 60, 72, 84, 100];

    try {
      // ── Agent 1: Research ────────────────────────────────────────────────────
      setAgent("research", "running"); startTimer("research");
      addLog("Research Agent — scanning trends...", "agent");
      const r1 = await callAgent("research", { run_id, niche: finalNiche });
      const { output: research } = await r1.json();
      stopTimer("research"); setAgent("research", "done");
      setProgress(PROGRESS_STEPS[0]);
      addLog(`Research complete — ${research.ideas?.length} ideas found`, "success");

      // ── Agent 2: Scoring ─────────────────────────────────────────────────────
      setAgent("scoring", "running"); startTimer("scoring");
      addLog("Scoring Agent — ranking ideas...", "agent");
      const r2 = await callAgent("scoring", { run_id, ideas: research.ideas });
      const { output: scoring } = await r2.json();
      stopTimer("scoring"); setAgent("scoring", "done");
      setProgress(PROGRESS_STEPS[1]);
      addLog(`Scoring complete — winner: "${scoring.selected_idea?.title}"`, "success");

      // ── Agent 3: Script ──────────────────────────────────────────────────────
      setAgent("script", "running"); startTimer("script");
      addLog("Script Agent — writing 8-12 minute script...", "agent");
      const r3 = await callAgent("script", { run_id, idea: scoring.selected_idea });
      const { output: script } = await r3.json();
      stopTimer("script"); setAgent("script", "done");
      setProgress(PROGRESS_STEPS[2]);
      addLog(`Script complete — ${script.word_count} words · ${script.scene_count} scenes`, "success");

      // ── Agent 4: Viewmax ─────────────────────────────────────────────────────
      setAgent("viewmax", "running"); startTimer("viewmax");
      addLog("Viewmax Agent — building storyboard...", "agent");
      const r4 = await callAgent("viewmax", { run_id, scenes: script.scenes, title: script.title });
      const { output: viewmax } = await r4.json();
      stopTimer("viewmax"); setAgent("viewmax", "done");
      setProgress(PROGRESS_STEPS[3]);
      addLog(`Viewmax complete — ${viewmax.total_scenes} production scenes`, "success");

      // ── Agent 5: Thumbnail ───────────────────────────────────────────────────
      setAgent("thumbnail", "running"); startTimer("thumbnail");
      addLog("Thumbnail Agent — generating 5 concepts...", "agent");
      const r5 = await callAgent("thumbnail", { run_id, idea: scoring.selected_idea, title: script.title });
      const { output: thumbnail } = await r5.json();
      stopTimer("thumbnail"); setAgent("thumbnail", "done");
      setProgress(PROGRESS_STEPS[4]);
      addLog(`Thumbnails complete — Concept #${thumbnail.recommended_concept} recommended`, "success");

      // ── Agent 6: SEO ─────────────────────────────────────────────────────────
      setAgent("seo", "running"); startTimer("seo");
      addLog("SEO Agent — building full SEO package...", "agent");
      const r6 = await callAgent("seo", { run_id, idea: scoring.selected_idea, script });
      const { output: seo } = await r6.json();
      stopTimer("seo"); setAgent("seo", "done");
      setProgress(PROGRESS_STEPS[5]);
      addLog(`SEO complete — ${seo.tags?.length} tags · ${seo.title_variations?.length} title variants`, "success");

      // ── Agent 7: QA ──────────────────────────────────────────────────────────
      setAgent("qa", "running"); startTimer("qa");
      addLog("QA Agent — scoring all outputs...", "agent");
      const r7 = await callAgent("qa", { run_id, research, scoring, script, viewmax, thumbnail, seo });
      const { output: qa } = await r7.json();
      stopTimer("qa"); setAgent("qa", "done");
      setProgress(PROGRESS_STEPS[6]);

      if (qa.passed) {
        addLog(`QA passed ✓ — Overall score: ${qa.overall_score}/100`, "success");
      } else {
        addLog(`QA flagged issues — Score: ${qa.overall_score}/100 (check QA tab)`, "info");
      }

      addLog("✅ Production complete! Redirecting to output library...", "success");
      setTimeout(() => router.push(`/library?run=${run_id}`), 1800);

    } catch (e) {
      const msg = String(e);
      setError(msg);
      addLog(`Pipeline error: ${msg}`, "error");
      // Mark any still-running agent as error
      setAgentStates((prev) => {
        const next = { ...prev };
        for (const id of Object.keys(next) as AgentId[]) {
          if (next[id].status === "running") {
            next[id] = { ...next[id], status: "error" };
            stopTimer(id);
          }
        }
        return next;
      });
    } finally {
      setRunning(false);
    }
  };

  const finalNiche = customNiche.trim() || niche;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-[#f1f1f1] mb-1">Production Pipeline</h1>
          <p className="text-[13px] text-[#555]">Enter a niche — the factory produces ready-to-publish video assets</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={reset}
            disabled={running}
            className="px-4 py-2 text-[13px] text-[#666] border border-[#2a2a2a] rounded-lg hover:bg-[#1a1a1a] disabled:opacity-40 transition-colors"
          >
            ↺ Reset
          </button>
          <button
            onClick={startProduction}
            disabled={running || !finalNiche}
            className="flex items-center gap-2 px-5 py-2 bg-[#E24B4A] text-white text-[14px] font-medium rounded-lg hover:bg-[#c93f3e] disabled:opacity-40 transition-colors"
          >
            {running
              ? <><span className="inline-block animate-spin">↻</span> Producing...</>
              : <>▶ Produce video</>}
          </button>
        </div>
      </div>

      {/* Niche selector */}
      <div className="mb-6 space-y-3">
        <p className="text-[11px] text-[#555] uppercase tracking-wider">Select niche</p>
        <div className="flex flex-wrap gap-2">
          {NICHES.map((n) => (
            <button
              key={n}
              onClick={() => { setNiche(n); setCustomNiche(""); }}
              disabled={running}
              className={`px-3 py-1.5 text-[12px] rounded-lg border transition-all disabled:opacity-40 ${
                niche === n && !customNiche
                  ? "bg-[#E24B4A15] border-[#E24B4A55] text-[#E24B4A]"
                  : "border-[#2a2a2a] text-[#666] hover:border-[#3a3a3a] hover:text-[#aaa]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <input
          value={customNiche}
          onChange={(e) => { setCustomNiche(e.target.value); setNiche(""); }}
          placeholder="Or type a custom niche..."
          disabled={running}
          className="w-full bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-[13px] text-[#f1f1f1] placeholder:text-[#444] outline-none focus:border-[#E24B4A] disabled:opacity-40 transition-colors"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 bg-[#1a0808] border border-[#E24B4A44] rounded-lg px-4 py-3 text-[13px] text-[#E24B4A] flex items-start gap-2">
          <span className="flex-shrink-0 mt-0.5">✕</span>
          <div>
            <p className="font-medium mb-0.5">Pipeline error</p>
            <p className="text-[#E24B4A99] text-[12px]">{error}</p>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between mb-1.5">
          <p className="text-[11px] text-[#444]">Progress</p>
          <p className="text-[11px] text-[#444]">{progress}%</p>
        </div>
        <div className="h-1 bg-[#1a1a1a] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progress}%`,
              background: progress === 100 ? "#1D9E75" : "#E24B4A",
            }}
          />
        </div>
      </div>

      {/* Agent pipeline */}
      <div className="space-y-2 mb-6">
        {AGENTS.map((agent, i) => (
          <div key={agent.id}>
            {i > 0 && (
              <div className="flex justify-center h-4 items-center text-[#222] text-xs">↓</div>
            )}
            <AgentCard
              agent={agent}
              index={i}
              status={agentStates[agent.id as AgentId]?.status || "idle"}
              elapsed={elapsed[agent.id]}
            />
          </div>
        ))}
      </div>

      {/* Factory log */}
      <div className="border border-[#1e1e1e] rounded-xl overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0d0d0d] border-b border-[#1e1e1e]">
          <span className="text-[#333]">⬛</span>
          <p className="text-[12px] text-[#444]">Factory log</p>
          <span className="text-[10px] text-[#2a2a2a] ml-auto">{logs.length} events</span>
        </div>
        <div className="p-4 bg-[#080808] h-44 overflow-y-auto font-mono text-[11px] leading-6 scrollbar-hide">
          {logs.length === 0 ? (
            <p className="text-[#2a2a2a]">Factory idle. Select a niche and produce a video.</p>
          ) : (
            logs.map((l, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-[#2a2a2a] flex-shrink-0">{l.ts}</span>
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
