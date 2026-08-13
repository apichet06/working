"use client"

import { useEffect, useState } from "react"
import { endOfMonth, startOfMonth } from "date-fns"
import WorkingCheckingTable from "@/app/features/working-checking/components/working-checking-table"
import { useWorkingChecking } from "@/app/features/working-checking/hook/use.working-checking"
import WorkingForm from "@/app/features/working/components/working.form"
import { useWorkingOptions } from "@/app/features/working/hook/use.options"
import { WorkingMaster } from "@/app/features/working/type"
import { WorkingMasterFormValues } from "@/app/features/working/lib/working.schema"
import { normalizeDateOnly } from "@/lib/formDatetime"

export default function WorkingChecking() {
    const { data, loading, error, searched, search, updateWorkingMaster } = useWorkingChecking()
    const { jobCodes, categoryCodes, partCodes, dieCodes, machineCodes } = useWorkingOptions()

    // ค่าเริ่มต้น: เดือนปีปัจจุบัน ให้ผู้ใช้กดค้นหาได้ทันทีโดยไม่ต้องเลือกวันเอง
    const [from, setFrom] = useState(() => normalizeDateOnly(startOfMonth(new Date())))
    const [to, setTo] = useState(() => normalizeDateOnly(endOfMonth(new Date())))
    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<WorkingMaster | null>(null)

    useEffect(() => {
        // initial fetch-on-mount using the default current-month range
        search(from, to)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only run once on mount; re-searching after that goes through the search button
    }, [])

    const handleRangeChange = (newFrom: string, newTo: string) => {
        setFrom(newFrom)
        setTo(newTo)
        search(newFrom, newTo)
    }

    const handleEdit = (item: WorkingMaster) => {
        setEditing(item)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: WorkingMasterFormValues) => {
        if (!editing) return

        const job = jobCodes.find((j) => String(j.job_id) === values.job_id)
        const category = categoryCodes.find((c) => String(c.cc_id) === values.cc_id)
        const part = partCodes.find((p) => String(p.part_id) === values.part_id)

        const input = {
            job_id: Number(values.job_id),
            job_code: job?.job_code ?? "",
            cc_id: Number(values.cc_id),
            cc_code: category?.cc_code ?? "",
            part_id: Number(values.part_id),
            part_code: part?.part_code ?? "",
            mac_id: values.mac_id ? Number(values.mac_id) : null,
            w_desc: values.w_desc,
            w_project_no: values.w_project_no,
        }

        await updateWorkingMaster(editing.w_id, input)
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-xl font-semibold">ตรวจสอบ/แก้ไขงานย้อนหลัง</h1>
                <p className="text-sm text-muted-foreground">
                    ค้นหาและแก้ไขข้อมูลงานของตัวเองในวันก่อนหน้าได้ที่นี่
                </p>
            </div>
            <WorkingForm
                open={formOpen}
                onOpenChange={setFormOpen}
                workingItem={editing}
                jobCodes={jobCodes}
                categoryCodes={categoryCodes}
                partCodes={partCodes}
                dieCodes={dieCodes}
                machineCodes={machineCodes}
                onSubmit={handleFormSubmit}
            />
            <WorkingCheckingTable
                data={data}
                loading={loading}
                error={error}
                searched={searched}
                from={from}
                to={to}
                onRangeChange={handleRangeChange}
                onEdit={handleEdit}
            />
        </div>
    )
}
