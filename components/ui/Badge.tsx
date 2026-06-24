interface BadgeProps {
  children: React.ReactNode;
  color?: "red" | "green" | "amber" | "blue" | "purple" | "gray";
  size?: "sm" | "md";
}

const colors = {
  red: "bg-[#2A0F0F] text-[#E24B4A] border-[#E24B4A33]",
  green: "bg-[#0A1F18] text-[#1D9E75] border-[#1D9E7533]",
  amber: "bg-[#2A1E00] text-[#EF9F27] border-[#EF9F2733]",
  blue: "bg-[#0A1828] text-[#378ADD] border-[#378ADD33]",
  purple: "bg-[#1A1540] text-[#7F77DD] border-[#7F77DD33]",
  gray: "bg-[#1a1a1a] text-[#888] border-[#2a2a2a]",
};

const sizes = {
  sm: "text-[10px] px-2 py-0.5",
  md: "text-[11px] px-2.5 py-1",
};

export default function Badge({ children, color = "gray", size = "sm" }: BadgeProps) {
  return (
    <span className={`inline-flex items-center border rounded-full font-medium ${colors[color]} ${sizes[size]}`}>
      {children}
    </span>
  );
}
