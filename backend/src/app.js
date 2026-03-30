import express from "express";
import cors from "cors";
import productosRoutes from "./routes/productos.js";
import proveedoresRoutes from "./routes/proveedores.js"; 
import authRoutes from "./routes/auth.js";
import dashboardRoutes from "./routes/dashboard.js";
import usuariosRouters from "./routes/usuarios.js"
import ventasRoutes from "./routes/ventas.js"
import transaccionesRoutes from "./routes/transacciones.js"
import categoriasRoutes from "./routes/categorias.js";
import comprasRoutes from "./routes/compras.js"; 

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/productos", productosRoutes);
app.use("/api/proveedores", proveedoresRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/usuarios", usuariosRouters);
app.use("/api/ventas", ventasRoutes);
app.use("/api/transacciones", transaccionesRoutes);
app.use("/api/categorias", categoriasRoutes);
app.use("/api/compras", comprasRoutes);

export default app;
