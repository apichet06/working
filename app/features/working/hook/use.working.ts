"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast"
import { working_service } from "../lib/working.service"
import { scheduleAutoCloseRefresh } from "../lib/auto-close-schedule"
import { WorkingMaster, WorkingMasterInput } from "../type"

export function useWorking() {
    const [data, setData] = useState<WorkingMaster[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await working_service.list()
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

        // เผื่อกรณีระบบปิดงานอัตโนมัติ (cron 11:45 / 16:40 / 00:00) ตอนที่หน้านี้เปิดค้างอยู่ - reload ครั้งเดียวหลังรอบ auto-close แต่ละครั้ง
        return scheduleAutoCloseRefresh(fetchData)
    }, [fetchData])

    useEffect(() => {
        // เมื่อ browser คืนการทำงานให้ tab ให้โหลด elapsed_seconds และสถานะล่าสุดจาก server
        // focus กับ visibilitychange มักเกิดติดกัน จึงกัน request ซ้ำในช่วงสั้นๆ
        let lastRefreshAt = 0
        const refreshWhenVisible = () => {
            if (document.visibilityState !== "visible") return
            const now = Date.now()
            if (now - lastRefreshAt < 1000) return
            lastRefreshAt = now
            void fetchData()
        }

        document.addEventListener("visibilitychange", refreshWhenVisible)
        window.addEventListener("focus", refreshWhenVisible)
        return () => {
            document.removeEventListener("visibilitychange", refreshWhenVisible)
            window.removeEventListener("focus", refreshWhenVisible)
        }
    }, [fetchData])

    const createWorking = useCallback(async (input: WorkingMasterInput) => {
        await working_service.create(input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const updateWorking = useCallback(async (w_id: number, input: WorkingMasterInput) => {
        await working_service.update(w_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const deleteWorking = useCallback(async (w_id: number) => {
        await working_service.remove(w_id)
        toast.add({ title: "ลบข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const startJob = useCallback(async (w_id: number) => {
        await working_service.startJob(w_id)
        toast.add({ title: "เริ่มงานแล้ว", type: "success" })
        await fetchData()
    }, [fetchData])

    const endJob = useCallback(async (wa_id: number) => {
        await working_service.endJob(wa_id)
        toast.add({ title: "ปิดงานแล้ว", type: "success" })
        await fetchData()
    }, [fetchData])

    const logManualTime = useCallback(async (w_id: number, wa_start_job: string, wa_end_job: string) => {
        await working_service.logManualTime({ w_id, wa_start_job, wa_end_job })
        toast.add({ title: "บันทึกเวลาแล้ว", type: "success" })
        await fetchData()
    }, [fetchData])

    const finishWorking = useCallback(async (w_id: number) => {
        await working_service.finish(w_id)
        toast.add({ title: "จบงานแล้ว", type: "success" })
        await fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        createWorking,
        updateWorking,
        deleteWorking,
        startJob,
        endJob,
        logManualTime,
        finishWorking,
    }
}
