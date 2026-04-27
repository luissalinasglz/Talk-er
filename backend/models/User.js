import pool from "../db/db.js";
import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from "../config/index.js";

export async function createUser(user) {
    const { name, last_name, username, password, role, period } = user;

    const [result] = await pool.query(
        `INSERT INTO users (name, last_name, username, password_hash, role, period)
        VALUES (?, ?, ?, ?, ?, ?)`,
        [name, last_name, username, password, role, period]
    );

    return result[0];
}

export async function findUserByUsername(username) {
    const [result] = await pool.query(
        "SELECT * FROM users WHERE username = ?",
        [username]
    );
    
    return result[0];
}

export async function findUserById(id) {
    const [result] = await pool.query(
        "SELECT name, last_name, username, role, period FROM users WHERE id = ?",
        [id]
    );
    
    return result[0];
}

export function generateAccessJWT(user) {
    const payload = {
        id: user.id,
    };
    
    return jwt.sign(payload, SECRET_ACCESS_TOKEN, {
        expiresIn: '20m',
    });
};
