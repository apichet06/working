import { AppSidebar } from "@/components/app-sidebar";
import { LogoutButton } from "@/components/logout-button";
import { ModeToggle } from "@/components/mode-toggle";
import { NavUser } from "@/components/nav-user";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/toast";
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
