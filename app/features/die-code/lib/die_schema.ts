import z from "zod";

export const DieCodeFormSchema = z.object({
    die_code: z.string()
        .min(1, { message: "กรุณากรอกรหัสดาย" })
        .max(50, { message: "รหัสดายต้องไม่เกิน 50 ตัวอักษร" }),
    dp_id: z.string()
        .min(1, { message: "กรุณาเลือกแผนก" }),
    die_descriptions: z.string()
        .min(1, { message: "กรุณากรอกรายละเอียดดาย" })
        .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

export type DieCodeFormValues = z.infer<typeof DieCodeFormSchema>;
