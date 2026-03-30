import axios from "axios";

// Asegúrate de que este puerto coincida con tu backend
const API = "http://localhost:4000/api/auth";

// LOGIN
export const loginRequest = (usuario, contrasena) =>
  axios.post(`${API}/login`, { usuario, contrasena });

// VALIDAR SESIÓN (CORREGIDO)
// Cambiamos a GET y enviamos el token en los Headers
export const validarSesion = (token) =>
  axios.get(`${API}/validar`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// CERRAR SESIÓN
export const cerrarSesion = (token) =>
  axios.post(`${API}/logout`, {}, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

// RECUPERAR CONTRASEÑA (Estaba bien, solo confirmo ruta)
export const solicitarPassword = (email) =>
  axios.post(`${API}/recuperar`, { email });

// CAMBIAR CONTRASEÑA (Estaba bien)
export const resetPassword = (token, nuevaClave) =>
  axios.post(`${API}/reset-password`, { token, nuevaClave });
