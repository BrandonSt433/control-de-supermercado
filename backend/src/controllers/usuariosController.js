import { Usuario } from "../models/Usuario.js";
import { transporter } from "../config/mailer.js";
import crypto from "crypto";

// Obtener todos los usuarios
export const getUsuarios = async (req, res) => {
  try {
    const usuarios = await Usuario.listar();
    res.json(usuarios);
  } catch (error) {
    console.error("ERROR en getUsuarios:", error);
    res.status(500).json({ error: "Error al obtener los usuarios" });
  }
};

// Crear un nuevo usuario con verificación por correo
export const crearUsuario = async (req, res) => {
  try {
    const {
      Nombre,
      Run,
      NombreUsuario,
      Contrasena,
      Rol,
      Correo,
      Estado,
    } = req.body;

    if (!NombreUsuario || !Contrasena || !Rol || !Correo) {
      return res.status(400).json({
        error: "Faltan campos obligatorios (NombreUsuario, Contrasena, Rol, Correo)",
      });
    }

    // 1. GENERAR TOKEN ÚNICO
    const token = crypto.randomBytes(32).toString("hex");

    // 2. GUARDAR USUARIO CON EL TOKEN
    const nuevoId = await Usuario.crear({
      Nombre,
      Run,
      NombreUsuario,
      Contrasena,
      Rol,
      Correo,
      Estado: Estado || "Activo",
      token_verificacion: token
    });

    // 3. ENVIAR CORREO DE VERIFICACIÓN
    const verificationLink = `http://localhost:5173/verificar/${token}`;

    await transporter.sendMail({
      from: '"Sistema de Inventario" <tucorreo@gmail.com>',
      to: Correo,
      subject: "Verifica tu cuenta - SIV",
      html: `
        <h1>Bienvenido al Sistema de Inventario</h1>
        <p>Hola ${Nombre || NombreUsuario},</p>
        <p>Un administrador ha creado tu cuenta. Por favor, haz clic en el siguiente enlace para activar tu acceso:</p>
        <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verificar Cuenta</a>
        <p>Si no funciona, copia este enlace: ${verificationLink}</p>
      `,
    });

    // 4. RESPONDER AL CLIENTE
    const creado = await Usuario.buscarPorId(nuevoId);

    res.status(201).json({
      message: "Usuario creado. Se ha enviado un correo de verificación.",
      usuario: creado,
    });
  } catch (error) {
    console.error("ERROR en crearUsuario:", error);
    res.status(500).json({ error: "Error al crear el usuario" });
  }
};

// Verificar usuario mediante token
export const verificarUsuarioPorToken = async (req, res) => {
  try {
    const { token } = req.params;
    
    // Llamamos al modelo para que busque y actualice
    const idValidado = await Usuario.verificarCuenta(token);

    if (!idValidado) {
      return res.status(400).json({ error: "El enlace de verificación es inválido o ya fue usado." });
    }

    res.json({ message: "Cuenta verificada exitosamente. Ya puedes iniciar sesión." });

  } catch (error) {
    console.error("ERROR en verificarUsuarioPorToken:", error);
    res.status(500).json({ error: "Error al verificar la cuenta." });
  }
};

// Actualizar un usuario existente
export const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const filasAfectadas = await Usuario.actualizar(id, req.body);
    if (filasAfectadas === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    const actualizado = await Usuario.buscarPorId(id);
    res.json({
      message: "Usuario actualizado correctamente",
      usuario: actualizado,
    });
  } catch (error) {
    console.error("ERROR en actualizarUsuario:", error);
    res.status(500).json({ error: "Error al actualizar el usuario" });
  }
};

// Eliminar un usuario
export const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const filasAfectadas = await Usuario.eliminar(id);
    if (filasAfectadas === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    console.error("ERROR en eliminarUsuario:", error);
    res.status(500).json({ error: "Error al eliminar el usuario" });
  }
};