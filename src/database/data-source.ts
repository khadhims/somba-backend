import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

const isCompiled = __filename.endsWith('.js');
const baseDir = join(__dirname, '..');
const extension = isCompiled ? 'js' : 'ts';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [`${baseDir}/**/*.entity.${extension}`],
  migrations: [`${baseDir}/migrations/*.${extension}`],
  synchronize: false,
});
