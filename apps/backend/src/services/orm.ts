import { DataSourceOptions } from 'typeorm';
import { Document } from '../documents/entities/document.entity';
import { join } from 'path';

export const config: DataSourceOptions = {
  type: 'sqlite',
  database: '.database/sql',
  synchronize: process.env.NODE_ENV !== 'production',
  entities: [Document],
  migrations: [join(__dirname, '../migrations/**/*{.ts,.js}')],
  migrationsRun: process.env.NODE_ENV === 'production',
  logging: process.env.NODE_ENV !== 'production',
};
