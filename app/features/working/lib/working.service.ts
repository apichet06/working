import { apiFetchUser, apiFetchWR } from "@/lib/api-client";
import {
    WorkingMaster,
    WorkingMasterInput,
    WorkingMasterListResponse,
    WorkingMasterCreateResponse,
    WorkingMasterUpdateResponse,
    WorkingMasterDeleteResponse,
    WorkingActionStartResponse,
    WorkingActionCalendarItem,
    WorkingActionCalendarListResponse,
    Holiday,
    HolidayApiResponse,
} from "../type";

export const working_service = {

    async listHoliday(): Promise<Holiday[]> {
        const res = await apiFetchUser<HolidayApiResponse>("holiday");
        return res.data;
    },

    async list(): Promise<WorkingMaster[]> {
        const res = await apiFetchWR<WorkingMasterListResponse>("workingmaster");
        return res.data;
    },

    async listCalendar(from: string, to: string): Promise<WorkingActionCalendarItem[]> {
        const res = await apiFetchWR<WorkingActionCalendarListResponse>(
            `workingaction?from=${from}&to=${to}`
        );
        return res.data;
    },

    async create(input: WorkingMasterInput): Promise<number> {
        const res = await apiFetchWR<WorkingMasterCreateResponse>("workingmaster", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async update(w_id: number, input: WorkingMasterInput): Promise<WorkingMaster> {
        const res = await apiFetchWR<WorkingMasterUpdateResponse>(`workingmaster/${w_id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async remove(w_id: number): Promise<WorkingMasterDeleteResponse> {
        return apiFetchWR<WorkingMasterDeleteResponse>(`workingmaster/${w_id}`, {
            method: "DELETE",
        });
    },

    async finish(w_id: number): Promise<void> {
        await apiFetchWR(`workingmaster/${w_id}/end`, {
            method: "PUT",
        });
    },

    async startJob(w_id: number): Promise<number> {
        const res = await apiFetchWR<WorkingActionStartResponse>("workingaction", {
            method: "POST",
            body: JSON.stringify({ w_id }),
        });
        return res.data;
    },

    async endJob(wa_id: number): Promise<void> {
        await apiFetchWR(`workingaction/${wa_id}`, {
            method: "PUT",
        });
    },
};
