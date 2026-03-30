import { Router } from "express";
import {listarTransacciones,resumenVentas} from "../controllers/transaccionesController.js";

const router = Router();

router.get("/", listarTransacciones);     
router.get("/resumen", resumenVentas);   
export default router;
