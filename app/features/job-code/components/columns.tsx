import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PencilIcon, Trash2Icon } from "lucide-react"
import { JobCode } from "../type"

type GetJobCodeColumnsOptions = {
    onEdit: (jobCode: JobCode) => void
    onDelete: (jobCode: JobCode) => void
}

export function getJobCodeColumns({
    onEdit,
    onDelete,
}: GetJobCodeColumnsOptions): ColumnDef<JobCode>[] {
    return [
        {
            header: 'ลำดับ',
            cell: ({ row }) => row.index + 1,
            size: 50,
            enableSorting: false,
        },
        {
            accessorKey: "job_id",
            header: "job_id",
        },
        {
            accessorKey: "job_code",
            header: "รหัสงาน",
        },
        {
            accessorKey: "dp_department",
            header: "แผนก",
            cell: ({ row }) => row.original.dp_department ?? "-",
        },
        {
            accessorKey: "job_descriptions",
            header: "รายละเอียด",
        },
        {
            accessorKey: "add_date",
            header: "วันที่เพิ่ม",
            cell: ({ row }) => row.original.add_date ?? "-",
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
