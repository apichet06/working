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
            // รหัสผ่านผิด = 401 เหมือนกัน แต่ต้องโชว์ข้อความ error บนฟอร์ม ไม่ใช่เด้งไปหน้า login (อยู่แล้ว)
            skipAuthRedirect: true,
        });
        return res;
    },

}

