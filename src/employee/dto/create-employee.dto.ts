export class CreateEmployeeDto {
  name: string;
  salary: number;
  currency: string;
  on_contract?: boolean;
  department: string;
  sub_department: string;
}
