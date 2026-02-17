import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { ChevronsUpDown, Check, X } from "lucide-react";

export interface FormSelectOption {
  value: string;
  label: string;
}

export interface FormSelectProps {
  options: FormSelectOption[];
  placeholder?: string;
  multiple?: boolean;
  value?: string;
  values?: string[];
  onValueChange?: (value: string) => void;
  onValuesChange?: (values: string[]) => void;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function FormSelect({
  options,
  placeholder = "Seleccionar...",
  multiple = false,
  value,
  values = [],
  onValueChange,
  onValuesChange,
  disabled = false,
  emptyMessage = "No hay opciones disponibles",
  className,
}: FormSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleItemClick = (optionValue: string) => {
    if (multiple) {
      const isSelected = values.includes(optionValue);
      if (isSelected) {
        onValuesChange?.(values.filter((v) => v !== optionValue));
      } else {
        onValuesChange?.([...values, optionValue]);
      }
    } else {
      onValueChange?.(optionValue);
      setOpen(false);
    }
  };

  const renderTriggerContent = () => {
    if (multiple) {
      if (values.length === 0) {
        return <span className="text-muted-foreground">{placeholder}</span>;
      }
      return (
        <div className="flex flex-wrap gap-1">
          {values.map((v) => {
            const opt = options.find((o) => o.value === v);
            return (
              <Badge key={v} variant="secondary" className="text-xs px-1.5 py-0.5 gap-1 font-normal">
                {opt?.label ?? v}
                <button
                  type="button"
                  className="ml-0.5 rounded-full outline-none hover:bg-muted-foreground/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    onValuesChange?.(values.filter((val) => val !== v));
                  }}
                  aria-label={`Quitar ${opt?.label ?? v}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      );
    }

    if (value) {
      const opt = options.find((o) => o.value === value);
      return <span className="truncate">{opt?.label ?? value}</span>;
    }
    return <span className="text-muted-foreground">{placeholder}</span>;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-auto min-h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
            "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            "disabled:cursor-not-allowed disabled:opacity-50",
            className,
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <div className="flex-1 text-left">{renderTriggerContent()}</div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[--radix-popover-trigger-width] p-1"
        align="start"
        sideOffset={4}
      >
        <div className="max-h-[200px] overflow-y-auto" role="listbox">
          {options.length === 0 ? (
            <p className="text-sm text-muted-foreground p-2">{emptyMessage}</p>
          ) : (
            options.map((option) => {
              const isSelected = multiple
                ? values.includes(option.value)
                : value === option.value;

              return (
                <div
                  key={option.value}
                  role="option"
                  aria-selected={isSelected}
                  className={cn(
                    "relative flex cursor-pointer select-none items-center rounded-sm py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
                    multiple ? "gap-2 px-2" : "pl-8 pr-2",
                  )}
                  onClick={() => handleItemClick(option.value)}
                >
                  {multiple ? (
                    <Checkbox
                      checked={isSelected}
                      className="pointer-events-none"
                    />
                  ) : (
                    isSelected && (
                      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
                        <Check className="h-4 w-4" />
                      </span>
                    )
                  )}
                  {option.label}
                </div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
