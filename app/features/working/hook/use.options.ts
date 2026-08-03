"use client"

import { useCallback, useEffect, useState } from "react"
import { jobcode_service } from "@/app/features/job-code/lib/job_service"
import { category_service } from "@/app/features/category-code/lib/category_service"
import { partcode_service } from "@/app/features/part-code/lib/partcode_service"
import { JobCode } from "@/app/features/job-code/type"
import { CategoryCode } from "@/app/features/category-code/type"
import { PartCode } from "@/app/features/part-code/type"

export function useWorkingOptions() {
    const [jobCodes, setJobCodes] = useState<JobCode[]>([])
    const [categoryCodes, setCategoryCodes] = useState<CategoryCode[]>([])
    const [partCodes, setPartCodes] = useState<PartCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const [jobs, categories, parts] = await Promise.all([
                jobcode_service.list(),
                category_service.list(),
                partcode_service.list(),
            ])
            setJobCodes(jobs)
            setCategoryCodes(categories)
            setPartCodes(parts)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลตัวเลือกไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount; state only updates after the awaited request settles
        fetchData()
    }, [fetchData])

    return { jobCodes, categoryCodes, partCodes, loading, error, refresh: fetchData }
}
