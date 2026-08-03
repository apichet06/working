// src/features/auth/hooks/use-require-auth-for-route.ts
"use client";

import { useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getRolesForPath } from "@/navigation/route-permissions";
import { useAuth } from "../context/auth-context";

export function useRequireAuthForCurrentRoute() {
    const router = useRouter();
    const pathname = usePathname();
    const { initialized, isAuthenticated, role } = useAuth();

    const allowedRoles = useMemo(() => getRolesForPath(pathname), [pathname]);
    const isAllowed = initialized && isAuthenticated && allowedRoles.includes(role);

    useEffect(() => {
        if (!initialized) return;

        // ยังไม่ login → เด้งไปหน้า login
        if (!isAuthenticated) {
            router.replace("/");
            return;
        }

        if (!allowedRoles.includes(role)) {
            // login แล้ว แต่ไม่มีสิทธิ์เข้า path นี้
            router.replace("/dashboard/no_rights");
        }

    }, [allowedRoles, initialized, isAuthenticated, role, router]);

    return {
        checking: !initialized || (isAuthenticated && !isAllowed),
        isAllowed,
    };
}
