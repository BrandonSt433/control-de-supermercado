import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/Pos.css";

export default function Pos() {
  const [productos, setProductos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState("Efectivo");
  const [cargando, setCargando] = useState(false);
  const [ventaModal, setVentaModal] = useState(null);

  const idUsuario = sessionStorage.getItem("idUsuario");

  const cargarProductos = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/productos");
      setProductos(res.data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const agregarAlCarrito = (producto) => {
    if (producto.Estado === "Inactivo") return;
    
    if (
      producto.FechaVencimiento &&
      new Date(producto.FechaVencimiento) < new Date()
    ) {
      return;
    }

    if (producto.StockActual <= 0) return;

    setCarrito((prev) => {
      const existe = prev.find((p) => p.idProducto === producto.idProducto);
      if (existe) {
        if (existe.cantidad >= producto.StockActual) return prev;
        return prev.map((p) =>
          p.idProducto === producto.idProducto
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }
      return [
        ...prev,
        {
          idProducto: producto.idProducto,
          Nombre: producto.Nombre,
          PrecioVenta: Number(producto.PrecioVenta),
          cantidad: 1,
          StockActual: producto.StockActual,
        },
      ];
    });
  };

  const cambiarCantidad = (idProducto, nuevaCantidadCruda) => {
    setCarrito((prev) =>
      prev
        .map((item) => {
          if (item.idProducto !== idProducto) return item;

          let cant = Number(nuevaCantidadCruda);
          if (isNaN(cant) || cant <= 0) cant = 1;
          if (cant > item.StockActual) cant = item.StockActual;

          return { ...item, cantidad: cant };
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const incrementar = (idProducto) => {
    setCarrito((prev) =>
      prev.map((item) => {
        if (item.idProducto !== idProducto) return item;
        if (item.cantidad >= item.StockActual) return item;
        return { ...item, cantidad: item.cantidad + 1 };
      })
    );
  };

  const decrementar = (idProducto) => {
    setCarrito((prev) =>
      prev
        .map((item) =>
          item.idProducto === idProducto
            ? { ...item, cantidad: item.cantidad - 1 }
            : item
        )
        .filter((item) => item.cantidad > 0)
    );
  };

  const totalCarrito = carrito.reduce(
    (sum, item) => sum + item.cantidad * item.PrecioVenta,
    0
  );

  const completarVenta = async () => {
    if (carrito.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "Carrito vacío",
        text: "Agrega al menos un producto antes de completar la venta.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      return;
    }
    if (!idUsuario) {
      Swal.fire({
        icon: "error",
        title: "Usuario no encontrado",
        text: "Debes iniciar sesión para registrar la venta.",
      });
      return;
    }

    for (const item of carrito) {
      const productoBD = productos.find(
        (p) => p.idProducto === item.idProducto
      );
      if (!productoBD) {
        Swal.fire({
          icon: "error",
          title: "Producto inexistente",
          text: `El producto "${item.Nombre}" ya no existe en el inventario.`,
        });
        return;
      }
      if (item.cantidad > productoBD.StockActual) {
        Swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          text: `No hay stock suficiente de "${item.Nombre}". Stock actual: ${productoBD.StockActual}`,
        });
        return;
      }
    }

    const result = await Swal.fire({
      title: "¿Confirmar la venta?",
      text: "Se registrará la venta con los productos del carrito.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sí, confirmar",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setCargando(true);

      const payload = {
        idUsuario: Number(idUsuario),
        metodoPago,
        items: carrito.map((item) => ({
          idProducto: item.idProducto,
          cantidad: item.cantidad,
          precioUnitario: item.PrecioVenta,
        })),
      };

      const res = await axios.post(
        "http://localhost:4000/api/ventas",
        payload
      );

      const productosCriticos = carrito
        .map((item) => {
          const productoBD = productos.find(
            (p) => p.idProducto === item.idProducto
          );
          if (!productoBD || productoBD.StockMinimo == null) return null;

          const stockActualAntes = Number(productoBD.StockActual);
          const cantidadVendida = Number(item.cantidad);
          const stockMinimo = Number(productoBD.StockMinimo);

          const nuevoStock = stockActualAntes - cantidadVendida;

          if (nuevoStock <= stockMinimo) {
            return {
              Nombre: productoBD.Nombre,
              nuevoStock,
              stockMinimo,
            };
          }

          return null;
        })
        .filter(Boolean);

      setVentaModal({
        idVenta: res.data.idVenta,
        total: totalCarrito,
        metodoPago,
      });

      await Swal.fire({
        icon: "success",
        title: "Venta realizada",
        text: "La venta se registró correctamente.",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 600,
        timerProgressBar: true,
      });

      if (productosCriticos.length > 0) {
        const html = productosCriticos
          .map(
            (p) =>
              `<li><b>${p.Nombre}</b> — Stock actual: ${p.nuevoStock} (mínimo: ${p.stockMinimo})</li>`
          )
          .join("");

        await Swal.fire({
          icon: "warning",
          title: "⚠️ Stock crítico después de la venta",
          html: `<ul style="text-align:left">${html}</ul>`,
        });
      }

      setCarrito([]);
      await cargarProductos();
    } catch (error) {
      console.error("Error al completar venta:", error);

      const msg = error.response?.data?.error;

      if (msg && msg.includes("stock")) {
        Swal.fire({
          icon: "error",
          title: "Stock insuficiente",
          text: msg,
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Error al completar la venta",
          text: msg || "No se pudo completar la venta.",
        });
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="pos-wrapper">
      <h1 className="pos-title">Punto de Venta</h1>
      <div className="pos-container">
        <div className="pos-productos">
          <h2>Productos disponibles</h2>
          <div className="productos-grid">
            {productos.map((p) => {
              const sinStock = p.StockActual <= 0;
              const fechaVenc = p.FechaVencimiento || p.fechavencimiento || null;
              const vencido = fechaVenc && new Date(fechaVenc) < new Date();
              const inactivo = p.Estado === "Inactivo";

              const deshabilitado = sinStock || vencido || inactivo;

              const estiloCard = deshabilitado
                ? {
                    backgroundColor: "#fee2e2", 
                    borderColor: "#dc2626",   
                    color: "#000000",         
                    cursor: "not-allowed",
                    opacity: 0.9,
                    borderWidth: "1px",
                    borderStyle: "solid"
                  }
                : {
                    cursor: "pointer"
                  };

              const colorStock = deshabilitado 
                ? "#dc2626"
                : "#22c55e";

              return (
                <div
                  key={p.idProducto}
                  className={`producto-card ${sinStock ? "sin-stock" : ""} ${
                    vencido ? "vencido" : ""
                  }`}
                  style={estiloCard}
                  onClick={() => {
                    if (!deshabilitado) agregarAlCarrito(p);
                  }}
                >
                  <div className="producto-nombre">{p.Nombre}</div>
                  <div className="producto-precio">
                    ${Number(p.PrecioVenta).toLocaleString("es-CL")}
                  </div>
                  <div className="producto-stock">
                    Stock:{" "}
                    <span style={{ color: colorStock, fontWeight: "bold" }}>
                      {p.StockActual}
                    </span>
                  </div>
                  
                  {sinStock && (
                    <div className="producto-agotado" style={{ color: "#000000", fontWeight: "bold" }}>SIN STOCK</div>
                  )}
                  {vencido && (
                    <div className="producto-agotado" style={{ color: "#000000", fontWeight: "bold" }}>PRODUCTO CADUCADO</div>
                  )}
                  {inactivo && !sinStock && !vencido && (
                    <div className="producto-agotado" style={{ color: "#000000", fontWeight: "bold" }}>INACTIVO</div>
                  )}
                </div>
              );
            })}

            {productos.length === 0 && (
              <p className="texto-secundario">
                No hay productos registrados.
              </p>
            )}
          </div>
        </div>

        <div className="pos-carrito">
          <h2>Carrito</h2>

          <div className="carrito-lista">
            {carrito.length === 0 && (
              <p className="carrito-vacio">
                No hay productos en el carrito.
              </p>
            )}

            {carrito.map((item) => (
              <div key={item.idProducto} className="carrito-item">
                <div className="carrito-info">
                  <div className="carrito-nombre">{item.Nombre}</div>
                  <div className="carrito-precio">
                    ${item.PrecioVenta.toLocaleString("es-CL")} c/u
                  </div>
                </div>

                <div className="carrito-controles">
                  <button
                    type="button"
                    className="btn-cantidad"
                    onClick={() => decrementar(item.idProducto)}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={item.StockActual}
                    value={item.cantidad}
                    onChange={(e) =>
                      cambiarCantidad(item.idProducto, e.target.value)
                    }
                  />
                  <button
                    type="button"
                    className="btn-cantidad"
                    onClick={() => incrementar(item.idProducto)}
                  >
                    +
                  </button>
                </div>

                <div className="carrito-subtotal">
                  $
                  {(item.cantidad * item.PrecioVenta).toLocaleString("es-CL")}
                </div>
              </div>
            ))}
          </div>

          <div className="carrito-resumen">
            <div className="carrito-total">
              Total:{" "}
              <span>${totalCarrito.toLocaleString("es-CL")}</span>
            </div>

            <div className="carrito-metodo">
              <label>Método de pago:</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </select>
            </div>

            <button
              className="btn-completar"
              onClick={completarVenta}
              disabled={cargando || carrito.length === 0}
            >
              {cargando ? "Procesando..." : "Completar venta"}
            </button>
          </div>
        </div>
      </div>

      {ventaModal && (
        <div className="venta-modal-overlay">
          <div className="venta-modal">
            <h3>Venta realizada</h3>
            <p>
              <strong>N° Boleta / Venta:</strong> {ventaModal.idVenta}
            </p>
            <p>
              <strong>Total:</strong>{" "}
              ${ventaModal.total.toLocaleString("es-CL")}
            </p>
            <p>
              <strong>Método de pago:</strong> {ventaModal.metodoPago}
            </p>

            <button
              className="btn-cerrar-modal"
              onClick={() => setVentaModal(null)}
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}