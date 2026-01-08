import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface OrderStatusSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  statuses: Array<{ name: string; color: string }>;
}

const getStatusStyles = (statusName: string) => {
  switch (statusName) {
    case "Pendiente":
      return "bg-warning/10 text-warning-foreground border-transparent";
    case "Finalizado":
      return "bg-success/10 text-success border-transparent";
    case "Cancelado":
      return "bg-destructive/10 text-destructive border-transparent";
    default:
      return "bg-secondary text-secondary-foreground border-transparent";
  }
};

export const OrderStatusSelect = ({
  value,
  onChange,
  disabled = false,
  statuses,
}: OrderStatusSelectProps) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (newValue: string) => {
    onChange(newValue);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild disabled={disabled}>
        <button
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors",
            "hover:opacity-80 focus:outline-none focus-visible:outline-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "min-h-[36px]",
            getStatusStyles(value)
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="whitespace-nowrap">{value}</span>
          <ChevronDown className="h-3 w-3 shrink-0" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[140px]">
        {statuses.map((status) => (
          <DropdownMenuItem
            key={status.name}
            onClick={() => handleSelect(status.name)}
            className="cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div
                className="h-2 w-2 rounded-full shrink-0"
                style={{ backgroundColor: status.color }}
              />
              <span>{status.name}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
