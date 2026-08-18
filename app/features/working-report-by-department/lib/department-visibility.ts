// แผนกกลุ่มนี้ (CAD/CAM) มองเห็นข้อมูลกันเองได้ภายในกลุ่ม แต่ไม่เห็นแผนกอื่นนอกกลุ่ม
const CROSS_VISIBLE_DEPARTMENT_IDS = [1, 2, 3]

// รายชื่อ d_id ที่ผู้ใช้คนนี้มีสิทธิ์มองเห็นข้อมูล: อยู่ในกลุ่ม CAD/CAM เห็นทั้งกลุ่ม, นอกกลุ่มเห็นเฉพาะแผนกตัวเอง
export function getVisibleDepartmentIds(d_id: number | undefined | null): number[] {
    if (d_id == null) return []
    if (CROSS_VISIBLE_DEPARTMENT_IDS.includes(d_id)) return CROSS_VISIBLE_DEPARTMENT_IDS
    return [d_id]
}
