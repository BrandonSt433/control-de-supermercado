import Swal from "sweetalert2";
import api from "../services/api";

export async function mostrarAlertasInventario() {
  try {
    const [resPorVencer, resVencidos, resStockBajo] = await Promise.all([
      api.get("/dashboard/lista-por-vencer"),
      api.get("/productos/vencidos"),
      api.get("/dashboard/lista-stock-bajo"),
    ]);

    const porVencerData = resPorVencer.data;
    const vencidosData = resVencidos.data;
    const stockBajoData = resStockBajo.data;

    // Si no hay nada en ninguna categoría, NO mostramos nada
    if (
      porVencerData.length === 0 &&
      vencidosData.length === 0 &&
      stockBajoData.length === 0
    ) {
      return;
    }

    let html = "";

    if (stockBajoData.length > 0) {
      html += "<h3>Stock crítico</h3><ul>";
      html += stockBajoData
        .map(
          (p) =>
            `<li><b>${p.Nombre}</b> — Stock actual: ${p.StockActual} (mínimo: ${p.StockMinimo})</li>`
        )
        .join("");
      html += "</ul>";
    }

    if (porVencerData.length > 0) {
      html += "<h3>Próximos a vencer</h3><ul>";
      html += porVencerData
        .map((p) => {
          const fecha =
            p.FechaVencimiento ||
            p.fechavencimiento ||
            "";
          const fechaFmt = fecha
            ? new Date(fecha).toLocaleDateString("es-CL")
            : "-";
          return `<li><b>${p.Nombre}</b> — Stock: ${p.StockActual} — vence el ${fechaFmt}</li>`;
        })
        .join("");
      html += "</ul>";
    }

    if (vencidosData.length > 0) {
      html += "<h3>Productos vencidos</h3><ul>";
      html += vencidosData
        .map((p) => {
          const fecha =
            p.FechaVencimiento ||
            p.fechavencimiento ||
            "";
          const fechaFmt = fecha
            ? new Date(fecha).toLocaleDateString("es-CL")
            : "-";
          return `<li><b>${p.Nombre}</b> — Stock: ${p.StockActual} — vencido desde ${fechaFmt}</li>`;
        })
        .join("");
      html += "</ul>";
    }

    await Swal.fire({
      icon: "warning",
      title: "⚠️ Alertas de inventario",
      html,
    });
  } catch (error) {
    console.error("Error al cargar alertas de inventario:", error);
  }
}
