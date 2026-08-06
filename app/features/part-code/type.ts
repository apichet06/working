export type PartCode = {
    part_id: number;
    part_code: string;
    part_descriptions: string;
    dp_id: number;
    dp_department: string | null;
    add_date: string;
    e_id: number;
    e_name: string | null;
};

export type PartCodeInput = {
    part_code: string;
    part_descriptions: string;
    dp_id: number;
};

export type Department = {
    d_id: number;
    d_department_en: string;
};

export type DepartmentListResponse = {
    data: Department[];
};

export type PartCodeListResponse = {
    data: PartCode[];
};

export type PartCodeCreateResponse = {
    data: number;
};

export type PartCodeUpdateResponse = {
    data: PartCode;
};

export type PartCodeDeleteResponse = {
    message: string;
};
