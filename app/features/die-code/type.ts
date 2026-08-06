export type DieCode = {
    die_id: number;
    die_code: string;
    dp_id: number;
    die_descriptions: string;
    dp_department: string | null;
    add_date: string;
    e_name: string | null;
};

export type DieCodeInput = {
    die_code: string;
    dp_id: number;
    die_descriptions: string;
};

export type DieCodeListResponse = {
    data: DieCode[];
};

export type DieCodeCreateResponse = {
    data: number;
};

export type DieCodeUpdateResponse = {
    data: DieCode;
};

export type DieCodeDeleteResponse = {
    message: string;
};

export type Department = {
    d_id: number;
    d_department_en: string;
};

export type DepartmentListResponse = {
    data: Department[];
};
