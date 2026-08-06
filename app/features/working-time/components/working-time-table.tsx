import { useEffect, useMemo, useState } from "react"
import {
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { format } from "date-fns"
import { CalendarIcon, SearchIcon } from "lucide-react"
import { Spinner } from "@/components/ui/spinner"
import { usePersistedTanstackTable } from "@/hooks/use-persisted-table-state"
import { getWorkingTimeColumns } from "./columns"
import { WorkingActionsJobList } from "../type"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
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

type EmpOption = { value: string; label: string }

type WorkingTimeTableProps = {
    data: WorkingActionsJobList[]
    loading: boolean
    error: string | null
    searched: boolean
    e_usercode: string
    onEUsercodeChange: (value: string) => void
    empOptions: EmpOption[]
    w_date: string
    onWDateChange: (value: string) => void
    onSearch: () => void
    onEdit: (row: WorkingActionsJobList) => void
}

export default function WorkingTimeTable({
    data,
    loading,
    error,
    searched,
    e_usercode,
    onEUsercodeChange,
    empOptions,
    w_date,
    onWDateChange,
    onSearch,
    onEdit,
}: WorkingTimeTableProps) {
    const columns = useMemo(() => getWorkingTimeColumns({ onEdit }), [onEdit])
    const [datePopoverOpen, setDatePopoverOpen] = useState(false)
    const selectedDate = w_date ? parseYMDToLocalDate(w_date) : undefined

    const persisted = usePersistedTanstackTable("working_time", {
        defaultPagination: { pageIndex: 0, pageSize: 10 },
        defaultSorting: [{ id: "working_date", desc: true }],
    })

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        state: persisted.state,
        onPaginationChange: persisted.onPaginationChange,
        onSortingChange: persisted.onSortingChange,
        enableSortingRemoval: false,
        autoResetPageIndex: false,
        autoResetAll: false,
    })

    useEffect(() => {
        persisted.clampToPageCount(table.getPageCount())
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSearch()
    }

    return (
        <Card>
            <CardHeader>
                <p className="font-medium">รายการปรับแก้เวลาทำงาน</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 md:w-full">
                    <form onSubmit={handleSubmit} className="grid w-full gap-3 md:mr-4 md:grid-cols-4">
                        <Combobox
                            items={empOptions}
                            value={empOptions.find((option) => option.value === e_usercode) ?? null}
                            onValueChange={(option: EmpOption | null) => onEUsercodeChange(option?.value ?? "")}
                        >
                            <ComboboxInput
                                placeholder="ค้นหาพนักงาน..."
                                showClear
                                className="w-full md:w-auto"
                            />
                            <ComboboxContent>
                                <ComboboxEmpty>ไม่พบพนักงาน</ComboboxEmpty>
                                <ComboboxList>
                                    {(option: EmpOption) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                        <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
                            <PopoverTrigger
                                className={cn(
                                    buttonVariants({ variant: "outline" }),
                                    "w-full justify-start font-normal md:w-auto",
                                    !selectedDate && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon />
                                {selectedDate ? format(selectedDate, "dd/MM/yyyy") : <span>เลือกวันที่</span>}
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    defaultMonth={selectedDate}
                                    onSelect={(date) => {
                                        onWDateChange(date ? normalizeDateOnly(date) : "")
                                        setDatePopoverOpen(false)
                                    }}
                                />
                            </PopoverContent>
                        </Popover>
                        <Button type="submit" disabled={loading} className="w-full md:w-auto">
                            <SearchIcon />
                            {loading ? "กำลังค้นหา..." : "ค้นหา"}
                        </Button>
                    </form>
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
                            กรุณาระบุรหัสพนักงานแล้วกดค้นหา
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
