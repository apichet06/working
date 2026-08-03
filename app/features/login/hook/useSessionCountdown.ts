"use client";

import { useEffect, useState } from "react";

type SessionCountdownResult = {
    remainingMs: number;
    formatted: string; // เช่น "00:05:23"
};

export function useSessionCountdown(): SessionCountdownResult {
    const [remainingMs, setRemainingMs] = useState(0);

    useEffect(() => {
        if (typeof window === "undefined") return;

        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const payload = JSON.parse(atob(token.split(".")[1]));
            if (!payload.exp) return;

            const expiryTime = payload.exp * 1000; // exp เป็นวินาที
            const update = () => {
                const now = Date.now();
                const diff = expiryTime - now;
                setRemainingMs(diff > 0 ? diff : 0);

                // ถ้าหมดอายุแล้ว จะเคลียร์ token + ส่งไปหน้า login
                if (diff <= 0) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.replace("/");
                }
            };

            update(); // อัปเดตครั้งแรกทันที
            const id = setInterval(update, 1000); // อัปเดตทุก 1 วิ

            return () => clearInterval(id);
        } catch (err) {
            console.error("Invalid token:", err);
        }
    }, []);

    // แปลง ms → hh:mm:ss
    const totalSec = Math.floor(remainingMs / 1000);
    const hours = Math.floor(totalSec / 3600)
        .toString()
        .padStart(2, "0");
    const minutes = Math.floor((totalSec % 3600) / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(totalSec % 60)
        .toString()
        .padStart(2, "0");

    const formatted = `${hours}:${minutes}:${seconds}`;

    return { remainingMs, formatted };
}
