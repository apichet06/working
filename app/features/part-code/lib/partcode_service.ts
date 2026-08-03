import { apiFetchWR } from "@/lib/api-client";
import {
    PartCode,
    PartCodeInput,
    PartCodeListResponse,
    PartCodeCreateResponse,
    PartCodeUpdateResponse,
    PartCodeDeleteResponse,
} from "../type";

export const partcode_service = {
    async list(): Promise<PartCode[]> {
        const res = await apiFetchWR<PartCodeListResponse>("partcode");
        return res.data;
    },

    async create(input: PartCodeInput): Promise<number> {
        const res = await apiFetchWR<PartCodeCreateResponse>("partcode", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async update(part_id: number, input: PartCodeInput): Promise<PartCode> {
        const res = await apiFetchWR<PartCodeUpdateResponse>(`partcode/${part_id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async remove(part_id: number): Promise<PartCodeDeleteResponse> {
        return apiFetchWR<PartCodeDeleteResponse>(`partcode/${part_id}`, {
            method: "DELETE",
        });
    },
};
