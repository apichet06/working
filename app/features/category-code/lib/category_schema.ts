import z from "zod";

export const CategoryCodeFormSchema = z.object({
    cc_code: z.string()
        .min(1, { message: "กรุณากรอกรหัสหมวดหมู่" })
        .max(50, { message: "รหัสหมวดหมู่ต้องไม่เกิน 50 ตัวอักษร" }),
    cc_descriptions: z.string()
        .min(1, { message: "กรุณากรอกรายละเอียดหมวดหมู่" })
        .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

export type CategoryCodeFormValues = z.infer<typeof CategoryCodeFormSchema>;
