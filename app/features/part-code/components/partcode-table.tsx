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
import { getPartCodeColumns } from "./columns"
import { PartCode } from "../type"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { DataTableHeader } from "@/components/data-table/data-table"
import { DataTableFooter } from "@/components/data-table/data-table-footer"

type PartCodeTableProps = {
    data: PartCode[]
    loading: boolean
    error: string | null
    onEdit: (partCode: PartCode) => void
    onDelete: (partCode: PartCode) => void
}

export default function PartCodeTable({
    data,
    loading,
    error,
    onEdit,
    onDelete,
}: PartCodeTableProps) {
    const columns = useMemo(
        () => getPartCodeColumns({ onEdit, onDelete }),
        [onEdit, onDelete]
    )

    const persisted = usePersistedTanstackTable("part_Code", {
        defaultPagination: { pageIndex: 0, pageSize: 5 },
        defaultSorting: [{ id: "part_code", desc: true }],
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
                <p className="font-medium">รายการรหัสชิ้นงาน</p>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 md:w-full">
                    <div className="grid w-full gap-3 md:mr-4 md:grid-cols-4">
                        <Input
                            placeholder="ค้นหารหัสชิ้นงาน..."
                            value={(table.getColumn("part_code")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("part_code")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:w-auto"
                        />
                        <Input
                            placeholder="ค้นหารายละเอียด..."
                            value={(table.getColumn("part_descriptions")?.getFilterValue() as string) ?? ""}
                            onChange={(event) =>
                                table.getColumn("part_descriptions")?.setFilterValue(event.target.value)
                            }
                            className="w-full md:w-auto"
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
