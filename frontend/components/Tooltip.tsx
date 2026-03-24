import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { ReactNode } from "react"

interface TooltipProps 
{
    content: string;
    children: ReactNode;
    side?: "top" | "right" | "bottom" | "left";
    delayDuration?: number;
}

export default function Tooltip({content, children, side = "top", delayDuration = 200}: TooltipProps) {
  return (
    <TooltipPrimitive.Provider>
        <TooltipPrimitive.Root delayDuration={delayDuration}>
            <TooltipPrimitive.Trigger asChild>
                {children}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Content className="bg-gray-900 text-white px-3 py-2 rounded text-sm z-50" side={side} sideOffset={5}>
                {content}
                <TooltipPrimitive.Arrow className="fill-gray-900"/>
            </TooltipPrimitive.Content>
        </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  )
}