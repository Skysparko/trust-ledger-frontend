import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  subtitle,
  className,
}: {
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-8 flex items-end justify-between gap-4", className)}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{title}</h2>
        {subtitle ? (
          <p className="mt-2 text-base text-zinc-600 dark:text-zinc-400 sm:text-lg">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}


