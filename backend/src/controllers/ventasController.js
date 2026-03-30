import pool from "../config/db.js";

export const crearVenta = async (req, res) => {
  const { idUsuario, metodoPago, items } = req.body; 

  if (!idUsuario || !metodoPago || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Datos de venta incompletos" });
  }

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    const total = items.reduce((sum, it) => sum + it.cantidad * it.precioUnitario, 0);

    const [ventaResult] = await conn.query(
      `INSERT INTO venta (FechaVenta, idUsuario, Total, MetodoPago) VALUES (NOW(), ?, ?, ?)`,
      [idUsuario, total, metodoPago]
    );
    const idVenta = ventaResult.insertId;

    for (const item of items) {
      let cantidadPendiente = item.cantidad;

      const [rowsProd] = await conn.query(
        "SELECT StockActual, Nombre FROM producto WHERE idProducto = ? FOR UPDATE",
        [item.idProducto]
      );

      if (rowsProd.length === 0) {
        throw new Error(`Producto ID ${item.idProducto} no existe`);
      }

      const stockGlobal = rowsProd[0].StockActual;
      const nombreProd = rowsProd[0].Nombre;

      if (cantidadPendiente > stockGlobal) {
        throw new Error(`Stock insuficiente de "${nombreProd}". Solicitado: ${cantidadPendiente}, Disponible: ${stockGlobal}`);
      }

      const [lotes] = await conn.query(
        `SELECT idLote, CantidadActual, FechaVencimiento 
         FROM lote 
         WHERE idProducto = ? AND CantidadActual > 0 
         ORDER BY FechaVencimiento ASC 
         FOR UPDATE`, 
        [item.idProducto]
      );

      for (const lote of lotes) {
        if (cantidadPendiente === 0) break;

        let cantidadASacar = 0;

        if (lote.CantidadActual >= cantidadPendiente) {
          cantidadASacar = cantidadPendiente;
        } else {
          cantidadASacar = lote.CantidadActual;
        }

        const subtotalLinea = cantidadASacar * item.precioUnitario;
        await conn.query(
          `INSERT INTO detalleventa (idVenta, idProducto, idLote, Cantidad, PrecioUnitario, Subtotal)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [idVenta, item.idProducto, lote.idLote, cantidadASacar, item.precioUnitario, subtotalLinea]
        );

        await conn.query(
          "UPDATE lote SET CantidadActual = CantidadActual - ? WHERE idLote = ?",
          [cantidadASacar, lote.idLote]
        );

        cantidadPendiente -= cantidadASacar;
      }

      if (cantidadPendiente > 0) {
        throw new Error(`Error de integridad: El stock global dice que hay, pero los lotes no alcanzan para "${nombreProd}".`);
      }

      await conn.query(
        "UPDATE producto SET StockActual = StockActual - ? WHERE idProducto = ?",
        [item.cantidad, item.idProducto]
      );

      const [movRes] = await conn.query(
        `INSERT INTO movimiento (idProducto, idUsuario, TipoMovimiento, Cantidad, FechaMovimiento)
         VALUES (?, ?, 'Salida', ?, NOW())`,
        [item.idProducto, idUsuario, item.cantidad]
      );

      const idMovimiento = movRes.insertId;

      await conn.query(
        `INSERT INTO historialmovimiento (idMovimiento, Accion, UsuarioResponsable, FechaAccion)
         VALUES (?, ?, ?, NOW())`,
        [idMovimiento, "Venta realizada", `Usuario ID ${idUsuario}`]
      );
    }

    await conn.commit();
    res.json({ mensaje: "Venta registrada correctamente", idVenta });

  } catch (error) {
    console.error("Error al crear venta:", error);
    try {
      await conn.rollback();
    } catch (_) {}
    
    res.status(400).json({ error: error.message || "Error al registrar la venta" });
  } finally {
    conn.release();
  }
};

export const historialVentas = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
        dv.idDetalle            AS idDetalleVenta,
        p.Nombre                AS Producto,
        l.FechaVencimiento      AS VencimientoLote,
        dv.Cantidad             AS Cantidad,
        dv.Subtotal             AS Total,
        v.MetodoPago            AS MetodoPago,
        COALESCE(u.Nombre, 'Sin usuario') AS Usuario,
        v.FechaVenta            AS FechaHora
      FROM venta v
      JOIN detalleventa dv ON dv.idVenta    = v.idVenta
      JOIN producto     p  ON p.idProducto  = dv.idProducto
      LEFT JOIN lote    l  ON l.idLote      = dv.idLote
      LEFT JOIN usuario u  ON u.idUsuario   = v.idUsuario
      ORDER BY v.FechaVenta DESC, dv.idDetalle DESC
      `
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el historial de ventas" });
  }
};