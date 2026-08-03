"use client"

import { useAuth } from "@/app/features/login/context/auth-context"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

function getInitials(name?: string) {
    if (!name) return "?"
    const cleaned = name.replace(/^(Mr\.|Mrs\.|Ms\.)\s*/i, "")
    const parts = cleaned.split(" ").filter(Boolean)
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "?"
}

export function NavUser({ className }: { className?: string }) {
    const { user } = useAuth()

    if (!user) return null

    const department = user.d_department_th ?? user.d_department_en

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Avatar size="sm">
                <AvatarFallback>{getInitials(user.e_fullname_en)}</AvatarFallback>
            </Avatar>
            <div className="hidden text-sm leading-tight sm:grid">
                <span className="font-medium whitespace-nowrap">{user.e_fullname_en ?? "-"}</span>
                <span
                    className="whitespace-nowrap text-xs text-muted-foreground"
                    style={{ fontFamily: "var(--font-noto-thai)" }}
                >
                    {user.e_usercode ?? "-"}
                    {department ? ` · ${department}` : ""}
                </span>
            </div>
        </div>
    )
}
