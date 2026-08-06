"use client"

import { useCallback, useEffect, useState } from "react"
import { dashboard_service } from "../lib/dashboard.service"
import { EmployeeJobCount } from "../type"

export function useEmployeeJobCounts(year: number) {
    const [data, setData] = useState<EmployeeJobCount[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        setLoading(true)
        try {
            const res = await dashboard_service.getEmployeeJobCounts(year)
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดจำนวนงานของพนักงานไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [year])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change; state only updates after the awaited request settles
        fetchData()
    }, [fetchData])

    return { data, loading, error }
}
