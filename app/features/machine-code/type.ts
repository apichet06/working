export type MachineCode = {
    mac_id: number;
    mac_code: string;
    dp_id: number;
    mac_descriptions: string;
    dp_department: string | null;
    add_date: string;
    e_name: string | null;
};

export type MachineCodeInput = {
    mac_code: string;
    dp_id: number;
    mac_descriptions: string;
};

export type MachineCodeListResponse = {
    data: MachineCode[];
};

export type MachineCodeCreateResponse = {
    data: number;
};

export type MachineCodeUpdateResponse = {
    data: MachineCode;
};

export type MachineCodeDeleteResponse = {
    message: string;
};

export type Department = {
    d_id: number;
    d_department_en: string;
};

export type DepartmentListResponse = {
    data: Department[];
};
