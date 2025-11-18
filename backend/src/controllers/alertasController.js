import pool from "../config/db.js";

export const getAlertasPendientes = async (req, res) => {
  const [rows] = await pool.query(`
    SELECT a.*, p.Nombre, l.FechaVencimiento
    FROM alertavencimiento a
    INNER JOIN lote l ON a.idLote = l.idLote
    INNER JOIN producto p ON l.idProducto = p.idProducto
    WHERE a.estado = 'Pendiente'
  `);
  res.json(rows);
};

export const marcarAtendida = async (req, res) => {
  const { id } = req.params;
  await pool.query("UPDATE alertavencimiento SET estado='Atendida' WHERE idAlerta=?", [id]);
  res.json({ mensaje: "Alerta marcada como atendida" });
};
