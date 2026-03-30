import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/auth";
import Swal from "sweetalert2";
import "../styles/Login.css"; // Reusamos tus estilos

export default function RestablecerPassword() {
  const { token } = useParams(); // Obtenemos el token de la URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nuevaClave = e.target.nuevaClave.value;
    const confirmarClave = e.target.confirmarClave.value;

    if (nuevaClave !== confirmarClave) {
      return Swal.fire("Error", "Las contraseñas no coinciden", "error");
    }

    setLoading(true);

    try {
      await resetPassword(token, nuevaClave);

      await Swal.fire({
        icon: "success",
        title: "¡Contraseña Actualizada!",
        text: "Ya puedes iniciar sesión con tu nueva clave.",
        confirmButtonColor: "#22c55e"
      });

      navigate("/login"); // Los mandamos al login automáticamente

    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Enlace inválido",
        text: "El enlace ha expirado o ya fue utilizado.",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card">
        <h2>Nueva Contraseña</h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nueva contraseña</label>
            <input type="password" name="nuevaClave" required minLength="4"/>
          </div>

          <div className="input-group">
            <label>Confirmar contraseña</label>
            <input type="password" name="confirmarClave" required minLength="4"/>
          </div>

          <button className="login-btn" style={{ backgroundColor: "#22c55e" }} disabled={loading}>
            {loading ? "Guardando..." : "Cambiar Contraseña"}
          </button>
        </form>
      </div>
    </div>
  );
}