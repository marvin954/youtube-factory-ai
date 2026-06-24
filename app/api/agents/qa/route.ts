import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJSON } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";
import { QAOutput, ResearchOutput, ScoringOutput, ScriptOutput, ViewmaxOutput, ThumbnailOutput, SEOOutput } from "@/types";

const SYSTEM = `You are the Quality Control Agent for YouTube Factory AI.
You are a ruthless quality gatekeeper. You score every output section 1-100.
Anything below 85 must be flagged for regeneration.
You have extremely high standards because mediocre content fails on YouTube.
Always respond with valid JSON only. No markdown. No explanation outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const {
      run_id, research, scoring, script, viewmax, thumbnail, seo
    }: {
      run_id: string;
      research: ResearchOutput;
      scoring: ScoringOutput;
      script: ScriptOutput;
      viewmax: ViewmaxOutput;
      thumbnail: ThumbnailOutput;
      seo: SEOOutput;
    } = await req.json();

    if (!run_id) return NextResponse.json({ error: "Missing run_id" }, { status: 400 });

    const raw = await callClaude(SYSTEM, `
Quality check all outputs from this YouTube Factory AI production run.

=== RESEARCH OUTPUT ===
Niche: ${research?.niche}
Ideas generated: ${research?.ideas?.length}
Top idea opportunity score: ${scoring?.selected_idea?.opportunity_score}

=== SCORING OUTPUT ===
Selected video: "${scoring?.selected_idea?.title}"
Final score: ${scoring?.selected_idea?.final_score}/100
Selection reason: ${scoring?.selection_reason}

=== SCRIPT OUTPUT ===
Title: ${script?.title}
Total scenes: ${script?.scene_count}
Word count: ${script?.word_count}
Duration: ~${Math.round((script?.total_duration_seconds || 0) / 60)} minutes
Hook: ${script?.hook_summary}
CTA: ${script?.cta_text}

=== VIEWMAX STORYBOARD ===
Total scenes: ${viewmax?.total_scenes}
Music style: ${viewmax?.music_style}
Pacing: ${viewmax?.pacing}

=== THUMBNAILS ===
Concepts generated: ${thumbnail?.concepts?.length}
Recommended: Concept #${thumbnail?.recommended_concept}

=== SEO PACKAGE ===
Title variations: ${seo?.title_variations?.length}
Tags: ${seo?.tags?.length}
Hashtags: ${seo?.hashtags?.length}
Shorts ideas: ${seo?.shorts_ideas?.length}
Has description: ${!!seo?.description}
Has pinned comment: ${!!seo?.pinned_comment}

Score each section ruthlessly. If a section scores below 85, list it in regenerate_agents.

Return ONLY this JSON:
{
  "overall_score": 0-100,
  "passed": true|false,
  "qa_notes": "2-3 sentences summary of quality assessment",
  "regenerate_agents": ["agent_id_if_below_85"],
  "sections": [
    {
      "name": "Research Quality",
      "score": 0-100,
      "passed": true|false,
      "issues": ["specific issue if any"],
      "suggestions": ["specific improvement suggestion"]
    },
    {
      "name": "Video Selection",
      "score": 0-100,
      "passed": true|false,
      "issues": [],
      "suggestions": []
    },
    {
      "name": "Script Quality",
      "score": 0-100,
      "passed": true|false,
      "issues": [],
      "suggestions": []
    },
    {
      "name": "Viewmax Storyboard",
      "score": 0-100,
      "passed": true|false,
      "issues": [],
      "suggestions": []
    },
    {
      "name": "Thumbnail Concepts",
      "score": 0-100,
      "passed": true|false,
      "issues": [],
      "suggestions": []
    },
    {
      "name": "SEO Package",
      "score": 0-100,
      "passed": true|false,
      "issues": [],
      "suggestions": []
    }
  ]
}`, 2000);

    const parsed = parseJSON<QAOutput>(raw);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("qa_outputs")
      .insert({
        run_id,
        overall_score: parsed.overall_score,
        passed: parsed.passed,
        sections: parsed.sections,
        regenerate_agents: parsed.regenerate_agents,
        qa_notes: parsed.qa_notes,
      })
      .select()
      .single();

    if (error) throw error;

    await db
      .from("factory_runs")
      .update({ current_agent: null, progress: 100, status: parsed.passed ? "complete" : "partial" })
      .eq("id", run_id);

    return NextResponse.json({ output: data as QAOutput });
  } catch (err) {
    console.error("[qa]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
