import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { CategoryCode } from "../type"
import { formatDateTime } from "@/lib/formDatetime"

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
            accessorKey: "cc_id",
            header: "รหัส ID",
        },
        {
            accessorKey: "cc_code",
            header: "รหัสหมวดหมู่",
        },
        {
            accessorKey: "dp_department",
            header: "แผนก",
            cell: ({ row }) => row.original.dp_department ?? "-",
        },
        {
            accessorKey: "cc_descriptions",
            header: "รายละเอียด",
        },
        {
            accessorKey: "add_date",
            header: "วันที่เพิ่ม",
            cell: ({ row }) => formatDateTime(row.original.add_date) ?? "-",
        },
        {
            accessorKey: "e_name",
            header: "ผู้เพิ่ม",
            cell: ({ row }) => row.original.e_name ?? "-",
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
