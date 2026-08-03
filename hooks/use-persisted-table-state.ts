'use client'

import { useEffect, useMemo, useState } from 'react'
import type {
    ColumnFiltersState,
    PaginationState,
    SortingState,
    Updater,
} from '@tanstack/react-table'

type PersistedState = {
    pagination: PaginationState
    sorting: SortingState
    columnFilters: ColumnFiltersState
}

type Options = {
    defaultPagination?: PaginationState
    defaultSorting?: SortingState
    defaultColumnFilters?: ColumnFiltersState
}

function safeParse<T>(value: string | null): T | null {
    if (!value) return null
    try {
        return JSON.parse(value) as T
    } catch {
        return null
    }
}

function applyUpdater<T>(updater: Updater<T>, prev: T): T {
    return typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater
}

export function usePersistedTanstackTable(key: string, options?: Options) {
    const defaults: PersistedState = {
        pagination: options?.defaultPagination ?? { pageIndex: 0, pageSize: 10 },
        sorting: options?.defaultSorting ?? [],
        columnFilters: options?.defaultColumnFilters ?? [],
    }

    const initial = useMemo(() => {
        if (typeof window === 'undefined') return defaults
        const saved = safeParse<PersistedState>(localStorage.getItem(key))
        return {
            pagination: saved?.pagination ?? defaults.pagination,
            sorting: saved?.sorting ?? defaults.sorting,
            columnFilters: saved?.columnFilters ?? defaults.columnFilters,
        } satisfies PersistedState
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key])

    const [pagination, _setPagination] = useState<PaginationState>(initial.pagination)
    const [sorting, _setSorting] = useState<SortingState>(initial.sorting)
    const [columnFilters, _setColumnFilters] = useState<ColumnFiltersState>(initial.columnFilters)

    const setPagination = (updater: Updater<PaginationState>) =>
        _setPagination((prev) => applyUpdater(updater, prev))

    const setSorting = (updater: Updater<SortingState>) =>
        _setSorting((prev) => applyUpdater(updater, prev))

    const setColumnFilters = (updater: Updater<ColumnFiltersState>) =>
        _setColumnFilters((prev) => applyUpdater(updater, prev))

    // persist state
    useEffect(() => {
        if (typeof window === 'undefined') return
        const payload: PersistedState = { pagination, sorting, columnFilters }
        localStorage.setItem(key, JSON.stringify(payload))
    }, [key, pagination, sorting, columnFilters])

    // clamp page (ใช้หลัง data เปลี่ยน)
    const clampToPageCount = (pageCount: number) => {
        const maxIndex = Math.max(pageCount - 1, 0)
        _setPagination((prev) => (prev.pageIndex > maxIndex ? { ...prev, pageIndex: maxIndex } : prev))
    }

    return {
        state: { pagination, sorting, columnFilters },
        onPaginationChange: setPagination,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        clampToPageCount,
    }
}
