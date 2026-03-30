import pool from "../config/db.js";

// Listar transacciones con filtros opcionales
export const listarTransacciones = async (req, res) => {
  const {
    usuarioId,
    productoId,
    fechaDesde,
    fechaHasta,
    totalMin,
    totalMax,
  } = req.query;

  try {
    let sql = `
      SELECT 
        v.idVenta,
        v.FechaVenta,
        v.MetodoPago,
        v.Total        AS TotalVenta,
        u.Nombre       AS Usuario,
        p.Nombre       AS Producto,
        dv.Cantidad,
        dv.Subtotal    AS TotalLinea
      FROM venta v
      JOIN detalleventa dv ON dv.idVenta = v.idVenta
      JOIN producto p      ON p.idProducto = dv.idProducto
      JOIN usuario u       ON u.idUsuario = v.idUsuario
      WHERE 1 = 1
    `;

    const params = [];

    if (usuarioId) {
      sql += " AND v.idUsuario = ?";
      params.push(usuarioId);
    }

    if (productoId) {
      sql += " AND dv.idProducto = ?";
      params.push(productoId);
    }

    if (fechaDesde) {
      sql += " AND DATE(v.FechaVenta) >= ?";
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      sql += " AND DATE(v.FechaVenta) <= ?";
      params.push(fechaHasta);
    }

    if (totalMin) {
      sql += " AND v.Total >= ?";
      params.push(totalMin);
    }

    if (totalMax) {
      sql += " AND v.Total <= ?";
      params.push(totalMax);
    }

    sql += " ORDER BY v.FechaVenta DESC, v.idVenta DESC";

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("ERROR en listarTransacciones:", error);
    res.status(500).json({ error: "Error al obtener las transacciones" });
  }
};

// Resumen de ventas diarias con filtros opcionales
export const resumenVentas = async (req, res) => {
  const {
    usuarioId,
    productoId,
    fechaDesde,
    fechaHasta,
    totalMin,
    totalMax,
  } = req.query;

  try {
    let sql = `
      SELECT 
        DATE(v.FechaVenta) AS Fecha,
        SUM(v.Total)       AS TotalDia
      FROM venta v
      JOIN detalleventa dv ON dv.idVenta = v.idVenta
      JOIN producto p      ON p.idProducto = dv.idProducto
      WHERE 1 = 1
    `;

    const params = [];

    if (usuarioId) {
      sql += " AND v.idUsuario = ?";
      params.push(usuarioId);
    }

    if (productoId) {
      sql += " AND dv.idProducto = ?";
      params.push(productoId);
    }

    if (fechaDesde) {
      sql += " AND DATE(v.FechaVenta) >= ?";
      params.push(fechaDesde);
    }

    if (fechaHasta) {
      sql += " AND DATE(v.FechaVenta) <= ?";
      params.push(fechaHasta);
    }

    if (totalMin) {
      sql += " AND v.Total >= ?";
      params.push(totalMin);
    }

    if (totalMax) {
      sql += " AND v.Total <= ?";
      params.push(totalMax);
    }

    sql += `
      GROUP BY DATE(v.FechaVenta)
      ORDER BY Fecha ASC
    `;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    console.error("ERROR en resumenVentas:", error);
    res.status(500).json({ error: "Error al obtener el resumen de ventas" });
  }
};
