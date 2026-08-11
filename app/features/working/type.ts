export type WorkingMaster = {
  w_id: number;
  e_usercode: string;
  job_code: string;
  job_id: number;
  cc_id: number;
  part_id: number;
  mac_id: number | null;
  cc_code: string;
  part_code: string;
  w_desc: string;
  w_project_no: string;
  e_id: number;
  w_date: string;
  wa_id: number | null;
  wa_start_job: string | null;
  wa_end_job: string | null;
  wa_status: string | null;
  cc_descriptions: string;
  job_descriptions: string;
  part_descriptions: string;
  mac_code: string | null;
  mac_descriptions: string | null;
  die_descriptions: string | null;
  end_job: number;
};

export type WorkingMasterInput = {
  job_code: string;
  job_id: number;
  cc_id: number;
  part_id: number;
  mac_id: number | null;
  cc_code: string;
  part_code: string;
  w_desc: string;
  w_project_no: string;
};

export type WorkingMasterListResponse = {
  data: WorkingMaster[];
};

export type WorkingMasterCreateResponse = {
  data: number;
};

export type WorkingMasterUpdateResponse = {
  data: WorkingMaster;
};

export type WorkingMasterDeleteResponse = {
  message: string;
};

export type WorkingActionStartResponse = {
  data: number;
};

// หนึ่งแถว = หนึ่งรอบเริ่ม/ปิดงานจริงจาก WorkingActionJob (ไม่ใช่แค่รอบล่าสุดของแต่ละงานแบบ WorkingMaster)
export type WorkingActionCalendarItem = {
  wa_id: number;
  wa_start_job: string;
  wa_end_job: string | null;
  wa_status: string | null;
  w_id: number;
  job_code: string;
  w_desc: string;
  w_project_no: string;
  cc_code: string;
  part_code: string;
  cc_descriptions: string;
  job_descriptions: string;
  part_descriptions: string;
  die_descriptions: string;
};

export type WorkingActionCalendarListResponse = {
  data: WorkingActionCalendarItem[];
};

export type Holiday = {
  h_id: number;
  h_name: string;
  h_start_date: string;
  h_end_date: string;
  h_holiday_status: string;
  h_hr_name: string;
  h_hr_datetime: string;
  e_id: number;
};

export type HolidayApiResponse = {
  status: string;
  data: Holiday[];
};
