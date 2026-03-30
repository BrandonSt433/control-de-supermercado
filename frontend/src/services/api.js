import axios from "axios";

// Conexion con backend
export const api = axios.create({
  baseURL: "http://localhost:4000/api",
});

// agrega el token a todas las peticiones
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// si el backend responde 401, cerramos sesión
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;

    if (status === 401) {
      sessionStorage.clear();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;
