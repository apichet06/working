"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast"
import { jobcode_service } from "../lib/job_service"
import { JobCode, JobCodeInput } from "../type"

export function useJobCode() {
    const [data, setData] = useState<JobCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await jobcode_service.list()
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

    const createJobCode = useCallback(async (input: JobCodeInput) => {
        await jobcode_service.create(input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const updateJobCode = useCallback(async (job_id: number, input: JobCodeInput) => {
        await jobcode_service.update(job_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const deleteJobCode = useCallback(async (job_id: number) => {
        await jobcode_service.remove(job_id)
        toast.add({ title: "ลบข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        createJobCode,
        updateJobCode,
        deleteJobCode,
    }
}
