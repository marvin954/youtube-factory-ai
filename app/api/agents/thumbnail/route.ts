import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJSON } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";
import { ThumbnailOutput, ScoredIdea } from "@/types";

const SYSTEM = `You are the Canva Thumbnail Agent for YouTube Factory AI.
You design high-CTR YouTube thumbnail concepts that make people stop scrolling and click.
You think like the best YouTube thumbnail designers: bold, simple, emotional, curious.
Rules: Mobile-first. One focal point. 2-4 words max on thumbnail. High contrast. Emotional trigger.
Always respond with valid JSON only. No markdown. No explanation outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { run_id, idea, title }: { run_id: string; idea: ScoredIdea; title: string } = await req.json();
    if (!run_id || !idea) return NextResponse.json({ error: "Missing run_id or idea" }, { status: 400 });

    const raw = await callClaude(SYSTEM, `
Create 5 thumbnail concepts for this YouTube video:

Video Title: ${title}
Topic: ${idea.topic}
Target Audience: ${idea.target_audience}
Emotional hook: ${idea.why_it_will_work}
Keywords: ${idea.keywords.join(", ")}

For each concept, think about:
1. What emotion does the viewer feel when they see it? (curiosity, fear, excitement, surprise)
2. What ONE thing is the focal point?
3. What 2-4 words create maximum intrigue?
4. What colors will pop in dark mode and light mode feeds?
5. Why will a person scrolling at 1am stop and click this?

Return ONLY this JSON:
{
  "recommended_concept": 1,
  "design_rationale": "2 sentences on why the recommended concept will win",
  "concepts": [
    {
      "concept_number": 1,
      "headline_text": "2-4 words MAX shown on thumbnail",
      "sub_text": "optional smaller text below headline",
      "visual_layout": "Detailed description of the visual layout and composition",
      "focal_point": "the ONE thing the eye goes to first",
      "emotional_trigger": "curiosity|fear|excitement|surprise|desire|relief",
      "color_palette": ["#hex1", "#hex2", "#hex3"],
      "icons_or_elements": ["element1", "element2"],
      "ctr_reason": "2 sentences explaining exactly why this will get clicks",
      "mobile_optimized": true
    }
  ]
}`, 2500);

    const parsed = parseJSON<ThumbnailOutput>(raw);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("thumbnail_outputs")
      .insert({
        run_id,
        concepts: parsed.concepts,
        recommended_concept: parsed.recommended_concept,
        design_rationale: parsed.design_rationale,
      })
      .select()
      .single();

    if (error) throw error;

    await db.from("factory_runs").update({ current_agent: "seo", progress: 75 }).eq("id", run_id);

    return NextResponse.json({ output: data as ThumbnailOutput });
  } catch (err) {
    console.error("[thumbnail]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
