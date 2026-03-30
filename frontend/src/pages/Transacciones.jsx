import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import "../styles/Transacciones.css";

const COLORS = ["#3b82f6", "#22c55e", "#f97316", "#e11d48", "#a855f7"];

export default function Transacciones() {
  const [ventas, setVentas] = useState([]);
  const [error, setError] = useState("");

  // filtros
  const [filtroUsuario, setFiltroUsuario] = useState("");
  const [filtroProducto, setFiltroProducto] = useState("");
  const [metodoPago, setMetodoPago] = useState("Todos");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");

  useEffect(() => {
    const cargarVentas = async () => {
      try {
        const res = await axios.get(
          "http://localhost:4000/api/ventas/historial"
        );
        setVentas(res.data || []);
        setError("");
      } catch (err) {
        console.error("Error al cargar ventas:", err);
        setError("No se pudieron cargar las ventas");
      }
    };

    cargarVentas();
  }, []);

  // Aplica filtros a las ventas
  const ventasFiltradas = useMemo(() => {
    return ventas.filter((v) => {
      // usuario
      if (
        filtroUsuario &&
        !v.Usuario?.toLowerCase().includes(filtroUsuario.toLowerCase())
      ) {
        return false;
      }

      // producto
      if (
        filtroProducto &&
        !v.Producto?.toLowerCase().includes(filtroProducto.toLowerCase())
      ) {
        return false;
      }

      // método de pago
      if (metodoPago !== "Todos" && v.MetodoPago !== metodoPago) {
        return false;
      }

      // rango fechas (FechaHora viene como string ISO)
      if (desde) {
        const dDesde = new Date(desde);
        const dVenta = new Date(v.FechaHora);
        if (dVenta < dDesde) return false;
      }

      if (hasta) {
        const dHasta = new Date(hasta);
        const dVenta = new Date(v.FechaHora);
        // sumo un día para incluir el día completo
        dHasta.setDate(dHasta.getDate() + 1);
        if (dVenta >= dHasta) return false;
      }

      return true;
    });
  }, [ventas, filtroUsuario, filtroProducto, metodoPago, desde, hasta]);

  // Datos para el gráfico
  const datosPorProducto = useMemo(() => {
    const mapa = new Map();
    ventasFiltradas.forEach((v) => {
      const clave = v.Producto || "Sin nombre";
      const actual = mapa.get(clave) || 0;
      const totalNum = Number(v.Total) || 0;
      mapa.set(clave, actual + totalNum);
    });

    return Array.from(mapa.entries()).map(([Producto, Total]) => ({
      Producto,
      Total,
    }));
  }, [ventasFiltradas]);

  // Datos para el gráfico de pastel
  const datosPorMetodoPago = useMemo(() => {
    const mapa = new Map();
    ventasFiltradas.forEach((v) => {
      const metodo = v.MetodoPago || "Sin método";
      const actual = mapa.get(metodo) || 0;
      const totalNum = Number(v.Total) || 0;
      mapa.set(metodo, actual + totalNum);
    });

    return Array.from(mapa.entries()).map(([name, value]) => ({
      name,
      value,
    }));
  }, [ventasFiltradas]);

  const totalMetodos = useMemo(
    () => datosPorMetodoPago.reduce((acc, d) => acc + d.value, 0),
    [datosPorMetodoPago]
  );

  return (
    <div className="transacciones-page">
      <h2 className="transacciones-title">Transacciones</h2>

      {/* Filtros arriba */}
      <div className="filtros-container">
        <input
          type="text"
          placeholder="Filtrar por usuario..."
          value={filtroUsuario}
          onChange={(e) => setFiltroUsuario(e.target.value)}
        />

        <input
          type="text"
          placeholder="Filtrar por producto..."
          value={filtroProducto}
          onChange={(e) => setFiltroProducto(e.target.value)}
        />

        <select
          value={metodoPago}
          onChange={(e) => setMetodoPago(e.target.value)}
        >
          <option value="Todos">Todos los métodos</option>
          <option value="Efectivo">Efectivo</option>
          <option value="Tarjeta">Tarjeta</option>
          <option value="Transferencia">Transferencia</option>
        </select>

        <div className="filtro-fecha">
          <span>Desde:</span>
          <input
            type="date"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>

        <div className="filtro-fecha">
          <span>Hasta:</span>
          <input
            type="date"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="transacciones-layout">
        {/* Tabla de ventas */}
        <div className="tabla-transacciones">
          {ventasFiltradas.length === 0 ? (
            <p>No hay ventas para los filtros seleccionados.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Método</th>
                  <th>Usuario</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.map((v) => {
                  const fecha = new Date(v.FechaHora);
                  const fechaStr = fecha.toLocaleDateString("es-CL");
                  const horaStr = fecha.toLocaleTimeString("es-CL", {
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={v.idDetalleVenta}>
                      <td>{v.Producto}</td>
                      <td>{v.Cantidad}</td>
                      <td>${Number(v.Total).toLocaleString("es-CL")}</td>
                      <td>{v.MetodoPago}</td>
                      <td>{v.Usuario}</td>
                      <td>{fechaStr}</td>
                      <td>{horaStr}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="graficos-transacciones">
          <h3>Ventas por producto</h3>

          {datosPorProducto.length === 0 ? (
            <p>No hay datos para mostrar el gráfico.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <BarChart data={datosPorProducto}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Producto" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toLocaleString("es-CL")}`
                    }
                  />
                  <Bar dataKey="Total" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          <h3 style={{ marginTop: "20px" }}>Ventas por método de pago</h3>

          {datosPorMetodoPago.length === 0 ? (
            <p>No hay datos para mostrar el gráfico de medios de pago.</p>
          ) : (
            <div style={{ width: "100%", height: 260 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Tooltip
                    formatter={(value) =>
                      `$${Number(value).toLocaleString("es-CL")}`
                    }
                  />
                  <Legend />
                  <Pie
                    data={datosPorMetodoPago}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={(entry) => {
                      if (!totalMetodos) return entry.name;
                      const pct = (entry.value * 100) / totalMetodos;
                      return `${entry.name} (${pct.toFixed(1)}%)`;
                    }}
                  >
                    {datosPorMetodoPago.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
