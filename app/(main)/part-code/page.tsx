"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import PartCodeTable from "@/app/features/part-code/components/partcode-table"
import PartCodeForm from "@/app/features/part-code/components/partcode-form"
import { usePartCode } from "@/app/features/part-code/hook/use-partcode"
import { PartCode } from "@/app/features/part-code/type"
import { PartCodeFormValues } from "@/app/features/part-code/lib/partcode_schema"

export default function PartCodePage() {
    const { data, loading, error, createPartCode, updatePartCode, deletePartCode } = usePartCode()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<PartCode | null>(null)
    const [deleting, setDeleting] = useState<PartCode | null>(null)

    const handleAddClick = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const handleEdit = (partCode: PartCode) => {
        setEditing(partCode)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: PartCodeFormValues) => {
        if (editing) {
            await updatePartCode(editing.part_id, values)
        } else {
            await createPartCode(values)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">รหัสชิ้นงาน</h1>
                    <p className="text-sm text-muted-foreground">
                        จัดการรายการรหัสชิ้นงานสำหรับใช้งานในระบบ
                    </p>
                </div>
                <Button type="button" onClick={handleAddClick}>
                    <PlusIcon />
                    เพิ่มรหัสชิ้นงาน
                </Button>
            </div>

            <PartCodeTable
                data={data}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                onDelete={setDeleting}
            />

            <PartCodeForm
                open={formOpen}
                onOpenChange={setFormOpen}
                partCode={editing}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="ลบรหัสชิ้นงาน"
                description={`ต้องการลบรหัสชิ้นงาน "${deleting?.part_code}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบ"
                confirmingLabel="กำลังลบ..."
                errorTitle="ลบข้อมูลไม่สำเร็จ"
                onConfirm={async () => {
                    if (!deleting) return
                    await deletePartCode(deleting.part_id)
                }}
            />
        </div>
    )
}
