import pool from "../config/db.js";

export const Producto = {
  getAll: async () => {
    const [rows] = await pool.query("SELECT * FROM producto");
    return rows;
  },

  // ✅ Crear producto BASE (catálogo)
  createBase: async ({ Nombre, Sku, idCategoria, StockMinimo }) => {
    const [result] = await pool.query(
      `
        INSERT INTO producto
          (idCategoria, idProveedor, Nombre, Sku, PrecioCompra, PrecioVenta, StockActual, StockMinimo, Estado, fechavencimiento)
        VALUES
          (?, NULL, ?, ?, 0, 0, 0, ?, 'Inactivo', NULL)
      `,
      [idCategoria, Nombre, Sku, StockMinimo]
    );

    return result.insertId;
  },

  // ✅ Update dinámico (solo campos enviados)
  update: async (id, datos) => {
    const allowed = [
      "idCategoria",
      "idProveedor",
      "Nombre",
      "Sku",
      "PrecioCompra",
      "PrecioVenta",
      "StockActual",
      "StockMinimo",
      "Estado",
      "fechavencimiento",
    ];

    const setParts = [];
    const values = [];

    for (const key of allowed) {
      if (datos[key] !== undefined) {
        setParts.push(`${key} = ?`);
        values.push(datos[key]);
      }
    }

    if (setParts.length === 0) return 0;

    values.push(id);

    const [result] = await pool.query(
      `UPDATE producto SET ${setParts.join(", ")} WHERE idProducto = ?`,
      values
    );

    return result.affectedRows;
  },

  obtenerPorVencer: async () => {
    const [rows] = await pool.query(`
      SELECT * FROM producto 
      WHERE fechavencimiento IS NOT NULL
        AND fechavencimiento BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 7 DAY)
    `);
    return rows;
  },

  obtenerVencidos: async () => {
    const [rows] = await pool.query(`
      SELECT * FROM producto
      WHERE fechavencimiento IS NOT NULL
        AND fechavencimiento < CURDATE()
    `);
    return rows;
  },

  obtenerStockCero: async () => {
    const [rows] = await pool.query(`
      SELECT * FROM producto
      WHERE StockActual = 0
    `);
    return rows;
  },

  obtenerStockCritico: async () => {
    const [rows] = await pool.query(`
      SELECT * FROM producto
      WHERE Estado = 'Activo'
        AND StockMinimo IS NOT NULL
        AND StockActual > 0
        AND StockActual <= StockMinimo
    `);
    return rows;
  },

  obtenerStockBajoOSinStock: async () => {
    const [rows] = await pool.query(`
      SELECT * FROM producto
      WHERE StockActual = 0
         OR (
            Estado = 'Activo'
            AND StockMinimo IS NOT NULL
            AND StockActual > 0
            AND StockActual <= StockMinimo
         )
    `);
    return rows;
  },
};
