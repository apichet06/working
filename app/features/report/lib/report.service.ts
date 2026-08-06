import { apiFetchWR } from "@/lib/api-client";
import { WorkingReport, WorkingReportListResponse } from "../type";

export const report_service = {
    async list(startDate: string, endDate: string): Promise<WorkingReport[]> {
        const params = new URLSearchParams({ startDate, endDate });
        const res = await apiFetchWR<WorkingReportListResponse>(`report?${params.toString()}`);
        return res.data;
    },
};
