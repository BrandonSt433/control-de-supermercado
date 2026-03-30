import { useEffect, useState } from "react";
import api from "../services/api";
import "../styles/Alertas.css";
import Swal from "sweetalert2";

export default function Alertas() {
  const [productosPorVencer, setProductosPorVencer] = useState([]);
  const [productosVencidos, setProductosVencidos] = useState([]);
  const [productosStockBajo, setProductosStockBajo] = useState([]);

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-CL");
  };

  const calcularDiasRestantes = (fecha) => {
    if (!fecha) return 0;
    const hoy = new Date();
    const venc = new Date(fecha);
    const diff = venc.getTime() - hoy.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calcularDiasVencidos = (fecha) => {
    if (!fecha) return 0;
    const hoy = new Date();
    const venc = new Date(fecha);
    const diff = hoy.getTime() - venc.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resPorVencer, resVencidos, resStockBajo] = await Promise.all([
          api.get("/dashboard/lista-por-vencer"),
          api.get("/productos/vencidos"),
          api.get("/dashboard/lista-stock-bajo"),
        ]);

        // --- Próximos a vencer ---
        const porVencerData = resPorVencer.data.map((p) => {
          const fecha = p.fechavencimiento || p.FechaVencimiento;
          return {
            idProducto: p.idProducto,
            Nombre: p.Nombre,
            Categoria: p.Categoria,
            StockActual: p.StockActual,
            FechaVencimiento: formatearFecha(fecha),
            DiasRestantes: calcularDiasRestantes(fecha),
          };
        });

        // --- Vencidos ---
        const vencidosData = resVencidos.data.map((p) => {
          const fecha = p.FechaVencimiento || p.fechavencimiento;
          return {
            idProducto: p.idProducto,
            Nombre: p.Nombre,
            Categoria: p.Categoria,
            StockActual: p.StockActual,
            FechaVencimiento: formatearFecha(fecha),
            DiasVencidos: p.DiasVencido ?? calcularDiasVencidos(fecha),
          };
        });

        // --- Stock bajo ---
        const stockBajoData = resStockBajo.data.map((p) => ({
          idProducto: p.idProducto,
          Nombre: p.Nombre,
          Categoria: p.Categoria,
          StockActual: p.StockActual,
          StockMinimo: p.StockMinimo,
        }));

        // 🔹 Leer alertas ya vistas (mismo key que usa el Sidebar)
        let vistas = [];
        try {
          const raw = sessionStorage.getItem("alertasVistas");
          if (raw) vistas = JSON.parse(raw);
        } catch {
          vistas = [];
        }

        const esNueva = (key) => !vistas.includes(key);

        // Agregar flags de "NUEVA"
        const porVencerConFlag = porVencerData.map((item) => {
          const keyAlerta = `P-${item.idProducto}`;
          return {
            ...item,
            keyAlerta,
            esNueva: esNueva(keyAlerta),
          };
        });

        const vencidosConFlag = vencidosData.map((item) => {
          const keyAlerta = `V-${item.idProducto}`;
          return {
            ...item,
            keyAlerta,
            esNueva: esNueva(keyAlerta),
          };
        });

        const stockBajoConFlag = stockBajoData.map((item) => {
          const keyAlerta = `S-${item.idProducto}`;
          return {
            ...item,
            keyAlerta,
            esNueva: esNueva(keyAlerta),
          };
        });

        // Guardar todas las alertas actuales como vistas
        const keysActuales = [
          ...porVencerConFlag.map((i) => i.keyAlerta),
          ...vencidosConFlag.map((i) => i.keyAlerta),
          ...stockBajoConFlag.map((i) => i.keyAlerta),
        ];

        const nuevasVistas = Array.from(new Set([...vistas, ...keysActuales]));
        sessionStorage.setItem("alertasVistas", JSON.stringify(nuevasVistas));

        setProductosPorVencer(porVencerConFlag);
        setProductosVencidos(vencidosConFlag);
        setProductosStockBajo(stockBajoConFlag);
      } catch (error) {
        console.error("Error cargando alertas:", error);
      }
    };

    fetchData();
  }, []);

  const getBadgeClassVencimiento = (dias) => {
    if (dias === 0) return "badge badge-danger";
    if (dias <= 3) return "badge badge-warning";
    if (dias <= 7) return "badge badge-alert";
    return "badge badge-good";
  };

  const getBadgeClassStock = (stockActual, stockMinimo) => {
    if (stockActual <= 0) return "badge badge-danger";
    if (stockActual <= stockMinimo) return "badge badge-warning";
    return "badge badge-alert";
  };

  return (
    <div className="alertas-container">
      <h2 className="alertas-title">Alertas de inventario</h2>

      {/* PRODUCTOS CON BAJO STOCK */}
      <section className="alert-section">
        <h3 className="section-title">Productos con stock bajo</h3>
        {productosStockBajo.length === 0 ? (
          <p className="empty-msg">No hay productos con stock bajo.</p>
        ) : (
          <div className="alertas-grid">
            {productosStockBajo.map((p) => (
              <div className="alert-card" key={p.idProducto}>
                {p.esNueva && (
                  <span className="alert-card-badge-nueva">NUEVA</span>
                )}

                <h3 className="product-name">{p.Nombre}</h3>
                <p className="categoria">
                  <strong>Categoría:</strong> {p.Categoria}
                </p>
                <p className="stock">
                  <strong>Stock actual:</strong> {p.StockActual}
                </p>
                <p className="stock-minimo">
                  <strong>Stock mínimo:</strong> {p.StockMinimo}
                </p>
                <span
                  className={getBadgeClassStock(
                    p.StockActual,
                    p.StockMinimo
                  )}
                >
                  {p.StockActual <= 0 ? "SIN STOCK" : "STOCK CRÍTICO"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTOS PRÓXIMOS A VENCER */}
      <section className="alert-section">
        <h3 className="section-title">Productos próximos a vencer</h3>
        {productosPorVencer.length === 0 ? (
          <p className="empty-msg">No hay productos próximos a vencer.</p>
        ) : (
          <div className="alertas-grid">
            {productosPorVencer.map((p) => (
              <div className="alert-card" key={p.idProducto}>
                {p.esNueva && (
                  <span className="alert-card-badge-nueva">NUEVA</span>
                )}

                <h3 className="product-name">{p.Nombre}</h3>
                <p className="categoria">
                  <strong>Categoría:</strong> {p.Categoria}
                </p>
                <p className="stock">
                  <strong>Stock:</strong> {p.StockActual}
                </p>
                <p className="vencimiento">
                  <strong>Fecha de vencimiento:</strong>{" "}
                  {p.FechaVencimiento}
                </p>
                <span className={getBadgeClassVencimiento(p.DiasRestantes)}>
                  {p.DiasRestantes === 0
                    ? "VENCE HOY"
                    : `Faltan ${p.DiasRestantes} días`}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PRODUCTOS VENCIDOS */}
      <section className="alert-section">
        <h3 className="section-title">Productos vencidos</h3>
        {productosVencidos.length === 0 ? (
          <p className="empty-msg">No hay productos vencidos.</p>
        ) : (
          <div className="alertas-grid">
            {productosVencidos.map((p) => (
              <div
                className="alert-card alert-card--vencido"
                key={p.idProducto}
              >
                {p.esNueva && (
                  <span className="alert-card-badge-nueva">NUEVA</span>
                )}

                <h3 className="product-name">{p.Nombre}</h3>
                <p className="categoria">
                  <strong>Categoría:</strong> {p.Categoria}
                </p>
                <p className="stock">
                  <strong>Stock:</strong> {p.StockActual}
                </p>
                <p className="vencimiento">
                  <strong>Fecha de vencimiento:</strong>{" "}
                  {p.FechaVencimiento}
                </p>
                <span className="badge badge-danger">
                  {p.DiasVencidos > 0
                    ? `VENCIDO hace ${p.DiasVencidos} días`
                    : "PRODUCTO VENCIDO"}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
