import express from "express";
import pool from "../config/db.js";

const router = express.Router();

//Total de los productos
router.get("/total-productos", async (req, res) =>{
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total FROM producto
        `);
        res.json(rows[0]);
    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

router.get("/stock-bajo", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total 
            FROM producto 
            WHERE StockActual < StockMinimo
        `);
        res.json(rows[0]);
    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});
// Productos por vencer en 7 días
router.get("/por-vencer", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM producto
            WHERE fechavencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
        `);
        res.json(rows[0]);
    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});


// Productos vencidos
router.get("/vencidos", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT COUNT(*) AS total
            FROM producto
            WHERE fechavencimiento < CURDATE()
        `);
        res.json(rows[0]);
    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

// Lista de productos por vencer pronto
router.get("/lista-por-vencer", async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT idProducto, Nombre, StockActual, fechavencimiento
            FROM producto
            WHERE fechavencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY)
            ORDER BY fechavencimiento ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error("ERROR:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;