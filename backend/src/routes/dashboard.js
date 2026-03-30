import pool from "../config/db.js"
import express from "express";
import { verificarToken } from "../middlewares/verificarToken.js";
import { can } from "../middlewares/can.js";

const router = express.Router();

router.get("/total-productos", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM producto
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

// 🔹 Productos por vencer (lista completa)
router.get("/lista-por-vencer", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.idProducto,
        p.Nombre,
        c.Nombre AS Categoria,
        p.StockActual,
        p.fechavencimiento
      FROM producto p
      INNER JOIN categoria c ON p.idCategoria = c.idCategoria
      WHERE p.fechavencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 15 DAY)
      ORDER BY p.fechavencimiento ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

//  Productos con stock bajo (lista completa)
router.get("/lista-stock-bajo", async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        p.idProducto,
        p.Nombre,
        c.Nombre AS Categoria,
        p.StockActual,
        p.StockMinimo
      FROM producto p
      INNER JOIN categoria c ON p.idCategoria = c.idCategoria
      WHERE p.StockActual < p.StockMinimo
      ORDER BY p.StockActual ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("ERROR:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;