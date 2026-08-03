import { apiFetchUser } from "@/lib/api-client";
import { EmployeeApiResponse, LoginData } from "../type";
export const employee_service = {

    async login(user: LoginData): Promise<EmployeeApiResponse> {
        const res = await apiFetchUser<EmployeeApiResponse>("/employee/login/47", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(user),
        });
        return res;
    },

}

