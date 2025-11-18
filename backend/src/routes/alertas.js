import express from "express";
import { getAlertasPendientes, marcarAtendida } from "../controllers/alertasController.js";
const router = express.Router();

router.get("/", getAlertasPendientes);
router.put("/:id", marcarAtendida);

export default router;
