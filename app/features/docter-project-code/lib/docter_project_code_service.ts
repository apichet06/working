import { apiFetchWR } from "@/lib/api-client";
import { DocterMfgNoListResponse } from "../type";

export const docter_project_code_service = {
    async listMfgNo(term: string): Promise<string[]> {
        const res = await apiFetchWR<DocterMfgNoListResponse>(
            `docter-project-code/mfgno?term=${encodeURIComponent(term)}`
        );
        // Normalize ที่ API boundary เพราะ runtime data จาก Oracle อาจไม่ตรงกับ TypeScript type
        // และ Combobox/form ใช้ string เป็น canonical value เสมอ
        return res.data.map((mfgNo) => String(mfgNo));
    },
};
