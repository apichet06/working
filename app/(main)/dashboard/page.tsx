"use client"

import { useMemo, useState } from "react"
import { useDashboard } from "@/app/features/dashboard/hook/use.dashboard"
import { useDepartment } from "@/app/features/dashboard/hook/use.department"
import { useEmployeeJobCounts } from "@/app/features/dashboard/hook/use.employee-job-counts"
import { useEmp } from "@/app/features/working-time/hook/use.emp"
import { SummaryBarChart } from "@/app/features/dashboard/components/summary-bar-chart"
import { SummaryLineChart } from "@/app/features/dashboard/components/summary-line-chart"
import { RankedBarChart, RankedItem } from "@/app/features/dashboard/components/ranked-bar-chart"
import { JobBreakdownItem, ProjectBreakdownItem } from "@/app/features/dashboard/type"
import { THAI_MONTH_LABELS } from "@/app/features/dashboard/lib/dashboard-calendar"
import { useAuth } from "@/app/features/login/context/auth-context"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { Label } from "@/components/ui/label"
import { MultiSelectFilter, MultiSelectOption } from "@/components/ui/multi-select-filter"

type EmpOption = { value: string; label: string; jobCount: number }

const HOURS_COLOR = { light: "#2a78d6", dark: "#3987e5" }
const JOB_HOUR_COLOR = { light: "#eb6834", dark: "#d95926" }
const JOB_BREAKDOWN_COLOR = { light: "#7c3aed", dark: "#9061f9" }
const PROJECT_BREAKDOWN_COLOR = { light: "#0d9488", dark: "#14b8a6" }

function getYearOptions(currentYear: number, span = 5): number[] {
    return Array.from({ length: span }, (_, i) => currentYear - i)
}

// ต่อ label ด้วยจำนวนวัน (job_hour) ต่อท้าย ส่วนตัวยาวของแท่งใช้ total_hours (ชั่วโมงจริง) เป็นหลัก
function jobBreakdownToRankedItems(rows: JobBreakdownItem[]): RankedItem[] {
    return rows.map((row) => ({
        label: `${row.job_code} - ${row.job_descriptions} (${row.job_hour} วัน)`,
        value: row.total_hours,
    }))
}

function projectBreakdownToRankedItems(rows: ProjectBreakdownItem[]): RankedItem[] {
    return rows.map((row) => ({
        label: `${row.w_project_no || "-"} (${row.job_hour} วัน)`,
        value: row.total_hours,
    }))
}

export default function DashboardPage() {
    const {
        year,
        setYear,
        month,
        setMonth,
        employeeId,
        setEmployeeId,
        yearPoints,
        monthPoints,
        loadingYearly,
        loadingMonthly,
        yearlyBreakdown,
        monthlyBreakdown,
        loadingYearlyBreakdown,
        loadingMonthlyBreakdown,
        error,
    } = useDashboard()
    const { role, user } = useAuth()
    const canViewOthers = role === "admin" || role === "subadmin"


    const { data: departments } = useDepartment()
    const { data: empData } = useEmp()
    // จำนวนงาน (ไม่ใช่จำนวนคน) ของแต่ละพนักงานในปีที่กำลังดูอยู่ ใช้กำหนดว่าใคร/แผนกไหน disable ได้ (ไม่มีงานเลย)
    const { data: jobCounts } = useEmployeeJobCounts(year)

    const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])

    const jobCountByEmpId = useMemo(() => {
        const map = new Map<number, number>()
        jobCounts.forEach((row) => map.set(row.e_id, row.job_count))
        return map
    }, [jobCounts])

    const empOptions = useMemo<EmpOption[]>(() => {
        const filtered = selectedDepartments.length > 0
            ? empData.filter((emp) => emp.d_id != null && selectedDepartments.includes(String(emp.d_id)))
            : empData
        return filtered
            .map((emp) => ({
                value: String(emp.e_id),
                label: `${emp.e_usercode} - ${emp.e_fullname_th}`,
                jobCount: jobCountByEmpId.get(emp.e_id) ?? 0,
            }))
            // คนที่มีงาน (jobCount มาก) ขึ้นก่อน คนที่ไม่มีงานเลย (0) ตกไปอยู่ล่างสุด
            .sort((a, b) => b.jobCount - a.jobCount || a.label.localeCompare(b.label))
    }, [empData, selectedDepartments, jobCountByEmpId])

    const selectedEmpOption = empOptions.find((option) => option.value === String(employeeId)) ?? null

    // แสดงให้ชัดว่ากราฟตอนนี้เป็นข้อมูลของใคร แผนกไหน — ไม่เลือกพนักงาน = ข้อมูลของ user ที่ login เอง
    const departmentNameById = useMemo(
        () => new Map(departments.map((department) => [department.d_id, department.d_department_en])),
        [departments]
    )
    const selectedEmp = useMemo(
        () => empData.find((emp) => emp.e_id === employeeId) ?? null,
        [empData, employeeId]
    )
    const viewingName = selectedEmp ? selectedEmp.e_fullname_th : (user?.e_fullname_en ?? user?.e_usercode ?? "ฉัน")
    const viewingDepartment = selectedEmp
        ? (selectedEmp.d_id != null ? departmentNameById.get(selectedEmp.d_id) : undefined)
        : user?.d_department_en

    // นับจำนวนงานรวมของแต่ละแผนก (ผลรวมจำนวนงานของพนักงานในแผนกนั้น) ไม่ใช่จำนวนคน
    const departmentOptions = useMemo<MultiSelectOption[]>(() => {
        const counts = new Map<number, number>()
        empData.forEach((emp) => {
            if (emp.d_id == null) return
            const jobCount = jobCountByEmpId.get(emp.e_id) ?? 0
            counts.set(emp.d_id, (counts.get(emp.d_id) ?? 0) + jobCount)
        })
        return departments.map((department) => ({
            value: String(department.d_id),
            label: department.d_department_en,
            count: counts.get(department.d_id) ?? 0,
        }))
    }, [departments, empData, jobCountByEmpId])

    const yearOptions = useMemo(() => getYearOptions(new Date().getFullYear()), [])
    const monthLabel = THAI_MONTH_LABELS[month - 1]

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Dashboard</h1>
                    <p className="text-sm text-muted-foreground">
                        สรุปชั่วโมงทำงานและจำนวนงาน รายปีและรายเดือน
                    </p>
                    <p className="text-sm">
                        กำลังแสดงข้อมูลของ <span className="font-medium text-foreground">{viewingName}</span>
                        {viewingDepartment && (
                            <>
                                {" "}· แผนก <span className="font-medium text-foreground">{viewingDepartment}</span>
                            </>
                        )}
                        {" "}· ปี <span className="font-medium text-foreground">{year}</span>
                    </p>
                </div>
                <div className="flex flex-wrap items-end gap-3">
                    {canViewOthers && (
                        <>
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs font-normal text-muted-foreground">แผนก</Label>
                                <MultiSelectFilter
                                    label="แผนก"
                                    searchPlaceholder="ค้นหาแผนก..."
                                    emptyText="ไม่พบแผนก"
                                    variant="button"
                                    options={departmentOptions}
                                    selected={selectedDepartments}
                                    onChange={(values) => {
                                        setSelectedDepartments(values)
                                        setEmployeeId(null)
                                    }}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <Label className="text-xs font-normal text-muted-foreground">พนักงาน</Label>
                                <Combobox
                                    items={empOptions}
                                    value={selectedEmpOption}
                                    onValueChange={(option: EmpOption | null) =>
                                        setEmployeeId(option ? Number(option.value) : null)
                                    }
                                >
                                    <ComboboxInput placeholder="ดูข้อมูลของฉัน (เลือกเพื่อดูของคนอื่น)" showClear className="w-75" />
                                    <ComboboxContent>
                                        <ComboboxEmpty>ไม่พบพนักงาน</ComboboxEmpty>
                                        <ComboboxList>
                                            {(option: EmpOption) => (
                                                <ComboboxItem
                                                    key={option.value}
                                                    value={option}
                                                    disabled={option.jobCount === 0}
                                                    className="justify-between"
                                                >
                                                    <span>{option.label}</span>
                                                    <span className="text-xs text-muted-foreground">{option.jobCount}</span>
                                                </ComboboxItem>
                                            )}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                            </div>
                        </>
                    )}
                    <div className="flex flex-col gap-1">
                        <Label className="text-xs font-normal text-muted-foreground">ปี</Label>
                        <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {yearOptions.map((y) => (
                                    <SelectItem key={y} value={String(y)}>
                                        {y}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            {error && (
                <div className="rounded-md border p-3 text-sm text-destructive">{error}</div>
            )}

            <section className="flex flex-col gap-3">
                <h2 className="text-sm font-medium text-muted-foreground">สรุปรายปี {year}</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <SummaryBarChart
                        title="ชั่วโมงทำงานจริงต่อเดือน (Labour Hours)"
                        description="รวมชั่วโมงที่ทำงานจริงในแต่ละเดือน นับตั้งแต่เริ่มงานจนกดปิดงาน"
                        data={yearPoints}
                        xKey="label"
                        valueKey="total_hours"
                        valueLabel="ชั่วโมง"
                        color={HOURS_COLOR}
                        loading={loadingYearly}
                    />
                    <SummaryBarChart
                        title="Job Hour ต่อเดือน (วัน)"
                        description="แสดงเป็นสัดส่วนของ 1 วัน (24 ชม.) รวมทั้งเดือน"
                        data={yearPoints}
                        xKey="label"
                        valueKey="job_hour"
                        valueLabel="วัน"
                        color={JOB_HOUR_COLOR}
                        loading={loadingYearly}
                    />
                    <RankedBarChart
                        title={`งานที่ทำในปี ${year} (ตาม Job Code)`}
                        description="เรียงจากชั่วโมงทำงานจริงมากไปน้อย วงเล็บคือจำนวนวันของงานนั้น"
                        items={jobBreakdownToRankedItems(yearlyBreakdown.byJob)}
                        valueLabel="ชั่วโมง"
                        color={JOB_BREAKDOWN_COLOR}
                        loading={loadingYearlyBreakdown}
                    />
                    <RankedBarChart
                        title={`โปรเจกต์ที่ทำในปี ${year}`}
                        description="เรียงจากชั่วโมงทำงานจริงมากไปน้อย วงเล็บคือจำนวนวันของโปรเจกต์นั้น"
                        items={projectBreakdownToRankedItems(yearlyBreakdown.byProject)}
                        valueLabel="ชั่วโมง"
                        color={PROJECT_BREAKDOWN_COLOR}
                        loading={loadingYearlyBreakdown}
                    />
                </div>
            </section>

            <section className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-sm font-medium text-muted-foreground">สรุปรายวัน</h2>
                    <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                        <SelectTrigger className="w-24">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {THAI_MONTH_LABELS.map((label, i) => (
                                <SelectItem key={label} value={String(i + 1)}>
                                    {label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">{year}</span>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                    <SummaryLineChart
                        title={`ชั่วโมงทำงานจริงรายวัน (Labour Hours) — ${monthLabel} ${year}`}
                        description="รวมชั่วโมงที่ทำงานจริงในแต่ละวันของเดือนนี้ วันไหนไม่มีงานจะแสดงเป็น 0"
                        data={monthPoints}
                        xKey="label"
                        valueKey="total_hours"
                        valueLabel="ชั่วโมง"
                        color={HOURS_COLOR}
                        loading={loadingMonthly}
                    />
                    <SummaryLineChart
                        title={`Job Hour รายวัน (วัน) — ${monthLabel} ${year}`}
                        description="แสดงเป็นสัดส่วนของ 1 วัน"
                        data={monthPoints}
                        xKey="label"
                        valueKey="job_hour"
                        valueLabel="วัน"
                        color={JOB_HOUR_COLOR}
                        loading={loadingMonthly}
                    />
                    <RankedBarChart
                        title={`งานที่ทำในเดือน ${monthLabel} ${year} (ตาม Job Code)`}
                        description="เรียงจากชั่วโมงทำงานจริงมากไปน้อย วงเล็บคือจำนวนวันของงานนั้น"
                        items={jobBreakdownToRankedItems(monthlyBreakdown.byJob)}
                        valueLabel="ชั่วโมง"
                        color={JOB_BREAKDOWN_COLOR}
                        loading={loadingMonthlyBreakdown}
                    />
                    <RankedBarChart
                        title={`โปรเจกต์ที่ทำในเดือน ${monthLabel} ${year}`}
                        description="เรียงจากชั่วโมงทำงานจริงมากไปน้อย วงเล็บคือจำนวนวันของโปรเจกต์นั้น"
                        items={projectBreakdownToRankedItems(monthlyBreakdown.byProject)}
                        valueLabel="ชั่วโมง"
                        color={PROJECT_BREAKDOWN_COLOR}
                        loading={loadingMonthlyBreakdown}
                    />
                </div>
            </section>
        </div>
    )
}
