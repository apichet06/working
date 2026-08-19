"use client"

import { useCallback, useState } from "react"
import { toast } from "@/components/ui/toast"
import { working_checking_service } from "../lib/working-checking.service"
import { WorkingMaster, WorkingMasterInput } from "@/app/features/working/type"

export function useWorkingChecking() {
    const [data, setData] = useState<WorkingMaster[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [searched, setSearched] = useState(false)
    const [range, setRange] = useState<{ from: string; to: string } | null>(null)

    const search = useCallback(async (from: string, to: string) => {
        setRange({ from, to })
        setSearched(true)
        setLoading(true)
        try {
            const res = await working_checking_service.listHistory(from, to)
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    const updateActionJobDetail = useCallback(async (wa_id: number, input: WorkingMasterInput) => {
        await working_checking_service.updateActionJobDetail(wa_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        if (range) await search(range.from, range.to)
    }, [range, search])

    return {
        data,
        loading,
        error,
        searched,
        search,
        updateActionJobDetail,
    }
}
