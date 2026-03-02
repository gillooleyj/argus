"use client";

import { useEffect, useRef, useState, KeyboardEvent, ClipboardEvent } from "react";
import { ORGANIZATIONS } from "@/constants/certifications";
import type { OrgInfo } from "@/constants/certifications";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (org: OrgInfo) => void;
  hasError?: boolean;
};

function searchOrgs(query: string): OrgInfo[] {
  const q = query.toLowerCase().trim();
  if (!q) return ORGANIZATIONS;
  return ORGANIZATIONS.filter((o) => o.name.toLowerCase().includes(q));
}

export default function OrgAutocomplete({
  value,
  onChange,
  onSelect,
  hasError,
}: Props) {
  const [suggestions, setSuggestions] = useState<OrgInfo[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) setSuggestions(searchOrgs(value));
    setActiveIndex(-1);
  }, [value, open]);

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function handleFocus() {
    setOpen(true);
    setSuggestions(searchOrgs(value));
  }

  function handleSelect(org: OrgInfo) {
    onSelect(org);
    setOpen(false);
    setActiveIndex(-1);
  }

  // The input is permanently readOnly so Safari never triggers contact autofill.
  // Key events still fire on readOnly inputs — we intercept them and manually
  // update the value via onChange instead of letting the browser do it.
  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) { setOpen(true); setSuggestions(searchOrgs(value)); }
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    } else if (e.key === "Backspace") {
      e.preventDefault();
      onChange(value.slice(0, -1));
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault();
      onChange(value + e.key);
      if (!open) setOpen(true);
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    onChange(text);
    if (!open) setOpen(true);
  }

  const showDropdown = open && suggestions.length > 0;

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        readOnly
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={showDropdown}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        value={value}
        placeholder="e.g. ISC2 or type your own"
        className={`w-full px-3 py-2 border rounded-lg text-sm bg-brand-navy text-white placeholder-brand-body/40 focus:outline-none focus:ring-2 focus:border-transparent ${
          hasError
            ? "border-red-400 dark:border-red-500 focus:ring-red-400 dark:focus:ring-red-500"
            : "border-brand-gold/40 focus:ring-brand-gold"
        }`}
      />

      {showDropdown && (
        <ul className="absolute z-20 left-0 right-0 mt-1 bg-brand-blue border border-brand-gold/40 rounded-lg shadow-lg overflow-hidden max-h-64 overflow-y-auto">
          {suggestions.map((org, i) => (
            <li key={org.name}>
              <button
                type="button"
                onMouseDown={() => handleSelect(org)}
                className={`w-full text-left px-3 py-2.5 flex items-center justify-between gap-4 transition-colors ${
                  i === activeIndex
                    ? "bg-brand-gold/20 text-brand-gold"
                    : "hover:bg-brand-navy text-brand-body"
                }`}
              >
                <span className="font-medium text-sm">{org.name}</span>
                <span className="text-xs text-brand-body/50 shrink-0">
                  {org.creditType} · {org.cycleMonths} mo
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
