import { apiFetchWR } from "@/lib/api-client";
import { DocterMfgNoListResponse } from "../type";

export const docter_project_code_service = {
    async listMfgNo(term: string): Promise<string[]> {
        const res = await apiFetchWR<DocterMfgNoListResponse>(
            `docter-project-code/mfgno?term=${encodeURIComponent(term)}`
        );
        return res.data;
    },
};
