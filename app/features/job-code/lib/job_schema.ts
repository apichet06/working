import z from "zod";

export const JobCodeFormSchema = z.object({
    job_code: z.string()
        .min(1, { message: "กรุณากรอกรหัสงาน" })
        .max(50, { message: "รหัสงานต้องไม่เกิน 50 ตัวอักษร" })
        .regex(/^\d+$/, { message: "กรุณากรอกตัวเลขเท่านั้น" }),
    dp_id: z.string()
        .min(1, { message: "กรุณาเลือกแผนก" }),
    job_descriptions: z.string()
        .min(1, { message: "กรุณากรอกรายละเอียดงาน" })
        .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

export type JobCodeFormValues = z.infer<typeof JobCodeFormSchema>;
