import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Checkbox } from "./checkbox";

interface MultiSelectProps {
  title: string;
  options: { label: string; value: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

export function MultiSelect({
  title,
  options,
  selected,
  onChange,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [search, setSearch] = React.useState("");

  const filteredOptions = options.filter((o) =>
    o.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  const handleSelectAll = () => {
    onChange(options.map((o) => o.value));
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const displayLabel = () => {
    if (selected.length === 0) return placeholder;
    if (selected.length === options.length) return `All ${title}`;
    if (selected.length <= 2) {
      return selected
        .map((val) => options.find((o) => o.value === val)?.label || val)
        .join(", ");
    }
    return `${selected.length} Selected`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="h-9 min-w-[145px] max-w-[220px] flex items-center justify-between gap-2 px-3 py-2 rounded-md border border-border bg-surface text-sm text-foreground/80 hover:bg-accent hover:text-foreground hover:border-accent-foreground/30 transition-all font-medium cursor-pointer shadow-sm">
          <span className="truncate">{displayLabel()}</span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2 flex flex-col gap-2 bg-popover border border-border shadow-md rounded-md" align="start">
        {options.length > 5 && (
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 w-full rounded border border-border bg-background px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          />
        )}
        <div className="flex items-center justify-between text-[10px] px-1 font-semibold text-muted-foreground/80 border-b border-border/40 pb-1.5">
          <button onClick={handleSelectAll} className="hover:text-foreground cursor-pointer">
            Select All
          </button>
          <button onClick={handleClearAll} className="hover:text-foreground cursor-pointer">
            Clear
          </button>
        </div>
        <div className="max-h-48 overflow-y-auto divide-y divide-border/30 flex flex-col">
          {filteredOptions.length === 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">No options found</div>
          ) : (
            filteredOptions.map((o) => {
              const isChecked = selected.includes(o.value);
              return (
                <div
                  key={o.value}
                  onClick={() => handleToggle(o.value)}
                  className="flex items-center gap-2.5 px-2 py-1.5 rounded hover:bg-accent cursor-pointer transition-colors text-xs font-medium"
                >
                  <Checkbox
                    checked={isChecked}
                    onCheckedChange={() => handleToggle(o.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="truncate">{o.label}</span>
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
