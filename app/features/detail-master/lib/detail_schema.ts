import z from "zod";

export const DetailMasterFormSchema = z.object({
  dp_id: z.string().min(1, { message: "กรุณาเลือกแผนก" }),
  detail_descriptions: z
    .string()
    .min(1, { message: "กรุณากรอกรายละเอียด" })
    .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

export type DetailMasterFormValues = z.infer<typeof DetailMasterFormSchema>;
