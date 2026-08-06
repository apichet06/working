"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import MachineCodeTable from "@/app/features/machine-code/components/machinecode-table"
import MachineCodeForm from "@/app/features/machine-code/components/machinecode-form"
import { useMachineCode } from "@/app/features/machine-code/hook/use-machinecode"
import { useDepartment } from "@/app/features/machine-code/hook/use-department"
import { MachineCode } from "@/app/features/machine-code/type"
import { MachineCodeFormValues } from "@/app/features/machine-code/lib/machine_schema"

export default function MachineCodePage() {
    const { data, loading, error, createMachineCode, updateMachineCode, deleteMachineCode } = useMachineCode()
    const { data: departments } = useDepartment()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<MachineCode | null>(null)
    const [deleting, setDeleting] = useState<MachineCode | null>(null)

    const handleAddClick = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const handleEdit = (machineCode: MachineCode) => {
        setEditing(machineCode)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: MachineCodeFormValues) => {
        const input = {
            mac_code: values.mac_code,
            dp_id: Number(values.dp_id),
            mac_descriptions: values.mac_descriptions,
        }
        if (editing) {
            await updateMachineCode(editing.mac_id, input)
        } else {
            await createMachineCode(input)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">รหัสเครื่องจักร</h1>
                    <p className="text-sm text-muted-foreground">
                        จัดการรายการรหัสเครื่องจักรสำหรับใช้งานในระบบ
                    </p>
                </div>
                <Button type="button" onClick={handleAddClick}>
                    <PlusIcon />
                    เพิ่มรหัสเครื่องจักร
                </Button>
            </div>

            <MachineCodeTable
                data={data}
                loading={loading}
                error={error}
                departments={departments}
                onEdit={handleEdit}
                onDelete={setDeleting}
            />

            <MachineCodeForm
                open={formOpen}
                onOpenChange={setFormOpen}
                machineCode={editing}
                departments={departments}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="ลบรหัสเครื่องจักร"
                description={`ต้องการลบรหัสเครื่องจักร "${deleting?.mac_code}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบ"
                confirmingLabel="กำลังลบ..."
                errorTitle="ลบข้อมูลไม่สำเร็จ"
                onConfirm={async () => {
                    if (!deleting) return
                    await deleteMachineCode(deleting.mac_id)
                }}
            />
        </div>
    )
}
