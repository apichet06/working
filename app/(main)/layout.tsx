"use client"

import { AppSidebar } from "@/components/app-sidebar";
import { LogoutButton } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import { NavUser } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Toaster } from "@/components/ui/toast";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";
import { useRequireAuthForCurrentRoute } from "@/app/features/login/hook/use-require-auth-for-route";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // ยังไม่ login หรือไม่มีสิทธิ์เข้า path นี้ -> hook นี้จะเด้งไปหน้า login/no_rights ให้เอง
    // ระหว่างเช็ค/รอเด้ง โชว์ spinner ไว้ก่อน กัน page ข้างในยิง fetch แล้วเจอ 401 โชว์ error ค้างจอ
    const { checking, isAllowed } = useRequireAuthForCurrentRoute();

    if (checking || !isAllowed) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-2 border-b bg-navbar px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator orientation="vertical" className="h-4 self-auto" />
                    <div className="ml-auto flex items-center gap-4">
                        <NavUser />
                        <Separator orientation="vertical" className="h-4 self-auto" />
                        <div className="flex items-center gap-2">
                            <ModeToggle />
                            <LogoutButton />
                        </div>
                    </div>
                </header>
                <div className="flex min-w-0 flex-1 flex-col gap-4 p-4">{children}</div>
            </SidebarInset>
            <Toaster />
        </SidebarProvider>
    );
}
