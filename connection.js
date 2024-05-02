import pkg from "pg";
import dotenv from "dotenv";

const { Pool } = pkg;
const env = dotenv.config().parsed;

const connection = new Pool({
  user: env.DB_USERNAME,
  host: env.DB_HOST,
  database: env.DB_DATABASE,
  password: env.DB_PASSWORD,
  port: env.DB_PORT,
});
export default connection;
