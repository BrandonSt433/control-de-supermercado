import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/Inventario.css";
import {PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,} from "recharts" 

export default function Inventario() {

  const [stats, setStats] = useState({
    total: 0,
    stockBajo: 0,
    porVencer: 0,
    vencidos: 0,
  });

  const [listaTotal, setListaTotal] = useState([]);
  const [listaStockBajo, setListaStockBajo] = useState([]);
  const [listaPorVencer, setListaPorVencer] = useState([]);
  const [listaVencidos, setListaVencidos] = useState([]);

  // Indica la tarjeta seleccionada
  const [activeTab, setActiveTab] = useState(null); 

  const formatearFecha = (fecha) => {
    if (!fecha) return "-";
    const d = new Date(fecha);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("es-CL");
  };

  const calcularDiasRestantes = (fecha) => {
    const hoy = new Date();
    const venc = new Date(fecha);
    const diff = venc - hoy;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const calcularDiasVencidos = (fecha) => {
    const hoy = new Date();
    const venc = new Date(fecha);
    const diff = hoy - venc;
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const COLORS = ["#f97316", "#eab308", "#dc2626", "#22c55e"]; // por vencer, stock bajo, vencidos, buenos

  const buenos = Math.max(
    0,
    stats.total - stats.stockBajo - stats.porVencer - stats.vencidos
  );

  const pieData = [
    { name: "Por vencer", value: stats.porVencer },
    { name: "Stock bajo", value: stats.stockBajo },
    { name: "Vencidos", value: stats.vencidos },
    { name: "Buenos", value: buenos },
  ];

  const dataFiltrada = pieData.filter((item) => item.value > 0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token
          ? { headers: { Authorization: `Bearer ${token}` } }
          : {};

        const [total, stockBajo, porVencer, vencidos] = await Promise.all([
          axios.get(
            "http://localhost:4000/api/dashboard/total-productos",
            headers
          ),
          axios.get(
            "http://localhost:4000/api/dashboard/stock-bajo",
            headers
          ),
          axios.get(
            "http://localhost:4000/api/dashboard/por-vencer",
            headers
          ),
          axios.get(
            "http://localhost:4000/api/dashboard/vencidos",
            headers
          ),
        ]);

        setStats({
          total: total.data.total,
          stockBajo: stockBajo.data.total,
          porVencer: porVencer.data.total,
          vencidos: vencidos.data.total,
        });

        const [resTotal, resStockBajo, resPorVencer, resVencidos] =
          await Promise.all([
            axios.get("http://localhost:4000/api/productos", headers),
            axios.get(
              "http://localhost:4000/api/dashboard/lista-stock-bajo",
              headers
            ),
            axios.get(
              "http://localhost:4000/api/dashboard/lista-por-vencer",
              headers
            ),
            axios.get(
              "http://localhost:4000/api/productos/vencidos",
              headers
            ),
          ]);

        const totalProductos = resTotal.data.map((p) => ({
          idProducto: p.idProducto,
          Nombre: p.Nombre,
          Categoria: p.Categoria,
          StockActual: p.StockActual,
          FechaVencimiento: formatearFecha(
            p.FechaVencimiento || p.fechavencimiento
          ),
        }));
        setListaTotal(totalProductos);

        const stockBajoLista = resStockBajo.data.map((p) => ({
          idProducto: p.idProducto,
          Nombre: p.Nombre,
          Categoria: p.Categoria,
          StockActual: p.StockActual,
          StockMinimo: p.StockMinimo,
        }));
        setListaStockBajo(stockBajoLista);

        const porVencerLista = resPorVencer.data.map((p) => ({
          idProducto: p.idProducto,
          Nombre: p.Nombre,
          Categoria: p.Categoria,
          StockActual: p.StockActual,
          FechaVencimiento: formatearFecha(p.fechavencimiento),
          DiasRestantes: calcularDiasRestantes(p.fechavencimiento),
        }));
        setListaPorVencer(porVencerLista);

        const vencidosLista = resVencidos.data.map((p) => {
          const fecha = p.FechaVencimiento;
          return {
            idProducto: p.idProducto,
            Nombre: p.Nombre,
            Categoria: p.Categoria,
            StockActual: p.StockActual,
            FechaVencimiento: formatearFecha(fecha),
            DiasVencidos:
              p.DiasVencido ?? calcularDiasVencidos(fecha),
          };
        });
        setListaVencidos(vencidosLista);
      } catch (error) {
        console.error("Error cargando datos de inventario:", error);
      }
    };

    fetchData();
  }, []);

  const getTituloTabla = () => {
    switch (activeTab) {
      case "total":
        return "Listado de todos los productos";
      case "stockBajo":
        return "Productos con stock bajo";
      case "porVencer":
        return "Productos por vencer";
      case "vencidos":
        return "Productos vencidos";
      default:
        return "";
    }
  };

  const renderTabla = () => {
    if (!activeTab) return null;

    if (activeTab === "total") {
      if (listaTotal.length === 0) {
        return <p className="empty-msg">No hay productos registrados</p>;
      }
      return (
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Fecha de vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {listaTotal.map((item) => (
              <tr key={item.idProducto}>
                <td>{item.Nombre}</td>
                <td>{item.Categoria}</td>
                <td>{item.StockActual}</td>
                <td>{item.FechaVencimiento}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === "stockBajo") {
      if (listaStockBajo.length === 0) {
        return (
          <p className="empty-msg">
            No hay productos con stock bajo en este momento
          </p>
        );
      }
      return (
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Stock actual</th>
              <th>Stock mínimo</th>
            </tr>
          </thead>
          <tbody>
            {listaStockBajo.map((item) => (
              <tr key={item.idProducto}>
                <td>{item.Nombre}</td>
                <td>{item.Categoria}</td>
                <td>{item.StockActual}</td>
                <td>{item.StockMinimo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === "porVencer") {
      if (listaPorVencer.length === 0) {
        return <p className="empty-msg">No hay productos por vencer</p>;
      }
      return (
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Categoría</th>
              <th>Cantidad</th>
              <th>Fecha de vencimiento</th>
              <th>Días restantes</th>
            </tr>
          </thead>
          <tbody>
            {listaPorVencer.map((item) => (
              <tr key={item.idProducto}>
                <td>{item.Nombre}</td>
                <td>{item.Categoria}</td>
                <td>{item.StockActual}</td>
                <td>{item.FechaVencimiento}</td>
                <td>{item.DiasRestantes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (listaVencidos.length === 0) {
      return <p className="empty-msg">No hay productos vencidos</p>;
    }

    return (
      <table className="table">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Cantidad</th>
            <th>Fecha de vencimiento</th>
            <th>Días vencidos</th>
          </tr>
        </thead>
        <tbody>
          {listaVencidos.map((item) => (
            <tr key={item.idProducto}>
              <td>{item.Nombre}</td>
              <td>{item.Categoria}</td>
              <td>{item.StockActual}</td>
              <td>{item.FechaVencimiento}</td>
              <td>{item.DiasVencidos}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="dashboard">
      <h2 className="title">Panel General</h2>

      <div className="cards">
        <button
          className={`card card-total ${
            activeTab === "total" ? "card--active" : ""
          }`}
          onClick={() => setActiveTab("total")}
        >
          <span className="card-label">Total productos</span>
          <span className="card-number">{stats.total}</span>
          <span className="card-footer">Ver listado completo</span>
        </button>

        <button
          className={`card card-stock-bajo ${
            activeTab === "stockBajo" ? "card--active" : ""
          }`}
          onClick={() => setActiveTab("stockBajo")}
        >
          <span className="card-label">Stock bajo</span>
          <span className="card-number">{stats.stockBajo}</span>
          <span className="card-footer">Ver productos críticos</span>
        </button>

        <button
          className={`card card-por-vencer ${
            activeTab === "porVencer" ? "card--active" : ""
          }`}
          onClick={() => setActiveTab("porVencer")}
        >
          <span className="card-label">Por vencer</span>
          <span className="card-number">{stats.porVencer}</span>
          <span className="card-footer">
            Ver productos próximos a vencer
          </span>
        </button>

        <button
          className={`card card-vencidos ${
            activeTab === "vencidos" ? "card--active" : ""
          }`}
          onClick={() => setActiveTab("vencidos")}
        >
          <span className="card-label">Vencidos</span>
          <span className="card-number">{stats.vencidos}</span>
          <span className="card-footer">Ver productos vencidos</span>
        </button>
      </div>

      {activeTab && (
        <div className="tabla-wrapper">
          <h2 className="subtitle">{getTituloTabla()}</h2>
          {renderTabla()}
        </div>
      )}

    <div className="chart-card">
        <h3 className="subtitle">Estado general de los productos</h3>
        {stats.total === 0 || dataFiltrada.length === 0 ? (
          <p className="empty-msg">
            Aún no hay datos suficientes para mostrar el gráfico.
          </p>
        ) : (
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataFiltrada}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label
                >
                  {dataFiltrada.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} productos`, name]}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

    </div>

    
  );
}