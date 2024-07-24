import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('employees')
export class Employee {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column()
  salary: number;

  @Column()
  currency: string;

  @Column({
    type: 'boolean',
    default: false,
  })
  on_contract?: boolean;

  @Column()
  department: string;

  @Column()
  sub_department: string;
}
