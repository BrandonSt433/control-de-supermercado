import express from "express";
import {login, validarSesion, logout, recuperar, resetPassword } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/validar-sesion", validarSesion);
router.post("/logout", logout);
router.post("/recuperar", recuperar);
router.post("/reset-password", resetPassword);

export default router;