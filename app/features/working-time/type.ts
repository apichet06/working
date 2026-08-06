export type empDTO = {
  e_id: number;
  e_usercode: string;
  e_fullname_th: string;
  d_id: number | null;
};

export type EmpListResponse = {
  data: empDTO[];
};

export type WorkingActionsJobList = {
  wa_id: number;
  wa_start_job: Date;
  wa_end_job: Date | null;
  wa_status: string | null;
  e_id: number;
  w_id: number;
  user_edit: number;
  edit_date: string;
  e_usercode: string;
  w_project_no: string;
  job_desc: string;
  w_desc: string;
  part_desc: string;
  cc_desc: string;
  working_date: Date;
  working_time: string;
  job_hour: number;
  labour_hour: number;
  mac_desc: string | null;
  die_desc: string | null;
  e_name: string;
};

export type HolidayApiResponseResponse = {
  data: WorkingActionsJobList[];
};

export type WorkingActionJob = {
  wa_id: number;
  wa_start_job: Date;
  wa_end_job: Date | null;
  wa_status: string | null;
  e_id: number;
  w_id: number;
  user_edit: number;
  edit_date: string;
};

export type WorkingActionJobResponse = {
  data: WorkingActionJob;
};
