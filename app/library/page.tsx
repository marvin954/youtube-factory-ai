"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import ScriptViewer from "@/components/outputs/ScriptViewer";
import ThumbnailViewer from "@/components/outputs/ThumbnailViewer";
import SEOViewer from "@/components/outputs/SEOViewer";
import QAViewer from "@/components/outputs/QAViewer";
import ScoreRing from "@/components/ui/ScoreRing";
import Badge from "@/components/ui/Badge";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "script", label: "Script" },
  { id: "viewmax", label: "Viewmax" },
  { id: "thumbnails", label: "Thumbnails" },
  { id: "seo", label: "SEO" },
  { id: "qa", label: "QA Report" },
];

function ViewmaxViewer({ viewmax }: { viewmax: any }) {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total scenes", value: viewmax.total_scenes },
          { label: "Duration", value: viewmax.estimated_duration },
          { label: "Music style", value: viewmax.music_style },
          { label: "Pacing", value: viewmax.pacing },
        ].map((k) => (
          <div key={k.label} className="bg-[#111] border border-[#2a2a2a] rounded-lg px-3 py-2.5">
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">{k.label}</p>
            <p className="text-[13px] text-[#f1f1f1] font-medium capitalize">{k.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
        <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Production notes</p>
        <p className="text-[13px] text-[#aaa]">{viewmax.production_notes}</p>
      </div>
      <div className="space-y-2">
        {viewmax.scenes?.map((scene: any) => (
          <div key={scene.scene_number} className="border border-[#2a2a2a] rounded-lg overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2.5 cursor-pointer bg-[#111] hover:bg-[#141414]" onClick={() => setOpen(open === scene.scene_number ? null : scene.scene_number)}>
              <span className="text-[11px] text-[#444] w-6">#{scene.scene_number}</span>
              <p className="text-[12px] text-[#888] flex-1 truncate">{scene.subtitle_text}</p>
              <span className="text-[11px] text-[#444]">{scene.timing_seconds}s</span>
              <span className="text-[#444] text-xs">{open === scene.scene_number ? "▲" : "▼"}</span>
            </div>
            {open === scene.scene_number && (
              <div className="px-4 pb-4 pt-3 bg-[#0d0d0d] border-t border-[#1e1e1e] space-y-3">
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Visual prompt</p>
                  <p className="text-[12px] text-[#ccc] leading-relaxed">{scene.visual_prompt}</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div><p className="text-[10px] text-[#555] mb-1">Camera</p><p className="text-[11px] text-[#888]">{scene.camera_movement}</p></div>
                  <div><p className="text-[10px] text-[#555] mb-1">Sound FX</p><p className="text-[11px] text-[#888]">{scene.sound_effect}</p></div>
                  <div><p className="text-[10px] text-[#555] mb-1">Music mood</p><p className="text-[11px] text-[#888]">{scene.background_music_mood}</p></div>
                </div>
                <div>
                  <p className="text-[10px] text-[#555] mb-1">Stock footage ideas</p>
                  <div className="flex flex-wrap gap-1.5">{scene.stock_footage_ideas?.map((s: string, i: number) => <span key={i} className="text-[11px] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded text-[#888]">{s}</span>)}</div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function LibraryContent() {
  const searchParams = useSearchParams();
  const runId = searchParams.get("run");
  const [tab, setTab] = useState("overview");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<any[]>([]);
  const [selectedRun, setSelectedRun] = useState<string | null>(runId);

  useEffect(() => {
    fetch("/api/runs").then(r => r.json()).then(d => setRuns(d.runs || []));
  }, []);

  useEffect(() => {
    if (!selectedRun) return;
    setLoading(true);
    fetch(`/api/run/${selectedRun}`).then(r => r.json()).then(d => { setData(d); setLoading(false); });
  }, [selectedRun]);

  const run = data?.run;
  const outputs = data?.outputs;

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[#f1f1f1] mb-1">Output Library</h1>
        <p className="text-[13px] text-[#555]">View all generated assets from each production run</p>
      </div>

      <div className="flex gap-3 mb-6 items-center">
        <select
          value={selectedRun || ""}
          onChange={(e) => setSelectedRun(e.target.value)}
          className="bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5 text-[13px] text-[#f1f1f1] outline-none focus:border-[#E24B4A] min-w-[300px]"
        >
          <option value="">Select a run...</option>
          {runs.map((r) => (
            <option key={r.id} value={r.id}>
              {r.niche} — {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </option>
          ))}
        </select>
        {run && (
          <Badge color={run.status === "complete" ? "green" : run.status === "running" ? "amber" : "gray"}>
            {run.status}
          </Badge>
        )}
      </div>

      {loading && <div className="text-[13px] text-[#555] py-8 text-center">Loading outputs...</div>}

      {!loading && !selectedRun && (
        <div className="text-center py-16 text-[#333] text-[14px]">Select a run to view outputs</div>
      )}

      {!loading && data && (
        <>
          {run && (
            <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5 mb-6 flex items-center gap-5">
              <div className="flex-1">
                <h2 className="text-[16px] font-medium text-[#f1f1f1] mb-1">{run.niche}</h2>
                {outputs?.scoring?.selected_idea && (
                  <p className="text-[13px] text-[#888]">📽 "{outputs.scoring.selected_idea.title}"</p>
                )}
                <p className="text-[11px] text-[#444] mt-2">{new Date(run.created_at).toLocaleString()}</p>
              </div>
              {outputs?.qa && <ScoreRing score={outputs.qa.overall_score} size={64} label="QA Score" />}
            </div>
          )}

          <div className="flex gap-1 mb-6 border-b border-[#1e1e1e] overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-[13px] whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  tab === t.id ? "text-[#f1f1f1] border-[#E24B4A]" : "text-[#555] border-transparent hover:text-[#888]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="pb-12">
            {tab === "overview" && outputs?.scoring && (
              <div className="space-y-4">
                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
                  <p className="text-[11px] text-[#555] uppercase tracking-wider mb-3">Selected video</p>
                  <h3 className="text-[16px] font-medium text-[#f1f1f1] mb-2">{outputs.scoring.selected_idea?.title}</h3>
                  <p className="text-[13px] text-[#888] mb-4">{outputs.scoring.selected_idea?.why_it_will_work}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Opportunity", value: outputs.scoring.selected_idea?.final_score + "/100" },
                      { label: "Competition", value: outputs.scoring.selected_idea?.competition_level },
                      { label: "Target audience", value: outputs.scoring.selected_idea?.target_audience },
                      { label: "Ideas generated", value: outputs.research?.ideas?.length },
                    ].map((k) => (
                      <div key={k.label} className="bg-[#0d0d0d] border border-[#1e1e1e] rounded-lg px-3 py-2.5">
                        <p className="text-[10px] text-[#444] uppercase tracking-wider mb-1">{k.label}</p>
                        <p className="text-[12px] text-[#ccc] capitalize">{k.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#111] border border-[#2a2a2a] rounded-xl p-5">
                  <p className="text-[11px] text-[#555] uppercase tracking-wider mb-3">Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {outputs.scoring.selected_idea?.keywords?.map((k: string) => (
                      <span key={k} className="text-[12px] bg-[#1a1a1a] border border-[#2a2a2a] px-2.5 py-1 rounded text-[#888]">{k}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {tab === "script" && outputs?.script && <ScriptViewer script={outputs.script} />}
            {tab === "viewmax" && outputs?.viewmax && <ViewmaxViewer viewmax={outputs.viewmax} />}
            {tab === "thumbnails" && outputs?.thumbnail && <ThumbnailViewer thumbnail={outputs.thumbnail} />}
            {tab === "seo" && outputs?.seo && <SEOViewer seo={outputs.seo} />}
            {tab === "qa" && outputs?.qa && <QAViewer qa={outputs.qa} />}

            {tab !== "overview" && !outputs?.[tab === "thumbnails" ? "thumbnail" : tab === "viewmax" ? "viewmax" : tab] && (
              <div className="text-center py-12 text-[#333] text-[13px]">This output hasn't been generated yet.</div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default function LibraryPage() {
  return (
    <Suspense fallback={<div className="p-8 text-[#555]">Loading...</div>}>
      <LibraryContent />
    </Suspense>
  );
}
