// แผนกเหล่านี้ยังกรอกเลขที่โปรเจกต์เองแบบข้อความ ส่วนแผนกอื่นๆ นอกเหนือจากนี้ใช้เลือกรหัสดาย + เครื่องจักรแทน
export const TEXT_PROJECT_NO_DEPARTMENT_IDS = [1, 2, 3, 6, 7, 8];

export function shouldUseDieAndMachine(d_id: number | undefined): boolean {
  return d_id !== undefined && !TEXT_PROJECT_NO_DEPARTMENT_IDS.includes(d_id);
}

// แผนก Finishing งานเป็นรอบสั้นๆ ที่รู้เวลาเริ่ม/จบแน่นอนอยู่แล้วตอนกรอก (เช่น ประชุม)
// จึงให้พนักงานระบุเวลาเริ่ม/จบเองแทนปุ่มเริ่มงาน/หยุดชั่วคราวแบบจับเวลาสด
export const MANUAL_TIME_ENTRY_DEPARTMENT_IDS = [8];

export function shouldUseManualTimeEntry(d_id: number | undefined): boolean {
  return d_id !== undefined && MANUAL_TIME_ENTRY_DEPARTMENT_IDS.includes(d_id);
}
