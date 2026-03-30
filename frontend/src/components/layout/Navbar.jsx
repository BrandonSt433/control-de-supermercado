import "../../styles/Navbar.css";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo">Sistema de Inventario</div>
        <div className="navbar-subtitle">SIV</div>
      </div>

      <div className="navbar-right">
        <div className="navbar-user">
          <span className="user-name">
            {sessionStorage.getItem("nombre")}
          </span>

        </div>
      </div>
    </header>
  );
}
