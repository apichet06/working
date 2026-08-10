import { apiFetchWR } from "@/lib/api-client";
import { DocterMfgNoListResponse } from "../type";

export const docter_project_code_service = {
    async listMfgNo(): Promise<string[]> {
        const res = await apiFetchWR<DocterMfgNoListResponse>("docter-project-code/mfgno");
        return res.data;
    },
};
