import axios from "axios";

// Conexion con backend
export const api = axios.create({
  baseURL: "http://localhost:4000/api"
});

export default api;