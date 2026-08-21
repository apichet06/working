import { useEffect, useMemo } from "react"
import {
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { Spinner } from "@/components/ui/spinner"
import { usePersistedTanstackTable } from "@/hooks/use-persisted-table-state"
import { getCategoryCodeColumns } from "./columns"
import { CategoryCode, Department } from "../type"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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

type DepartmentOption = { value: string; label: string }

type CategoryCodeTableProps = {
    data: CategoryCode[]
    loading: boolean
    error: string | null
    departments: Department[]
    onEdit: (categoryCode: CategoryCode) => void
    onDelete: (categoryCode: CategoryCode) => void
}

export default function CategoryCodeTable({
    data,
    loading,
    error,
    departments,
    onEdit,
    onDelete,
}: CategoryCodeTableProps) {
    const columns = useMemo(
        () => getCategoryCodeColumns({ onEdit, onDelete }),
        [onEdit, onDelete]
    )

    const departmentOptions = useMemo<DepartmentOption[]>(
        () => departments.map((department) => ({ value: department.d_department_en, label: department.d_department_en })),
        [departments]
    )

    const persisted = usePersistedTanstackTable("category_code", {
        defaultPagination: { pageIndex: 0, pageSize: 5 },
        defaultSorting: [{ id: "cc_id", desc: false }],
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
        initialState: { columnVisibility: { cc_id: false } },
        onPaginationChange: persisted.onPaginationChange,
        onSortingChange: persisted.onSortingChange,
        onColumnFiltersChange: persisted.onColumnFiltersChange,
        enableSortingRemoval: false,
        // สำคัญ: ไม่ให้ data เปลี่ยนแล้วรีเซ็ตกลับหน้า 0
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
                <p className="font-medium">รายการรหัสหมวดหมู่</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 md:w-full">
                    <div className="grid w-full gap-3 md:mr-4 md:grid-cols-4">
                        <Input
                            placeholder="ค้นหารหัสหมวดหมู่..."
                            value={(table.getColumn("cc_code")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("cc_code")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:w-auto"
                        />
                        <Input
                            placeholder="ค้นหารายละเอียด..."
                            value={(table.getColumn("cc_descriptions")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("cc_descriptions")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:w-auto"
                        />
                        <Combobox
                            items={departmentOptions}
                            value={
                                departmentOptions.find(
                                    (option) => option.value === (table.getColumn("dp_department")?.getFilterValue() as string)
                                ) ?? null
                            }
                            onValueChange={(option: DepartmentOption | null) =>
                                table.getColumn("dp_department")?.setFilterValue(option?.value ?? undefined)
                            }
                        >
                            <ComboboxInput
                                placeholder="ค้นหาแผนก..."
                                showClear
                                className="w-full md:w-auto"
                            />
                            <ComboboxContent>
                                <ComboboxEmpty>ไม่พบแผนก</ComboboxEmpty>
                                <ComboboxList>
                                    {(option: DepartmentOption) => (
                                        <ComboboxItem key={option.value} value={option}>
                                            {option.label}
                                        </ComboboxItem>
                                    )}
                                </ComboboxList>
                            </ComboboxContent>
                        </Combobox>
                    </div>
                    {loading ? (
                        <div className="flex h-24 items-center justify-center rounded-md border">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="flex h-24 items-center justify-center rounded-md border text-sm text-destructive">
                            {error}
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
