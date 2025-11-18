import pool from "../config/db.js";

export const Producto = {
  getAll: async () => {
    const [rows] = await pool.query(`
      SELECT 
        p.idProducto,
        p.Nombre,
        p.Sku,
        p.PrecioCompra,
        p.PrecioVenta,
        p.StockActual,
        p.StockMinimo,
        p.Estado,
        p.fechavencimiento,
        p.idCategoria,
        c.Nombre AS CategoriaNombre
      FROM producto p
      LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
    `);

    return rows;
  },
};

