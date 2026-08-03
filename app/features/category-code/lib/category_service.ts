import { apiFetchWR } from "@/lib/api-client";
import {
    CategoryCode,
    CategoryCodeInput,
    CategoryCodeListResponse,
    CategoryCodeCreateResponse,
    CategoryCodeUpdateResponse,
    CategoryCodeDeleteResponse,
} from "../type";

// หมายเหตุ: ฝั่ง API mount เส้นทางไว้ที่ /api/catetory (สะกดแบบนี้จริงใน app.ts)
export const category_service = {
    async list(): Promise<CategoryCode[]> {
        const res = await apiFetchWR<CategoryCodeListResponse>("catetory");
        return res.data;
    },

    async create(input: CategoryCodeInput): Promise<number> {
        const res = await apiFetchWR<CategoryCodeCreateResponse>("catetory", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async update(cc_id: number, input: CategoryCodeInput): Promise<CategoryCode> {
        const res = await apiFetchWR<CategoryCodeUpdateResponse>(`catetory/${cc_id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async remove(cc_id: number): Promise<CategoryCodeDeleteResponse> {
        return apiFetchWR<CategoryCodeDeleteResponse>(`catetory/${cc_id}`, {
            method: "DELETE",
        });
    },
};
