import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config/index.js";
import Router from "./routes/index.js";
import pool from "./db/db.js"
import { purgeExpiredTokens } from "./models/Blacklist.js";

const server = express();

server.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());
server.use("/uploads", express.static("uploads"));

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
Router(server);

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
