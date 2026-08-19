import { apiFetchWR } from "@/lib/api-client";
import { WorkingMaster, WorkingMasterInput, WorkingMasterListResponse } from "@/app/features/working/type";

export const working_checking_service = {
    async listHistory(from: string, to: string): Promise<WorkingMaster[]> {
        const res = await apiFetchWR<WorkingMasterListResponse>(`workingmaster/history?from=${from}&to=${to}`);
        return res.data;
    },

    // แก้ไขเนื้อหางาน (job/category/part/machine/รายละเอียด/โปรเจกต์) ของ WorkingActionJob โดยตรง ไม่แตะเวลา (payload shape เดียวกับ WorkingMasterInput)
    async updateActionJobDetail(wa_id: number, input: WorkingMasterInput): Promise<void> {
        await apiFetchWR(`workingaction/${wa_id}/detail`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
    },
};
