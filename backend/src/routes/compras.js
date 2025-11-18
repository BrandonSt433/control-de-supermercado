import express from "express";
import { registrarCompra, getCompras } from "../controllers/comprasController.js";
const router = express.Router();

router.post("/", registrarCompra);
router.get("/", getCompras);

export default router;
