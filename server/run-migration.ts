import { DataSource } from 'typeorm';
import { AddGradeCodeColumn1757891157000 } from './src/migrations/1757891157000-AddGradeCodeColumn';
import { AddMissingStudentColumns1757891158000 } from './src/migrations/1757891158000-AddMissingStudentColumns';
import { AddGraduationYearColumn1757891159000 } from './src/migrations/1757891159000-AddGraduationYearColumn';
import { CreateStaffTable1758309830629 } from './src/migrations/1758309830629-CreateStaffTable';

async function runMigration() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5433'),
    username: process.env.DB_ADMIN_USERNAME || 'academia_user',
    password: process.env.DB_ADMIN_PASSWORD || 'academia_password',
    database: process.env.DB_NAME || 'academia_pro',
    entities: [],
    migrations: [],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log('Database connection established');

    // Run first migration
    console.log('Running AddGradeCodeColumn migration...');
    const migration1 = new AddGradeCodeColumn1757891157000();
    await migration1.up(dataSource.createQueryRunner());
    console.log('AddGradeCodeColumn migration completed successfully');

    // Run second migration
    console.log('Running AddMissingStudentColumns migration...');
    const migration2 = new AddMissingStudentColumns1757891158000();
    await migration2.up(dataSource.createQueryRunner());
    console.log('AddMissingStudentColumns migration completed successfully');

    // Run third migration
    console.log('Running AddGraduationYearColumn migration...');
    const migration3 = new AddGraduationYearColumn1757891159000();
    await migration3.up(dataSource.createQueryRunner());
    console.log('AddGraduationYearColumn migration completed successfully');

    // Run fourth migration
    console.log('Running CreateStaffTable migration...');
    const migration4 = new CreateStaffTable1758309830629();
    await migration4.up(dataSource.createQueryRunner());
    console.log('CreateStaffTable migration completed successfully');

    await dataSource.destroy();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();