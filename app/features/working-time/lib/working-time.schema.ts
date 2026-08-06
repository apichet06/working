import z from "zod";

export const WA_STATUS_OPTIONS = ["ผู้ใช้ปิดงาน", "ระบบปิดงานอัตโนมัติ", "แอดมินแก้ไข"] as const;

export const WorkingTimeFormSchema = z.object({
    wa_start_time: z.string().min(1, { message: "กรุณาระบุเวลาเริ่มงาน" }),
    wa_end_time: z.string().min(1, { message: "กรุณาระบุเวลาสิ้นสุดงาน" }),
}).refine((data) => data.wa_end_time > data.wa_start_time, {
    message: "เวลาสิ้นสุดต้องอยู่หลังเวลาเริ่มงาน",
    path: ["wa_end_time"],
});

export type WorkingTimeFormValues = z.infer<typeof WorkingTimeFormSchema>;
