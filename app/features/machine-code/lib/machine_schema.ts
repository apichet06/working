import z from "zod";

export const MachineCodeFormSchema = z.object({
    mac_code: z.string()
        .min(1, { message: "กรุณากรอกรหัสเครื่องจักร" })
        .max(50, { message: "รหัสเครื่องจักรต้องไม่เกิน 50 ตัวอักษร" }),
    dp_id: z.string()
        .min(1, { message: "กรุณาเลือกแผนก" }),
    mac_descriptions: z.string()
        .min(1, { message: "กรุณากรอกรายละเอียดเครื่องจักร" })
        .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

export type MachineCodeFormValues = z.infer<typeof MachineCodeFormSchema>;
