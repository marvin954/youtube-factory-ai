"use client";
import { QAOutput } from "@/types";
import ScoreRing from "@/components/ui/ScoreRing";
import Badge from "@/components/ui/Badge";

export default function QAViewer({ qa }: { qa: QAOutput }) {
  return (
    <div className="space-y-4">
      <div className={`border rounded-xl p-5 flex items-center gap-6 ${qa.passed ? "border-[#1D9E7533] bg-[#0a1f18]" : "border-[#E24B4A33] bg-[#1a0808]"}`}>
        <ScoreRing score={qa.overall_score} size={72} label="Overall" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-[15px] font-medium text-[#f1f1f1]">
              {qa.passed ? "✅ Quality approved" : "⚠️ Quality issues found"}
            </h3>
            <Badge color={qa.passed ? "green" : "red"}>{qa.overall_score}/100</Badge>
          </div>
          <p className="text-[13px] text-[#888] leading-relaxed">{qa.qa_notes}</p>
          {qa.regenerate_agents?.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="text-[11px] text-[#555]">Flagged for regeneration:</span>
              {qa.regenerate_agents.map((a) => (
                <Badge key={a} color="amber">{a}</Badge>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {qa.sections.map((section) => (
          <div
            key={section.name}
            className={`border rounded-xl p-4 ${section.passed ? "border-[#1D9E7522] bg-[#0d1a14]" : "border-[#E24B4A22] bg-[#1a0d0d]"}`}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] text-[#555]">{section.name}</p>
              <ScoreRing score={section.score} size={40} />
            </div>
            {section.issues?.length > 0 && (
              <div className="space-y-1 mb-2">
                {section.issues.map((issue, i) => (
                  <p key={i} className="text-[11px] text-[#E24B4A] flex gap-1.5"><span>✕</span>{issue}</p>
                ))}
              </div>
            )}
            {section.suggestions?.length > 0 && (
              <div className="space-y-1">
                {section.suggestions.map((s, i) => (
                  <p key={i} className="text-[11px] text-[#EF9F27] flex gap-1.5"><span>→</span>{s}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
