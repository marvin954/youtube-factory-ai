import { AgentId } from "@/types";

export interface AgentMeta {
  id: AgentId;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  weight: number; // progress weight
}

export const AGENTS: AgentMeta[] = [
  {
    id: "research",
    label: "YouTube Research Agent",
    description: "Discovers high-opportunity video ideas in your niche",
    icon: "🔍",
    color: "#E24B4A",
    bgColor: "#2A0F0F",
    weight: 10,
  },
  {
    id: "scoring",
    label: "Video Selection Agent",
    description: "Scores every idea across 5 dimensions, selects the winner",
    icon: "🏆",
    color: "#EF9F27",
    bgColor: "#2A1E00",
    weight: 10,
  },
  {
    id: "script",
    label: "Claude Script Agent",
    description: "Writes a full 8–12 minute retention-optimized script",
    icon: "✍️",
    color: "#7F77DD",
    bgColor: "#1A1540",
    weight: 20,
  },
  {
    id: "viewmax",
    label: "Viewmax Studio Agent",
    description: "Converts script into a scene-by-scene production storyboard",
    icon: "🎬",
    color: "#E87040",
    bgColor: "#2A1008",
    weight: 20,
  },
  {
    id: "thumbnail",
    label: "Canva Thumbnail Agent",
    description: "Generates 5 high-CTR thumbnail concepts",
    icon: "🖼️",
    color: "#D4519A",
    bgColor: "#2A0A1A",
    weight: 15,
  },
  {
    id: "seo",
    label: "SEO Agent",
    description: "Builds full SEO package: titles, description, tags, hashtags",
    icon: "📈",
    color: "#378ADD",
    bgColor: "#0A1828",
    weight: 15,
  },
  {
    id: "qa",
    label: "Quality Control Agent",
    description: "Scores all outputs 1–100 and regenerates anything below 85",
    icon: "🛡️",
    color: "#1D9E75",
    bgColor: "#0A1F18",
    weight: 10,
  },
];

export const TOTAL_WEIGHT = AGENTS.reduce((s, a) => s + a.weight, 0);
