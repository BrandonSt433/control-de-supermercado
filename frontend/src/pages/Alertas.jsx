import { useEffect, useState } from "react";
import "../styles/Alertas.css"; 
export default function Alertas() {
  const [productos, setProductos] = useState([]);

  const calcularDiasRestantes = (fecha) => {
    const hoy = new Date();
    const venc = new Date(fecha);
    const diff = venc - hoy;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("http://localhost:4000/api/dashboard/lista-por-vencer");
      const data = await res.json();

      const procesados = data.map((p) => ({
        idProducto: p.idProducto,
        Nombre: p.Nombre,
        FechaVencimiento: new Date(p.fechavencimiento).toLocaleDateString("es-CL"),
        DiasRestantes: calcularDiasRestantes(p.fechavencimiento)
      }));

      setProductos(procesados);
    }

    fetchData();
  }, []);

  const getBadgeClass = (dias) => {
    if (dias === 0) return "badge badge-danger";      
    if (dias <= 3) return "badge badge-warning";       
    if (dias <= 7) return "badge badge-alert";       
    return "badge badge-good";                   
  };

  return (
    <div className="alertas-container">
      <h2 className="alertas-title">Productos próximos a vencer</h2>

      {productos.length === 0 ? (
        <p className="empty-msg">🎉 No hay productos por vencer</p>
      ) : (
        <div className="alertas-grid">
          {productos.map((p) => (
            <div className="alert-card" key={p.idProducto}>
              <h3 className="product-name">{p.Nombre}</h3>

              <p className="vencimiento">
                <strong>Fecha:</strong> {p.FechaVencimiento}
              </p>

              <span className={getBadgeClass(p.DiasRestantes)}>
                {p.DiasRestantes === 0
                  ? "VENCE HOY"
                  : `Faltan ${p.DiasRestantes} días`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
