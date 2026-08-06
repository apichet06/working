export type YearlySummaryItem = {
    month: number;
    total_hours: number;
    job_hour: number;
};

export type MonthlySummaryItem = {
    day: number;
    total_hours: number;
    job_hour: number;
};

export type YearlySummaryResponse = {
    data: YearlySummaryItem[];
};

export type MonthlySummaryResponse = {
    data: MonthlySummaryItem[];
};

export type Department = {
    d_id: number;
    d_department_en: string;
};

export type DepartmentListResponse = {
    data: Department[];
};

export type EmployeeJobCount = {
    e_id: number;
    job_count: number;
};

export type EmployeeJobCountResponse = {
    data: EmployeeJobCount[];
};

export type JobBreakdownItem = {
    job_code: string;
    job_descriptions: string;
    total_hours: number;
    job_hour: number;
};

export type ProjectBreakdownItem = {
    w_project_no: string;
    total_hours: number;
    job_hour: number;
};

export type BreakdownData = {
    byJob: JobBreakdownItem[];
    byProject: ProjectBreakdownItem[];
};

export type BreakdownResponse = {
    data: BreakdownData;
};
