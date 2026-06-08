import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { PORT } from "./config/index.js";
import Router from "./routes/index.js";
import pool from "./db/db.js"
import { purgeExpiredTokens } from "./models/Blacklist.js";
import { connectMongo } from "./db/mongo.js"
import { webcrypto } from "crypto";
globalThis.crypto = webcrypto;

const server = express();

server.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
}));
server.disable("x-powered-by");
server.use(cookieParser());
server.use(express.urlencoded({ extended: false }));
server.use(express.json());

async function runSeed() {
    try {
        const { seed } = await import("./db/seed.js");
        await seed();
    } catch (err) {
        console.error("Seed error:", err.message);
    }
}

async function connectWithRetry() {
    try {
        const conn = await pool.getConnection();
        console.log("Connected to DB ✓");
        conn.release();
        await runSeed();
    } catch (err) {
        console.log("MySQL not ready, retrying in 3s...");
        setTimeout(connectWithRetry, 3000);
    }
}

connectWithRetry();
await connectMongo();
Router(server);

server.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);
