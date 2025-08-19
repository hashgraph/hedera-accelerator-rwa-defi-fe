import type * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "./textarea";
import { TooltipInfoButton } from "./tooltipInfoButton";

interface FormTextareaProps extends React.ComponentProps<"textarea"> {
   required?: boolean;
   label: string;
   name: string;
   error?: string;
   description?: string;
   className?: string;
   tooltipContent?: string;
}

function FormTextarea({
   required,
   label,
   description,
   name,
   error,
   className,
   tooltipContent,
   ...props
}: FormTextareaProps) {
   return (
      <div className="w-full">
         <div className="flex items-center gap-1">
            <Label htmlFor={name} className="gap-1">
               {label}
               {required && <span className={"text-red-500"}>*</span>}
            </Label>
            {tooltipContent && (
               <TooltipInfoButton label={label}>{tooltipContent}</TooltipInfoButton>
            )}
         </div>
         <Textarea
            aria-invalid={!!error}
            id={name}
            name={name}
            data-slot="textarea"
            className={cn(
               "mt-1",
               "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex min-h-16 w-full min-w-0 rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
               "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
               "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive aria-invalid:text-red-500",
               className,
            )}
            {...props}
         />
         {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
         {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
      </div>
   );
}

export { FormTextarea };
