import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { EmployeeModule } from './../src/employee/employee.module';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { Employee } from './../src/employee/entities/employee.entity';
import { Repository } from 'typeorm';
import * as employeeDataset from './__fixtures__/dataset.json';

describe('EmployeeController (e2e)', () => {
  let app: INestApplication;
  let employeeRepository: Repository<Employee>;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [Employee],
          synchronize: true, // do not set it true in production application
          dropSchema: true, // do not set it true in production application
        }),
        EmployeeModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    employeeRepository = moduleFixture.get(getRepositoryToken(Employee));
  });

  beforeEach(async () => {
    // seed employee table with some data
    employeeRepository.save(
      employeeDataset.map((data) => ({
        ...data,
        salary: parseInt(data.salary),
        on_contract: data.on_contract === 'true',
      })),
    );
  });

  it('should receive POST /employee and create a database entry', (done) => {
    const body = {
      name: 'Mainak',
      salary: 250000,
      currency: 'USD',
      department: 'Engineering',
      sub_department: 'Platform',
    };
    request(app.getHttpServer())
      .post('/employee')
      .send(body)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          throw err;
        }
        // verify that the response status code is correct
        expect(res.status).toBe(201);
        expect(res.body).toMatchObject(body);
        expect(res.body).toHaveProperty('id');

        // verify that the entity was created in the database
        expect(
          employeeRepository.findOneBy({ id: res.body.id }),
        ).resolves.toMatchObject(body);
        done();
      });
  });

  it('should receive DELETE /employee/:id and delete an existing database entry', async (done) => {
    const id = await employeeRepository
      .find({ take: 1 })
      .then((employees) => employees[0].id);
    request(app.getHttpServer())
      .delete('/employee/' + id)
      .set('Accept', 'application/text')
      .set('Content-Type', 'application/json')
      .end((err, res) => {
        if (err) {
          throw err;
        }
        // verify that the response status code is correct
        expect(res.status).toBe(204);
        expect(res.body).toEqual({});

        // verify that the entity was removed from the database
        expect(employeeRepository.findOneBy({ id })).toBeNull();
        done();
      });
  });

  it('should receive DELETE /employee/:id and throw NotFound exception for non existing entry', async (done) => {
    let id = await employeeRepository
      .createQueryBuilder()
      .select('MAX(id)')
      .getRawOne()
      .then((employee) => employee.id);

    if (id === null) {
      id = 1;
    } else {
      id += 1;
    }

    request(app.getHttpServer())
      .delete('/employee/' + id)
      .set('Accept', 'application/text')
      .end((err, res) => {
        if (err) {
          throw err;
        }
        // verify that the response status code is correct
        expect(res.status).toBe(404);
        expect(res.body).toBeNull();

        // verify that the entity was removed from the database
        expect(employeeRepository.findOneBy({ id })).resolves.toBeNull();
        done();
      });
  });

  afterAll(async () => {
    await app.close();
  });
});
