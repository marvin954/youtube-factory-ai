import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJSON } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";
import { ResearchOutput, VideoIdea } from "@/types";

const SYSTEM = `You are the YouTube Research Agent for YouTube Factory AI. 
Your job is to discover the highest-opportunity video ideas in a niche.
You think like a top YouTube strategist: you find topics people are actively searching, 
avoid saturated ideas, and identify both evergreen and trending opportunities.
Always respond with valid JSON only. No markdown. No explanation outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { run_id, niche } = await req.json();
    if (!run_id || !niche) return NextResponse.json({ error: "Missing run_id or niche" }, { status: 400 });

    const raw = await callClaude(SYSTEM, `
Research the YouTube niche: "${niche}"

Generate exactly 8 video ideas. For each idea analyze:
- Search intent (what the viewer wants to achieve)
- Why it will perform
- Target audience  
- Competition level
- Opportunity score (0-100)
- Virality potential (0-100)
- Evergreen score (0-100, where 100 = relevant forever)
- 6-8 exact keywords people search

Return ONLY this JSON (no markdown fences):
{
  "niche": "${niche}",
  "research_notes": "2-3 sentences about the overall niche opportunity",
  "ideas": [
    {
      "title": "exact clickable YouTube title",
      "topic": "core topic in 5 words",
      "why_it_will_work": "2 sentences explaining why this will get views",
      "target_audience": "specific audience description",
      "competition_level": "low|medium|high",
      "opportunity_score": 0-100,
      "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
      "search_intent": "what the viewer wants to achieve",
      "virality_potential": 0-100,
      "evergreen_score": 0-100
    }
  ]
}`, 3000);

    const parsed = parseJSON<{ niche: string; research_notes: string; ideas: VideoIdea[] }>(raw);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("research_outputs")
      .insert({ run_id, niche: parsed.niche, ideas: parsed.ideas, research_notes: parsed.research_notes })
      .select()
      .single();

    if (error) throw error;

    await db.from("factory_runs").update({ current_agent: "scoring", progress: 10 }).eq("id", run_id);

    return NextResponse.json({ output: data as ResearchOutput });
  } catch (err) {
    console.error("[research]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
