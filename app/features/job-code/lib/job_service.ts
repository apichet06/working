import { apiFetchWR } from "@/lib/api-client";
import {
    JobCode,
    JobCodeInput,
    JobCodeListResponse,
    JobCodeCreateResponse,
    JobCodeUpdateResponse,
    JobCodeDeleteResponse,
} from "../type";

export const jobcode_service = {
    async list(): Promise<JobCode[]> {
        const res = await apiFetchWR<JobCodeListResponse>("jobcode");
        return res.data;
    },

    async create(input: JobCodeInput): Promise<number> {
        const res = await apiFetchWR<JobCodeCreateResponse>("jobcode", {
            method: "POST",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async update(job_id: number, input: JobCodeInput): Promise<JobCode> {
        const res = await apiFetchWR<JobCodeUpdateResponse>(`jobcode/${job_id}`, {
            method: "PUT",
            body: JSON.stringify(input),
        });
        return res.data;
    },

    async remove(job_id: number): Promise<JobCodeDeleteResponse> {
        return apiFetchWR<JobCodeDeleteResponse>(`jobcode/${job_id}`, {
            method: "DELETE",
        });
    },
};
