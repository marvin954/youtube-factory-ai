// ─── Master Run ────────────────────────────────────────────────────────────────
export type RunStatus = "idle" | "running" | "complete" | "error" | "partial";

export interface FactoryRun {
  id: string;
  niche: string;
  status: RunStatus;
  current_agent: string | null;
  progress: number; // 0–100
  error_message: string | null;
  created_at: string;
  updated_at: string;
  // joined
  research_output?: ResearchOutput;
  scoring_output?: ScoringOutput;
  script_output?: ScriptOutput;
  viewmax_output?: ViewmaxOutput;
  thumbnail_output?: ThumbnailOutput;
  seo_output?: SEOOutput;
  qa_output?: QAOutput;
}

// ─── Agent 1: Research ─────────────────────────────────────────────────────────
export interface VideoIdea {
  title: string;
  topic: string;
  why_it_will_work: string;
  target_audience: string;
  competition_level: "low" | "medium" | "high";
  opportunity_score: number; // 0–100
  keywords: string[];
  search_intent: string;
  virality_potential: number; // 0–100
  evergreen_score: number; // 0–100
}

export interface ResearchOutput {
  id: string;
  run_id: string;
  niche: string;
  ideas: VideoIdea[];
  research_notes: string;
  created_at: string;
}

// ─── Agent 2: Scoring / Selection ──────────────────────────────────────────────
export interface ScoredIdea extends VideoIdea {
  demand_score: number;        // 30%
  competition_score: number;   // 20%
  ctr_potential: number;       // 25%
  evergreen_potential: number; // 15%
  virality_potential_score: number; // 10%
  final_score: number;
  rank: number;
}

export interface ScoringOutput {
  id: string;
  run_id: string;
  scored_ideas: ScoredIdea[];
  selected_idea: ScoredIdea;
  selection_reason: string;
  created_at: string;
}

// ─── Agent 3: Script ───────────────────────────────────────────────────────────
export interface ScriptScene {
  scene_number: number;
  section: "hook" | "problem" | "story" | "main_point" | "example" | "retention_loop" | "cta";
  narration: string;
  visual_suggestion: string;
  text_overlay: string;
  transition: string;
  timing_seconds: number;
  b_roll_suggestion: string;
  pattern_interrupt: boolean;
}

export interface ScriptOutput {
  id: string;
  run_id: string;
  title: string;
  total_duration_seconds: number;
  word_count: number;
  scene_count: number;
  scenes: ScriptScene[];
  hook_summary: string;
  cta_text: string;
  created_at: string;
}

// ─── Agent 4: Viewmax Studio ───────────────────────────────────────────────────
export interface ViewmaxScene {
  scene_number: number;
  visual_prompt: string;
  camera_movement: string;
  stock_footage_ideas: string[];
  sound_effect: string;
  background_music_mood: string;
  subtitle_text: string;
  transition: string;
  timing_seconds: number;
  narration_text: string;
}

export interface ViewmaxOutput {
  id: string;
  run_id: string;
  total_scenes: number;
  estimated_duration: string;
  music_style: string;
  pacing: "slow" | "medium" | "fast" | "very_fast";
  scenes: ViewmaxScene[];
  production_notes: string;
  created_at: string;
}

// ─── Agent 5: Thumbnails ───────────────────────────────────────────────────────
export interface ThumbnailConcept {
  concept_number: number;
  headline_text: string;
  sub_text: string;
  visual_layout: string;
  focal_point: string;
  emotional_trigger: string;
  color_palette: string[];
  icons_or_elements: string[];
  ctr_reason: string;
  mobile_optimized: boolean;
}

export interface ThumbnailOutput {
  id: string;
  run_id: string;
  concepts: ThumbnailConcept[];
  recommended_concept: number;
  design_rationale: string;
  created_at: string;
}

// ─── Agent 6: SEO ──────────────────────────────────────────────────────────────
export interface SEOOutput {
  id: string;
  run_id: string;
  title_variations: string[];
  description: string;
  keywords: string[];
  tags: string[];
  hashtags: string[];
  pinned_comment: string;
  community_post: string;
  shorts_ideas: string[];
  chapter_markers: { time: string; title: string }[];
  created_at: string;
}

// ─── Agent 7: QA ───────────────────────────────────────────────────────────────
export interface QASection {
  name: string;
  score: number; // 0–100
  passed: boolean;
  issues: string[];
  suggestions: string[];
}

export interface QAOutput {
  id: string;
  run_id: string;
  overall_score: number;
  passed: boolean;
  sections: QASection[];
  regenerate_agents: string[];
  qa_notes: string;
  created_at: string;
}

// ─── Agent State (UI) ──────────────────────────────────────────────────────────
export type AgentId =
  | "research"
  | "scoring"
  | "script"
  | "viewmax"
  | "thumbnail"
  | "seo"
  | "qa";

export type AgentStatus = "idle" | "running" | "done" | "error" | "skipped";

export interface AgentState {
  id: AgentId;
  status: AgentStatus;
  startedAt?: number;
  completedAt?: number;
  error?: string;
  retryCount: number;
}
