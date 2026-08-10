import z from "zod";

export const WorkingMasterFormSchema = z.object({
    job_id: z.string().min(1, { message: "กรุณาเลือกงาน" }),
    cc_id: z.string().min(1, { message: "กรุณาเลือกหมวดหมู่" }),
    part_id: z.string().min(1, { message: "กรุณาเลือกชิ้นงาน" }),
    mac_id: z.string().optional(),
    w_project_no: z.string()
        .max(100, { message: "เลขที่โปรเจกต์ต้องไม่เกิน 100 ตัวอักษร" }),
    w_desc: z.string()
        .min(1, { message: "กรุณากรอกรายละเอียด" })
        .max(255, { message: "รายละเอียดต้องไม่เกิน 255 ตัวอักษร" }),
});

// requireDieAndMachine: true สำหรับแผนกที่ต้องเลือกรหัสดาย + เครื่องจักรแทนการกรอกเลขที่โปรเจกต์เอง
export function getWorkingMasterFormSchema(requireDieAndMachine: boolean) {
    return WorkingMasterFormSchema.superRefine((values, ctx) => {
        if (!values.w_project_no) {
            ctx.addIssue({
                code: "custom",
                path: ["w_project_no"],
                message: requireDieAndMachine ? "กรุณาเลือกรหัสดาย" : "กรุณาเลือกเลขที่โปรเจกต์",
            });
        }
        if (requireDieAndMachine && !values.mac_id) {
            ctx.addIssue({
                code: "custom",
                path: ["mac_id"],
                message: "กรุณาเลือกเครื่องจักร",
            });
        }
    });
}

export type WorkingMasterFormValues = z.infer<typeof WorkingMasterFormSchema>;
