export type DetailMaster = {
  detail_id: number;
  dp_id: number;
  dp_department: string | null;
  detail_descriptions: string;
  add_date: string;
  e_id: number;
  e_name: string | null;
};

export type DetailMasterInput = {
  dp_id: number;
  detail_descriptions: string;
};

export type DetailMasterResponse = {
  data: DetailMaster[];
};

export type Department = {
  d_id: number;
  d_department_en: string;
};

export type DepartmentListResponse = {
  data: Department[];
};

export type DetailMasterCreateResponse = {
  data: number;
};

export type DetailMasterUpdateResponse = {
  data: DetailMaster;
};

export type DetailMasterDeleteResponse = {
  message: string;
};
