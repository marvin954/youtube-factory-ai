"use client";
import { SEOOutput } from "@/types";
import { useState } from "react";

function CopyBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="bg-[#111] border border-[#2a2a2a] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1e1e1e]">
        <p className="text-[11px] text-[#555] uppercase tracking-wider">{label}</p>
        <button onClick={copy} className="text-[11px] text-[#555] hover:text-[#E24B4A] transition-colors">
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <div className="px-4 py-3">
        <p className="text-[12px] text-[#aaa] font-mono leading-relaxed whitespace-pre-wrap">{value}</p>
      </div>
    </div>
  );
}

export default function SEOViewer({ seo }: { seo: SEOOutput }) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <p className="text-[11px] text-[#555] uppercase tracking-wider">Title variations</p>
        {seo.title_variations.map((t, i) => (
          <div key={i} className="flex items-center gap-3 bg-[#111] border border-[#2a2a2a] rounded-lg px-4 py-2.5">
            <span className="text-[11px] text-[#444] w-4 flex-shrink-0">{i + 1}</span>
            <p className="text-[13px] text-[#ccc] flex-1">{t}</p>
            <span className={`text-[10px] ${t.length > 60 ? "text-[#E24B4A]" : "text-[#1D9E75]"}`}>{t.length}/60</span>
          </div>
        ))}
      </div>

      <CopyBlock label="Description" value={seo.description} />
      <CopyBlock label="Pinned comment" value={seo.pinned_comment} />
      <CopyBlock label="Community post" value={seo.community_post} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
          <p className="text-[11px] text-[#555] uppercase tracking-wider mb-3">Tags ({seo.tags.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {seo.tags.map((tag, i) => (
              <span key={i} className="text-[11px] bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded text-[#888]">{tag}</span>
            ))}
          </div>
        </div>
        <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
          <p className="text-[11px] text-[#555] uppercase tracking-wider mb-3">Hashtags</p>
          <div className="flex flex-wrap gap-1.5">
            {seo.hashtags.map((h, i) => (
              <span key={i} className="text-[11px] bg-[#1a1540] border border-[#7F77DD33] px-2 py-0.5 rounded text-[#7F77DD]">{h}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
        <p className="text-[11px] text-[#555] uppercase tracking-wider mb-3">Shorts ideas</p>
        <div className="space-y-2">
          {seo.shorts_ideas.map((s, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="text-[11px] text-[#E24B4A] mt-0.5 flex-shrink-0">▶</span>
              <p className="text-[12px] text-[#aaa]">{s}</p>
            </div>
          ))}
        </div>
      </div>

      {seo.chapter_markers?.length > 0 && (
        <div className="bg-[#111] border border-[#2a2a2a] rounded-lg p-4">
          <p className="text-[11px] text-[#555] uppercase tracking-wider mb-3">Chapter markers</p>
          <div className="space-y-1.5 font-mono text-[12px]">
            {seo.chapter_markers.map((c, i) => (
              <div key={i} className="flex gap-4 text-[#888]">
                <span className="text-[#555] w-12 flex-shrink-0">{c.time}</span>
                <span>{c.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
