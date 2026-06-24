import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

// This route ONLY creates the run record and returns the run_id.
// All agent orchestration happens client-side in dashboard/page.tsx
// to avoid Vercel's 10s serverless timeout.

export async function POST(req: NextRequest) {
  try {
    const { niche } = await req.json();
    if (!niche) return NextResponse.json({ error: "Niche is required" }, { status: 400 });

    const db = supabaseAdmin();
    const { data: run, error } = await db
      .from("factory_runs")
      .insert({ niche, status: "running", current_agent: "research", progress: 0 })
      .select()
      .single();

    if (error || !run) {
      console.error("[orchestrate] DB error:", error);
      return NextResponse.json({ error: error?.message || "Failed to create run" }, { status: 500 });
    }

    return NextResponse.json({ run_id: run.id, status: "running" });
  } catch (err) {
    console.error("[orchestrate] Unexpected error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
