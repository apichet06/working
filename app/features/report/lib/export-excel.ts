import ExcelJS from "exceljs";
import { format } from "date-fns";
import { parseYMDToLocalDate } from "@/lib/formDatetime";
import { ReportMasterCode, WorkingReport, WorkingReportTemplate } from "../type";

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

function downloadWorkbook(buffer: ExcelJS.Buffer, filename: string) {
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
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
  downloadWorkbook(buffer, `working-report_${sanitizeFilenamePart(scopeLabel)}_${from}_${to}.xlsx`);
}

const TEMPLATE_URL = "/excel/working_master.xlsx";
const TEMPLATE_DATA_START_ROW = 5;
const TEMPLATE_FORMULA_START_COLUMN = 12; // L เป็นต้นไป ห้ามเขียนหรือเคลียร์
const EXCEL_UNIX_EPOCH_OFFSET_DAYS = 25569;
const MILLISECONDS_PER_DAY = 86400000;

// API ส่ง DATETIME ของ MySQL เป็นเวลาไทยแบบไม่มี timezone (YYYY-MM-DD HH:mm:ss)
// แปลงเป็น serial number ของ Excel โดยใช้ Date.UTC เฉพาะเพื่อคำนวณตัวเลข ห้ามสร้าง Date
// จาก string นี้ตรงๆ เพราะ JavaScript/ExcelJS จะชดเชย timezone แล้วเวลาถอย 7 ชั่วโมง
function mysqlDateTimeToExcelSerial(value: string): number {
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})$/);
  if (!match) throw new Error(`รูปแบบวันเวลาไม่ถูกต้อง: ${value}`);
  const [, year, month, day, hour, minute, second] = match;
  return Date.UTC(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
    Number(second),
  ) / MILLISECONDS_PER_DAY + EXCEL_UNIX_EPOCH_OFFSET_DAYS;
}

function uniqueCodes(codes: ReportMasterCode[]): ReportMasterCode[] {
  const byCode = new Map<string, ReportMasterCode>();
  for (const item of codes) {
    const code = String(item.code).trim();
    if (code && !byCode.has(code)) byCode.set(code, { code, description: item.description ?? "" });
  }
  return [...byCode.values()].sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
}

function clearValues(
  sheet: ExcelJS.Worksheet,
  startRow: number,
  endRow: number,
  columns: number[],
) {
  for (let row = startRow; row <= endRow; row += 1) {
    for (const column of columns) sheet.getCell(row, column).value = null;
  }
}

function writeCodeTable(
  sheet: ExcelJS.Worksheet,
  codeColumn: number,
  descriptionColumn: number,
  codes: ReportMasterCode[],
) {
  uniqueCodes(codes).forEach((item, index) => {
    const row = index + 2;
    sheet.getCell(row, codeColumn).value = item.code;
    sheet.getCell(row, descriptionColumn).value = item.description;
  });
}

function getLastFormulaRow(sheet: ExcelJS.Worksheet): number {
  let lastFormulaRow = 0;
  sheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    row.eachCell({ includeEmpty: false }, (cell, columnNumber) => {
      if (columnNumber >= TEMPLATE_FORMULA_START_COLUMN && cell.type === ExcelJS.ValueType.Formula) {
        lastFormulaRow = Math.max(lastFormulaRow, rowNumber);
      }
    });
  });
  return lastFormulaRow;
}

function buildTemplateFilename(
  data: WorkingReportTemplate,
  from: string,
  to: string,
  selectedEmployeeNames?: string[],
): string {
  const firstNameByEmployee = new Map<number, string>();
  for (const row of data.rows) {
    if (!firstNameByEmployee.has(row.e_id)) {
      firstNameByEmployee.set(row.e_id, row.e_firstname_th?.trim() || row.e_usercode);
    }
  }
  const names = [...new Set(
    selectedEmployeeNames && selectedEmployeeNames.length > 0
      ? selectedEmployeeNames
      : [...firstNameByEmployee.values()],
  )]
    .map(sanitizeFilenamePart)
    .join("_");
  const fromMonthYear = `${from.slice(5, 7)}_${from.slice(2, 4)}`;
  const toMonthYear = `${to.slice(5, 7)}_${to.slice(2, 4)}`;
  const period = fromMonthYear === toMonthYear
    ? fromMonthYear
    : `${fromMonthYear}-${toMonthYear}`;
  return `wr_${names || "ไม่พบชื่อ"}${period}.xlsx`;
}

export async function exportReportWithTemplate(
  data: WorkingReportTemplate,
  from: string,
  to: string,
  selectedEmployeeNames?: string[],
) {
  const templateResponse = await fetch(TEMPLATE_URL, { cache: "no-store" });
  if (!templateResponse.ok) {
    throw new Error(`โหลดไฟล์ต้นแบบไม่สำเร็จ (${templateResponse.status})`);
  }

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(await templateResponse.arrayBuffer());
  const reportSheet = workbook.getWorksheet("Working Report");
  const allCodeSheet = workbook.getWorksheet("All code");
  if (!reportSheet || !allCodeSheet) {
    throw new Error("ไฟล์ต้นแบบต้องมี Sheet ชื่อ Working Report และ All code");
  }

  const lastFormulaRow = getLastFormulaRow(reportSheet);
  const templateCapacity = lastFormulaRow > 0
    ? lastFormulaRow - TEMPLATE_DATA_START_ROW + 1
    : reportSheet.rowCount - TEMPLATE_DATA_START_ROW + 1;
  if (data.rows.length > templateCapacity) {
    throw new Error(`ข้อมูลมี ${data.rows.length} แถว แต่สูตรในไฟล์ต้นแบบรองรับ ${templateCapacity} แถว`);
  }

  reportSheet.getCell("C3").value = `${format(parseYMDToLocalDate(from), "dd/MM/yyyy")} - ${format(parseYMDToLocalDate(to), "dd/MM/yyyy")}`;
  const reportClearEndRow = Math.max(reportSheet.rowCount, TEMPLATE_DATA_START_ROW + data.rows.length - 1);
  clearValues(
    reportSheet,
    TEMPLATE_DATA_START_ROW,
    reportClearEndRow,
    Array.from({ length: 10 }, (_, index) => index + 2), // B:K เท่านั้น
  );

  data.rows.forEach((item, index) => {
    const rowNumber = TEMPLATE_DATA_START_ROW + index;
    const start = mysqlDateTimeToExcelSerial(item.wa_start_job);
    const finish = mysqlDateTimeToExcelSerial(item.wa_end_job);
    reportSheet.getCell(rowNumber, 2).value = Math.floor(start);
    reportSheet.getCell(rowNumber, 3).value = item.e_usercode;
    reportSheet.getCell(rowNumber, 4).value = item.job_code;
    reportSheet.getCell(rowNumber, 5).value = item.mac_code ?? "";
    reportSheet.getCell(rowNumber, 6).value = item.w_project_no;
    reportSheet.getCell(rowNumber, 7).value = item.cc_code;
    reportSheet.getCell(rowNumber, 8).value = item.part_code;
    reportSheet.getCell(rowNumber, 9).value = item.w_desc;
    // J/K เก็บเฉพาะเศษส่วนของหนึ่งวัน (เวลาอย่างเดียว) ไม่ใส่ serial ของวันที่ลงไป
    // เพื่อให้ formula bar และค่าภายในเซลล์เป็นเวลา เช่น 8:00:00 ไม่ใช่วัน+เวลา
    const startTimeCell = reportSheet.getCell(rowNumber, 10);
    const finishTimeCell = reportSheet.getCell(rowNumber, 11);
    startTimeCell.value = start - Math.floor(start);
    finishTimeCell.value = finish - Math.floor(finish);
    startTimeCell.numFmt = "h:mm:ss";
    finishTimeCell.numFmt = "h:mm:ss";
  });

  const allCodeClearEndRow = Math.max(
    allCodeSheet.rowCount,
    data.codes.jobs.length + 1,
    data.codes.dies.length + 1,
    data.codes.categories.length + 1,
    data.codes.parts.length + 1,
  );
  clearValues(allCodeSheet, 2, allCodeClearEndRow, [2, 3, 5, 6, 8, 9, 11, 12]);
  writeCodeTable(allCodeSheet, 2, 3, data.codes.jobs);
  writeCodeTable(allCodeSheet, 5, 6, data.codes.dies);
  writeCodeTable(allCodeSheet, 8, 9, data.codes.categories);
  writeCodeTable(allCodeSheet, 11, 12, data.codes.parts);

  workbook.calcProperties.fullCalcOnLoad = true;
  const buffer = await workbook.xlsx.writeBuffer();
  downloadWorkbook(buffer, buildTemplateFilename(data, from, to, selectedEmployeeNames));
}
