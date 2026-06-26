import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function NovaLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-3xl" : size === "sm" ? "text-base" : "text-xl";
  const icon = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-5 w-5" : "h-6 w-6";
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-lg bg-primary/15 text-primary ring-1 ring-primary/40",
          icon === "h-8 w-8" ? "h-10 w-10" : icon === "h-5 w-5" ? "h-7 w-7" : "h-8 w-8",
        )}
      >
        <Zap className={cn(icon, "fill-primary")} strokeWidth={2.5} />
      </span>
      <span className={cn("font-extrabold tracking-tight text-foreground", text)}>
        Nova<span className="text-primary">Bank</span>
      </span>
    </div>
  );
}