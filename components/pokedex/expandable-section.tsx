import { ChevronDown } from "lucide-react";

type ExpandableSectionProps = {
  children: React.ReactNode;
  defaultOpen: boolean;
  eyebrow: string;
  title: string;
};

export function ExpandableSection({ children, defaultOpen, eyebrow, title }: ExpandableSectionProps): React.JSX.Element {
  return (
    <details className="group border-b hairline py-5" open={defaultOpen}>
      <summary className="flex min-h-11 list-none cursor-pointer items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-mono text-[10px] uppercase tracking-[0.16em] text-subtle">{eyebrow}</span>
          <span className="mt-1 block text-lg font-semibold tracking-[-0.035em] text-foreground">{title}</span>
        </span>
        <ChevronDown aria-hidden className="details-chevron shrink-0 text-muted transition-transform duration-300" size={19} strokeWidth={1.6} />
      </summary>
      <div className="pt-5">{children}</div>
    </details>
  );
}
