import pool from "../config/db.js";

export const registrarCompra = async (req, res) => {
    const { idProveedor, idUsuario, metodoPago, total, productos } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [resultCompra] = await connection.query(
            "INSERT INTO compra (idProveedor, idUsuario, FechaCompra, Total, MetodoPago) VALUES (?, ?, NOW(), ?, ?)",
            [idProveedor, idUsuario, total, metodoPago]
        );
        const idCompra = resultCompra.insertId;

        for (const item of productos) {
            await connection.query(
                "INSERT INTO detallecompra (idCompra, idProducto, Cantidad, PrecioUnitario, Subtotal) VALUES (?, ?, ?, ?, ?)",
                [idCompra, item.idProducto, item.cantidad, item.precio, item.cantidad * item.precio]
            );

            const codigoDelLote = item.codigoLote || 'S/N';
            
            await connection.query(
                `INSERT INTO lote 
                (idProducto, Codigo, FechaIngreso, FechaVencimiento, CantidadInicial, CantidadActual) 
                VALUES (?, ?, NOW(), ?, ?, ?)`,
                [item.idProducto, codigoDelLote, item.fechaVencimiento, item.cantidad, item.cantidad]
            );

            await connection.query(
                "UPDATE producto SET StockActual = StockActual + ?, PrecioCompra = ? WHERE idProducto = ?",
                [item.cantidad, item.precio, item.idProducto]
            );
        }

        await connection.commit();
        res.status(201).json({ message: "Compra registrada correctamente" });

    } catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Error al registrar la compra" });
    } finally {
        connection.release();
    }
};

export const getCompras = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT c.idCompra, c.FechaCompra, c.Total, c.MetodoPago, p.Nombre as Proveedor 
            FROM compra c
            LEFT JOIN proveedor p ON c.idProveedor = p.idProveedor
            ORDER BY c.FechaCompra DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error al obtener el historial de compras" });
    }
};