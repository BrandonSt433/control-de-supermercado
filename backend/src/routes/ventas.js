import { Router } from "express";
import { crearVenta, historialVentas } from "../controllers/ventasController.js";

const router = Router();

router.post("/", crearVenta);
router.get("/historial", historialVentas);

export default router;
