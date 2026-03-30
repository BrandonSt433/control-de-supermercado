import pool from "../config/db.js";
import { Producto } from "../models/Producto.js";

// Actualiza automáticamente el estado de los productos según las reglas definidas
const actualizarEstadosAutomaticos = async () => {
  await pool.query(`
    UPDATE producto
    SET Estado = 'Inactivo'
    WHERE (
      StockActual <= 0
      OR (fechavencimiento IS NOT NULL AND fechavencimiento < CURDATE())
    )
    AND Estado <> 'Inactivo'
  `);
};
// Recalcula y actualiza la fecha de vencimiento mínima del producto basado en sus lotes activos
const recalcularFechaVencimientoProducto = async (connection, idProducto) => {
  const [[row]] = await connection.query(
    `
      SELECT MIN(FechaVencimiento) AS minFecha
      FROM lote
      WHERE idProducto = ?
        AND CantidadActual > 0
        AND FechaVencimiento IS NOT NULL
        AND FechaVencimiento >= CURDATE()
    `,
    [idProducto]
  );

  await connection.query(
    `UPDATE producto SET fechavencimiento = ? WHERE idProducto = ?`,
    [row?.minFecha ?? null, idProducto]
  );
};

// Obtener todos los productos
export const getProductos = async (req, res) => {
  try {
    await actualizarEstadosAutomaticos();

    const [rows] = await pool.query(`
      SELECT
        p.idProducto,
        p.idCategoria,
        p.idProveedor,
        p.Nombre,
        c.Nombre AS Categoria,
        p.Sku,
        p.PrecioCompra,
        p.PrecioVenta,
        p.StockActual,
        p.StockMinimo,
        p.fechavencimiento,
        p.Estado
      FROM producto p
      LEFT JOIN categoria c ON p.idCategoria = c.idCategoria
      ORDER BY 
        (p.Estado = 'Inactivo') ASC,
        p.Nombre ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("ERROR en getProductos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};
// Obtener productos con lotes vencidos
export const getProductosVencidos = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT
        l.idLote,
        p.idProducto,
        p.Nombre,
        c.Nombre AS Categoria,
        l.Codigo AS CodigoLote,
        l.FechaIngreso,
        l.FechaVencimiento,
        l.CantidadActual,
        pr.Nombre AS Proveedor,
        DATEDIFF(CURDATE(), l.FechaVencimiento) AS DiasVencido
      FROM lote l
      INNER JOIN producto p ON p.idProducto = l.idProducto
      LEFT JOIN categoria c ON c.idCategoria = p.idCategoria
      LEFT JOIN proveedor pr ON pr.idProveedor = l.idProveedor
      WHERE l.CantidadActual > 0
        AND l.FechaVencimiento IS NOT NULL
        AND l.FechaVencimiento < CURDATE()
      ORDER BY l.FechaVencimiento ASC, l.FechaIngreso ASC
    `);

    res.json(rows);
  } catch (error) {
    console.error("ERROR en getProductosVencidos (lote):", error);
    res.status(500).json({ error: "Error al obtener lotes vencidos" });
  }
};

export const getProductosPorVencer = async (req, res) => {
  try {
    const DIAS_ALERTA = 30;

    const [rows] = await pool.query(
      `
      SELECT 
        l.idLote,
        p.idProducto,
        p.Nombre,
        c.Nombre AS Categoria,
        l.Codigo AS CodigoLote,
        l.FechaIngreso,
        l.FechaVencimiento,
        l.CantidadActual,
        pr.Nombre AS Proveedor,
        DATEDIFF(l.FechaVencimiento, CURDATE()) AS DiasRestantes
      FROM lote l
      INNER JOIN producto p ON p.idProducto = l.idProducto
      LEFT JOIN categoria c ON c.idCategoria = p.idCategoria
      LEFT JOIN proveedor pr ON pr.idProveedor = l.idProveedor
      WHERE l.CantidadActual > 0
        AND l.FechaVencimiento IS NOT NULL
        AND l.FechaVencimiento >= CURDATE()
        AND l.FechaVencimiento <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      ORDER BY l.FechaVencimiento ASC, l.FechaIngreso ASC
      `,
      [DIAS_ALERTA]
    );

    res.json(rows);
  } catch (error) {
    console.error("ERROR en getProductosPorVencer (lote):", error);
    res.status(500).json({ error: "Error al obtener lotes por vencer" });
  }
};

/*Crear PRODUCTO BASE con Campos: Nombre, SKU, Categoría, StockMinimo*/
export const crearProductoBase = async (req, res) => {
  try {
    const { Nombre, Sku, idCategoria, StockMinimo } = req.body;

    if (!Nombre?.trim()) return res.status(400).json({ error: "El nombre es obligatorio." });
    if (!Sku?.trim()) return res.status(400).json({ error: "El SKU es obligatorio." });
    if (!idCategoria) return res.status(400).json({ error: "Debes seleccionar una categoría." });

    // Validar SKU único
    const [dup] = await pool.query(
      `SELECT idProducto FROM producto WHERE Sku = ? LIMIT 1`,
      [Sku.trim()]
    );
    if (dup.length > 0) return res.status(409).json({ error: "El SKU ya existe. Usa otro." });

    const idNuevo = await Producto.createBase({
      Nombre: Nombre.trim(),
      Sku: Sku.trim(),
      idCategoria: Number(idCategoria),
      StockMinimo: Number(StockMinimo ?? 0),
    });

    await actualizarEstadosAutomaticos();

    res.status(201).json({ message: "Producto base creado", id: idNuevo });
  } catch (error) {
    console.error("ERROR en crearProductoBase:", error);
    res.status(500).json({ error: "Error al crear producto base" });
  }
};

/* Ingresar/Recepcionar producto, Inserta lote con idProveedor y suma stock al producto.*/
export const ingresarProducto = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      idProducto,
      PrecioCompra,
      PrecioVenta,
      StockActual,
      codigoLote,
      fechavencimiento,
      idProveedor,
      Estado,
    } = req.body;

    const pid = Number(idProducto);
    const pc = Number(PrecioCompra);
    const pv = Number(PrecioVenta);
    const qty = Number(StockActual);
    const prov = Number(idProveedor);

    if (!pid) return res.status(400).json({ error: "Debes seleccionar un producto." });
    if (!prov) return res.status(400).json({ error: "Debes seleccionar un proveedor." });

    if (Number.isNaN(pc) || Number.isNaN(pv)) return res.status(400).json({ error: "Precios inválidos." });
    if (pc < 0 || pv < 0) return res.status(400).json({ error: "Los precios no pueden ser negativos." });
    if (pv < pc) return res.status(400).json({ error: "El precio de venta no puede ser menor al de compra." });

    if (Number.isNaN(qty) || qty <= 0) return res.status(400).json({ error: "La cantidad recibida debe ser mayor a 0." });
    if (!fechavencimiento) return res.status(400).json({ error: "Debes ingresar fecha de vencimiento." });

    const codigoFinal = codigoLote?.trim() || `LOTE-${Date.now()}`;
    const estadoFinal = Estado === "Inactivo" ? "Inactivo" : "Activo";

    await connection.beginTransaction();

    // Validar que exista producto
    const [[prod]] = await connection.query(
      `SELECT idProducto FROM producto WHERE idProducto = ?`,
      [pid]
    );
    if (!prod) {
      await connection.rollback();
      return res.status(404).json({ error: "Producto no encontrado." });
    }

    // Validar que exista proveedor
    const [[provRow]] = await connection.query(
      `SELECT idProveedor FROM proveedor WHERE idProveedor = ?`,
      [prov]
    );
    if (!provRow) {
      await connection.rollback();
      return res.status(404).json({ error: "Proveedor no encontrado." });
    }

    // Insertar lote con idProveedor
    await connection.query(
      `
        INSERT INTO lote
          (idProducto, idProveedor, Codigo, FechaIngreso, FechaVencimiento, CantidadInicial, CantidadActual)
        VALUES
          (?, ?, ?, NOW(), ?, ?, ?)
      `,
      [pid, prov, codigoFinal, fechavencimiento, qty, qty]
    );

    // Actualizar producto (suma stock + actualiza precios + proveedor actual)
    await connection.query(
      `
        UPDATE producto
        SET
          StockActual = StockActual + ?,
          PrecioCompra = ?,
          PrecioVenta = ?,
          idProveedor = ?,
          Estado = ?
        WHERE idProducto = ?
      `,
      [qty, pc, pv, prov, estadoFinal, pid]
    );

    // Ajustar fechavencimiento del producto
    await recalcularFechaVencimientoProducto(connection, pid);

    await connection.commit();

    await actualizarEstadosAutomaticos();

    res.json({ message: "Ingreso registrado correctamente" });
  } catch (error) {
    try {
      await connection.rollback();
    } catch {}
    console.error("ERROR en ingresarProducto:", error);
    res.status(500).json({ error: "Error al registrar el ingreso" });
  } finally {
    connection.release();
  }
};

export const actualizarProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = { ...req.body };

    if (datos.PrecioCompra !== undefined || datos.PrecioVenta !== undefined) {
      const pc = Number(datos.PrecioCompra);
      const pv = Number(datos.PrecioVenta);

      if (Number.isNaN(pc) || Number.isNaN(pv)) return res.status(400).json({ error: "Los precios deben ser numéricos." });
      if (pc < 0 || pv < 0) return res.status(400).json({ error: "Los precios no pueden ser negativos." });
      if (pv < pc) return res.status(400).json({ error: "El precio de venta no puede ser menor al de compra." });

      datos.PrecioCompra = pc;
      datos.PrecioVenta = pv;
    }

    // SKU único si lo cambian
    if (datos.Sku?.trim()) {
      const [dup] = await pool.query(
        `SELECT idProducto FROM producto WHERE Sku = ? AND idProducto <> ? LIMIT 1`,
        [datos.Sku.trim(), Number(id)]
      );
      if (dup.length > 0) return res.status(409).json({ error: "El SKU ya existe. Usa otro." });
      datos.Sku = datos.Sku.trim();
    }

    const affected = await Producto.update(id, datos);
    if (affected === 0) return res.status(404).json({ message: "Producto no encontrado" });

    await actualizarEstadosAutomaticos();

    res.json({ message: "Producto actualizado correctamente" });
  } catch (error) {
    console.error("ERROR en actualizarProducto:", error);
    res.status(500).json({ error: "Error al actualizar el producto" });
  }
};

export const eliminarProducto = async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query(
      `
        UPDATE producto
        SET Estado = CASE
          WHEN Estado = 'Activo' THEN 'Inactivo'
          WHEN Estado = 'Inactivo' THEN 'Activo'
          ELSE Estado
        END
        WHERE idProducto = ?
      `,
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Producto no encontrado" });
    }

    res.json({ message: "Estado actualizado correctamente" });
  } catch (error) {
    console.error("ERROR en eliminarProducto:", error);
    res.status(500).json({ message: "Error al cambiar estado del producto" });
  }
};
