import { apiFetchWR } from "@/lib/api-client";
import { WorkingMaster, WorkingMasterListResponse } from "@/app/features/working/type";

export const working_checking_service = {
    async listHistory(from: string, to: string): Promise<WorkingMaster[]> {
        const res = await apiFetchWR<WorkingMasterListResponse>(`workingmaster/history?from=${from}&to=${to}`);
        return res.data;
    },
};
