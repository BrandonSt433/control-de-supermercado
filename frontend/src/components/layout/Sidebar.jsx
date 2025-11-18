import { Link } from "react-router-dom";
import "../../styles/Sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <Link to="/" className="sidebar-link">Inventario</Link>
      <Link to="/productos" className="sidebar-link">Productos</Link>
      <Link to="/alertas" className="sidebar-link">Alertas</Link>
    </div>
  );
}
