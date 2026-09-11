"use client"

import { useCallback, useEffect, useState } from "react"
import { projectMonitorService } from "../lib/project-monitor.service"
import { ActiveProject } from "../type"

const REFRESH_INTERVAL_MS = 30_000

export type ProjectMonitorMode = "cumulative" | "realtime"

export function useProjectMonitor(departmentId: number | null, mode: ProjectMonitorMode = "cumulative") {
    const [projects, setProjects] = useState<ActiveProject[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [fetchedAt, setFetchedAt] = useState(0)
    const [now, setNow] = useState(0)

    const refresh = useCallback(async (showLoading = false) => {
        if (departmentId === null) return
        if (showLoading) setLoading(true)
        try {
            const data = mode === "realtime"
                ? await projectMonitorService.getRealtimeProjects(departmentId)
                : await projectMonitorService.getActiveProjects(departmentId)
            const receivedAt = Date.now()
            setProjects(data)
            setFetchedAt(receivedAt)
            setNow(receivedAt)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูล Project Monitor ไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [departmentId, mode])

    useEffect(() => {
        if (departmentId === null) return
        // eslint-disable-next-line react-hooks/set-state-in-effect -- เริ่มโหลดข้อมูลทันทีเมื่อเปิดหน้าหรือเปลี่ยนแผนก
        void refresh(true)
        const refreshTimer = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS)
        return () => window.clearInterval(refreshTimer)
    }, [departmentId, refresh])

    useEffect(() => {
        const clockTimer = window.setInterval(() => setNow(Date.now()), 60_000)
        return () => window.clearInterval(clockTimer)
    }, [])

    return {
        projects,
        loading,
        error,
        refresh: () => refresh(true),
        extraSeconds: Math.max(0, Math.floor((now - fetchedAt) / 1_000)),
    }
}
