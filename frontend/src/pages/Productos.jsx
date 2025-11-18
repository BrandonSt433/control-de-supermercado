import React, { useEffect, useState } from "react";
import ProductoTabla from "../components/ProductoTabla";
import api from "../services/api";

const Productos = () => {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    api.get("/productos")
      .then(res => setProductos(res.data))
      .catch(err => console.log(err));
  }, []);

  const editarProducto = (producto) => {
    console.log("Editando:", producto);
    // Aquí agregamos un modal después si quieres
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ fontSize: "22px", fontWeight: "bold", marginBottom: "15px", color:"white" ,backgroundColor:"black", }}>
        Listado de Productos
      </h1>

      <ProductoTabla productos={productos} onEdit={editarProducto} />
    </div>
  );
};

export default Productos;
