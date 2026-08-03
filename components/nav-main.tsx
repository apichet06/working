"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { type NavGroup, type NavMainItem } from "@/navigation/sidebar/sidebar-items";

interface NavMainProps {
  readonly items: readonly NavGroup[];
}

const IsComingSoon = () => (
  <span className="ml-auto rounded-md bg-gray-200 px-2 py-1 text-xs dark:text-gray-800">Soon</span>
);

const NavItemExpanded = ({
  item,
  isActive,
  isSubmenuOpen,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
  isSubmenuOpen: (subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <Collapsible
      defaultOpen={isSubmenuOpen(item.subItems)}
      render={<SidebarMenuItem />}
    >
      {item.subItems ? (
        <CollapsibleTrigger
          render={
            <SidebarMenuButton
              className="group"
              disabled={item.comingSoon}
              isActive={isActive(item.url as string, item.subItems)}
              tooltip={item.title}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.comingSoon && <IsComingSoon />}
              <ChevronRight className="ml-auto transition-transform duration-200 group-data-panel-open:rotate-90" />
            </SidebarMenuButton>
          }
        />
      ) : (
        <SidebarMenuButton
          aria-disabled={item.comingSoon}
          isActive={isActive(item.url as string)}
          tooltip={item.title}
          render={
            <Link href={item.url as string} prefetch={false} target={item.newTab ? "_blank" : undefined}>
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              {item.comingSoon && <IsComingSoon />}
            </Link>
          }
        />
      )}
      {item.subItems && (
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems.map((subItem) => (
              <SidebarMenuSubItem key={subItem.title}>
                <SidebarMenuSubButton
                  aria-disabled={subItem.comingSoon}
                  isActive={isActive(subItem.url)}
                  render={
                    <Link href={subItem.url} prefetch={false} target={subItem.newTab ? "_blank" : undefined}>
                      {subItem.icon && <subItem.icon />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  }
                />
              </SidebarMenuSubItem>
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      )}
    </Collapsible>
  );
};

const NavItemCollapsed = ({
  item,
  isActive,
}: {
  item: NavMainItem;
  isActive: (url: string, subItems?: NavMainItem["subItems"]) => boolean;
}) => {
  return (
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuButton
              disabled={item.comingSoon}
              tooltip={item.title}
              isActive={isActive(item.url as string, item.subItems)}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
              <ChevronRight />
            </SidebarMenuButton>
          }
        />
        <DropdownMenuContent className="w-50 space-y-1" side="right" align="start">
          {item.subItems?.map((subItem) => (
            <DropdownMenuItem
              key={subItem.title}
              render={
                <SidebarMenuSubButton
                  className="focus-visible:ring-0"
                  aria-disabled={subItem.comingSoon}
                  isActive={isActive(subItem.url)}
                  render={
                    <Link href={subItem.url} target={subItem.newTab ? "_blank" : undefined}>
                      {subItem.icon && <subItem.icon className="[&>svg]:text-sidebar-foreground" />}
                      <span>{subItem.title}</span>
                      {subItem.comingSoon && <IsComingSoon />}
                    </Link>
                  }
                />
              }
            />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  );
};

export function NavMain({ items }: NavMainProps) {
  const path = usePathname();
  const { state, isMobile } = useSidebar();

  const normalize = (p: string) => (p.endsWith("/") && p !== "/" ? p.slice(0, -1) : p);
  const isActivePath = (pathname: string, href?: string) => {
    if (!href) return false;
    const current = normalize(pathname);
    const target = normalize(href);

    return current === target || current.startsWith(target + "/");
  };

  const isItemActive = (url: string, subItems?: NavMainItem["subItems"]) => {
    if (subItems?.length) {
      return subItems.some((sub) => isActivePath(path, sub.url));
    }
    return isActivePath(path, url);
  };

  const isSubmenuOpen = (subItems?: NavMainItem["subItems"]) => {
    return subItems?.some((sub) => path.startsWith(sub.url)) ?? false;
  };

  return (
    <>
      {items.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item) => {
                if (state === "collapsed" && !isMobile) {
                  // ไม่มี subItems -> render เป็น link ตรง ๆ
                  if (!item.subItems) {
                    return (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton
                          aria-disabled={item.comingSoon}
                          tooltip={item.title}
                          isActive={isItemActive(item.url as string)}
                          render={
                            <Link href={item.url as string} target={item.newTab ? "_blank" : undefined}>
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                            </Link>
                          }
                        />
                      </SidebarMenuItem>
                    );
                  }
                  // มี subItems -> render เป็น dropdown
                  return <NavItemCollapsed key={item.title} item={item} isActive={isItemActive} />;
                }
                // Expanded view
                return (
                  <NavItemExpanded key={item.title} item={item} isActive={isItemActive} isSubmenuOpen={isSubmenuOpen} />
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
