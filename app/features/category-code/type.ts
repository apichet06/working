export type CategoryCode = {
    cc_id: number;
    cc_code: string;
    cc_descriptions: string;
};

export type CategoryCodeInput = {
    cc_code: string;
    cc_descriptions: string;
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
