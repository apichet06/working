"use client"

import { useCallback, useEffect, useState } from "react"
import { dashboard_service } from "../lib/dashboard.service"
import { buildMonthDays, buildYearMonths } from "../lib/dashboard-calendar"
import { MonthlySummaryItem, YearlySummaryItem, BreakdownData } from "../type"

const EMPTY_BREAKDOWN: BreakdownData = { byJob: [], byProject: [] }

const now = new Date()

export function useDashboard() {
    const [year, setYear] = useState(now.getFullYear())
    const [month, setMonth] = useState(now.getMonth() + 1)
    // null = ดูข้อมูลของตัวเอง, ไม่ null = e_id ของพนักงานที่เลือกดู (เฉพาะ admin/subadmin)
    const [employeeId, setEmployeeId] = useState<number | null>(null)

    const [yearlyData, setYearlyData] = useState<YearlySummaryItem[]>([])
    const [monthlyData, setMonthlyData] = useState<MonthlySummaryItem[]>([])
    const [loadingYearly, setLoadingYearly] = useState(true)
    const [loadingMonthly, setLoadingMonthly] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [yearlyBreakdown, setYearlyBreakdown] = useState<BreakdownData>(EMPTY_BREAKDOWN)
    const [monthlyBreakdown, setMonthlyBreakdown] = useState<BreakdownData>(EMPTY_BREAKDOWN)
    const [loadingYearlyBreakdown, setLoadingYearlyBreakdown] = useState(true)
    const [loadingMonthlyBreakdown, setLoadingMonthlyBreakdown] = useState(true)

    const fetchYearly = useCallback(async () => {
        setLoadingYearly(true)
        try {
            const res = await dashboard_service.getYearly(year, employeeId ?? undefined)
            setYearlyData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลสรุปรายปีไม่สำเร็จ")
        } finally {
            setLoadingYearly(false)
        }
    }, [year, employeeId])

    const fetchMonthly = useCallback(async () => {
        setLoadingMonthly(true)
        try {
            const res = await dashboard_service.getMonthly(year, month, employeeId ?? undefined)
            setMonthlyData(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลสรุปรายเดือนไม่สำเร็จ")
        } finally {
            setLoadingMonthly(false)
        }
    }, [year, month, employeeId])

    const fetchYearlyBreakdown = useCallback(async () => {
        setLoadingYearlyBreakdown(true)
        try {
            const res = await dashboard_service.getYearlyBreakdown(year, employeeId ?? undefined)
            setYearlyBreakdown(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลสรุปงานรายปีไม่สำเร็จ")
        } finally {
            setLoadingYearlyBreakdown(false)
        }
    }, [year, employeeId])

    const fetchMonthlyBreakdown = useCallback(async () => {
        setLoadingMonthlyBreakdown(true)
        try {
            const res = await dashboard_service.getMonthlyBreakdown(year, month, employeeId ?? undefined)
            setMonthlyBreakdown(res)
            setError(null)
        } catch (err) {
            setError(err instanceof Error ? err.message : "โหลดข้อมูลสรุปงานรายเดือนไม่สำเร็จ")
        } finally {
            setLoadingMonthlyBreakdown(false)
        }
    }, [year, month, employeeId])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change; state only updates after the awaited request settles
        fetchYearly()
    }, [fetchYearly])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change; state only updates after the awaited request settles
        fetchMonthly()
    }, [fetchMonthly])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change; state only updates after the awaited request settles
        fetchYearlyBreakdown()
    }, [fetchYearlyBreakdown])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-change; state only updates after the awaited request settles
        fetchMonthlyBreakdown()
    }, [fetchMonthlyBreakdown])

    return {
        year,
        setYear,
        month,
        setMonth,
        employeeId,
        setEmployeeId,
        yearPoints: buildYearMonths(yearlyData),
        monthPoints: buildMonthDays(year, month, monthlyData),
        loadingYearly,
        loadingMonthly,
        yearlyBreakdown,
        monthlyBreakdown,
        loadingYearlyBreakdown,
        loadingMonthlyBreakdown,
        error,
    }
}
