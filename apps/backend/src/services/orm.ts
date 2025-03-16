import { DataSourceOptions } from 'typeorm';
import { Document } from '../documents/entities/document.entity';

export const config: DataSourceOptions = {
  type: 'sqlite',
  database: '.database/sql',
  synchronize: true,
  entities: [Document],
};
