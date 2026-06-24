"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dashboard", icon: "▶", label: "Pipeline" },
  { href: "/library", icon: "📁", label: "Output Library" },
  { href: "/history", icon: "🕐", label: "Run History" },
  { href: "/settings", icon: "⚙️", label: "Settings" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-52 bg-[#0d0d0d] border-r border-[#1e1e1e] flex flex-col z-40">
      <div className="p-5 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-[#E24B4A] rounded-lg flex items-center justify-center text-base">▶</div>
          <div>
            <p className="text-[13px] font-semibold text-[#f1f1f1] leading-none">YouTube</p>
            <p className="text-[11px] text-[#E24B4A] leading-none mt-0.5">Factory AI</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map((item) => {
          const active = path.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] transition-all ${
                active
                  ? "bg-[#E24B4A15] text-[#f1f1f1] border border-[#E24B4A33]"
                  : "text-[#666] hover:text-[#aaa] hover:bg-[#1a1a1a]"
              }`}
            >
              <span className="text-base w-5 text-center">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#1e1e1e]">
        <p className="text-[10px] text-[#333] text-center">Mammba Enterprises</p>
      </div>
    </aside>
  );
}
