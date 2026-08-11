"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { PlusIcon, XIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { WorkActionStatusInfo } from "@/components/work-action-status-info"
import WorkingCard from "@/app/features/working/components/working.card"
import WorkingForm from "@/app/features/working/components/working.form"
import { useWorking } from "@/app/features/working/hook/use.working"
import { useWorkingOptions } from "@/app/features/working/hook/use.options"
import { WorkingMaster } from "@/app/features/working/type"
import { WorkingMasterFormValues } from "@/app/features/working/lib/working.schema"

const WorkingWeekCalendar = dynamic(
    () => import("@/app/features/working/components/working-week-calendar"),
    { ssr: false, loading: () => <div className="flex h-24 items-center justify-center rounded-md border"><Spinner /></div> }
)

export default function WorkingPage() {
    const {
        data,
        loading,
        error,
        createWorking,
        updateWorking,
        deleteWorking,
        startJob,
        endJob,
        finishWorking,
    } = useWorking()
    const { jobCodes, categoryCodes, partCodes, dieCodes, machineCodes, mfgNoList } = useWorkingOptions()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<WorkingMaster | null>(null)
    const [deleting, setDeleting] = useState<WorkingMaster | null>(null)

    const handleAddClick = () => {
        if (formOpen && !editing) {
            setFormOpen(false)
            return
        }
        setEditing(null)
        setFormOpen(true)
    }

    const handleEdit = (item: WorkingMaster) => {
        setEditing(item)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: WorkingMasterFormValues) => {
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

        if (editing) {
            await updateWorking(editing.w_id, input)
        } else {
            await createWorking(input)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <WorkingWeekCalendar />

            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="flex items-center gap-1.5">
                        <h1 className="text-xl font-semibold">บันทึกงาน</h1>
                        <WorkActionStatusInfo />
                    </div>
                    <p className="text-sm text-muted-foreground">
                        รายการงานที่ยังไม่จบ เริ่ม/ปิด/จบงานได้จากการ์ดแต่ละรายการ
                    </p>
                </div>
                <Button type="button" onClick={handleAddClick}>
                    {formOpen && !editing ? <XIcon /> : <PlusIcon />}
                    {formOpen && !editing ? "ปิดฟอร์ม" : "เพิ่มงาน"}
                </Button>
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
                mfgNoList={mfgNoList}
                onSubmit={handleFormSubmit}
            />

            {loading ? (
                <div className="flex h-24 items-center justify-center rounded-md border">
                    <Spinner />
                </div>
            ) : error ? (
                <div className="flex h-24 items-center justify-center rounded-md border text-sm text-destructive">
                    {error}
                </div>
            ) : data.length === 0 ? (
                <div className="flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground">
                    ยังไม่มีงานที่ค้างอยู่
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {data.map((item) => (
                        <WorkingCard
                            key={item.w_id}
                            item={item}
                            onEdit={handleEdit}
                            onDelete={setDeleting}
                            onStart={startJob}
                            onEnd={endJob}
                            onFinish={finishWorking}
                        />
                    ))}
                </div>
            )}

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="ลบงาน"
                description={`ต้องการลบงาน "${deleting?.job_code}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบ"
                confirmingLabel="กำลังลบ..."
                errorTitle="ลบข้อมูลไม่สำเร็จ"
                onConfirm={async () => {
                    if (!deleting) return
                    await deleteWorking(deleting.w_id)
                }}
            />
        </div>
    )
}
