import { Router } from "express";
import {
  getProductos,
  getProductosVencidos,
  getProductosPorVencer,
  crearProductoBase,
  ingresarProducto,
  actualizarProducto,
  eliminarProducto,
} from "../controllers/productosController.js";

const router = Router();

router.get("/", getProductos);
router.get("/vencidos", getProductosVencidos);
router.get("/por-vencer", getProductosPorVencer);
router.post("/", crearProductoBase);
router.post("/ingreso", ingresarProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

export default router;