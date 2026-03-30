import pool from "../config/db.js";

export function checkRole(...rolesPermitidos) {
  return async (req, res, next) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ mensaje: "Usuario no autenticado." });
      }

      const [rows] = await pool.query(
        "SELECT Rol, Estado FROM usuario WHERE idUsuario = ?",
        [req.user.id]
      );

      if (rows.length === 0) {
        return res.status(401).json({ mensaje: "Usuario no encontrado." });
      }

      const { Rol, Estado } = rows[0];

      // Si quieres, vuelves a validar aquí que esté Activo
      if (Estado === "Inactivo") {
        return res
          .status(403)
          .json({ mensaje: "Usuario inactivo. Contacta al administrador." });
      }

      if (!rolesPermitidos.includes(Rol)) {
        return res.status(403).json({
          mensaje: "No tienes permisos para realizar esta acción.",
        });
      }

      // guardamos el rol por si el controlador lo quiere usar
      req.user.rol = Rol;
      next();
    } catch (error) {
      console.error("Error en checkRole:", error);
      return res.status(500).json({ mensaje: "Error de servidor." });
    }
  };
}
