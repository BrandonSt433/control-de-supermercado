import cron from "node-cron";
import { Producto } from "../models/Producto.js";
import { enviarCorreoAlerta } from "../utils/alertas.js";

export const iniciarCronJob = () => {

  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("🕗 Revisión diaria: vencimientos y vencidos...");

      try {
        const porVencer = await Producto.obtenerPorVencer();
        if (porVencer.length > 0) {
          await enviarCorreoAlerta(porVencer, "POR_VENCER");
        }

        const vencidos = await Producto.obtenerVencidos();
        if (vencidos.length > 0) {
          await enviarCorreoAlerta(vencidos, "VENCIDO");
        }

        if (porVencer.length === 0 && vencidos.length === 0) {
          console.log("✅ Sin alertas de vencimiento hoy.");
        }
      } catch (error) {
        console.error("❌ Error cron vencimientos:", error);
      }
    },
    { timezone: "America/Santiago" }
  );

  // Cada 15 minutos → stock crítico/0
  cron.schedule(
    "0 8 * * *",
    async () => {
      console.log("📦 Revisión stock: crítico / 0...");

      try {
        const stock = await Producto.obtenerStockBajoOSinStock();
        if (stock.length > 0) {
          await enviarCorreoAlerta(stock, "STOCK");
        } else {
          console.log("✅ Sin stock crítico/0.");
        }
      } catch (error) {
        console.error("❌ Error cron stock:", error);
      }
    },
    { timezone: "America/Santiago" }
  );
};
