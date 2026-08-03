"use client";

import { useSessionCountdown } from "./hook/useSessionCountdown";

export function SessionTimer() {
    const { formatted } = useSessionCountdown();

    // ถ้าไม่มี token / ไม่มีเวลา ไม่ต้องแสดงอะไร
    if (formatted === "00:00:00") {
        return null;
    }

    return (
        <div className="text-[11px] text-muted-foreground text-right">
            <span className="opacity-70">Session:</span>{" "}
            <span className="font-mono">{formatted}</span>
        </div>
    );
}
