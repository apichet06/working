"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import JobCodeTable from "@/app/features/job-code/components/jobcode-table"
import JobCodeForm from "@/app/features/job-code/components/jobcode-form"
import { useJobCode } from "@/app/features/job-code/hook/use-jobcode"
import { useDepartment } from "@/app/features/job-code/hook/use-department"
import { JobCode } from "@/app/features/job-code/type"
import { JobCodeFormValues } from "@/app/features/job-code/lib/job_schema"

export default function JobCodePage() {
    const { data, loading, error, createJobCode, updateJobCode, deleteJobCode } = useJobCode()
    const { data: departments } = useDepartment()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<JobCode | null>(null)
    const [deleting, setDeleting] = useState<JobCode | null>(null)

    const handleAddClick = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const handleEdit = (jobCode: JobCode) => {
        setEditing(jobCode)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: JobCodeFormValues) => {
        const input = {
            job_code: values.job_code,
            dp_id: Number(values.dp_id),
            job_descriptions: values.job_descriptions,
        }
        if (editing) {
            await updateJobCode(editing.job_id, input)
        } else {
            await createJobCode(input)
        }
    }
    console.log(data);

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">รหัสงาน</h1>
                    <p className="text-sm text-muted-foreground">
                        จัดการรายการรหัสงานสำหรับใช้งานในระบบ
                    </p>
                </div>
                <Button type="button" onClick={handleAddClick}>
                    <PlusIcon />
                    เพิ่มรหัสงาน
                </Button>
            </div>

            <JobCodeTable
                data={data}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                onDelete={setDeleting}
            />

            <JobCodeForm
                open={formOpen}
                onOpenChange={setFormOpen}
                jobCode={editing}
                departments={departments}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="ลบรหัสงาน"
                description={`ต้องการลบรหัสงาน "${deleting?.job_code}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบ"
                confirmingLabel="กำลังลบ..."
                errorTitle="ลบข้อมูลไม่สำเร็จ"
                onConfirm={async () => {
                    if (!deleting) return
                    await deleteJobCode(deleting.job_id)
                }}
            />
        </div>
    )
}
