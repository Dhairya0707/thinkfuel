"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useRouter } from "next/navigation";
import { url } from "inspector";

export function NavMain({
  item,
}: {
  item: {
    title: string;
    items: {
      title: string;
      url: string;
      icon: LucideIcon;
      tooltip: string;
    }[];
  };
}) {
  const router = useRouter();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{item.title}</SidebarGroupLabel>

      <SidebarMenu>
        {item.items.map((item) => (
          <Collapsible key={item.tooltip} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  onClick={() => {
                    router.push(item.url);
                  }}
                  tooltip={item.title}
                >
                  {item.icon && <item.icon />}
                  <span className="font-medium">{item.title}</span>
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent></CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
