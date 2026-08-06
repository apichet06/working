import { apiFetchWR } from "@/lib/api-client";
import {
    DieCode,
    DieCodeInput,
    DieCodeListResponse,
    DieCodeCreateResponse,
    DieCodeUpdateResponse,
    DieCodeDeleteResponse,
} from "../type";

export const diecode_service = {
    async list(): Promise<DieCode[]> {
        const res = await apiFetchWR<DieCodeListResponse>("diecode");
        return res.data;
    },

    async create(input: DieCodeInput): Promise<number> {
        const res = await apiFetchWR<DieCodeCreateResponse>("diecode", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async update(die_id: number, input: DieCodeInput): Promise<DieCode> {
        const res = await apiFetchWR<DieCodeUpdateResponse>(`diecode/${die_id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async remove(die_id: number): Promise<DieCodeDeleteResponse> {
        return apiFetchWR<DieCodeDeleteResponse>(`diecode/${die_id}`, {
            method: "DELETE",
        });
    },
};
