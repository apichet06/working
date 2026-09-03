import { apiFetchWR } from "@/lib/api-client";
import {
    WorkingReport,
    WorkingReportListResponse,
    WorkingReportTemplate,
    WorkingReportTemplateResponse,
} from "../type";

export const report_service = {
    async list(startDate: string, endDate: string): Promise<WorkingReport[]> {
        const params = new URLSearchParams({ startDate, endDate });
        const res = await apiFetchWR<WorkingReportListResponse>(`report?${params.toString()}`);
        return res.data;
    },

    async template(startDate: string, endDate: string, employeeIds?: number[]): Promise<WorkingReportTemplate> {
        const params = new URLSearchParams({ startDate, endDate });
        if (employeeIds && employeeIds.length > 0) {
            params.set("e_id", employeeIds.join(","));
        }
        const res = await apiFetchWR<WorkingReportTemplateResponse>(`report/template?${params.toString()}`);
        return res.data;
    },
};
