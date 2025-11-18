import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Inventario.css";

export default function Inventario() {
  const [stats, setStats] = useState({
    total: 0,
    stockBajo: 0,
    porVencer: 0,
    vencidos: 0
  });

  const [listaVencer, setListaVencer] = useState([]);

   useEffect(() => {
    async function fetchData() {
      const total = await axios.get("http://localhost:4000/api/dashboard/total-productos");
      const stockBajo = await axios.get("http://localhost:4000/api/dashboard/stock-bajo");
      const porVencer = await axios.get("http://localhost:4000/api/dashboard/por-vencer");
      const vencidos = await axios.get("http://localhost:4000/api/dashboard/vencidos");
      const lista = await axios.get("http://localhost:4000/api/dashboard/lista-por-vencer");

      setStats({
        total: total.data.total,
        stockBajo: stockBajo.data.total,
        porVencer: porVencer.data.total,
        vencidos: vencidos.data.total,
      });

      setListaVencer(lista.data);
    }

    fetchData();
  }, []);

  return (
    <div className="dashboard">

      <h2 className="title">Panel General</h2>

      <div className="cards">
        <div className="card">
          <h3>Total productos</h3>
          <p>{stats.total}</p>
        </div>

        <div className="card">
          <h3>Stock bajo</h3>
          <p>{stats.stockBajo}</p>
        </div>

        <div className="card">
          <h3>Por vencer</h3>
          <p>{stats.porVencer}</p>
        </div>

        <div className="card">
          <h3>Vencidos</h3>
          <p>{stats.vencidos}</p>
        </div>
      </div>

      <h2 className="subtitle mt-4">Productos por vencer</h2>

      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Cantidad</th>
            <th>Fecha de vencimiento</th>
          </tr>
        </thead>
        <tbody>
          {listaVencer.map(item => (
            <tr key={item.idProducto}>
              <td>{item.Nombre}</td>
              <td>{item.StockActual}</td>
              <td>{new Date(item.fechavencimiento).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

    </div>
  );


};