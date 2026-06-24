"use client";
import { ScriptOutput } from "@/types";
import { useState } from "react";
import Badge from "@/components/ui/Badge";

const sectionColors: Record<string, "red" | "amber" | "blue" | "purple" | "green" | "gray"> = {
  hook: "red",
  problem: "amber",
  story: "purple",
  main_point: "blue",
  example: "green",
  retention_loop: "amber",
  cta: "red",
};

export default function ScriptViewer({ script }: { script: ScriptOutput }) {
  const [expanded, setExpanded] = useState<number | null>(null);

  const totalMins = Math.round(script.total_duration_seconds / 60);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Duration", value: `~${totalMins} min` },
          { label: "Scenes", value: script.scene_count },
          { label: "Words", value: script.word_count.toLocaleString() },
          { label: "Pattern Interrupts", value: script.scenes.filter((s) => s.pattern_interrupt).length },
        ].map((k) => (
          <div key={k.label} className="bg-[#111] rounded-lg px-3 py-2.5 border border-[#2a2a2a]">
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">{k.label}</p>
            <p className="text-lg font-medium text-[#f1f1f1]">{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#111] border border-[#E24B4A33] rounded-lg p-4">
        <p className="text-[11px] text-[#E24B4A] uppercase tracking-wider mb-1">Hook</p>
        <p className="text-[13px] text-[#ccc]">{script.hook_summary}</p>
      </div>

      <div className="space-y-2">
        {script.scenes.map((scene) => (
          <div
            key={scene.scene_number}
            className="border border-[#2a2a2a] rounded-lg overflow-hidden cursor-pointer hover:border-[#3a3a3a] transition-colors"
            onClick={() => setExpanded(expanded === scene.scene_number ? null : scene.scene_number)}
          >
            <div className="flex items-center gap-3 px-4 py-2.5 bg-[#111]">
              <span className="text-[11px] text-[#444] w-6 flex-shrink-0">#{scene.scene_number}</span>
              <Badge color={sectionColors[scene.section] || "gray"}>{scene.section.replace("_", " ")}</Badge>
              {scene.pattern_interrupt && (
                <Badge color="amber">⚡ Pattern interrupt</Badge>
              )}
              <span className="text-[11px] text-[#555] ml-auto">{scene.timing_seconds}s</span>
              <span className="text-[#444] text-xs">{expanded === scene.scene_number ? "▲" : "▼"}</span>
            </div>

            {expanded === scene.scene_number && (
              <div className="px-4 pb-4 pt-3 bg-[#0d0d0d] space-y-3 border-t border-[#1e1e1e]">
                <div>
                  <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Narration</p>
                  <p className="text-[13px] text-[#ccc] leading-relaxed">{scene.narration}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Visual</p>
                    <p className="text-[12px] text-[#888]">{scene.visual_suggestion}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Text overlay</p>
                    <p className="text-[12px] text-[#888]">{scene.text_overlay || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">B-Roll</p>
                    <p className="text-[12px] text-[#888]">{scene.b_roll_suggestion}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#111] border border-[#1D9E7533] rounded-lg p-4">
        <p className="text-[11px] text-[#1D9E75] uppercase tracking-wider mb-1">CTA</p>
        <p className="text-[13px] text-[#ccc]">{script.cta_text}</p>
      </div>
    </div>
  );
}
