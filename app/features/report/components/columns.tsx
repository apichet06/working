import { ColumnDef } from "@tanstack/react-table"
import { WorkingReport } from "@/app/features/report/type"
import { FormatDate } from "@/lib/formDatetime"

export function getReportColumns(): ColumnDef<WorkingReport>[] {
    return [
        {
            header: 'ลำดับ',
            cell: ({ row }) => row.index + 1,
            size: 50,
            enableSorting: false,
        },
        {
            accessorKey: "e_usercode",
            header: "รหัสพนักงาน",
        },
        {
            accessorKey: "working_date",
            header: "วันที่",
            cell: ({ row }) => FormatDate(row.original.working_date),
        },
        {
            accessorKey: "w_project_no",
            header: "เลขที่โปรเจกต์",
            cell: ({ row }) => row.original.w_project_no || "-",
        },
        {
            accessorKey: "job_desc",
            header: "งาน (Job)",
            cell: ({ row }) => row.original.job_desc,
        },
        {
            accessorKey: "mac_desc",
            header: "เครื่องจักร(Machine)"
        },
        {
            accessorKey: "part_desc",
            header: "ชิ้นงาน (Part)",
            cell: ({ row }) => row.original.part_desc,
        },
        {
            accessorKey: "cc_desc",
            header: "หมวดหมู่ (Category)",
            cell: ({ row }) => row.original.cc_desc,
        },
        {
            accessorKey: "w_desc",
            header: "รายละเอียด",
        },
        {
            accessorKey: "job_hour",
            header: "Job Hour (วัน)",
            cell: ({ row }) => row.original.job_hour.toFixed(2),
        },
        {
            accessorKey: "labour_hour",
            header: "Labour Hour (ชม.)",
            cell: ({ row }) => row.original.labour_hour.toFixed(2),
        },
    ]
}
