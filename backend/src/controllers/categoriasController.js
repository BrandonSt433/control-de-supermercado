import pool from "../config/db.js";

export const getCategorias = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT idCategoria, Nombre
      FROM categoria
      ORDER BY Nombre ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("ERROR en getCategorias:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};
