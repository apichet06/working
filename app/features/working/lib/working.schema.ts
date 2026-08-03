import z from "zod";

export const WorkingMasterFormSchema = z.object({
    job_id: z.string().min(1, { message: "กรุณาเลือกงาน" }),
    cc_id: z.string().min(1, { message: "กรุณาเลือกหมวดหมู่" }),
    part_id: z.string().min(1, { message: "กรุณาเลือกชิ้นงาน" }),
    w_project_no: z.string()
        .min(1, { message: "กรุณากรอกเลขที่โปรเจกต์" })
        .max(100, { message: "เลขที่โปรเจกต์ต้องไม่เกิน 100 ตัวอักษร" }),
    w_desc: z.string()
        .min(1, { message: "กรุณากรอกรายละเอียด" })
        .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

export type WorkingMasterFormValues = z.infer<typeof WorkingMasterFormSchema>;
