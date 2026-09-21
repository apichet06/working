import { exportReportToExcel } from "@/app/features/report/lib/export-excel"
import { WorkingReport } from "@/app/features/report/type"

type ExportFilters = {
    department: string[]
    e_usercode: string[]
    job_code: string[]
    cc_code: string[]
    part_code: string[]
    wp_name_en: string[]
}

type DepartmentOption = {
    value: string
    label: string
}

type HandleExportParams = {
    rows: WorkingReport[]
    selected: ExportFilters
    departmentOptions: DepartmentOption[]
    from: string
    to: string
    projectFilter?: string
    descriptionFilter?: string
}

// 1-3 รายการใช้ชื่อโดยตรง หากมากกว่านั้นใช้จำนวนเพื่อไม่ให้ชื่อไฟล์ยาวเกินไป
function buildScopeLabel(names: string[], unit: string): string | null {
    if (names.length === 0) return null
    if (names.length <= 3) return names.join("-")
    return `${names.length}${unit}`
}

export async function handleExport({
    rows,
    selected,
    departmentOptions,
    from,
    to,
    projectFilter = "",
    descriptionFilter = "",
}: HandleExportParams): Promise<void> {
    const departmentNames = departmentOptions
        .filter((option) => selected.department.includes(option.value))
        .map((option) => option.label)
    const scopeLabel =
        buildScopeLabel(selected.e_usercode, "คน") ??
        buildScopeLabel(departmentNames, "แผนก") ??
        "ทุกคน"
    const branchNames = selected.wp_name_en.length > 0
        ? selected.wp_name_en
        : [...new Set(rows.map((row) => row.wp_name_en?.trim()).filter((name): name is string => !!name))]
    const branchLabel = buildScopeLabel(branchNames, "สาขา") ?? "ไม่ระบุสาขา"

    const hasOtherFilters =
        selected.job_code.length > 0 ||
        selected.cc_code.length > 0 ||
        selected.part_code.length > 0 ||
        projectFilter.trim().length > 0 ||
        descriptionFilter.trim().length > 0
    const filteredScope = hasOtherFilters ? `${scopeLabel}-กรองเพิ่มเติม` : scopeLabel
    const fileScope = `${branchLabel}_${filteredScope}`

    await exportReportToExcel(rows, from, to, fileScope)
}
