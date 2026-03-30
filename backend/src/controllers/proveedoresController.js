import pool from "../config/db.js";

// Obtener todos los proveedores
export const getProveedores = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT idProveedor, Nombre, Contacto, Telefono, Email, Direccion
      FROM proveedor
      ORDER BY Nombre ASC
    `);
    res.json(rows);
  } catch (error) {
    console.error("ERROR en getProveedores:", error);
    res.status(500).json({ error: "Error al obtener proveedores" });
  }
};

// Crear un nuevo proveedor
export const crearProveedor = async (req, res) => {
  try {
    const { Nombre, Contacto, Telefono, Email, Direccion } = req.body;

    if (!Nombre?.trim()) {
      return res.status(400).json({ error: "El nombre del proveedor es obligatorio." });
    }

    const [result] = await pool.query(
      `
        INSERT INTO proveedor (Nombre, Contacto, Telefono, Email, Direccion)
        VALUES (?, ?, ?, ?, ?)
      `,
      [
        Nombre.trim(),
        Contacto?.trim() || null,
        Telefono?.trim() || null,
        Email?.trim() || null,
        Direccion?.trim() || null,
      ]
    );

    res.status(201).json({ message: "Proveedor creado", id: result.insertId });
  } catch (error) {
    console.error("ERROR en crearProveedor:", error);
    res.status(500).json({ error: "Error al crear proveedor" });
  }
};

export const actualizarProveedor = async (req, res) => {
  try {
    const { id } = req.params;
    const { Nombre, Contacto, Telefono, Email, Direccion } = req.body;

    if (!Nombre?.trim()) {
      return res.status(400).json({ error: "El nombre del proveedor es obligatorio." });
    }

    const [result] = await pool.query(
      `
        UPDATE proveedor
        SET Nombre = ?, Contacto = ?, Telefono = ?, Email = ?, Direccion = ?
        WHERE idProveedor = ?
      `,
      [
        Nombre.trim(),
        Contacto?.trim() || null,
        Telefono?.trim() || null,
        Email?.trim() || null,
        Direccion?.trim() || null,
        Number(id),
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Proveedor no encontrado." });
    }

    res.json({ message: "Proveedor actualizado" });
  } catch (error) {
    console.error("ERROR en actualizarProveedor:", error);
    res.status(500).json({ error: "Error al actualizar proveedor" });
  }
};

export const eliminarProveedor = async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(`DELETE FROM proveedor WHERE idProveedor = ?`, [Number(id)]);

    res.json({ message: "Proveedor eliminado" });
  } catch (error) {
    // Si está referenciado por producto/lote, MySQL lanza error de FK
    if (error?.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        error: "No se puede eliminar: este proveedor está asociado a productos o lotes.",
      });
    }

    console.error("ERROR en eliminarProveedor:", error);
    res.status(500).json({ error: "Error al eliminar proveedor" });
  }
};
