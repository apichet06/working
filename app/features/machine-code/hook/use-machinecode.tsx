"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast"
import { machinecode_service } from "../lib/machine_service"
import { MachineCode, MachineCodeInput } from "../type"

export function useMachineCode() {
    const [data, setData] = useState<MachineCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await machinecode_service.list()
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

    const createMachineCode = useCallback(async (input: MachineCodeInput) => {
        await machinecode_service.create(input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const updateMachineCode = useCallback(async (mac_id: number, input: MachineCodeInput) => {
        await machinecode_service.update(mac_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const deleteMachineCode = useCallback(async (mac_id: number) => {
        await machinecode_service.remove(mac_id)
        toast.add({ title: "ลบข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        createMachineCode,
        updateMachineCode,
        deleteMachineCode,
    }
}
