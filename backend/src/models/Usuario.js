import pool from "../config/db.js";
import bcrypt from "bcrypt";

export const Usuario = {
  // metodo para login
  async buscarPorUsuario(nombreUsuario) {
    const [rows] = await pool.query(
      "SELECT * FROM usuario WHERE NombreUsuario = ?",
      [nombreUsuario]
    );
    return rows[0];
  },

  async buscarPorId(idUsuario) {
    const [rows] = await pool.query(
      "SELECT * FROM usuario WHERE idUsuario = ?",
      [idUsuario]
    );
    return rows[0];
  },

  // método para crear usuario desde el registro público (sin token)
  async crearUsuario(nombreUsuario, contrasena, rol, correo) {
    const hash = await bcrypt.hash(contrasena, 10);
    const [result] = await pool.query(
      `INSERT INTO usuario (NombreUsuario, Contrasena, Rol, Correo, Estado)
       VALUES (?, ?, ?, ?, 'Activo')`,
      [nombreUsuario, hash, rol, correo]
    );
    return result.insertId;
  },

  async actualizarPassword(idUsuario, nuevaClave) {
    const hash = await bcrypt.hash(nuevaClave, 10);
    await pool.query(
      "UPDATE usuario SET Contrasena = ? WHERE idUsuario = ?",
      [hash, idUsuario]
    );
  },

  // método para listar usuarios (para el mantenedor)

  async listar() {
    const [rows] = await pool.query(
      `SELECT 
         idUsuario,
         NombreUsuario,
         Nombre,
         Run,
         Rol,
         Correo,
         Estado,
         cuenta_verificada -- Opcional: por si quieres mostrar en la tabla si ya validó
       FROM usuario`
    );
    return rows;
  },

  // Crear usuario desde el mantenedor (ACTUALIZADO PARA TOKEN)
  async crear(datos) {
    const {
      Nombre,
      Run,
      NombreUsuario,
      Contrasena,
      Rol,
      Correo,
      Estado,
      token_verificacion // <--- RECIBIMOS EL TOKEN
    } = datos;

    const hash = await bcrypt.hash(Contrasena, 10);
    // Insertamos el nuevo usuario con el token de verificación
    const [result] = await pool.query(
      `INSERT INTO usuario
        (Nombre, Run, NombreUsuario, Contrasena, Rol, Correo, Estado, token_verificacion, cuenta_verificada)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)`,
      [Nombre, Run, NombreUsuario, hash, Rol, Correo, Estado, token_verificacion]
    );

    return result.insertId;
  },

  // Actualizar usuario
  async actualizar(id, datos) {
    const {
      Nombre,
      Run,
      NombreUsuario,
      Contrasena,
      Rol,
      Correo,
      Estado,
    } = datos;

    if (Contrasena && Contrasena.trim() !== "") {
      const hash = await bcrypt.hash(Contrasena, 10);
      const [result] = await pool.query(
        `UPDATE usuario SET
           Nombre = ?,
           Run = ?,
           NombreUsuario = ?,
           Contrasena = ?,
           Rol = ?,
           Correo = ?,
           Estado = ?
         WHERE idUsuario = ?`,
        [Nombre, Run, NombreUsuario, hash, Rol, Correo, Estado, id]
      );
      return result.affectedRows;
    }

    const [result] = await pool.query(
      `UPDATE usuario SET
         Nombre = ?,
         Run = ?,
         NombreUsuario = ?,
         Rol = ?,
         Correo = ?,
         Estado = ?
       WHERE idUsuario = ?`,
      [Nombre, Run, NombreUsuario, Rol, Correo, Estado, id]
    );
    return result.affectedRows;
  },

  async eliminar(id) {
    const [result] = await pool.query(
      "DELETE FROM usuario WHERE idUsuario = ?",
      [id]
    );
    return result.affectedRows;
  },


  async verificarCuenta(token) {
    const [rows] = await pool.query(
      "SELECT idUsuario FROM usuario WHERE token_verificacion = ?",
      [token]
    );

    if (rows.length === 0) return null;

    const idUsuario = rows[0].idUsuario;
    await pool.query(
      "UPDATE usuario SET cuenta_verificada = 1, token_verificacion = NULL WHERE idUsuario = ?",
      [idUsuario]
    );

    return idUsuario;
  },
  async buscarPorCorreo(correo) {
    const [rows] = await pool.query("SELECT * FROM usuario WHERE Correo = ?", [correo]);
    return rows[0];
  },
  async guardarTokenRecuperacion(idUsuario, token, fechaExpiracion) {
    await pool.query(
      "UPDATE usuario SET token_recuperacion = ?, token_expiracion = ? WHERE idUsuario = ?",
      [token, fechaExpiracion, idUsuario]
    );
  },
  async buscarPorTokenRecuperacion(token) {
    const [rows] = await pool.query(
      "SELECT * FROM usuario WHERE token_recuperacion = ? AND token_expiracion > NOW()",
      [token]
    );
    return rows[0];
  },
  async limpiarTokenRecuperacion(idUsuario) {
    await pool.query(
      "UPDATE usuario SET token_recuperacion = NULL, token_expiracion = NULL WHERE idUsuario = ?",
      [idUsuario]
    );
  },
};