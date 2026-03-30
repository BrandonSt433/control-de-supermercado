import { Router } from "express";
import {
  getProveedores,
  crearProveedor,
  actualizarProveedor,
  eliminarProveedor,
} from "../controllers/proveedoresController.js";

const router = Router();

router.get("/", getProveedores);
router.post("/", crearProveedor);
router.put("/:id", actualizarProveedor);
router.delete("/:id", eliminarProveedor);

export default router;
