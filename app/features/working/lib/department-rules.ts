// แผนกเหล่านี้ยังกรอกเลขที่โปรเจกต์เองแบบข้อความ ส่วนแผนกอื่นๆ นอกเหนือจากนี้ใช้เลือกรหัสดาย + เครื่องจักรแทน
export const TEXT_PROJECT_NO_DEPARTMENT_IDS = [1, 2, 3]

export function shouldUseDieAndMachine(d_id: number | undefined): boolean {
    return d_id !== undefined && !TEXT_PROJECT_NO_DEPARTMENT_IDS.includes(d_id)
}
