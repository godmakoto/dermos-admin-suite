import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader = ({ title, description, children, className }: PageHeaderProps) => {
  return (
    <div className={cn(
      "mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between",
      className
    )}>
      <div>
        <h1 className="text-xl font-semibold text-foreground lg:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-2 shrink-0">
          {children}
        </div>
      )}
    </div>
  );
};
