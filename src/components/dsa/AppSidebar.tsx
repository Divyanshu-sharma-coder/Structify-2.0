import { Link, useRouterState } from "@tanstack/react-router";
import { GROUPED } from "@/lib/dsa/registry";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const currentPath = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (p: string) => currentPath === p;

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader className="px-4 py-3 border-b border-sidebar-border">
        <Link to="/" className="font-bold text-base tracking-tight">
          <span className="text-primary">DSA</span> Visualizer
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest">DATA STRUCTURES</SidebarGroupLabel>
          <SidebarGroupContent>
            {Object.entries(GROUPED.ds).map(([group, items]) => (
              <div key={group} className="mb-1">
                <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  {group}
                </div>
                <SidebarMenu>
                  {items.map((t) => (
                    <SidebarMenuItem key={t.slug}>
                      <SidebarMenuButton asChild isActive={isActive(`/ds/${t.slug}`)}>
                        <Link to="/ds/$topic" params={{ topic: t.slug }} className="flex items-center gap-2">
                          <span>{t.emoji}</span>
                          <span className="text-xs">{t.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] tracking-widest">ALGORITHMS</SidebarGroupLabel>
          <SidebarGroupContent>
            {Object.entries(GROUPED.algo).map(([group, items]) => (
              <div key={group} className="mb-1">
                <div className="px-2 pt-2 pb-1 text-[10px] font-semibold text-sidebar-foreground/60 uppercase tracking-wider">
                  {group}
                </div>
                <SidebarMenu>
                  {items.map((t) => (
                    <SidebarMenuItem key={t.slug}>
                      <SidebarMenuButton asChild isActive={isActive(`/algo/${t.slug}`)}>
                        <Link to="/algo/$topic" params={{ topic: t.slug }} className="flex items-center gap-2">
                          <span>{t.emoji}</span>
                          <span className="text-xs">{t.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </div>
            ))}
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/patterns")}>
                  <Link to="/patterns" className="flex items-center gap-2">
                    <span>🎨</span>
                    <span className="text-xs">C++ Patterns</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={isActive("/sandbox")}>
                  <Link to="/sandbox" className="flex items-center gap-2">
                    <span>💻</span>
                    <span className="text-xs">JS Sandbox</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
