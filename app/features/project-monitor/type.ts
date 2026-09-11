export type ActiveProjectMember = {
    e_id: number
    e_usercode: string | null
    e_name: string
    started_at: string
    elapsed_seconds: number
    is_working: boolean
    job_code: string
    cc_code: string
    part_code: string
    w_desc: string
}

export type ActiveProject = {
    project_no: string
    die_descriptions: string | null
    started_at: string
    elapsed_seconds: number
    member_count: number
    active_member_count: number
    members: ActiveProjectMember[]
}

export type ActiveProjectsResponse = {
    data: ActiveProject[]
}

export type MonitorDepartmentsResponse = {
    data: number[]
}
