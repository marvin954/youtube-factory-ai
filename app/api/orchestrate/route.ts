import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function callAgent(path: string, body: object, retries = 2): Promise<Response> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE}/api/agents/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) return res;
      if (attempt === retries) return res;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 2000 * (attempt + 1)));
    }
  }
  throw new Error(`Agent ${path} failed after ${retries + 1} attempts`);
}

export async function POST(req: NextRequest) {
  const { niche } = await req.json();
  if (!niche) return NextResponse.json({ error: "Niche is required" }, { status: 400 });

  const db = supabaseAdmin();

  // Create run record
  const { data: run, error: runErr } = await db
    .from("factory_runs")
    .insert({ niche, status: "running", current_agent: "research", progress: 0 })
    .select()
    .single();

  if (runErr || !run) return NextResponse.json({ error: "Failed to create run" }, { status: 500 });

  const run_id = run.id;

  // Return run_id immediately — client polls for progress
  // The orchestration continues async via the streaming approach below
  const orchestrate = async () => {
    try {
      // ── Agent 1: Research ──────────────────────────────────────
      const r1 = await callAgent("research", { run_id, niche });
      if (!r1.ok) throw new Error("Research agent failed");
      const { output: research } = await r1.json();

      // ── Agent 2: Scoring ──────────────────────────────────────
      const r2 = await callAgent("scoring", { run_id, ideas: research.ideas });
      if (!r2.ok) throw new Error("Scoring agent failed");
      const { output: scoring } = await r2.json();

      // ── Agent 3: Script ───────────────────────────────────────
      const r3 = await callAgent("script", { run_id, idea: scoring.selected_idea });
      if (!r3.ok) throw new Error("Script agent failed");
      const { output: script } = await r3.json();

      // ── Agent 4: Viewmax ──────────────────────────────────────
      const r4 = await callAgent("viewmax", { run_id, scenes: script.scenes, title: script.title });
      if (!r4.ok) throw new Error("Viewmax agent failed");
      const { output: viewmax } = await r4.json();

      // ── Agent 5: Thumbnail ────────────────────────────────────
      const r5 = await callAgent("thumbnail", { run_id, idea: scoring.selected_idea, title: script.title });
      if (!r5.ok) throw new Error("Thumbnail agent failed");
      const { output: thumbnail } = await r5.json();

      // ── Agent 6: SEO ──────────────────────────────────────────
      const r6 = await callAgent("seo", { run_id, idea: scoring.selected_idea, script });
      if (!r6.ok) throw new Error("SEO agent failed");
      const { output: seo } = await r6.json();

      // ── Agent 7: QA ───────────────────────────────────────────
      const r7 = await callAgent("qa", { run_id, research, scoring, script, viewmax, thumbnail, seo });
      if (!r7.ok) throw new Error("QA agent failed");

    } catch (err) {
      console.error("[orchestrate]", err);
      await db
        .from("factory_runs")
        .update({ status: "error", error_message: String(err), current_agent: null })
        .eq("id", run_id);
    }
  };

  // Fire and forget — client polls
  orchestrate();

  return NextResponse.json({ run_id, status: "running" });
}
