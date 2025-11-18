import express from "express";
import cors from "cors";
import productosRoutes from "./routes/productos.js";

const app = express();

app.use(cors());
app.use(express.json());

// Rutas
app.use("/api/productos", productosRoutes);

export default app;
