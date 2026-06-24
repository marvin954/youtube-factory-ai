interface ScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export default function ScoreRing({ score, size = 56, label }: ScoreRingProps) {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 85 ? "#1D9E75" : score >= 70 ? "#EF9F27" : "#E24B4A";

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#2a2a2a" strokeWidth={4} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
        />
        <text
          x={size / 2} y={size / 2 + 5}
          textAnchor="middle"
          fontSize={size < 48 ? 11 : 14}
          fontWeight={500}
          fill={color}
          style={{ transform: "rotate(90deg)", transformOrigin: `${size / 2}px ${size / 2}px` }}
        >
          {score}
        </text>
      </svg>
      {label && <p className="text-[10px] text-[#555] text-center leading-tight">{label}</p>}
    </div>
  );
}
