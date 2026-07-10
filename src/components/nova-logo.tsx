import { cn } from "@/lib/utils";

export function NovaLogo({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" }) {
  const text = size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-lg";
  const mark = size === "lg" ? "h-9 w-9 text-base" : size === "sm" ? "h-6 w-6 text-[10px]" : "h-7 w-7 text-xs";
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-foreground font-bold tracking-tight text-background",
          mark,
        )}
      >
        R
      </span>
      <span className={cn("font-semibold tracking-tight text-foreground", text)}>
        Revolut <span className="font-normal text-muted-foreground">Go</span>
      </span>
    </div>
  );
}