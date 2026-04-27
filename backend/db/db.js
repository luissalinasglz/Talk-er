import mysql from "mysql2/promise"
import { MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, DB_HOST } from "../config/index.js";

const pool = mysql.createPool({
    host: DB_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE
});

export default pool;
