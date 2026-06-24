import { NextRequest, NextResponse } from "next/server";
import { callClaude, parseJSON } from "@/lib/claude";
import { supabaseAdmin } from "@/lib/supabase";
import { SEOOutput, ScoredIdea, ScriptOutput } from "@/types";

const SYSTEM = `You are the SEO Agent for YouTube Factory AI.
You build complete YouTube SEO packages that maximize discoverability.
You know exactly how the YouTube algorithm works: titles, descriptions, tags, and metadata.
Always respond with valid JSON only. No markdown. No explanation outside JSON.`;

export async function POST(req: NextRequest) {
  try {
    const { run_id, idea, script }: { run_id: string; idea: ScoredIdea; script: ScriptOutput } = await req.json();
    if (!run_id || !idea || !script) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const raw = await callClaude(SYSTEM, `
Build a complete YouTube SEO package for this video:

Title: ${script.title}
Topic: ${idea.topic}
Target Audience: ${idea.target_audience}
Primary Keywords: ${idea.keywords.join(", ")}
Video hook: ${script.hook_summary}
CTA: ${script.cta_text}
Video duration: ~${Math.round(script.total_duration_seconds / 60)} minutes

Generate the full SEO package:

Return ONLY this JSON:
{
  "title_variations": [
    "Primary title (under 60 chars, keyword first)",
    "A/B test variation 2",
    "A/B test variation 3",
    "A/B test variation 4",
    "A/B test variation 5"
  ],
  "description": "Full YouTube description (300-500 words). Include: hook paragraph, what they will learn (bullet points), timestamps section, CTA, links section. Use primary keyword in first 100 chars.",
  "keywords": ["keyword1", "keyword2", ...15 keywords total...],
  "tags": ["tag1", "tag2", ...25 specific tags...],
  "hashtags": ["#hashtag1", "#hashtag2", ...8 hashtags...],
  "pinned_comment": "First comment pinned by channel — creates engagement loop, asks question or directs to resource",
  "community_post": "YouTube Community tab post to promote this video (2-3 sentences, conversational)",
  "shorts_ideas": [
    "30-second Short idea 1 from this video",
    "30-second Short idea 2",
    "30-second Short idea 3"
  ],
  "chapter_markers": [
    { "time": "0:00", "title": "Introduction" },
    { "time": "0:30", "title": "Chapter name" }
  ]
}`, 3000);

    const parsed = parseJSON<SEOOutput>(raw);

    const db = supabaseAdmin();
    const { data, error } = await db
      .from("seo_outputs")
      .insert({
        run_id,
        title_variations: parsed.title_variations,
        description: parsed.description,
        keywords: parsed.keywords,
        tags: parsed.tags,
        hashtags: parsed.hashtags,
        pinned_comment: parsed.pinned_comment,
        community_post: parsed.community_post,
        shorts_ideas: parsed.shorts_ideas,
        chapter_markers: parsed.chapter_markers,
      })
      .select()
      .single();

    if (error) throw error;

    await db.from("factory_runs").update({ current_agent: "qa", progress: 88 }).eq("id", run_id);

    return NextResponse.json({ output: data as SEOOutput });
  } catch (err) {
    console.error("[seo]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
