"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import DieCodeTable from "@/app/features/die-code/components/diecode-table"
import DieCodeForm from "@/app/features/die-code/components/diecode-form"
import { useDieCode } from "@/app/features/die-code/hook/use-diecode"
import { useDepartment } from "@/app/features/die-code/hook/use-department"
import { DieCode } from "@/app/features/die-code/type"
import { DieCodeFormValues } from "@/app/features/die-code/lib/die_schema"

export default function DieCodePage() {
    const { data, loading, error, createDieCode, updateDieCode, deleteDieCode } = useDieCode()
    const { data: departments } = useDepartment()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<DieCode | null>(null)
    const [deleting, setDeleting] = useState<DieCode | null>(null)

    const handleAddClick = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const handleEdit = (dieCode: DieCode) => {
        setEditing(dieCode)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: DieCodeFormValues) => {
        const input = {
            die_code: values.die_code,
            dp_id: Number(values.dp_id),
            die_descriptions: values.die_descriptions,
        }
        if (editing) {
            await updateDieCode(editing.die_id, input)
        } else {
            await createDieCode(input)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">รหัสดาย</h1>
                    <p className="text-sm text-muted-foreground">
                        จัดการรายการรหัสดายสำหรับใช้งานในระบบ
                    </p>
                </div>
                <Button type="button" onClick={handleAddClick}>
                    <PlusIcon />
                    เพิ่มรหัสดาย
                </Button>
            </div>

            <DieCodeTable
                data={data}
                loading={loading}
                error={error}
                departments={departments}
                onEdit={handleEdit}
                onDelete={setDeleting}
            />

            <DieCodeForm
                open={formOpen}
                onOpenChange={setFormOpen}
                dieCode={editing}
                departments={departments}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="ลบรหัสดาย"
                description={`ต้องการลบรหัสดาย "${deleting?.die_code}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบ"
                confirmingLabel="กำลังลบ..."
                errorTitle="ลบข้อมูลไม่สำเร็จ"
                onConfirm={async () => {
                    if (!deleting) return
                    await deleteDieCode(deleting.die_id)
                }}
            />
        </div>
    )
}
