import { permisos } from "../config/permissions.js";

export function can(accion) {
  return (req, res, next) => {
    if (!req.user || !req.user.rol) {
      return res.status(401).json({
        mensaje: "Usuario no autenticado. Inicia sesión nuevamente.",
      });
    }

    const rol = req.user.rol;
    const lista = permisos[rol] || [];

    if (!lista.includes(accion)) {
      return res.status(403).json({
        mensaje: "No tienes permiso para realizar esta acción.",
      });
    }

    next();
  };
}
