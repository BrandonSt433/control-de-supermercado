import { useState } from "react";
import { Link } from "react-router-dom"; // Importamos Link para volver atrás
import { solicitarPassword } from "../services/auth";
import Swal from "sweetalert2"; // Usamos SweetAlert para consistencia
import "../styles/Login.css";

export default function RecuperarPassword() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    
    setLoading(true); // Activamos estado de carga

    try {
      const res = await solicitarPassword(email);
      
      // Mensaje de éxito bonito
      Swal.fire({
        icon: "success",
        title: "Correo enviado",
        text: res.data.mensaje || "Revisa tu bandeja de entrada.",
        confirmButtonColor: "#2563eb"
      });
      
    } catch (error) {
      console.error(error);
      // Mensaje de error
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo enviar el correo. Intenta nuevamente.",
        confirmButtonColor: "#ef4444"
      });
    } finally {
      setLoading(false); // Desactivamos carga
    }
  };

  return (
    <div className="login-container fade-in">
      <div className="login-card">
        <h2>Recuperar contraseña</h2>
        <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "20px", textAlign: "center" }}>
          Ingresa tu correo y te enviaremos un enlace para crear una nueva clave.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Correo registrado</label>
            <input 
              type="email" 
              name="email" 
              required 
              placeholder="ejemplo@correo.com"
            />
          </div>

          <button className="login-btn" disabled={loading}>
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <Link to="/login" style={{ color: "#2563eb", textDecoration: "none", fontSize: "0.9rem" }}>
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  );
}