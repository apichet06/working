import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import { PencilIcon } from "lucide-react"
import { WorkingActionsJobList } from "../type"
import { FormatDate, formatEngDateTime } from "@/lib/formDatetime"
import { WorkActionStatusBadge } from "@/components/work-action-status-badge"

type GetWorkingTimeColumnsOptions = {
    onEdit: (row: WorkingActionsJobList) => void
}

export function getWorkingTimeColumns({
    onEdit,
}: GetWorkingTimeColumnsOptions): ColumnDef<WorkingActionsJobList>[] {
    return [
        {
            header: 'ลำดับ',
            cell: ({ row }) => row.index + 1,
            size: 50,
            enableSorting: false,
            meta: {
                thClassName: "sticky left-0 z-10 border-r bg-background",
                tdClassName: "sticky left-0 z-10 border-r bg-background",
            },
        },
        {
            accessorKey: "e_usercode",
            header: "รหัสพนักงาน",
        },
        {
            accessorKey: "working_date",
            header: "วันที่ทำงาน",
            cell: ({ row }) => FormatDate(row.original.working_date),
        },
        {
            accessorKey: "job_desc",
            header: "รหัสงาน (Job Code)",
        },
        {
            accessorKey: "part_desc",
            header: "รหัสชิ้นงาน (Part Code)",
        },
        {
            accessorKey: "cc_desc",
            header: "หมวดหมู่ (Category Code)",
        },
        {
            accessorKey: "die_desc",
            header: "รหัสดาย (DEI NO)",
            cell: ({ row }) => row.original.die_desc ?? "-",
        },
        {
            accessorKey: "mac_desc",
            header: "เครื่องจักร",
            cell: ({ row }) => row.original.mac_desc ?? "-",
        },
        {
            accessorKey: "w_desc",
            header: "รายละเอียดงาน",
        },
        {
            accessorKey: "working_time",
            header: "เวลาทำงาน",
        },
        {
            accessorKey: "labour_hour",
            header: "ชั่วโมงทำงาน",
        },
        {
            accessorKey: "wa_status",
            header: "สถานะ",
            cell: ({ row }) => <WorkActionStatusBadge status={row.original.wa_status} />,
        },
        {
            accessorKey: "e_name",
            header: "ผู้แก้ไข",
            cell: ({ row }) => {
                const data = row.original.e_name
                return data == null ? "-" : data
            }
        },
        {
            accessorKey: "edit_date",
            header: "เวลาแก้ไข",
            cell: ({ row }) => formatEngDateTime(row.original.edit_date),
        },
        {
            id: "actions",
            header: "จัดการ",
            meta: {
                thClassName: "sticky right-0 z-10 border-l bg-background",
                tdClassName: "sticky right-0 z-10 border-l bg-background",
            },
            cell: ({ row }) => {
                const notEnded = !row.original.wa_end_job
                return (
                    <div className="flex items-center gap-1">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label="แก้ไข"
                            disabled={notEnded}
                            title={notEnded ? "ยังไม่ปิดงาน จึงยังแก้ไขไม่ได้" : undefined}
                            onClick={() => onEdit(row.original)}
                        >
                            <PencilIcon />
                        </Button>
                    </div>
                )
            },
        },
    ]
}
