export type Employee = {
    er_id: number;
    r_id: number;
    w_id: number;
    e_id: number;
    er_datetime: string;
    w_name: string;
    e_fullname: string;
    e_usercode: string;
    r_role: string;
    d_department: string;
    d_department_en: string;
    p_position: string;
    p_position_th: string;
    e_image: string;
    e_email: string;
    p_id: number;

}

export type LoginData = {
    usercode: string;
    password: string;
}


export type EmployeeApiResponse = {
    status: string;
    message: string;
    data: Employee;
    token: string;
};