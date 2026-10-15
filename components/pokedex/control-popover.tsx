"use client";

import { ChevronDown, X } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

type Props = {
  label: React.ReactNode;
  title: string;
  active?: boolean;
  className?: string;
  onOpen?: () => void;
  hideChevron?: boolean;
  accessibleLabel?: string;
  description?: string;
  children: (close: () => void) => React.ReactNode;
};

export function ControlPopover({
  label,
  title,
  active,
  className = "",
  onOpen,
  hideChevron = false,
  accessibleLabel,
  description,
  children,
}: Props): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const [restoreFocus, setRestoreFocus] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  function close(): void {
    setRestoreFocus(true);
    setOpen(false);
  }
  useEffect(() => {
    if (!open && restoreFocus) trigger.current?.focus({ preventScroll: true });
  }, [open, restoreFocus]);
  useEffect(() => {
    if (!open) return;
    function pointer(event: PointerEvent): void {
      if (!root.current?.contains(event.target as Node)) {
        setRestoreFocus(false);
        setOpen(false);
      }
    }
    function keyboard(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        setOpen(false);
        trigger.current?.focus({ preventScroll: true });
      }
    }
    document.addEventListener("pointerdown", pointer);
    document.addEventListener("keydown", keyboard);
    return () => {
      document.removeEventListener("pointerdown", pointer);
      document.removeEventListener("keydown", keyboard);
    };
  }, [open]);
  return (
    <div
      className={`control-popover ${className}`}
      ref={root}
      data-popover={open ? "open" : undefined}
    >
      <button
        ref={trigger}
        type="button"
        className={`fg-button ${active ? "primary" : ""}`}
        aria-expanded={open}
        aria-label={accessibleLabel}
        aria-describedby={description ? `${id}-description` : undefined}
        aria-controls={id}
        onClick={() => {
          if (open) close();
          else {
            onOpen?.();
            setRestoreFocus(false);
            setOpen(true);
          }
        }}
      >
        {label}
        {!hideChevron && <ChevronDown size={15} aria-hidden />}
      </button>
      {description && (
        <span className="sr-only" id={`${id}-description`}>{description}</span>
      )}
      {open && (
        <div className="control-panel plate" id={id} aria-label={title}>
          <div className="popover-heading">
            <h2>{title}</h2>
            <button
              className="icon-button"
              type="button"
              onClick={close}
              aria-label={`Close ${title.toLowerCase()}`}
            >
              <X size={18} aria-hidden />
            </button>
          </div>
          {children(close)}
        </div>
      )}
    </div>
  );
}
