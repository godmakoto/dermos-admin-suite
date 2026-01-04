import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  label: string;
  color?: string;
  variant?: "default" | "outline";
}

export const StatusBadge = ({ label, color, variant = "default" }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variant === "outline" && "border"
      )}
      style={{
        backgroundColor: variant === "default" ? `${color}20` : "transparent",
        color: color,
        borderColor: variant === "outline" ? color : undefined,
      }}
    >
      {label}
    </span>
  );
};
