"use client"

import Link from "next/link"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Command } from "lucide-react"

import { NavGroup, sidebarItems } from "@/navigation/sidebar/sidebar-items"
import { useAuth } from "@/app/features/login/context/auth-context"
import { useMemo } from "react"
import { SessionTimer } from "@/app/features/login/session-timer"
import { NavMain } from "./nav-main"
import Image from "next/image"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { role } = useAuth()
    const filteredItems = useMemo<NavGroup[]>(() => {
        // admin เห็นทุกเมนู
        if (role === "admin") return sidebarItems;

        return sidebarItems
            .map((group) => {
                const filtered = group.items
                    .map((item) => {
                        // ถ้า item มี subItems → filter subItems ตาม role ด้วย
                        const subItems = item.subItems?.filter(
                            (sub) => !sub.roles || sub.roles.includes(role)
                        );

                        const allowed =
                            (!item.roles || item.roles.includes(role)) &&
                            (subItems ? subItems.length > 0 || !item.subItems : true);

                        if (!allowed) return null;

                        return {
                            ...item,
                            ...(subItems && { subItems }),
                        };
                    })
                    .filter((i): i is NonNullable<typeof i> => i !== null);

                if (filtered.length === 0) return null;

                return {
                    ...group,
                    items: filtered,
                };
            })
            .filter((g): g is NavGroup => g !== null);
    }, [role]);

    return (
        <Sidebar collapsible="icon" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                            render={
                                <Link href="/dashboard">
                                    <Image src={"/logowr_new.png"} alt={"logo"} width={35} height={35} />
                                    <span className="text-base font-semibold">Working Report System</span>
                                </Link>
                            }
                        />
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={filteredItems} />
            </SidebarContent>
            <SidebarFooter>
                <SessionTimer />
            </SidebarFooter>
        </Sidebar>
    )
}
