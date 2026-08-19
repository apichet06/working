"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ModeToggle({ className }: { className?: string }) {
    const { resolvedTheme, setTheme } = useTheme()

    return (
        <Button
            variant="outline"
            size="icon"
            className={className}
            onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        >
            <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    )
}
