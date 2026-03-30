import nodemailer from "nodemailer";

const DESTINATARIOS =
  "josesandovalgarces@gmail.com";

const fmtFecha = (d) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("es-CL");
};

const diasRestantes = (fecha) => {
  if (!fecha) return null;
  const f = new Date(fecha);
  if (isNaN(f.getTime())) return null;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  f.setHours(0, 0, 0, 0);

  return Math.ceil((f - hoy) / 86400000);
};

export const enviarCorreoAlerta = async (productos, tipo = "POR_VENCER") => {
  if (!productos || productos.length === 0) return;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "brandonstuardo433@gmail.com",
      pass: "isto itsl jodg nuyr",
    },
  });

  const hoyTxt = new Date().toLocaleDateString("es-CL");

  const config = {
    POR_VENCER: {
      titulo: "⚠️ Productos próximos a vencer",
      badge: "PRÓXIMO A VENCER",
      descripcion: "Se detectaron productos con vencimiento dentro de los próximos 7 días.",
      subject: `⚠️ ALERTA (${hoyTxt}): ${productos.length} producto(s) por vencer`,
    },
    VENCIDO: {
      titulo: "⛔ Productos vencidos",
      badge: "VENCIDO",
      descripcion: "Se detectaron productos con fecha de vencimiento ya caducada.",
      subject: `⛔ ALERTA (${hoyTxt}): ${productos.length} producto(s) vencido(s)`,
    },
    STOCK: {
      titulo: "📉 Stock bajo o sin stock",
      badge: "STOCK CRÍTICO",
      descripcion: "Se detectaron productos con stock en 0 o en nivel crítico (≤ stock mínimo).",
      subject: `📉 ALERTA (${hoyTxt}): ${productos.length} producto(s) con stock crítico/0`,
    },
  }[tipo] || {
    titulo: "🔔 Alerta de Inventario",
    badge: "ALERTA",
    descripcion: "Se detectaron novedades en el inventario.",
    subject: `🔔 ALERTA (${hoyTxt}): ${productos.length} producto(s)`,
  };

  const filas = productos
    .map((p) => {
      const fv = p.fechavencimiento || null;
      const dr = diasRestantes(fv);

      let estadoExtra = "";
      if (tipo === "POR_VENCER" && dr !== null) estadoExtra = `${dr} día(s)`;
      if (tipo === "VENCIDO" && dr !== null) estadoExtra = `${Math.abs(dr)} día(s) vencido`;
      if (tipo === "STOCK") {
        estadoExtra = Number(p.StockActual) === 0 ? "SIN STOCK" : "BAJO";
      }

      return `
        <tr>
          <td style="padding:10px;border-bottom:1px solid #eee;">
            <div style="font-weight:600;">${p.Nombre ?? "-"}</div>
            <div style="color:#666;font-size:12px;">SKU: ${p.Sku ?? "-"}</div>
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
            ${p.StockActual ?? "-"}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
            ${p.StockMinimo ?? "-"}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;">
            ${fmtFecha(fv)}
          </td>
          <td style="padding:10px;border-bottom:1px solid #eee;text-align:center;font-weight:600;">
            ${estadoExtra || "-"}
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
  <div style="font-family:Arial, Helvetica, sans-serif;background:#f6f7fb;padding:24px;">
    <div style="max-width:760px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #e9e9e9;">
      <div style="padding:18px 20px;background:#111827;color:#fff;">
        <div style="font-size:18px;font-weight:700;">Sistema Inventario</div>
        <div style="font-size:13px;opacity:.9;">Reporte automático • ${hoyTxt}</div>
      </div>

      <div style="padding:18px 20px;">
        <div style="display:inline-block;background:#f3f4f6;border:1px solid #e5e7eb;padding:6px 10px;border-radius:999px;font-size:12px;font-weight:700;">
          ${config.badge}
        </div>

        <h2 style="margin:12px 0 6px;">${config.titulo}</h2>
        <p style="margin:0 0 14px;color:#444;">${config.descripcion}</p>

        <table style="width:100%;border-collapse:collapse;border:1px solid #eee;border-radius:10px;overflow:hidden;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:10px;text-align:left;border-bottom:1px solid #eee;">Producto</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid #eee;">Stock</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid #eee;">Mínimo</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid #eee;">Vencimiento</th>
              <th style="padding:10px;text-align:center;border-bottom:1px solid #eee;">Estado</th>
            </tr>
          </thead>
          <tbody>
            ${filas}
          </tbody>
        </table>

        <p style="margin:14px 0 0;color:#6b7280;font-size:12px;">
          Este correo fue generado automáticamente por el sistema.
        </p>
      </div>
    </div>
  </div>
  `;

  try {
    await transporter.sendMail({
      from: '"Sistema Inventario" <brandonstuardo433@gmail.com>',
      to: DESTINATARIOS,
      subject: config.subject,
      html,
    });
    console.log("📧 Correo enviado:", config.subject);
  } catch (error) {
    console.error("❌ Error enviando correo:", error);
  }
};
