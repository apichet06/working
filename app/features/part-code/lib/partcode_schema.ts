import z from "zod";

export const PartCodeFormSchema = z.object({
    part_code: z.string()
        .min(1, { message: "กรุณากรอกรหัสชิ้นงาน" })
        .max(50, { message: "รหัสชิ้นงานต้องไม่เกิน 50 ตัวอักษร" }),
    dp_id: z.string()
        .min(1, { message: "กรุณาเลือกแผนก" }),
    part_descriptions: z.string()
        .min(1, { message: "กรุณากรอกรายละเอียดชิ้นงาน" })
        .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

export type PartCodeFormValues = z.infer<typeof PartCodeFormSchema>;
