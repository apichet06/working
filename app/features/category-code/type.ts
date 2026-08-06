export type CategoryCode = {
    cc_id: number;
    cc_code: string;
    cc_descriptions: string;
    dp_id: number;
    dp_department: string | null;
    add_date: string;
    e_id: number;
    e_name: string | null;
};

export type CategoryCodeInput = {
    cc_code: string;
    cc_descriptions: string;
    dp_id: number;
};

export type Department = {
    d_id: number;
    d_department_en: string;
};

export type DepartmentListResponse = {
    data: Department[];
};

export type CategoryCodeListResponse = {
    data: CategoryCode[];
};

export type CategoryCodeCreateResponse = {
    data: number;
};

export type CategoryCodeUpdateResponse = {
    data: CategoryCode;
};

export type CategoryCodeDeleteResponse = {
    message: string;
};
