import { Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import { isString } from "lodash";

interface IProps {
   label: string;
   children: React.ReactNode;
}

export const TooltipInfoButton = ({ label, children }: IProps) => {
   return (
      <Tooltip>
         <TooltipTrigger asChild>
            <button
               tabIndex={-1}
               type="button"
               className="inline-flex items-center justify-center p-0 h-4 w-4 text-gray-600 hover:text-foreground transition-colors hover:cursor-pointer"
               aria-label={`Help for ${label}`}
            >
               <Info className="h-4 w-4" />
            </button>
         </TooltipTrigger>
         <TooltipContent className="max-w-sm text-wrap">
            {isString(children) ? <p>{children}</p> : children}
         </TooltipContent>
      </Tooltip>
   );
};
