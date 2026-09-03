import { apiFetchWR } from "@/lib/api-client";
import {
  DetailMaster,
  DetailMasterInput,
  DetailMasterCreateResponse,
  DetailMasterDeleteResponse,
  DetailMasterResponse,
  DetailMasterUpdateResponse,
} from "../type";

export const detailmaster_service = {
  async list(): Promise<DetailMaster[]> {
    const res = await apiFetchWR<DetailMasterResponse>("detailmaster");
    return res.data;
  },

  async create(input: DetailMasterInput): Promise<number> {
    const res = await apiFetchWR<DetailMasterCreateResponse>("detailmaster", {
      method: "POST",
      body: JSON.stringify(input),
    });
    return res.data;
  },

  async update(detail_id: number, input: DetailMasterInput): Promise<DetailMaster> {
    const res = await apiFetchWR<DetailMasterUpdateResponse>(
      `detailmaster/${detail_id}`,
      {
        method: "PUT",
        body: JSON.stringify(input),
      },
    );
    return res.data;
  },

  async remove(detail_id: number): Promise<DetailMasterDeleteResponse> {
    return apiFetchWR<DetailMasterDeleteResponse>(`detailmaster/${detail_id}`, {
      method: "DELETE",
    });
  },
};
