import { apiFetchWR } from "@/lib/api-client";
import { empDTO, EmpListResponse, HolidayApiResponseResponse, WorkingActionJob, WorkingActionJobResponse, WorkingActionsJobList } from "../type";
import { toMySQLDateTime } from "@/lib/formDatetime";

export type WorkingActionsListFilters = {
    e_usercode: string;
    w_date?: string;
};

export const workingtime_service = {
    async listEmp(): Promise<empDTO[]> {
        const res = await apiFetchWR<EmpListResponse>("emp");
        return res.data;
    },

    async list(filters: WorkingActionsListFilters): Promise<WorkingActionsJobList[]> {
        const params = new URLSearchParams();
        params.set("e_usercode", filters.e_usercode);
        if (filters.w_date) params.set("w_date", filters.w_date);

        const res = await apiFetchWR<HolidayApiResponseResponse>(`workingaction/list?${params.toString()}`);
        return res.data;
    },

    async update(wa_id: number, input: WorkingActionJob): Promise<WorkingActionJob> {
        const payload = {
            ...input,
            wa_start_job: toMySQLDateTime(input.wa_start_job),
            wa_end_job: input.wa_end_job ? toMySQLDateTime(input.wa_end_job) : null,
        };

        const res = await apiFetchWR<WorkingActionJobResponse>(`workingaction/${wa_id}/admin`, {
            method: "PUT",
            body: JSON.stringify(payload),
        });
        return res.data;
    },
}
