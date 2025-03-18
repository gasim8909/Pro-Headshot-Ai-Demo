"use client";

import { Badge } from "./ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

// This component has been simplified as Python server integration is no longer needed
export default function ServerStatusIndicator() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="default"
            className="bg-green-100 text-green-800 hover:bg-green-200 cursor-help"
          >
            System Online
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>AI processing is handled internally</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
