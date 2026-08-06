import { apiFetchWR } from "@/lib/api-client";
import {
    MachineCode,
    MachineCodeInput,
    MachineCodeListResponse,
    MachineCodeCreateResponse,
    MachineCodeUpdateResponse,
    MachineCodeDeleteResponse,
} from "../type";

export const machinecode_service = {
    async list(): Promise<MachineCode[]> {
        const res = await apiFetchWR<MachineCodeListResponse>("machinecode");
        return res.data;
    },

    async create(input: MachineCodeInput): Promise<number> {
        const res = await apiFetchWR<MachineCodeCreateResponse>("machinecode", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async update(mac_id: number, input: MachineCodeInput): Promise<MachineCode> {
        const res = await apiFetchWR<MachineCodeUpdateResponse>(`machinecode/${mac_id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async remove(mac_id: number): Promise<MachineCodeDeleteResponse> {
        return apiFetchWR<MachineCodeDeleteResponse>(`machinecode/${mac_id}`, {
            method: "DELETE",
        });
    },
};
