// backend/src/controllers/authController.js
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import pool from "../config/db.js";
import { transporter } from "../config/mailer.js";
import crypto from "crypto";
import { Usuario } from "../models/Usuario.js";

// 👇 exportamos el mapa para usarlo en el middleware
export const sesionesActivas = new Map();

// LOGIN ----------------------------------------------------
export const login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  if (!usuario || !contrasena) {
    return res
      .status(400)
      .json({ mensaje: "Usuario y contraseña son obligatorios" });
  }

  try {
    // Buscar por NombreUsuario
    // 👇 CAMBIO 1: Agregamos 'cuenta_verificada' a la consulta
    const [rows] = await pool.query(
      "SELECT idUsuario, NombreUsuario, Contrasena, Nombre, Rol, Estado, cuenta_verificada FROM usuario WHERE NombreUsuario = ? LIMIT 1",
      [usuario]
    );

    if (rows.length === 0) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const user = rows[0];

    // 1. Validar si está Inactivo (Bloqueado por admin)
    if (user.Estado === "Inactivo") {
      return res
        .status(403)
        .json({ mensaje: "El usuario está inactivo o bloqueado" });
    }

    // 👇 CAMBIO 2: Validar si verificó su correo
    // Si es 0 (falso), lo bloqueamos y le pedimos revisar su email.
    if (user.cuenta_verificada === 0) {
        return res.status(403).json({ 
            mensaje: "Tu cuenta no ha sido verificada. Por favor revisa tu correo electrónico." 
        });
    }

    // Comparar contraseña
    let passwordOK = false;

    if (user.Contrasena && user.Contrasena.startsWith("$2")) {
      // Parece un hash de bcrypt
      passwordOK = await bcrypt.compare(contrasena, user.Contrasena);
    } else {
      // Texto plano (modo desarrollo)
      passwordOK = contrasena === user.Contrasena;
    }

    if (!passwordOK) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    // Crear token
    const token = jwt.sign(
      {
        id: user.idUsuario,
        rol: user.Rol,
      },
      "SECRET",
      { expiresIn: "2h" }
    );

    // Guardar sesión en memoria (para invalidar al reiniciar el servidor)
    sesionesActivas.set(user.idUsuario, token);

    return res.json({
      token,
      rol: user.Rol,
      nombreUsuario: user.NombreUsuario,
      nombre: user.Nombre,
      idUsuario: user.idUsuario,
    });
  } catch (error) {
    console.error("ERROR en login:", error); 
    return res.status(500).json({ mensaje: "Error en el servidor" });
  }
};

// LOGOUT ---------------------------------------------------
export const logout = (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.json({ mensaje: "Sesión cerrada" });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, "SECRET");

    sesionesActivas.delete(decoded.id);

    return res.json({ mensaje: "Sesión cerrada correctamente" });
  } catch (error) {
    return res.json({ mensaje: "Sesión cerrada" });
  }
};

// VALIDAR SESIÓN (para el frontend) ------------------------
export const validarSesion = (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.json({ valido: false });
    }

    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, "SECRET");

    const tokenGuardado = sesionesActivas.get(decoded.id);
    if (!tokenGuardado || tokenGuardado !== token) {
      return res.json({ valido: false });
    }

    return res.json({
      valido: true,
      rol: decoded.rol,
      idUsuario: decoded.id,
    });
  } catch (error) {
    return res.json({ valido: false });
  }
};

// RECUPERAR / RESET (placeholders) -------------------------
export const recuperar = async (req, res) => {
  const { email } = req.body;

  try {
    const usuario = await Usuario.buscarPorCorreo(email);

    if (!usuario) {
      // Por seguridad, no decimos si el correo existe o no, pero aquí para desarrollo te aviso
      return res.status(200).json({ mensaje: "Si el correo existe, se enviaron instrucciones." });
    }

    // Generar token y fecha de expiración (1 hora)
    const token = crypto.randomBytes(32).toString("hex");
    const expiracion = new Date(Date.now() + 3600000); // 1 hora en milisegundos

    await Usuario.guardarTokenRecuperacion(usuario.idUsuario, token, expiracion);

    // Enviar correo
    const resetUrl = `http://localhost:5173/restablecer/${token}`;

    await transporter.sendMail({
      from: '"Soporte SIV" <tucorreo@gmail.com>',
      to: email,
      subject: "Recuperar Contraseña - SIV",
      html: `
        <h1>Recuperación de Contraseña</h1>
        <p>Hola ${usuario.Nombre}, has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva (válido por 1 hora):</p>
        <a href="${resetUrl}" style="background-color: #ef4444; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Restablecer Contraseña</a>
        <p>Si no fuiste tú, ignora este correo.</p>
      `,
    });

    res.json({ mensaje: "Si el correo existe, se enviaron instrucciones." });

  } catch (error) {
    console.error("Error en recuperar:", error);
    res.status(500).json({ error: "Error al procesar la solicitud" });
  }
};

// 2. Restablecer contraseña (El usuario pone la nueva clave)
export const resetPassword = async (req, res) => {
  const { token, nuevaClave } = req.body;

  try {
    // Buscar usuario con ese token y que NO haya expirado
    const usuario = await Usuario.buscarPorTokenRecuperacion(token);

    if (!usuario) {
      return res.status(400).json({ error: "El enlace es inválido o ha expirado." });
    }

    // Actualizar contraseña (el modelo ya la encripta internamente si usas el método correcto)
    // OJO: En tu modelo Usuario.js tienes 'actualizarPassword', usémoslo.
    await Usuario.actualizarPassword(usuario.idUsuario, nuevaClave);

    // Borrar el token para que no se pueda usar de nuevo
    await Usuario.limpiarTokenRecuperacion(usuario.idUsuario);

    res.json({ mensaje: "Contraseña actualizada correctamente. Ya puedes iniciar sesión." });

  } catch (error) {
    console.error("Error en resetPassword:", error);
    res.status(500).json({ error: "Error al restablecer la contraseña" });
  }
};