import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJSON } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";
import { ScriptOutput, ScriptScene, ScoredIdea } from "@/types";

const SYSTEM = `You are the Claude Script Agent for YouTube Factory AI.
You write world-class faceless YouTube scripts that maximize watch time and retention.
Rules: Conversational tone. Short punchy sentences. No fluff. 
Pattern interrupt every 45 seconds. Open loops that make viewers stay.
Always respond with valid JSON only. No markdown. No explanation outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { run_id, idea }: { run_id: string; idea: ScoredIdea } = await req.json();
    if (!run_id || !idea) return NextResponse.json({ error: "Missing run_id or idea" }, { status: 400 });

    const raw = await callClaude(SYSTEM, `
Write a complete YouTube script for this video:

Title: ${idea.title}
Topic: ${idea.topic}
Target Audience: ${idea.target_audience}
Keywords to naturally include: ${idea.keywords.join(", ")}
Why it will work: ${idea.why_it_will_work}

Requirements:
- Total length: 8-12 minutes (1200-1800 words of narration)
- Structure: Hook → Problem → Story → 3-5 Main Points → Examples → Retention Loop → CTA
- Pattern interrupt flag: mark scenes where you add a pattern interrupt (every ~45 seconds)
- Each scene should be 20-45 seconds of content
- B-roll suggestions must be specific and producible
- Hook must be the first 30 seconds — make it impossible to click away

Return ONLY this JSON:
{
  "title": "${idea.title}",
  "hook_summary": "one sentence describing the hook",
  "cta_text": "exact CTA line spoken at end",
  "total_duration_seconds": 540,
  "word_count": 1400,
  "scene_count": 18,
  "scenes": [
    {
      "scene_number": 1,
      "section": "hook|problem|story|main_point|example|retention_loop|cta",
      "narration": "Exact words the narrator says for this scene",
      "visual_suggestion": "What should be on screen",
      "text_overlay": "Text shown on screen (keep short, max 6 words)",
      "transition": "cut|fade|zoom|slide",
      "timing_seconds": 25,
      "b_roll_suggestion": "Specific stock footage or visual to source",
      "pattern_interrupt": false
    }
  ]
}`, 4096);

    const parsed = parseJSON<ScriptOutput>(raw);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("script_outputs")
      .insert({
        run_id,
        title: parsed.title,
        total_duration_seconds: parsed.total_duration_seconds,
        word_count: parsed.word_count,
        scene_count: parsed.scene_count,
        scenes: parsed.scenes,
        hook_summary: parsed.hook_summary,
        cta_text: parsed.cta_text,
      })
      .select()
      .single();

    if (error) throw error;

    await db.from("factory_runs").update({ current_agent: "viewmax", progress: 40 }).eq("id", run_id);

    return NextResponse.json({ output: data as ScriptOutput });
  } catch (err) {
    console.error("[script]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
