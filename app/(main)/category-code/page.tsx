"use client"

import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConfirmDialog } from "@/components/confirm-dialog"
import CategoryCodeTable from "@/app/features/category-code/components/category-table"
import CategoryCodeForm from "@/app/features/category-code/components/category-form"
import { useCategoryCode } from "@/app/features/category-code/hook/use-category"
import { CategoryCode } from "@/app/features/category-code/type"
import { CategoryCodeFormValues } from "@/app/features/category-code/lib/category_schema"

export default function CategoryCodePage() {
    const { data, loading, error, createCategoryCode, updateCategoryCode, deleteCategoryCode } = useCategoryCode()

    const [formOpen, setFormOpen] = useState(false)
    const [editing, setEditing] = useState<CategoryCode | null>(null)
    const [deleting, setDeleting] = useState<CategoryCode | null>(null)

    const handleAddClick = () => {
        setEditing(null)
        setFormOpen(true)
    }

    const handleEdit = (categoryCode: CategoryCode) => {
        setEditing(categoryCode)
        setFormOpen(true)
    }

    const handleFormSubmit = async (values: CategoryCodeFormValues) => {
        if (editing) {
            await updateCategoryCode(editing.cc_id, values)
        } else {
            await createCategoryCode(values)
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h1 className="text-xl font-semibold">รหัสหมวดหมู่</h1>
                    <p className="text-sm text-muted-foreground">
                        จัดการรายการรหัสหมวดหมู่สำหรับใช้งานในระบบ
                    </p>
                </div>
                <Button type="button" onClick={handleAddClick}>
                    <PlusIcon />
                    เพิ่มรหัสหมวดหมู่
                </Button>
            </div>

            <CategoryCodeTable
                data={data}
                loading={loading}
                error={error}
                onEdit={handleEdit}
                onDelete={setDeleting}
            />

            <CategoryCodeForm
                open={formOpen}
                onOpenChange={setFormOpen}
                categoryCode={editing}
                onSubmit={handleFormSubmit}
            />

            <ConfirmDialog
                open={!!deleting}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="ลบรหัสหมวดหมู่"
                description={`ต้องการลบรหัสหมวดหมู่ "${deleting?.cc_code}" ใช่หรือไม่? การลบไม่สามารถย้อนกลับได้`}
                confirmLabel="ลบ"
                confirmingLabel="กำลังลบ..."
                errorTitle="ลบข้อมูลไม่สำเร็จ"
                onConfirm={async () => {
                    if (!deleting) return
                    await deleteCategoryCode(deleting.cc_id)
                }}
            />
        </div>
    )
}
