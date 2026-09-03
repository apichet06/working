import { exportReportWithTemplate } from "@/app/features/report/lib/export-excel"
import { report_service } from "@/app/features/report/lib/report.service"
import { empDTO } from "@/app/features/working-time/type"

export type TemplateExportFilters = {
    e_usercode: string[]
    job_code: string[]
    cc_code: string[]
    part_code: string[]
    wp_name_en: string[]
}

type HandleTemplateExportParams = {
    empData: empDTO[]
    selected: TemplateExportFilters
    from: string
    to: string
    projectFilter?: string
    descriptionFilter?: string
}

export async function handleTemplateExport({
    empData,
    selected,
    from,
    to,
    projectFilter = "",
    descriptionFilter = "",
}: HandleTemplateExportParams): Promise<void> {
    const employeeIdByUsercode = new Map(empData.map((emp) => [emp.e_usercode, emp.e_id]))
    const selectedEmployeeIds = selected.e_usercode
        .map((usercode) => employeeIdByUsercode.get(usercode))
        .filter((id): id is number => id !== undefined)

    const templateData = await report_service.template(
        from,
        to,
        selectedEmployeeIds.length > 0 ? selectedEmployeeIds : undefined,
    )

    const firstNameByUsercode = new Map(
        templateData.rows.map((row) => [row.e_usercode, row.e_firstname_th?.trim() || row.e_usercode])
    )
    const selectedEmployeeNames = selected.e_usercode.length > 0
        ? selected.e_usercode.map((usercode) => firstNameByUsercode.get(usercode) ?? usercode)
        : undefined

    const normalizedProjectFilter = projectFilter.trim().toLocaleLowerCase()
    const normalizedDescriptionFilter = descriptionFilter.trim().toLocaleLowerCase()
    const rows = templateData.rows.filter((row) =>
        (selected.e_usercode.length === 0 || selected.e_usercode.includes(row.e_usercode)) &&
        (selected.job_code.length === 0 || selected.job_code.includes(String(row.job_code))) &&
        (selected.cc_code.length === 0 || selected.cc_code.includes(String(row.cc_code))) &&
        (selected.part_code.length === 0 || selected.part_code.includes(String(row.part_code))) &&
        (selected.wp_name_en.length === 0 || selected.wp_name_en.includes(row.wp_name_en ?? "")) &&
        (!normalizedProjectFilter || row.w_project_no.toLocaleLowerCase().includes(normalizedProjectFilter)) &&
        (!normalizedDescriptionFilter || row.w_desc.toLocaleLowerCase().includes(normalizedDescriptionFilter))
    )

    if (rows.length === 0) throw new Error("ไม่พบข้อมูลดิบสำหรับส่งออก")

    await exportReportWithTemplate({ ...templateData, rows }, from, to, selectedEmployeeNames)
}
