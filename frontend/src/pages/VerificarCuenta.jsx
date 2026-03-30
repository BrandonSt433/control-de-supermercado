import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function VerificarCuenta() {
  const { token } = useParams(); // Obtenemos el token de la URL
  const [estado, setEstado] = useState("cargando"); // cargando | exito | error
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const verificar = async () => {
      try {
        // Llamamos al backend para validar el token
        await axios.post(`http://localhost:4000/api/usuarios/verificar/${token}`);
        setEstado("exito");
      } catch (error) {
        setEstado("error");
        setMensaje(error.response?.data?.error || "Error desconocido");
      }
    };

    if (token) verificar();
  }, [token]);

  return (
    <div style={{ 
      height: "100vh", 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      background: "#0f172a", 
      color: "white" 
    }}>
      <div style={{ textAlign: "center", padding: "40px", background: "#1e293b", borderRadius: "10px" }}>
        
        {estado === "cargando" && <h2>Verificando tu cuenta...</h2>}
        
        {estado === "exito" && (
          <>
            <h1 style={{ color: "#22c55e", fontSize: "3rem" }}>¡Cuenta Verificada!</h1>
            <p>Ya tienes acceso al sistema.</p>
            <Link to="/login" style={{ 
              display: "inline-block", 
              marginTop: "20px", 
              padding: "10px 20px", 
              background: "#2563eb", 
              color: "white", 
              textDecoration: "none", 
              borderRadius: "5px" 
            }}>
              Ir al Login
            </Link>
          </>
        )}

        {estado === "error" && (
          <>
            <h1 style={{ color: "#ef4444", fontSize: "3rem" }}>Error</h1>
            <p>{mensaje}</p>
            <Link to="/login" style={{ color: "#94a3b8", marginTop: "20px", display: "block" }}>
              Volver al inicio
            </Link>
          </>
        )}
      </div>
    </div>
  );
}