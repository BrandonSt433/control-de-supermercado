import { Producto } from "../models/Producto.js";

// Cargar productos
export const getProductos = async (req, res) => {
  try {
    const productos = await Producto.getAll();
    res.json(productos);
  } catch (error) {
    console.error("ERROR en getProductos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
};
