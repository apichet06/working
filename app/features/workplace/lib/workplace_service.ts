import { apiFetchWR } from "@/lib/api-client";
import { WorkplaceDTO, WorkplaceListResponse } from "../type";

const workplaceService = {
  async list(): Promise<WorkplaceDTO[]> {
    const res = await apiFetchWR<WorkplaceListResponse>("workplace");
    return res.data;
  },
};

export default workplaceService;
