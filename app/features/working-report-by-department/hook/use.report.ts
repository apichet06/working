"use client"

import { useCallback, useState } from "react"
import { report_service } from "../lib/report.service"
import { WorkingReport } from "../type"

export function useReport() {
    const [data, setData] = useState<WorkingReport[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)

    const search = useCallback(async (from: string, to: string) => {
        setSearched(true)
        setLoading(true)
        try {
            const res = await report_service.list(from, to)
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลรายงานไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    return {
        data,
        loading,
        error,
        searched,
        search,
    }
}
