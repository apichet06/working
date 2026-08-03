export type JobCode = {
    job_id: number;
    job_code: string;
    dp_id: number;
    job_descriptions: string;
    dp_department: string | null;
    add_date: string;
    e_name: string | null;
};

export type JobCodeInput = {
    job_code: string;
    dp_id: number;
    job_descriptions: string;
};

export type JobCodeListResponse = {
    data: JobCode[];
};

export type JobCodeCreateResponse = {
    data: number;
};

export type JobCodeUpdateResponse = {
    data: JobCode;
};

export type JobCodeDeleteResponse = {
    message: string;
};

export type Department = {
    d_id: number;
    d_department_en: string;
};

export type DepartmentListResponse = {
    data: Department[];
};
