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
            header: "เครื่องจักร(Machine)",
            cell: ({ row }) => {
                const data = row.original.mac_code
                return data == null ? "-" : data
            }
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
            // ปักหมุดชิดขวาคู่กับ labour_hour ต้อง offset ด้วยความกว้างของ labour_hour (right-28 = w-28)
            // ไม่งั้นทั้งสองคอลัมน์จะ sticky right-0 ทับตำแหน่งเดียวกัน อันนี้เลยดูเหมือน "ใช้ไม่ได้" เพราะโดน labour_hour บังอยู่
            meta: {
                thClassName: "sticky right-28 z-10 w-28 border-l bg-background",
                tdClassName: "sticky right-28 z-10 w-28 border-l bg-background",
            },
        },
        {
            accessorKey: "labour_hour",
            header: "Labour Hour (ชม.)",
            cell: ({ row }) => row.original.labour_hour.toFixed(2),
            // ไม่ต้องมี border-l เพราะติดกับ job_hour ที่ sticky อยู่แล้ว ไม่ใช่รอยต่อกับเนื้อหาที่เลื่อนได้
            meta: {
                thClassName: "sticky right-0 z-10 w-28 bg-background",
                tdClassName: "sticky right-0 z-10 w-28 bg-background",
            },
        },
    ]
}
