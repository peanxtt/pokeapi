"use client";
import { Plus, Minus } from "lucide-react";
import { useId, useState } from "react";
type Props = {
  children: React.ReactNode;
  defaultOpen: boolean;
  eyebrow: string;
  title: string;
};
export function ExpandableSection({
  children,
  defaultOpen,
  eyebrow,
  title,
}: Props): React.JSX.Element {
  const [open, setOpen] = useState(defaultOpen);
  const id = useId();
  return (
    <section className="expandable-section">
      <button
        type="button"
        className="fg-button disclosure-trigger"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        <span>{title}</span>
        {open ? (
          <Minus size={18} aria-hidden />
        ) : (
          <Plus size={18} aria-hidden />
        )}
      </button>
      <div id={id} hidden={!open} className="disclosure-content">
        <p className="meta">{eyebrow}</p>
        {children}
      </div>
    </section>
  );
}
