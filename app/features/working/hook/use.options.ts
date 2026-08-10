"use client"

import { useCallback, useEffect, useState } from "react"
import { jobcode_service } from "@/app/features/job-code/lib/job_service"
import { category_service } from "@/app/features/category-code/lib/category_service"
import { partcode_service } from "@/app/features/part-code/lib/partcode_service"
import { diecode_service } from "@/app/features/die-code/lib/die_service"
import { machinecode_service } from "@/app/features/machine-code/lib/machine_service"
import { docter_project_code_service } from "@/app/features/docter-project-code/lib/docter_project_code_service"
import { useAuth } from "@/app/features/login/context/auth-context"
import { JobCode } from "@/app/features/job-code/type"
import { CategoryCode } from "@/app/features/category-code/type"
import { PartCode } from "@/app/features/part-code/type"
import { DieCode } from "@/app/features/die-code/type"
import { MachineCode } from "@/app/features/machine-code/type"

export function useWorkingOptions() {
    const { user } = useAuth()
    const [jobCodes, setJobCodes] = useState<JobCode[]>([])
    const [categoryCodes, setCategoryCodes] = useState<CategoryCode[]>([])
    const [partCodes, setPartCodes] = useState<PartCode[]>([])
    const [dieCodes, setDieCodes] = useState<DieCode[]>([])
    const [machineCodes, setMachineCodes] = useState<MachineCode[]>([])
    const [mfgNoList, setMfgNoList] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const [jobs, categories, parts, dies, machines, mfgNos] = await Promise.all([
                jobcode_service.list(),
                category_service.list(),
                partcode_service.list(),
                diecode_service.list(),
                machinecode_service.list(),
                docter_project_code_service.listMfgNo(),
            ])
            // เห็นเฉพาะ job code ของแผนกตัวเองที่ล็อกอินอยู่
            setJobCodes(jobs.filter((job) => job.dp_id === user?.d_id).sort((a, b) => a.job_id - b.job_id))
            setCategoryCodes(categories.filter((category) => category.dp_id === user?.d_id).sort((a, b) => a.cc_id - b.cc_id))
            setPartCodes(parts.filter((part) => part.dp_id === user?.d_id).sort((a, b) => a.part_id - b.part_id))
            setDieCodes(dies.filter((die) => die.dp_id === user?.d_id).sort((a, b) => a.die_id - b.die_id))
            setMachineCodes(machines.filter((machine) => machine.dp_id === user?.d_id).sort((a, b) => a.mac_id - b.mac_id))
            setMfgNoList(mfgNos)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลตัวเลือกไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [user])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount; state only updates after the awaited request settles
        fetchData()
    }, [fetchData])

    return { jobCodes, categoryCodes, partCodes, dieCodes, machineCodes, mfgNoList, loading, error, refresh: fetchData }
}
