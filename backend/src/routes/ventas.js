import express from "express";
import { registrarVenta, getVentas } from "../controllers/ventasController.js";

const router = express.Router();

router.post("/", registrarVenta);
router.get("/", getVentas);

export default router;