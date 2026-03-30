import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // <--- 1. IMPORTAMOS LINK
import { loginRequest, validarSesion } from "../services/auth";
import "../styles/Login.css";
import { HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeOff } from "react-icons/hi";
import { mostrarAlertasInventario } from "../utils/alertasProductos.js";

export default function Login({ onLogin }) {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const token = sessionStorage.getItem("token");

    if (token) {
      validarSesion(token)
        .then((res) => {
          if (res.data.valido) {
            onLogin(res.data.rol);
            navigate("/");
          } else {
            sessionStorage.clear();
          }
        })
        .catch(() => {
          sessionStorage.clear();
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [onLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const usuarioForm = e.target.usuario.value;
    const contrasenaForm = e.target.contrasena.value;

    try {
      const res = await loginRequest(usuarioForm, contrasenaForm);

      // SessionStorage se borra al cerrar navegador
      sessionStorage.setItem("token", res.data.token);
      sessionStorage.setItem("rol", res.data.rol);
      sessionStorage.setItem("nombreUsuario", res.data.nombreUsuario);
      sessionStorage.setItem("nombre", res.data.nombre);
      sessionStorage.setItem("idUsuario", res.data.idUsuario);

      onLogin(res.data.rol);
      await mostrarAlertasInventario();
      navigate("/");
    } catch (error) {
      const status = error.response?.status;
      const mensajeBackend = error.response?.data?.mensaje;

      // MEJORA: Mostrar el mensaje exacto del backend (ej: Cuenta no verificada)
      if (status === 403) {
        setErrorMsg(mensajeBackend || "Acceso denegado. Contacta al administrador.");
      } else if (status === 401) {
        setErrorMsg("Usuario o contraseña incorrecta");
      } else {
        setErrorMsg("Ocurrió un error al iniciar sesión");
      }
    }
  };

  if (loading) {
    return <div className="login-loading">Cargando...</div>;
  }

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <div className="login-icon">
          <HiOutlineLockClosed size={45} />
        </div>

        <h2 className="login-title">Sistema de Inventario</h2>
        <p className="login-subtitle">SIV</p>

        {errorMsg && <p className="login-error">{errorMsg}</p>}

        <label className="login-label">Usuario</label>
        <input
          type="text"
          name="usuario"
          placeholder="Ej: admin"
          className="login-input"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
          required
        />

        <label className="login-label">Contraseña</label>
        <div className="login-password-box">
          <input
            type={mostrarPass ? "text" : "password"}
            name="contrasena"
            placeholder="••••••"
            className="login-input password-field"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <span
            className="toggle-pass"
            onClick={() => setMostrarPass(!mostrarPass)}
          >
            {mostrarPass ? <HiOutlineEyeOff /> : <HiOutlineEye />}
          </span>
        </div>

        <Link className="login-forgot" to="/recuperar">
          ¿Olvidé mi contraseña?
        </Link>

        <button className="login-btn" type="submit">
          Iniciar Sesión
        </button>

        <div className="login-defaults">
          <p>Credenciales por defecto:</p>
          <span>Administrador / admin123</span><br />
          <span>bodega / bodega123</span><br />
          <span>super / super123</span>
        </div>
      </form>
    </div>
  );
}