import z from "zod";

export const FormSchema = z.object({
    usercode: z.string()
        .min(7, { message: "กรุณากรอกข้อความ usercode" })
        .max(7, { message: "usercode ต้องไม่เกิน 7 ตัวอักษร" }),
    password: z.string().min(7, { message: "Password must be at least 7 characters." }),
});

export type FormValues = z.infer<typeof FormSchema>;



