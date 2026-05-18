import pool from "../db/db.js";

export async function blacklistToken(token, expiresAt) {
    await pool.query(
        "INSERT INTO blacklist (token, expires_at) VALUES (?, ?)",
        [token, expiresAt]
    );
}

export async function isTokenBlacklisted(token) {
    const [rows] = await pool.query(
        "SELECT id FROM blacklist WHERE token = ? AND expires_at > NOW()",
        [token]
    );
    return rows.length > 0;
}

export async function purgeExpiredTokens() {
    await pool.query("DELETE FROM blacklist WHERE expires_at <= NOW()");
}
