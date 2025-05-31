import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: number;
}

export function LoadingSpinner({ className, size = 24 }: LoadingSpinnerProps) {
  return (
    <div className="flex justify-center items-center w-full h-full">
      <Loader2
        className={cn("animate-spin text-primary", className)}
        size={size}
        aria-label="Loading..." 
      />
    </div>
  );
}
