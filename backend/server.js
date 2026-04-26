import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import mysql from "mysql2/promise";
import { PORT, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD, DB_HOST } from "./config/index.js";
import Router from "./routes/index.js";

const server = express();

server.use(cors());
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

const pool = mysql.createPool({
    host: DB_HOST,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE 
});

async function connectWithRetry() {
    try {
        const conn = await pool.getConnection();
        console.log("Connected to DB");
        conn.release();
    } catch (err) {
        console.log("MySQL not ready, retrying in 3s...");
        setTimeout(connectWithRetry, 3000);
    }
}

connectWithRetry();

/*pool.getConnection()
    .then((conn) => {
        console.log("Connected to database");
        conn.release();
    })
    .catch((err) => console.log(err));*/

Router(server);

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
