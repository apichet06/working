"use client"

import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/features/login/context/auth-context"

export function LogoutButton({ className }: { className?: string }) {
    const router = useRouter()
    const { logout } = useAuth()

    const handleLogout = () => {
        logout()
        router.push("/")
    }

    return (
        <Button variant="outline" size="icon" className={className} onClick={handleLogout}>
            <LogOut />
            <span className="sr-only">ออกจากระบบ</span>
        </Button>
    )
}
