export type PartCode = {
    part_id: number;
    part_code: string;
    part_descriptions: string;
};

export type PartCodeInput = {
    part_code: string;
    part_descriptions: string;
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
