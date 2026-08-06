import { apiFetchWR } from "@/lib/api-client";
import {
    YearlySummaryItem,
    YearlySummaryResponse,
    MonthlySummaryItem,
    MonthlySummaryResponse,
    EmployeeJobCount,
    EmployeeJobCountResponse,
    BreakdownData,
    BreakdownResponse,
} from "../type";

export const dashboard_service = {
    async getYearly(year: number, employeeId?: number): Promise<YearlySummaryItem[]> {
        const params = new URLSearchParams({ year: String(year) });
        if (employeeId) params.set("employee", String(employeeId));

        const res = await apiFetchWR<YearlySummaryResponse>(`dashboard/yearly?${params.toString()}`);
        return res.data;
    },

    async getMonthly(year: number, month: number, employeeId?: number): Promise<MonthlySummaryItem[]> {
        const params = new URLSearchParams({ year: String(year), month: String(month) });
        if (employeeId) params.set("employee", String(employeeId));

        const res = await apiFetchWR<MonthlySummaryResponse>(`dashboard/monthly?${params.toString()}`);
        return res.data;
    },

    async getEmployeeJobCounts(year: number): Promise<EmployeeJobCount[]> {
        const params = new URLSearchParams({ year: String(year) });
        const res = await apiFetchWR<EmployeeJobCountResponse>(`dashboard/employee-job-counts?${params.toString()}`);
        return res.data;
    },

    async getYearlyBreakdown(year: number, employeeId?: number): Promise<BreakdownData> {
        const params = new URLSearchParams({ year: String(year) });
        if (employeeId) params.set("employee", String(employeeId));

        const res = await apiFetchWR<BreakdownResponse>(`dashboard/yearly-breakdown?${params.toString()}`);
        return res.data;
    },

    async getMonthlyBreakdown(year: number, month: number, employeeId?: number): Promise<BreakdownData> {
        const params = new URLSearchParams({ year: String(year), month: String(month) });
        if (employeeId) params.set("employee", String(employeeId));

        const res = await apiFetchWR<BreakdownResponse>(`dashboard/monthly-breakdown?${params.toString()}`);
        return res.data;
    },
};
