import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "lucide-react"
import { WorkingMaster } from "@/app/features/working/type"
import { FormatDate, toTimeValue } from "@/lib/formDatetime"

type GetWorkingCheckingColumnsOptions = {
    onEdit: (row: WorkingMaster) => void
}

export function getWorkingCheckingColumns({
    onEdit,
}: GetWorkingCheckingColumnsOptions): ColumnDef<WorkingMaster>[] {
    return [
        {
            header: 'ลำดับ',
            cell: ({ row }) => row.index + 1,
            size: 50,
            enableSorting: false,
        },
        {
            accessorKey: "w_project_no",
            header: "เลขที่โปรเจกต์",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span>{row.original.w_project_no || "-"}</span>
                    {row.original.die_descriptions && (
                        <span className="text-xs text-muted-foreground">{row.original.die_descriptions}</span>
                    )}
                </div>
            ),
        },
        {
            accessorKey: "job_code",
            header: "งาน (Job Code)",
            filterFn: "weakEquals",
            cell: ({ row }) => `${row.original.job_code} - ${row.original.job_descriptions}`,
        },
        {
            accessorKey: "cc_code",
            header: "หมวดหมู่ (Category Code)",
            filterFn: "weakEquals",
            cell: ({ row }) => `${row.original.cc_code} - ${row.original.cc_descriptions}`,
        },
        {
            accessorKey: "part_code",
            header: "ชิ้นงาน (Part Code)",
            filterFn: "weakEquals",
            cell: ({ row }) => `${row.original.part_code} - ${row.original.part_descriptions}`,
        },
        {
            accessorKey: "mac_code",
            header: "เครื่องจักร",
            cell: ({ row }) => row.original.mac_code ? `${row.original.mac_code} - ${row.original.mac_descriptions}` : "-",
        },

        {
            accessorKey: "w_desc",
            header: "รายละเอียด",
        },
        {
            accessorKey: "w_date",
            header: "วันที่",
            cell: ({ row }) => FormatDate(row.original.w_date),
        },
        {
            accessorKey: "wa_start_job",
            header: "เวลาเริ่มงาน",
            cell: ({ row }) => row.original.wa_start_job ? toTimeValue(row.original.wa_start_job).slice(0, 5) : "-",
            meta: {
                thClassName: "bg-sky-100 dark:bg-sky-950/40",
                tdClassName: "bg-sky-50 dark:bg-sky-950/20",
            },
        },
        {
            accessorKey: "wa_end_job",
            header: "เวลาจบงาน",
            cell: ({ row }) => row.original.wa_end_job ? toTimeValue(row.original.wa_end_job).slice(0, 5) : "-",
            meta: {
                thClassName: "bg-sky-100 dark:bg-sky-950/40",
                tdClassName: "bg-sky-50 dark:bg-sky-950/20",
            },
        },
        {
            accessorKey: "job_hour",
            header: "Job Hour (วัน)",
            cell: ({ row }) => row.original.job_hour != null ? row.original.job_hour.toFixed(2) : "-",
            meta: {
                thClassName: "bg-blue-100 dark:bg-blue-950/40",
                tdClassName: "bg-blue-50 dark:bg-blue-950/20",
            },
        },
        {
            accessorKey: "labour_hour",
            header: "Labour Hour (ชม.)",
            cell: ({ row }) => row.original.labour_hour != null ? row.original.labour_hour.toFixed(2) : "-",
            meta: {
                thClassName: "bg-blue-100 dark:bg-blue-950/40",
                tdClassName: "bg-blue-50 dark:bg-blue-950/20",
            },
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
                </div>
            ),
        },
    ]
}
