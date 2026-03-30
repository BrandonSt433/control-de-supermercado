import nodemailer from "nodemailer";

// Configuración de transporte (Gmail)
export const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true para 465, false para otros puertos
  auth: {
    user: "brandonstuardo433@gmail.com", // ⚠️ REEMPLAZA CON TU CORREO
    pass: "tysy xzjs aoix qreg", // ⚠️ REEMPLAZA CON TU CONTRASEÑA DE APLICACIÓN
  },
});

// Verificación de conexión (Opcional, para ver si funciona al iniciar)
transporter.verify().then(() => {
  console.log("Listo para enviar correos");
}).catch((error) => {
  console.error("Error al configurar correo:", error);
});