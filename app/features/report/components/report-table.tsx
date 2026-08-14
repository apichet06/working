import { useEffect, useMemo, useState } from "react"
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { CalendarIcon, DownloadIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { Spinner } from "@/components/ui/spinner"
import { usePersistedTanstackTable } from "@/hooks/use-persisted-table-state"
import { getReportColumns } from "./columns"
import { WorkingReport } from "@/app/features/report/type"
import { empDTO } from "@/app/features/working-time/type"
import { Department } from "@/app/features/dashboard/type"
import { exportReportToExcel } from "@/app/features/report/lib/export-excel"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { DataTableHeader } from "@/components/data-table/data-table"
import { DataTableFooter } from "@/components/data-table/data-table-footer"
import { normalizeDateOnly, parseYMDToLocalDate } from "@/lib/formDatetime"
import { cn } from "@/lib/utils"
import { MultiSelectFilter, MultiSelectOption } from "@/components/ui/multi-select-filter"

type ReportTableProps = {
    data: WorkingReport[]
    empData: empDTO[]
    departments: Department[]
    loading: boolean
    error: string | null
    searched: boolean
    from: string
    to: string
    onRangeChange: (from: string, to: string) => void
}

function toRange(from: string, to: string): DateRange | undefined {
    return from ? { from: parseYMDToLocalDate(from), to: to ? parseYMDToLocalDate(to) : undefined } : undefined
}

// แถวรายงาน + department_id ที่ resolve จาก e_usercode (ตัวรายงานไม่มี department มาตรงๆ)
type EnrichedRow = WorkingReport & { department_id: string }

type FilterKey = "department" | "e_usercode" | "job_code" | "cc_code" | "part_code" | "wp_name_en"

const ACCESSORS: Record<FilterKey, (row: EnrichedRow) => string> = {
    department: (row) => row.department_id,
    e_usercode: (row) => row.e_usercode,
    job_code: (row) => String(row.job_code),
    cc_code: (row) => String(row.cc_code),
    part_code: (row) => String(row.part_code),
    wp_name_en: (row) => row.wp_name_en ?? "",
}

const EMPTY_SELECTION: Record<FilterKey, string[]> = {
    department: [],
    e_usercode: [],
    job_code: [],
    cc_code: [],
    part_code: [],
    wp_name_en: [],
}

// สร้างชื่อ scope สำหรับไฟล์ export: 1-3 รายการ ต่อชื่อกันด้วย "-" ได้ตรงๆ, มากกว่านั้นบอกแค่จำนวนแทน กันชื่อไฟล์ยาวเกินไปเวลาเลือกหลายสิบคน/แผนก
function buildScopeLabel(names: string[], unit: string): string | null {
    if (names.length === 0) return null
    if (names.length <= 3) return names.join("-")
    return `${names.length}${unit}`
}

// ตัวเลือกทั้งหมดมาจากผลค้นหาปัจจุบัน (allRows) แต่จำนวนนับ (count) มาจาก subset ที่ผ่าน filter อื่นๆ แล้ว (faceted count)
// ค่าที่ยังไม่เคยปรากฏใน subset จะได้ count = 0 — ตัวเลือกจึงไม่หายไปแม้ตอนนี้จะเลือกไม่ได้ผลลัพธ์อะไร
function buildFacetedOptions(
    allRows: EnrichedRow[],
    countRows: EnrichedRow[],
    getCode: (row: EnrichedRow) => string,
    getLabel: (row: EnrichedRow) => string
): MultiSelectOption[] {
    const labelByCode = new Map<string, string>()
    for (const row of allRows) {
        const code = getCode(row)
        if (code && !labelByCode.has(code)) labelByCode.set(code, getLabel(row))
    }
    const countByCode = new Map<string, number>()
    for (const row of countRows) {
        const code = getCode(row)
        if (!code) continue
        countByCode.set(code, (countByCode.get(code) ?? 0) + 1)
    }
    return Array.from(labelByCode, ([value, label]) => ({ value, label, count: countByCode.get(value) ?? 0 }))
}

export default function ReportTable({
    data,
    empData,
    departments,
    loading,
    error,
    searched,
    from,
    to,
    onRangeChange,
}: ReportTableProps) {
    const columns = useMemo(() => getReportColumns(), [])
    const nameByUsercode = useMemo(
        () => new Map(empData.map((emp) => [emp.e_usercode, emp.e_fullname_th])),
        [empData]
    )
    const usercodeToDepartment = useMemo(
        () => new Map(empData.map((emp) => [emp.e_usercode, emp.d_id])),
        [empData]
    )
    const enrichedData = useMemo<EnrichedRow[]>(
        () =>
            data.map((row) => {
                const d_id = usercodeToDepartment.get(row.e_usercode)
                return { ...row, department_id: d_id != null ? String(d_id) : "" }
            }),
        [data, usercodeToDepartment]
    )

    // สถานะของ dropdown filter ทั้ง 5 ตัว — เก็บรวมกันเพื่อคำนวณ faceted count ข้าม filter กันได้
    const [selected, setSelected] = useState<Record<FilterKey, string[]>>(EMPTY_SELECTION)
    const updateFilter = (key: FilterKey) => (values: string[]) =>
        setSelected((prev) => ({ ...prev, [key]: values }))

    // กรองแถวด้วย filter ทุกตัว ยกเว้น excludeKey — ใช้คำนวณทั้งผลลัพธ์จริง (excludeKey = null) และ faceted count ของแต่ละ filter
    const filterExcept = (rows: EnrichedRow[], excludeKey: FilterKey | null) =>
        rows.filter((row) =>
            (Object.keys(selected) as FilterKey[]).every((key) => {
                if (key === excludeKey) return true
                const values = selected[key]
                if (values.length === 0) return true
                return values.includes(ACCESSORS[key](row))
            })
        )

    const departmentOptions = useMemo(() => {
        const subset = filterExcept(enrichedData, "department")
        const counts = new Map<string, number>()
        subset.forEach((row) => {
            if (row.department_id) counts.set(row.department_id, (counts.get(row.department_id) ?? 0) + 1)
        })
        return departments.map((department) => ({
            value: String(department.d_id),
            label: department.d_department_en,
            count: counts.get(String(department.d_id)) ?? 0,
        }))
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrichedData, selected, departments])

    const empOptions = useMemo(() => {
        const subset = filterExcept(enrichedData, "e_usercode")
        return buildFacetedOptions(enrichedData, subset, ACCESSORS.e_usercode, (row) => {
            const name = nameByUsercode.get(row.e_usercode)
            return name ? `${row.e_usercode} - ${name}` : row.e_usercode
        })
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrichedData, selected, nameByUsercode])

    const jobOptions = useMemo(() => {
        const subset = filterExcept(enrichedData, "job_code")
        return buildFacetedOptions(enrichedData, subset, ACCESSORS.job_code, (row) => row.job_desc)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrichedData, selected])

    const categoryOptions = useMemo(() => {
        const subset = filterExcept(enrichedData, "cc_code")
        return buildFacetedOptions(enrichedData, subset, ACCESSORS.cc_code, (row) => row.cc_desc)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrichedData, selected])

    const partOptions = useMemo(() => {
        const subset = filterExcept(enrichedData, "part_code")
        return buildFacetedOptions(enrichedData, subset, ACCESSORS.part_code, (row) => row.part_desc)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrichedData, selected])

    const branchOptions = useMemo(() => {
        const subset = filterExcept(enrichedData, "wp_name_en")
        return buildFacetedOptions(enrichedData, subset, ACCESSORS.wp_name_en, ACCESSORS.wp_name_en)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [enrichedData, selected])

    // ผลลัพธ์จริงที่ผ่าน filter ทั้ง 6 ตัวแล้ว ป้อนเข้า table (ไม่ผ่าน TanStack columnFilters อีกต่อไป)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const filteredData = useMemo(() => filterExcept(enrichedData, null), [enrichedData, selected])

    const [rangePopoverOpen, setRangePopoverOpen] = useState(false)
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>(() => toRange(from, to))

    useEffect(() => {
        setPendingRange(toRange(from, to))
    }, [from, to])

    // v2: key เปลี่ยนเพราะ filter dropdown ทั้ง 5 ตัวย้ายออกจาก TanStack columnFilters ไปเป็น state ของตัวเอง (filterExcept ด้านบน)
    // ถ้าใช้ key เดิม ผู้ใช้ที่เคย persist columnFilters แบบเก่า (array ของ job_code/cc_code/part_code/e_usercode) ไว้
    // จะโดน TanStack เอาไป auto-infer filterFn ให้คอลัมน์เหล่านี้ใหม่ ซึ่งอาจพังแบบเดียวกับบั๊ก inNumberRange ที่เจอก่อนหน้านี้
    const persisted = usePersistedTanstackTable("working_report_v2", {
        defaultPagination: { pageIndex: 0, pageSize: 10 },
        defaultSorting: [{ id: "working_date", desc: true }],
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: filteredData,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        state: persisted.state,
        onPaginationChange: persisted.onPaginationChange,
        onSortingChange: persisted.onSortingChange,
        onColumnFiltersChange: persisted.onColumnFiltersChange,
        enableSortingRemoval: false,
        autoResetPageIndex: false,
        autoResetAll: false,
    })

    useEffect(() => {
        persisted.clampToPageCount(table.getPageCount())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, persisted.state.columnFilters])

    const [exporting, setExporting] = useState(false)
    const handleExport = async () => {
        setExporting(true)
        try {
            const rows = table.getFilteredRowModel().rows.map((row) => row.original)

            // เลือกพนักงานเจาะจง = ใช้ชื่อ scope นั้น สำคัญกว่าแผนก เพราะเป็นตัวกรองที่เจาะจงสุด
            // ไม่เลือกพนักงานแต่เลือกแผนก = ใช้ชื่อแผนกแทน ไม่เลือกทั้งคู่ = "ทุกคน"
            const departmentNames = departmentOptions
                .filter((option) => selected.department.includes(option.value))
                .map((option) => option.label)
            const scopeLabel =
                buildScopeLabel(selected.e_usercode, "คน") ??
                buildScopeLabel(departmentNames, "แผนก") ??
                "ทุกคน"

            // มี filter ย่อยอื่น (งาน/หมวดหมู่/ชิ้นงาน/ค้นหาโปรเจกต์-รายละเอียด) อยู่ด้วยไหม ถ้ามีให้บอกไว้เฉยๆ ไม่ต้องแจกแจงทุกตัวในชื่อไฟล์
            const hasOtherFilters =
                selected.job_code.length > 0 ||
                selected.cc_code.length > 0 ||
                selected.part_code.length > 0 ||
                !!table.getColumn("w_project_no")?.getFilterValue() ||
                !!table.getColumn("w_desc")?.getFilterValue()

            const fileScope = hasOtherFilters ? `${scopeLabel}-กรองเพิ่มเติม` : scopeLabel

            await exportReportToExcel(rows, from, to, fileScope)
        } finally {
            setExporting(false)
        }
    }

    const totals = useMemo(() => {
        const rows = table.getFilteredRowModel().rows.map((row) => row.original)
        return rows.reduce(
            (acc, row) => ({
                jobHour: acc.jobHour + row.job_hour,
                labourHour: acc.labourHour + row.labour_hour,
            }),
            { jobHour: 0, labourHour: 0 }
        )
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filteredData, persisted.state.columnFilters])

    return (
        <Card>
            <CardHeader>
                <p className="font-medium">รายงานการทำงาน</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 md:w-full">
                    <div className="grid w-full gap-3 md:mr-4 md:grid-cols-4">
                        <Popover
                            open={rangePopoverOpen}
                            onOpenChange={(open) => {
                                setRangePopoverOpen(open)
                                if (!open && pendingRange?.from && pendingRange?.to) {
                                    const newFrom = normalizeDateOnly(pendingRange.from)
                                    const newTo = normalizeDateOnly(pendingRange.to)
                                    if (newFrom !== from || newTo !== to) {
                                        onRangeChange(newFrom, newTo)
                                    }
                                }
                            }}
                        >
                            <PopoverTrigger
                                className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    "w-full justify-start font-normal md:w-auto",
                                    !pendingRange?.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon />
                                {pendingRange?.from ? (
                                    pendingRange.to ? (
                                        <>
                                            {format(pendingRange.from, "dd/MM/yyyy")} - {format(pendingRange.to, "dd/MM/yyyy")}
                                        </>
                                    ) : (
                                        format(pendingRange.from, "dd/MM/yyyy")
                                    )
                                ) : (
                                    <span>เลือกช่วงวันที่</span>
                                )}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    selected={pendingRange}
                                    defaultMonth={pendingRange?.from}
                                    numberOfMonths={2}
                                    onSelect={(range) => setPendingRange(range)}
                                />
                            </PopoverContent>
                        </Popover>
                        <MultiSelectFilter
                            label="แผนก"
                            searchPlaceholder="ค้นหาแผนก..."
                            emptyText="ไม่พบแผนก"
                            options={departmentOptions}
                            selected={selected.department}
                            onChange={updateFilter("department")}
                            variant="button"
                        />
                    </div>
                    <div className="grid w-full gap-3 md:mr-4 md:grid-cols-4">

                        <MultiSelectFilter
                            label="พนักงาน"
                            searchPlaceholder="ค้นหารหัสพนักงาน..."
                            emptyText="ไม่พบพนักงาน"
                            options={empOptions}
                            selected={selected.e_usercode}
                            onChange={updateFilter("e_usercode")}
                        />
                        <MultiSelectFilter
                            label="งาน (Job)"
                            searchPlaceholder="ค้นหางาน..."
                            emptyText="ไม่พบงาน"
                            options={jobOptions}
                            selected={selected.job_code}
                            onChange={updateFilter("job_code")}
                        />
                        <MultiSelectFilter
                            label="หมวดหมู่ (Category)"
                            searchPlaceholder="ค้นหาหมวดหมู่..."
                            emptyText="ไม่พบหมวดหมู่"
                            options={categoryOptions}
                            selected={selected.cc_code}
                            onChange={updateFilter("cc_code")}
                        />
                        <MultiSelectFilter
                            label="ชิ้นงาน (Part)"
                            searchPlaceholder="ค้นหาชิ้นงาน..."
                            emptyText="ไม่พบชิ้นงาน"
                            options={partOptions}
                            selected={selected.part_code}
                            onChange={updateFilter("part_code")}
                        />
                        <MultiSelectFilter
                            label="สาขา"
                            searchPlaceholder="ค้นหาสาขา..."
                            emptyText="ไม่พบสาขา"
                            options={branchOptions}
                            selected={selected.wp_name_en}
                            onChange={updateFilter("wp_name_en")}
                        />
                        <Input
                            placeholder="ค้นหาเลขที่โปรเจกต์..."
                            value={(table.getColumn("w_project_no")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("w_project_no")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:w-auto"
                        />
                        <Input
                            placeholder="ค้นหารายละเอียด..."
                            value={(table.getColumn("w_desc")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("w_desc")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:w-auto lg:col-span-2"
                        />
                    </div>
                    {searched && !loading && !error && (
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                <span>
                                    รวม Job Hour: <span className="font-medium text-foreground">{totals.jobHour.toFixed(2)}</span> วัน
                                </span>
                                <span>
                                    รวม Labour Hour: <span className="font-medium text-foreground">{totals.labourHour.toFixed(2)}</span> ชม.
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                disabled={exporting || table.getFilteredRowModel().rows.length === 0}
                                onClick={handleExport}
                            >
                                <DownloadIcon />
                                {exporting ? "กำลังส่งออก..." : "Export Excel"}
                            </Button>
                        </div>
                    )}
                    {loading ? (
                        <div className="flex h-24 items-center justify-center rounded-md border">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="flex h-24 items-center justify-center rounded-md border text-sm text-destructive">
                            {error}
                        </div>
                    ) : !searched ? (
                        <div className="flex h-24 items-center justify-center rounded-md border text-sm text-muted-foreground">
                            กรุณาเลือกช่วงวันที่
                        </div>
                    ) : (
                        <>
                            <DataTableHeader table={table} columnsLength={columns.length} emptyText="ไม่พบข้อมูล" />
                            <DataTableFooter table={table} />
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
