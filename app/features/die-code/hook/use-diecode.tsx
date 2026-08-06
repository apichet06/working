"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast"
import { diecode_service } from "../lib/die_service"
import { DieCode, DieCodeInput } from "../type"

export function useDieCode() {
    const [data, setData] = useState<DieCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await diecode_service.list()
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount; state only updates after the awaited request settles
        fetchData()
    }, [fetchData])

    const createDieCode = useCallback(async (input: DieCodeInput) => {
        await diecode_service.create(input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const updateDieCode = useCallback(async (die_id: number, input: DieCodeInput) => {
        await diecode_service.update(die_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const deleteDieCode = useCallback(async (die_id: number) => {
        await diecode_service.remove(die_id)
        toast.add({ title: "ลบข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        createDieCode,
        updateDieCode,
        deleteDieCode,
    }
}
