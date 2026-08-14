import ExcelJS from "exceljs";
import { format } from "date-fns";
import { WorkingReport } from "../type";

// ตัดตัวอักษรที่ตำแหน่งที่ 3-4 ออกจากรหัสพนักงาน เช่น 6811436 -> 68436
function trimEmpCode(code: string): string {
  if (code.length < 4) return code;
  return code.slice(0, 2) + code.slice(4);
}

const HEADER_FILL_ARGB = "FFD9D9D9"; // เทาอ่อน
const HEADER_FONT_COLOR_ARGB = "FF404040"; // เทาเข้ม
const FONT_NAME = "Angsana New";
const FONT_SIZE = 14;
const THIN_BORDER = {
  top: { style: "thin" },
  left: { style: "thin" },
  bottom: { style: "thin" },
  right: { style: "thin" },
} as const;

// กันชื่อแผนกมีอักขระที่ใช้เป็นชื่อไฟล์ไม่ได้ (/ \ : * ? " < > |)
function sanitizeFilenamePart(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, "-");
}

export async function exportReportToExcel(
  rows: WorkingReport[],
  from: string,
  to: string,
  scopeLabel: string,
) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Working Report");

  sheet.columns = [
    { header: "ID", key: "id", width: 10 },
    { header: "Working Date", key: "working_date", width: 14 },
    { header: "Emp Code", key: "e_usercode", width: 12 },
    { header: "Job Code", key: "job_code", width: 12 },
    { header: "Machine Code", key: "mac_code", width: 14 },
    { header: "Die No", key: "w_project_no", width: 16 },
    { header: "Category", key: "cc_code", width: 12 },
    { header: "Part Code", key: "part_code", width: 12 },
    { header: "Description", key: "w_desc", width: 30 },
    { header: "Job Hour", key: "job_hour", width: 12 },
    { header: "Labour Hour", key: "labour_hour", width: 14 },
    { header: "BRANCE", key: "wa_plant", width: 14 },
  ];
  sheet.autoFilter = {
    from: { row: 1, column: 1 },
    to: { row: 1, column: sheet.columns.length },
  };

  sheet.getRow(1).eachCell((cell) => {
    cell.font = {
      name: FONT_NAME,
      size: FONT_SIZE,
      bold: true,
      color: { argb: HEADER_FONT_COLOR_ARGB },
    };
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: HEADER_FILL_ARGB },
    };
    cell.border = THIN_BORDER;
  });

  rows.forEach((row, index) => {
    const excelRow = sheet.addRow({
      id: index + 1,
      working_date: format(new Date(row.working_date), "dd/MM/yyyy"),
      e_usercode: trimEmpCode(row.e_usercode),
      job_code: row.job_code,
      mac_code: row.mac_code ?? "-",
      w_project_no: row.w_project_no,
      cc_code: row.cc_code,
      part_code: row.part_code,
      w_desc: row.w_desc,
      job_hour: row.labour_hour,
      labour_hour: row.labour_hour,
      wa_plant: row.wa_plant,
    });
    excelRow.eachCell((cell) => {
      cell.font = { name: FONT_NAME, size: FONT_SIZE };
      cell.border = THIN_BORDER;
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `working-report_${sanitizeFilenamePart(scopeLabel)}_${from}_${to}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
