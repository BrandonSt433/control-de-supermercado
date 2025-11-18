import { useEffect, useState } from "react";
import { api } from "../services/api";
import Swal from "sweetalert2";

export default function AlertasVencimiento() {
  const [productos, setProductos] = useState([]);

  const calcularDiasRestantes = (fecha) => {
    const hoy = new Date();
    const venc = new Date(fecha);
    const diferencia = venc - hoy; 
    return Math.max(0, Math.ceil(diferencia / (1000 * 60 * 60 * 24)));
  };

  useEffect(() => {
    api.get("/dashboard/lista-por-vencer").then((res) => {
      const productosConDias = res.data.map((p) => ({
        ...p,
        DiasRestantes: calcularDiasRestantes(p.fechavencimiento),
        FechaVencimiento: new Date(p.fechavencimiento).toLocaleDateString("es-CL"),
      }));

      setProductos(productosConDias);

      if (productosConDias.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "⚠️ Productos próximos a vencer",
          html: productosConDias
            .map(
              (p) =>
                `<b>${p.Nombre}</b> — vence en ${p.DiasRestantes} días (${p.FechaVencimiento})`
            )
            .join("<br>")
        });
      }
    });
  }, []);

  return (
    <div className="container mt-4">
      <h2>Productos próximos a vencer</h2>
      {productos.length === 0 ? (
        <p>No hay productos por vencer 🎉</p>
      ) : (
        <table className="table table-bordered mt-3">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Fecha de Vencimiento</th>
              <th>Días restantes</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((p) => (
              <tr key={p.idProducto}>
                <td>{p.Nombre}</td>
                <td>{p.FechaVencimiento}</td>
                <td>{p.DiasRestantes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
