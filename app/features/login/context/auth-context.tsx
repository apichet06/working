"use client";

import { Role } from "@/navigation/sidebar/sidebar-items";
import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
} from "react";

// export type UserRole = "admin" | "user" | "guest";

export type AuthUser = {
    e_id?: number;
    e_fullname_en?: string;
    e_usercode?: string;
    r_role?: string | null;
    e_email?: string;
    e_image?: string;
    d_department_en?: string;
    d_department_th?: string;
};

type AuthContextValue = {
    user: AuthUser | null;
    role: Role;
    isAuthenticated: boolean;
    initialized: boolean;
    login: (user: AuthUser, token: string) => void;
    logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function getRoleFromUser(user: AuthUser | null): Role {
    const rRole = user?.r_role;
    if (!rRole) return "guest";

    const lower = rRole.toLowerCase();
    if (lower === "admin") return "admin";
    if (lower === "subadmin") return "subadmin";
    return "guest";
}

function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split(".")[1])) as { exp?: number };
        if (!payload.exp) return false;

        return payload.exp * 1000 <= Date.now();
    } catch {
        return true;
    }
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (typeof window === "undefined") return;

        try {
            const rawUser = localStorage.getItem("user");
            const token = localStorage.getItem("token");

            if (rawUser && token && !isTokenExpired(token)) {
                const parsed = JSON.parse(rawUser) as AuthUser;

                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(parsed);
            } else {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setInitialized(true);
        }
    }, []);

    const login = (userData: AuthUser, token: string) => {
        if (typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(userData));
            localStorage.setItem("token", token);
        }
        setUser(userData);
    };

    const logout = () => {
        if (typeof window !== "undefined") {
            document.body.style.pointerEvents = "auto"
            document.body.style.overflow = ""
            document.documentElement.style.overflow = ""
            localStorage.removeItem("user");
            localStorage.removeItem("token");
        }
        setUser(null);
    };

    const role = getRoleFromUser(user);

    const value: AuthContextValue = {
        user,
        role,
        isAuthenticated: !!user,
        initialized,
        login,
        logout,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return ctx;
}
