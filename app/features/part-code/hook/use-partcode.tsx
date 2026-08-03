"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast"
import { partcode_service } from "../lib/partcode_service"
import { PartCode, PartCodeInput } from "../type"

export function usePartCode() {
    const [data, setData] = useState<PartCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await partcode_service.list()
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

    const createPartCode = useCallback(async (input: PartCodeInput) => {
        await partcode_service.create(input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const updatePartCode = useCallback(async (part_id: number, input: PartCodeInput) => {
        await partcode_service.update(part_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const deletePartCode = useCallback(async (part_id: number) => {
        await partcode_service.remove(part_id)
        toast.add({ title: "ลบข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        createPartCode,
        updatePartCode,
        deletePartCode,
    }
}
