'use client'

import { useId } from 'react'
import { ChevronFirstIcon, ChevronLastIcon, ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import type { Table as TanTable } from '@tanstack/react-table'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Pagination, PaginationContent, PaginationItem } from '@/components/ui/pagination'
import { Button } from '@/components/ui/button'

type Props<T> = {
    table: TanTable<T>
    pageSizeOptions?: number[]
}

export function DataTableFooter<T>({
    table,
    pageSizeOptions = [5, 10, 25, 50, 100],
}: Props<T>) {
    const id = useId()

    const pageIndex = table.getState().pagination.pageIndex
    const pageSize = table.getState().pagination.pageSize
    const rowCount = table.getRowCount()

    const start = rowCount === 0 ? 0 : pageIndex * pageSize + 1
    const end = Math.min((pageIndex + 1) * pageSize, rowCount)

    return (
        <>
            <div className='flex items-center justify-between gap-8'>
                <div className='flex items-center gap-3'>
                    <Label htmlFor={id} className='max-sm:sr-only'>
                        Rows per page
                    </Label>
                    <Select
                        value={table.getState().pagination.pageSize.toString()}
                        onValueChange={value => {
                            table.setPageSize(Number(value))
                        }}
                    >
                        <SelectTrigger id={id} className='w-fit whitespace-nowrap'>
                            <SelectValue placeholder='Select number of results' />
                        </SelectTrigger>
                        <SelectContent>
                            {pageSizeOptions.map(pageSize => (
                                <SelectItem key={pageSize} value={pageSize.toString()}>
                                    {pageSize}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className='text-muted-foreground flex grow justify-end text-sm whitespace-nowrap'>
                    <p className='text-muted-foreground text-sm whitespace-nowrap' aria-live='polite'>
                        <span className="text-foreground">{start}-{end}</span> of{" "}
                        <span className="text-foreground">{rowCount}</span>
                    </p>
                </div>
                <div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    size='icon'
                                    variant='outline'
                                    className='disabled:pointer-events-none disabled:opacity-50'
                                    onClick={() => table.firstPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label='Go to first page'
                                >
                                    <ChevronFirstIcon aria-hidden='true' />
                                </Button>
                            </PaginationItem>

                            <PaginationItem>
                                <Button
                                    size='icon'
                                    variant='outline'
                                    className='disabled:pointer-events-none disabled:opacity-50'
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                    aria-label='Go to previous page'
                                >
                                    <ChevronLeftIcon aria-hidden='true' />
                                </Button>
                            </PaginationItem>

                            <PaginationItem>
                                <Button
                                    size='icon'
                                    variant='outline'
                                    className='disabled:pointer-events-none disabled:opacity-50'
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                    aria-label='Go to next page'
                                >
                                    <ChevronRightIcon aria-hidden='true' />
                                </Button>
                            </PaginationItem>

                            <PaginationItem>
                                <Button
                                    size='icon'
                                    variant='outline'
                                    className='disabled:pointer-events-none disabled:opacity-50'
                                    onClick={() => table.lastPage()}
                                    disabled={!table.getCanNextPage()}
                                    aria-label='Go to last page'
                                >
                                    <ChevronLastIcon aria-hidden='true' />
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

        </>



    )
}
