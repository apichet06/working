"use client"

import { useCallback, useEffect, useState } from "react"
import { toast } from "@/components/ui/toast"
import { category_service } from "../lib/category_service"
import { CategoryCode, CategoryCodeInput } from "../type"

export function useCategoryCode() {
    const [data, setData] = useState<CategoryCode[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const res = await category_service.list()
            setData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลไม่สำเร็จ")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch-on-mount; state only updates after the awaited request settles
        fetchData()
    }, [fetchData])

    const createCategoryCode = useCallback(async (input: CategoryCodeInput) => {
        await category_service.create(input)
        toast.add({ title: "บันทึกข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const updateCategoryCode = useCallback(async (cc_id: number, input: CategoryCodeInput) => {
        await category_service.update(cc_id, input)
        toast.add({ title: "อัปเดตข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    const deleteCategoryCode = useCallback(async (cc_id: number) => {
        await category_service.remove(cc_id)
        toast.add({ title: "ลบข้อมูลสำเร็จ", type: "success" })
        await fetchData()
    }, [fetchData])

    return {
        data,
        loading,
        error,
        refresh: fetchData,
        createCategoryCode,
        updateCategoryCode,
        deleteCategoryCode,
    }
}
