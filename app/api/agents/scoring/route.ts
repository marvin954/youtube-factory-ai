import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJSON } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";
import { ScoredIdea, ScoringOutput, VideoIdea } from "@/types";

const SYSTEM = `You are the Video Selection Agent for YouTube Factory AI.
You score video ideas using a weighted formula and select the single best opportunity.
Scoring weights: Demand=30%, Competition=20%, CTR Potential=25%, Evergreen=15%, Virality=10%.
Always respond with valid JSON only. No markdown. No explanation outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { run_id, ideas }: { run_id: string; ideas: VideoIdea[] } = await req.json();
    if (!run_id || !ideas?.length) return NextResponse.json({ error: "Missing run_id or ideas" }, { status: 400 });

    const raw = await callClaude(SYSTEM, `
Score these ${ideas.length} video ideas using EXACTLY these weights:
- Demand Score: 30% weight (how many people are searching this right now)
- Competition Score: 20% weight (INVERSE — low competition = high score)
- CTR Potential: 25% weight (how likely is someone to click this thumbnail/title)
- Evergreen Potential: 15% weight (will this be relevant in 2 years?)
- Virality Potential: 10% weight (could this spread beyond search?)

Ideas to score:
${JSON.stringify(ideas, null, 2)}

Calculate final_score = (demand*0.30) + (competition*0.20) + (ctr*0.25) + (evergreen*0.15) + (virality*0.10)
Rank them 1 (best) to ${ideas.length} (worst).

Return ONLY this JSON:
{
  "scored_ideas": [
    {
      "title": "...",
      "topic": "...",
      "why_it_will_work": "...",
      "target_audience": "...",
      "competition_level": "low|medium|high",
      "opportunity_score": 0-100,
      "keywords": [],
      "search_intent": "...",
      "virality_potential": 0-100,
      "evergreen_score": 0-100,
      "demand_score": 0-100,
      "competition_score": 0-100,
      "ctr_potential": 0-100,
      "evergreen_potential": 0-100,
      "virality_potential_score": 0-100,
      "final_score": 0-100,
      "rank": 1
    }
  ],
  "selected_idea": { ...highest scoring idea object... },
  "selection_reason": "2 sentences explaining why this idea won"
}`, 3000);

    const parsed = parseJSON<{ scored_ideas: ScoredIdea[]; selected_idea: ScoredIdea; selection_reason: string }>(raw);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("scoring_outputs")
      .insert({ run_id, scored_ideas: parsed.scored_ideas, selected_idea: parsed.selected_idea, selection_reason: parsed.selection_reason })
      .select()
      .single();

    if (error) throw error;

    await db.from("factory_runs").update({ current_agent: "script", progress: 20 }).eq("id", run_id);

    return NextResponse.json({ output: data as ScoringOutput });
  } catch (err) {
    console.error("[scoring]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
