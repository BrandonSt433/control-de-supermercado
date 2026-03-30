import { Router } from "express";
import {
  getUsuarios,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  verificarUsuarioPorToken
} from "../controllers/usuariosController.js";

const router = Router();

router.get("/", getUsuarios);
router.post("/", crearUsuario);
router.put("/:id", actualizarUsuario);
router.delete("/:id", eliminarUsuario);
router.post("/verificar/:token", verificarUsuarioPorToken);

export default router;
