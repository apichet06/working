"use client"

import { useEffect, useState } from "react"
import { endOfMonth, startOfMonth } from "date-fns"
import { TriangleAlertIcon } from "lucide-react"
import ReportTable from "@/app/features/report/components/report-table"
import { useReport } from "@/app/features/report/hook/use.report"
import { useDepartment } from "@/app/features/dashboard/hook/use.department"
import { useEmp } from "@/app/features/working-time/hook/use.emp"
import { normalizeDateOnly } from "@/lib/formDatetime"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function WorkingReportPage() {
    const { data, loading, error, searched, search } = useReport()
    const { data: departments } = useDepartment()
    const { data: empData } = useEmp()

    const [from, setFrom] = useState(() => normalizeDateOnly(startOfMonth(new Date())))
    const [to, setTo] = useState(() => normalizeDateOnly(endOfMonth(new Date())))

    // อ่านของทุกคนเสมอ (ไม่ส่ง e_id ให้ backend) ตัวกรองแผนก/พนักงาน/งาน/หมวดหมู่/ชิ้นงานทำที่ ReportTable ฝั่ง client ทั้งหมด
    useEffect(() => {
        search(from, to)
        // eslint-disable-next-line react-hooks/exhaustive-deps -- ยิงครั้งเดียวตอน mount ด้วยช่วงวันที่เริ่มต้น ส่วน handleRangeChange เป็นคนยิง search เองตอนเปลี่ยนช่วงวันที่
    }, [])

    const handleRangeChange = (newFrom: string, newTo: string) => {
        setFrom(newFrom)
        setTo(newTo)
        search(newFrom, newTo)
    }

    return (
        <div className="flex flex-col gap-4">
            <div>
                <h1 className="text-xl font-semibold">Working Report</h1>
                <p className="text-sm text-muted-foreground">
                    รายงานสรุปการทำงานตามช่วงวันที่
                </p>
            </div>

            <Alert className="border-amber-500/50 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-950/30">
                <TriangleAlertIcon className="text-amber-600 dark:text-amber-400" />
                <AlertDescription className="text-amber-800 dark:text-amber-300">
                    หมายเหตุ: ถ้าพนักงานคนเดียวกันทำงานเดียวกัน (โปรเจกต์ งาน หมวดหมู่ ชิ้นงาน และรายละเอียดตรงกันหมด) ในวันเดียวกันหลายรอบ
                    ระบบจะรวมชั่วโมงทั้งหมดของวันนั้นเป็นแถวเดียวให้อัตโนมัติ
                </AlertDescription>
            </Alert>

            <ReportTable
                data={data}
                empData={empData}
                departments={departments}
                loading={loading}
                error={error}
                searched={searched}
                from={from}
                to={to}
                onRangeChange={handleRangeChange}
            />
        </div>
    )
}
