import { useEffect, useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "../../styles/Sidebar.css";

import {
  HiOutlineViewGrid,
  HiOutlineCube,
  HiOutlineShoppingCart,
  HiOutlineExclamation,
  HiOutlineDocumentText,
  HiOutlineUserGroup,
  HiOutlineLogout,
} from "react-icons/hi";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  // Cantidad de alertas nuevas (para el globo)
  const [nuevasAlertas, setNuevasAlertas] = useState(0);
  // Claves únicas de las alertas actuales (para saber cuáles ya se vieron)
  const [alertKeys, setAlertKeys] = useState([]);

  // Cargar alertas (stock bajo + por vencer + vencidos)
  const cargarNotificaciones = async () => {
    try {
      const [resStockBajo, resPorVencer, resVencidos] = await Promise.all([
        axios.get("http://localhost:4000/api/dashboard/lista-stock-bajo"),
        axios.get("http://localhost:4000/api/dashboard/lista-por-vencer"),
        axios.get("http://localhost:4000/api/productos/vencidos"),
      ]);

      const stockBajo = resStockBajo.data || [];
      const porVencer = resPorVencer.data || [];
      const vencidos = resVencidos.data || [];

      // Usamos claves con prefijo para distinguir tipo de alerta
      const keysActuales = [
        ...stockBajo.map((p) => `S-${p.idProducto}`), // Stock bajo
        ...porVencer.map((p) => `P-${p.idProducto}`), // Próximos a vencer
        ...vencidos.map((p) => `V-${p.idProducto}`),  // Vencidos
      ];

      const unicas = Array.from(new Set(keysActuales));
      setAlertKeys(unicas);

      // Leer las alertas ya vistas desde sessionStorage
      let vistas = [];
      try {
        const raw = sessionStorage.getItem("alertasVistas");
        if (raw) vistas = JSON.parse(raw);
      } catch (e) {
        vistas = [];
      }

      // Contar solo las NO vistas
      const nuevas = unicas.filter((k) => !vistas.includes(k));
      setNuevasAlertas(nuevas.length);
    } catch (error) {
      console.error("Error cargando notificaciones del sidebar:", error);
    }
  };

  // Al montar el sidebar, empezar a consultar cada 15 segundos
  useEffect(() => {
    cargarNotificaciones();
    const id = setInterval(cargarNotificaciones, 1000); // 15s
    return () => clearInterval(id);
  }, []);

  // Cuando entras a /alertas, marcar todas las actuales como vistas
  useEffect(() => {
    if (location.pathname === "/alertas" && alertKeys.length > 0) {
      sessionStorage.setItem("alertasVistas", JSON.stringify(alertKeys));
      setNuevasAlertas(0);
    }
  }, [location.pathname, alertKeys]);

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/login");
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="user-row">
          <span className="user-label">USUARIO: </span>
          <span className="user-name">
            {sessionStorage.getItem("nombreUsuario")}
          </span>
        </div>
        <span className="user-role">{sessionStorage.getItem("rol")}</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          <HiOutlineViewGrid className="sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/productos"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          <HiOutlineCube className="sidebar-icon" />
          <span>Inventario</span>
        </NavLink>

        <NavLink
          to="/pos"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          <HiOutlineShoppingCart className="sidebar-icon" />
          <span>Punto de Venta</span>
        </NavLink>

        {/* ALERTAS con globo de notificación */}
        <NavLink
          to="/alertas"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
            }}
          >
            <HiOutlineExclamation className="sidebar-icon" />
          </div>
          <span>Alertas</span>

          {nuevasAlertas > 0 && (
            <span className="sidebar-badge">{nuevasAlertas}</span>
          )}
        </NavLink>

        <NavLink
          to="/transacciones"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          <HiOutlineDocumentText className="sidebar-icon" />
          <span>Transacciones</span>
        </NavLink>

        <NavLink
          to="/merma"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          <HiOutlineExclamation className="sidebar-icon" />
          <span>Merma</span>
        </NavLink>

        <NavLink
          to="/usuarios"
          className={({ isActive }) =>
            "sidebar-link" + (isActive ? " active" : "")
          }
        >
          <HiOutlineUserGroup className="sidebar-icon" />
          <span>Usuarios</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <HiOutlineLogout className="sidebar-icon" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
