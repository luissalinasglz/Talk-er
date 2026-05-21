import { findUserById } from "../models/User.js";
import { isTokenBlacklisted } from "../models/Blacklist.js";
import jwt from "jsonwebtoken";
import { SECRET_ACCESS_TOKEN } from "../config/index.js";

export async function Verify(req, res, next) { 
    try {
        const authHeader = req.headers["cookie"];
        
        if (!authHeader) return res.sendStatus(401);
        const cookie = authHeader.split("=")[1];

        const blacklisted = await isTokenBlacklisted(cookie);
        if (blacklisted) {
            return res.status(401).json({ message: "Esta sesion ha expirado. Por favor, inicia sesion de nuevo" });
        }

        jwt.verify(cookie, SECRET_ACCESS_TOKEN, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: "Esta sesion ha expirado. Por favor, inicia sesion de nuevo" });
            }
            
            const { id } = decoded;
            const user = await findUserById(id);
            req.user = user;
            next();
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

export async function VerifyRoleAdmin(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        
        if (role !== "admin") {
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page.",
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

export async function VerifyRoleSupervisor(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        
        if (role !== "supervisor") {
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page.",
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

export async function VerifyRoleTeacher(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        
        if (role !== "teacher") {
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page.",
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}

export async function VerifyRoleStudent(req, res, next) {
    try {
        const user = req.user;
        const { role } = user;
        
        if (role !== "student") {
            return res.status(401).json({
                status: "failed",
                message: "You are not authorized to view this page.",
            });
        }
        next();
    } catch (err) {
        res.status(500).json({
            status: "error",
            code: 500,
            data: [],
            message: "Internal Server Error",
        });
    }
}
