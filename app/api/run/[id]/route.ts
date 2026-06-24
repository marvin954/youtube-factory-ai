import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const id = params.id;

  const [run, research, scoring, script, viewmax, thumbnail, seo, qa] = await Promise.all([
    db.from("factory_runs").select("*").eq("id", id).single(),
    db.from("research_outputs").select("*").eq("run_id", id).maybeSingle(),
    db.from("scoring_outputs").select("*").eq("run_id", id).maybeSingle(),
    db.from("script_outputs").select("*").eq("run_id", id).maybeSingle(),
    db.from("viewmax_outputs").select("*").eq("run_id", id).maybeSingle(),
    db.from("thumbnail_outputs").select("*").eq("run_id", id).maybeSingle(),
    db.from("seo_outputs").select("*").eq("run_id", id).maybeSingle(),
    db.from("qa_outputs").select("*").eq("run_id", id).maybeSingle(),
  ]);

  if (run.error) return NextResponse.json({ error: "Run not found" }, { status: 404 });

  return NextResponse.json({
    run: run.data,
    outputs: {
      research: research.data,
      scoring: scoring.data,
      script: script.data,
      viewmax: viewmax.data,
      thumbnail: thumbnail.data,
      seo: seo.data,
      qa: qa.data,
    },
  });
}
