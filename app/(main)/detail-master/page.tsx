'use client'
import { useDepartment } from "@/app/features/dashboard/hook/use.department";
import DetailMasterForm from "@/app/features/detail-master/components/detail-form";
import DetailTable from "@/app/features/detail-master/components/detail-table";
import { useDetailMaster } from "@/app/features/detail-master/hook/use-detail";
import { DetailMasterFormValues } from "@/app/features/detail-master/lib/detail_schema";
import { DetailMaster } from "@/app/features/detail-master/type";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { PlusIcon } from "lucide-react";
import { useState } from "react";


export default function DetailMasterPage() {

    const { data, loading, error, createDetailMaster, updateDetailMaster, deleteDetailMaster } = useDetailMaster()
    const { data: departments } = useDepartment()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<DetailMaster | null>(null)
    const [deleting, setDeleting] = useState<DetailMaster | null>(null)

    const handleAddClick = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const handleEdit = (detailMaster: DetailMaster) => {
        setEditing(detailMaster)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: DetailMasterFormValues) => {
        const input = {
            dp_id: Number(values.dp_id),
            detail_descriptions: values.detail_descriptions,
        }
        if (editing) {
            await updateDetailMaster(editing.detail_id, input)
        } else {
            await createDetailMaster(input)
        }
    }



    return (
        <>
            <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h1 className="text-xl font-semibold">  จัดการรายละเอียด</h1>
                        <p className="text-sm text-muted-foreground">
                            จัดการรายละเอียดสำหรับใช้งานในระบบ
                        </p>
                    </div>
                    <Button type="button" onClick={handleAddClick}>
                        <PlusIcon />
                        เพิ่มรายละเอียด
                    </Button>
                </div>
                <DetailTable
                    data={data}
                    loading={loading}
                    error={error}
                    departments={departments}
                    onEdit={handleEdit}
                    onDelete={setDeleting}
                />

                <DetailMasterForm
                    open={formOpen}
                    onOpenChange={setFormOpen}
                    detailMaster={editing}
                    departments={departments}
                    onSubmit={handleFormSubmit}
                />
            </div>

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="ลบรายละเอียด"
                description={`ต้องการลบ "${deleting?.detail_descriptions}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบ"
                confirmingLabel="กำลังลบ..."
                errorTitle="ลบข้อมูลไม่สำเร็จ"
                onConfirm={async () => {
                    if (!deleting) return
                    await deleteDetailMaster(deleting.detail_id)
                }}
            />
        </>
    )
}
