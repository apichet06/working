import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { CategoryCode } from "../type"

type GetCategoryCodeColumnsOptions = {
    onEdit: (categoryCode: CategoryCode) => void
    onDelete: (categoryCode: CategoryCode) => void
}

export function getCategoryCodeColumns({
    onEdit,
    onDelete,
}: GetCategoryCodeColumnsOptions): ColumnDef<CategoryCode>[] {
    return [
        {
            header: 'ลำดับ',
            cell: ({ row }) => row.index + 1,
            size: 50,
            enableSorting: false,
        },
        {
            accessorKey: "cc_code",
            header: "รหัสหมวดหมู่",
        },
        {
            accessorKey: "cc_descriptions",
            header: "รายละเอียด",
        },
        {
            id: "actions",
            header: "จัดการ",
            cell: ({ row }) => (
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="แก้ไข"
                        onClick={() => onEdit(row.original)}
                    >
                        <PencilIcon />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label="ลบ"
                        onClick={() => onDelete(row.original)}
                    >
                        <Trash2Icon className="text-destructive" />
                    </Button>
                </div>
            ),
        },
    ]
}
