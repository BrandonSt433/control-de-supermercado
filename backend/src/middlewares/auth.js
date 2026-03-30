import jwt from "jsonwebtoken";

export function verificarToken(req, res, next) {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ mensaje: "Acceso denegado. Falta token." });

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, "SECRET");
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ mensaje: "Token inválido." });
  }
}
