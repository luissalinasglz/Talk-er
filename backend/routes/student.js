import express from "express";
import pool from "../db/db.js";

const router = express.Router();

router.get("/sesiones", async (req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM sessions`);
        console.log("\n---Sesiones--");
        console.log(rows);
        
        res.json(rows);
    } catch(error) {
        console.log("Error al consultar: ", error);
        res.status(500).json({ message: "Error al consultar las sesiones"});
    }
});

router.get("/horarios", async ( req, res) => {
    try {
        const [rows] = await pool.query(`SELECT * FROM horarios`);

        console.log("\n---Horarios---");
        console.log(rows);

        res.json(rows);
    } catch(error){
        console.log("Error en los horarios: ", error);
        res.statutus(500).json({ message: "Error el consultar los horarios"});
    }
})

export default router;