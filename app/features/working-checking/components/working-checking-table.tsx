import { useEffect, useMemo, useState } from "react"
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { type DateRange } from "react-day-picker"
import { Spinner } from "@/components/ui/spinner"
import { usePersistedTanstackTable } from "@/hooks/use-persisted-table-state"
import { getWorkingCheckingColumns } from "./columns"
import { WorkingMaster } from "@/app/features/working/type"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { DataTableHeader } from "@/components/data-table/data-table"
import { DataTableFooter } from "@/components/data-table/data-table-footer"
import { normalizeDateOnly, parseYMDToLocalDate } from "@/lib/formDatetime"
import { cn } from "@/lib/utils"

type WorkingCheckingTableProps = {
    data: WorkingMaster[]
    loading: boolean
    error: string | null
    searched: boolean
    from: string
    to: string
    onRangeChange: (from: string, to: string) => void
    onEdit: (row: WorkingMaster) => void
}

type FilterOption = { value: string; label: string }

function toRange(from: string, to: string): DateRange | undefined {
    return from ? { from: parseYMDToLocalDate(from), to: to ? parseYMDToLocalDate(to) : undefined } : undefined
}

// ตัวเลือกใน dropdown filter มาจากค่าที่มีอยู่จริงในผลค้นหาปัจจุบัน (ไม่ใช่ทุกรหัสในระบบ)
function uniqueOptions(rows: WorkingMaster[], getCode: (row: WorkingMaster) => string, getLabel: (row: WorkingMaster) => string): FilterOption[] {
    const map = new Map<string, string>()
    for (const row of rows) {
        const code = getCode(row)
        if (code && !map.has(code)) map.set(code, getLabel(row))
    }
    return Array.from(map, ([value, label]) => ({ value, label }))
}

export default function WorkingCheckingTable({
    data,
    loading,
    error,
    searched,
    from,
    to,
    onRangeChange,
    onEdit,
}: WorkingCheckingTableProps) {
    const columns = useMemo(() => getWorkingCheckingColumns({ onEdit }), [onEdit])
    const jobOptions = useMemo(
        () => uniqueOptions(data, (row) => row.job_code, (row) => `${row.job_code} - ${row.job_descriptions}`),
        [data]
    )
    const categoryOptions = useMemo(
        () => uniqueOptions(data, (row) => row.cc_code, (row) => `${row.cc_code} - ${row.cc_descriptions}`),
        [data]
    )
    const partOptions = useMemo(
        () => uniqueOptions(data, (row) => row.part_code, (row) => `${row.part_code} - ${row.part_descriptions}`),
        [data]
    )
    const [rangePopoverOpen, setRangePopoverOpen] = useState(false)
    // สถานะระหว่างกำลังเลือกวันที่ในปฏิทิน (คลิกครั้งแรก = from, ครั้งที่สอง = to) แยกจาก from/to
    // ที่ผูกกับผลค้นหาจริง เพื่อให้ react-day-picker แสดงผลถูกต้องระหว่างเลือก โดยยังไม่ยิงค้นหาจนกว่าจะครบ
    const [pendingRange, setPendingRange] = useState<DateRange | undefined>(() => toRange(from, to))

    useEffect(() => {
        setPendingRange(toRange(from, to))
    }, [from, to])

    const persisted = usePersistedTanstackTable("working_checking", {
        defaultPagination: { pageIndex: 0, pageSize: 10 },
        defaultSorting: [{ id: "w_date", desc: true }],
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
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
    }, [data, persisted.state.columnFilters])

    return (
        <Card>
            <CardHeader>
                <p className="font-medium">รายการงานย้อนหลัง</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 md:w-full">
                    <Popover
                        open={rangePopoverOpen}
                        onOpenChange={(open) => {
                            setRangePopoverOpen(open)
                            // ยิงค้นหาตอนปิด popover (คลิกนอก/Esc) เท่านั้น ไม่ใช่ทันทีที่เลือกวันครบ
                            // เผื่อผู้ใช้อยากเลือกใหม่ก่อนค่อยปิด
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
                    <div className="grid w-full gap-3 md:mr-4 md:grid-cols-3">
                        <Input
                            placeholder="ค้นหาเลขที่โปรเจกต์..."
                            value={(table.getColumn("w_project_no")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("w_project_no")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:w-auto"
                        />
                        <Combobox
                            items={jobOptions}
                            value={
                                jobOptions.find(
                                    (option) => option.value === (table.getColumn("job_code")?.getFilterValue() as string)
                                ) ?? null
                            }
                            onValueChange={(option: FilterOption | null) =>
                                table.getColumn("job_code")?.setFilterValue(option?.value ?? undefined)
                            }
                        >
                            <ComboboxInput placeholder="งาน (Job Code)..." showClear className="w-full md:w-auto" />
                            <ComboboxContent>
                                <ComboboxEmpty>ไม่พบงาน</ComboboxEmpty>
                                <ComboboxList>
                                    {(option: FilterOption) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        <Combobox
                            items={categoryOptions}
                            value={
                                categoryOptions.find(
                                    (option) => option.value === (table.getColumn("cc_code")?.getFilterValue() as string)
                                ) ?? null
                            }
                            onValueChange={(option: FilterOption | null) =>
                                table.getColumn("cc_code")?.setFilterValue(option?.value ?? undefined)
                            }
                        >
                            <ComboboxInput placeholder="หมวดหมู่ (Category Code)..." showClear className="w-full md:w-auto" />
                            <ComboboxContent>
                                <ComboboxEmpty>ไม่พบหมวดหมู่</ComboboxEmpty>
                                <ComboboxList>
                                    {(option: FilterOption) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        <Combobox
                            items={partOptions}
                            value={
                                partOptions.find(
                                    (option) => option.value === (table.getColumn("part_code")?.getFilterValue() as string)
                                ) ?? null
                            }
                            onValueChange={(option: FilterOption | null) =>
                                table.getColumn("part_code")?.setFilterValue(option?.value ?? undefined)
                            }
                        >
                            <ComboboxInput placeholder="ชิ้นงาน (Part Code)..." showClear className="w-full md:w-auto" />
                            <ComboboxContent>
                                <ComboboxEmpty>ไม่พบชิ้นงาน</ComboboxEmpty>
                                <ComboboxList>
                                    {(option: FilterOption) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        <Input
                            placeholder="ค้นหารายละเอียด..."
                            value={(table.getColumn("w_desc")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("w_desc")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:col-span-2 md:w-auto"
                        />
                    </div>
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
