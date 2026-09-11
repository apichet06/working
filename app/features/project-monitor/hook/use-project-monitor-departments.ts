"use client"

import { useCallback, useEffect, useState } from "react"
import { projectMonitorService } from "../lib/project-monitor.service"

const REFRESH_INTERVAL_MS = 30_000

export function useProjectMonitorDepartments() {
    const [departmentIds, setDepartmentIds] = useState<number[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const refresh = useCallback(async () => {
        try {
            setDepartmentIds(await projectMonitorService.getDepartmentIds())
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดแผนกที่มีงานไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- โหลดรายการครั้งแรกเมื่อเปิดหน้า
        void refresh()
        const timer = window.setInterval(() => void refresh(), REFRESH_INTERVAL_MS)
        return () => window.clearInterval(timer)
    }, [refresh])

    return { departmentIds, loading, error, refresh }
}
