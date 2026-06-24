"use client";
import { ThumbnailOutput, ThumbnailConcept } from "@/types";
import { useState } from "react";
import Badge from "@/components/ui/Badge";

const emotionColors: Record<string, "red" | "amber" | "purple" | "blue" | "green"> = {
  curiosity: "purple",
  fear: "red",
  excitement: "amber",
  surprise: "blue",
  desire: "red",
  relief: "green",
};

function ConceptCard({ concept, isRecommended }: { concept: ThumbnailConcept; isRecommended: boolean }) {
  const [open, setOpen] = useState(isRecommended);

  return (
    <div
      className={`border rounded-xl overflow-hidden transition-all ${
        isRecommended ? "border-[#E24B4A]" : "border-[#2a2a2a]"
      }`}
    >
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer"
        style={{ background: isRecommended ? "#1a0808" : "#111" }}
        onClick={() => setOpen(!open)}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0"
          style={{ background: "#2a2a2a", color: isRecommended ? "#E24B4A" : "#888" }}
        >
          {concept.concept_number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#f1f1f1] leading-tight">"{concept.headline_text}"</p>
          {concept.sub_text && <p className="text-[11px] text-[#555] mt-0.5 truncate">{concept.sub_text}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {isRecommended && <Badge color="red">⭐ Recommended</Badge>}
          <Badge color={emotionColors[concept.emotional_trigger] || "gray"}>{concept.emotional_trigger}</Badge>
          <span className="text-[#444] text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </div>

      {open && (
        <div className="px-4 pb-4 pt-3 border-t border-[#1e1e1e] bg-[#0d0d0d] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Visual layout</p>
              <p className="text-[12px] text-[#aaa] leading-relaxed">{concept.visual_layout}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Focal point</p>
              <p className="text-[12px] text-[#aaa]">{concept.focal_point}</p>
            </div>
          </div>

          <div>
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5">Color palette</p>
            <div className="flex gap-2">
              {concept.color_palette.map((hex, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded" style={{ background: hex, border: "1px solid #333" }} />
                  <span className="text-[10px] text-[#555] font-mono">{hex}</span>
                </div>
              ))}
            </div>
          </div>

          {concept.icons_or_elements?.length > 0 && (
            <div>
              <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1.5">Elements</p>
              <div className="flex flex-wrap gap-1.5">
                {concept.icons_or_elements.map((el, i) => (
                  <span key={i} className="text-[11px] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded text-[#888]">{el}</span>
                ))}
              </div>
            </div>
          )}

          <div className="bg-[#1a1a1a] rounded-lg p-3 border border-[#2a2a2a]">
            <p className="text-[10px] text-[#555] uppercase tracking-wider mb-1">Why this increases CTR</p>
            <p className="text-[12px] text-[#ccc] leading-relaxed">{concept.ctr_reason}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ThumbnailViewer({ thumbnail }: { thumbnail: ThumbnailOutput }) {
  return (
    <div className="space-y-3">
      <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
        <p className="text-[11px] text-[#555] uppercase tracking-wider mb-1">Design rationale</p>
        <p className="text-[13px] text-[#ccc]">{thumbnail.design_rationale}</p>
      </div>
      {thumbnail.concepts.map((c) => (
        <ConceptCard key={c.concept_number} concept={c} isRecommended={c.concept_number === thumbnail.recommended_concept} />
      ))}
    </div>
  );
}
