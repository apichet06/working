'use client'

import { useEffect, useRef, useState } from 'react'
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

    // เริ่มด้วยค่า default เสมอ (ตรงกับ server) แล้วค่อยโหลดค่าที่ persist ไว้ทีหลังใน useEffect
    // ห้ามอ่าน localStorage ตอน render เพราะ client จะได้ค่าต่างจาก server ทันทีตั้งแต่รอบแรก ทำให้ hydration mismatch
    const [pagination, _setPagination] = useState<PaginationState>(defaults.pagination)
    const [sorting, _setSorting] = useState<SortingState>(defaults.sorting)
    const [columnFilters, _setColumnFilters] = useState<ColumnFiltersState>(defaults.columnFilters)

    const setPagination = (updater: Updater<PaginationState>) =>
        _setPagination((prev) => applyUpdater(updater, prev))

    const setSorting = (updater: Updater<SortingState>) =>
        _setSorting((prev) => applyUpdater(updater, prev))

    const setColumnFilters = (updater: Updater<ColumnFiltersState>) =>
        _setColumnFilters((prev) => applyUpdater(updater, prev))

    // โหลดค่าที่เคย persist ไว้ (client-only, หลัง mount) — ตั้งใจ setState ใน effect เพื่อ sync
    // จาก localStorage (external system) เข้า React state ทีเดียวตอน mount กัน hydration mismatch
    useEffect(() => {
        const saved = safeParse<PersistedState>(localStorage.getItem(key))
        // eslint-disable-next-line react-hooks/set-state-in-effect -- sync ค่าเริ่มต้นจาก localStorage ครั้งเดียวตอน mount
        if (saved?.pagination) _setPagination(saved.pagination)
        if (saved?.sorting) _setSorting(saved.sorting)
        if (saved?.columnFilters) _setColumnFilters(saved.columnFilters)
    }, [key])

    // persist state — ข้าม run แรกตอน mount เพราะ state ตอนนั้นยังเป็น default อยู่
    // (การโหลดค่าจริงด้านบนยังไม่ apply ในรอบ effect เดียวกัน) ไม่งั้นจะเขียนทับค่าที่เคย persist ไว้ด้วย default
    const isFirstPersist = useRef(true)
    useEffect(() => {
        if (isFirstPersist.current) {
            isFirstPersist.current = false
            return
        }
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
