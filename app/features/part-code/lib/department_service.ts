import { apiFetchUser } from "@/lib/api-client";
import { Department, DepartmentListResponse } from "../type";

// ระบบพนักงาน (EIS) มี endpoint นี้อยู่แล้ว
export const department_service = {
    async list(): Promise<Department[]> {
        const res = await apiFetchUser<DepartmentListResponse>("department");
        return res.data;
    },
};
