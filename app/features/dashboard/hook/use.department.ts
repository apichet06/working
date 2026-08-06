"use client"

import { useCallback, useEffect, useState } from "react"
import { department_service } from "../lib/department.service"
import { Department } from "../type"

export function useDepartment() {
    const [data, setData] = useState<Department[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await department_service.list()
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลแผนกไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount; state only updates after the awaited request settles
        fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
    }
}
