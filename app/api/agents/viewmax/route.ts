import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJSON } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";
import { ViewmaxOutput, ScriptScene } from "@/types";

const SYSTEM = `You are the Viewmax Studio Agent for YouTube Factory AI.
You convert scripts into ready-to-produce Viewmax Studio storyboards.
You think like a professional video editor: fast pacing, dynamic movement, new visual every 3-6 seconds.
Always respond with valid JSON only. No markdown. No explanation outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { run_id, scenes, title }: { run_id: string; scenes: ScriptScene[]; title: string } = await req.json();
    if (!run_id || !scenes?.length) return NextResponse.json({ error: "Missing run_id or scenes" }, { status: 400 });

    const raw = await callClaude(SYSTEM, `
Convert this YouTube script into a Viewmax Studio production storyboard.

Video Title: ${title}
Total Scenes: ${scenes.length}

Script scenes:
${JSON.stringify(scenes, null, 2)}

For EVERY scene, generate production instructions. Rules:
- New visual every 3-6 seconds (suggest sub-cuts within scenes)
- Camera movements must feel cinematic (push in, pull out, pan, ken burns)
- Stock footage must be specific (e.g. "aerial drone shot of Miami skyline at sunset")
- Sound effects add immersion (keyboard clicks, notification sounds, whooshes)
- Background music mood must match content energy
- Large bold captions (word-by-word style)
- Transitions must maintain energy

Return ONLY this JSON:
{
  "total_scenes": ${scenes.length},
  "estimated_duration": "9 minutes 30 seconds",
  "music_style": "upbeat corporate/cinematic/lofi etc",
  "pacing": "fast",
  "production_notes": "2-3 sentences of overall production direction",
  "scenes": [
    {
      "scene_number": 1,
      "visual_prompt": "Detailed AI image/video generation prompt for this scene",
      "camera_movement": "Push in slowly / Ken Burns effect / Static / Pan right",
      "stock_footage_ideas": ["specific footage idea 1", "specific footage idea 2"],
      "sound_effect": "specific sound effect name",
      "background_music_mood": "tense/uplifting/mysterious etc",
      "subtitle_text": "exact words from narration for this scene",
      "transition": "cut|fade|zoom-in|slide-left|wipe",
      "timing_seconds": 25,
      "narration_text": "exact narration words"
    }
  ]
}`, 4096);

    const parsed = parseJSON<ViewmaxOutput>(raw);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("viewmax_outputs")
      .insert({
        run_id,
        total_scenes: parsed.total_scenes,
        estimated_duration: parsed.estimated_duration,
        music_style: parsed.music_style,
        pacing: parsed.pacing,
        scenes: parsed.scenes,
        production_notes: parsed.production_notes,
      })
      .select()
      .single();

    if (error) throw error;

    await db.from("factory_runs").update({ current_agent: "thumbnail", progress: 60 }).eq("id", run_id);

    return NextResponse.json({ output: data as ViewmaxOutput });
  } catch (err) {
    console.error("[viewmax]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
