"use client";

import { FILTERS, FilterName } from "../lib/filterTypes";

interface Props {
  active: FilterName;
  onSelect: (name: FilterName) => void;
}

export default function FilterPanel({ active, onSelect }: Props) {
  return (
    <div className="w-full overflow-x-auto bg-surface-card rounded-xl p-3">
      <div className="flex gap-2 min-w-max">
        {FILTERS.map((f) => {
          const isActive = f.name === active;
          return (
            <button
              key={f.name}
              onClick={() => onSelect(f.name)}
              className={[
                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-teal",
                isActive
                  ? "border border-accent-teal text-accent-teal bg-accent-teal/10"
                  : "border border-transparent text-gray-text hover:text-white hover:border-gray-text/40",
              ].join(" ")}
            >
              {f.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
