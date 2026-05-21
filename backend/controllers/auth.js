import { findUserByUsername, generateAccessJWT } from "../models/User.js";
import jwt from "jsonwebtoken";
import { blacklistToken } from "../models/Blacklist.js";
import bcrypt from "bcrypt";

export async function Login(req, res) {
    const { username } = req.body;
    try {
        const user = await findUserByUsername(username);
        if(!user)
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Nombre de usuario invalido"
            });

        const isPasswordValid = req.body.password == user.password_hash;
        
        if (!isPasswordValid)
            return res.status(401).json({
                status: "failed",
                data: [],
                message: "Contraseña incorrecta"
            });
        
        let options = {
            maxAge: 20 * 60 * 1000,
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };
        
        const token = generateAccessJWT(user);
        const { password_hash, ...user_data } = user;

        res.cookie("SessionID", token, options);
        res.status(200).json({
            status: "success",
            data: [user_data],
            message: "You have successfully logged in.",
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Error interno del servidor",
        });
    }
    res.end();
}

export async function Logout(req, res) {
    try {
        const authHeader = req.headers["cookie"];
        if (!authHeader) return res.sendStatus(401);

        const cookie = authHeader.split("=")[1];

        const decoded = jwt.decode(cookie);
        if (decoded?.exp) {
            const expiresAt = new Date(decoded.exp * 1000);
            await blacklistToken(cookie, expiresAt);
        }

        res.clearCookie("SessionID", {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        });

        res.status(200).json({ status: "success", message: "Se ha cerrado sesion de manera exitosa" });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}
