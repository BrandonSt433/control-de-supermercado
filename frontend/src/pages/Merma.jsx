import { useEffect, useState } from "react";
import api from "../services/api.js";
import "../styles/Merma.css";

export default function Merma() {
  const [productos, setProductos] = useState([]);
  const [totalMerma, setTotalMerma] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("/productos/vencidos");
        const data = (res.data || []).map((p) => {
          const costo =
            (Number(p.StockActual) || 0) * (Number(p.PrecioCompra) || 0);

          const fecha = p.FechaVencimiento || p.fechavencimiento;

          return {
            ...p,
            CostoPerdido: costo,
            FechaVencimiento: fecha
              ? new Date(fecha).toLocaleDateString("es-CL")
              : "-",
          };
        });

        setProductos(data);

        const total = data.reduce(
          (sum, p) => sum + (p.CostoPerdido || 0),
          0
        );
        setTotalMerma(total);
      } catch (error) {
        console.error("Error al cargar merma:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="merma-page">
      <h1 className="merma-title">Merma por productos vencidos</h1>

      <div className="merma-resumen-card">
        <h2>Total perdido</h2>
        <p className="merma-total">
          ${totalMerma.toLocaleString("es-CL")}
        </p>
        <span className="merma-subtitle">
          Costo de compra de todos los productos vencidos.
        </span>
      </div>

      <div className="merma-table-wrapper">
        <table className="merma-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock vencido</th>
              <th>Precio compra</th>
              <th>Costo perdido</th>
              <th>Fecha vencimiento</th>
              <th>Días vencido</th>
            </tr>
          </thead>
          <tbody>
            {productos.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No hay productos vencidos 🙌
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.idProducto}>
                  <td>{p.Nombre}</td>
                  <td>{p.Categoria}</td>
                  <td>{p.StockActual}</td>
                  <td>
                    ${Number(p.PrecioCompra).toLocaleString("es-CL")}
                  </td>
                  <td>
                    ${Number(p.CostoPerdido).toLocaleString("es-CL")}
                  </td>
                  <td>{p.FechaVencimiento}</td>
                  <td>{p.DiasVencido}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
