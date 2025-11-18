import nodemailer from 'nodemailer';

export const enviarAlerta = async (correo, mensaje) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: 'tuCorreo@gmail.com', pass: 'tuClave' }
  });

  await transporter.sendMail({
    from: 'Sistema Inventario',
    to: correo,
    subject: 'Producto próximo a vencer',
    text: mensaje
  });
};
