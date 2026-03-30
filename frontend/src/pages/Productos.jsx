import React, { useEffect, useState } from "react";
import TablaProductos from "../components/tables/ProductosTabla";
import { ModalProducto } from "../components/ModalProducto";
import ModalIngresoProducto from "../components/ModalIngresoProducto";
import ModalCategoria from "../components/ModalCategoria";
import ModalProveedores from "../components/ModalProveedores";
import api from "../services/api";
import "../styles/Producto.css";

import { showSuccess, showError, confirmDelete } from "../utils/alert";

const Productos = () => {
  const [productos, setProductos] = useState([]);

  const [modalProductoOpen, setModalProductoOpen] = useState(false);
  const [modalIngresoOpen, setModalIngresoOpen] = useState(false);
  const [modalCategoriaOpen, setModalCategoriaOpen] = useState(false);
  const [modalProveedoresOpen, setModalProveedoresOpen] = useState(false);

  const [productoEditar, setProductoEditar] = useState(null);

  const cargarProductos = () => {
    api
      .get("/productos")
      .then((res) => setProductos(res.data))
      .catch((err) => {
        console.error("ERROR:", err);
        showError("Error al cargar", "No se pudieron obtener los productos.");
      });
  };

  useEffect(() => {
    cargarProductos();
  }, []);

  const handleNuevoProductoBase = () => {
    setProductoEditar(null);
    setModalProductoOpen(true);
  };

  const handleEditarProductoBase = (producto) => {
    setProductoEditar(producto);
    setModalProductoOpen(true);
  };

  const handleIngresarProducto = () => {
    setModalIngresoOpen(true);
  };

  const handleEliminar = async (id) => {
    try {
      const result = await confirmDelete(
        "Cambiar estado",
        "Esta acción cambiará el ESTADO del producto (Activo/Inactivo)."
      );

      if (!result.isConfirmed) return;

      await api.delete(`/productos/${id}`);
      showSuccess("Estado actualizado", "Se actualizó correctamente.");
      cargarProductos();
    } catch (error) {
      console.error("Error al actualizar:", error);
      showError("Error", "No se pudo actualizar el producto. Revisa la consola.");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        className="header-actions"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
          gap: "12px",
        }}
      >
        <h1 className="title">Listado de Productos</h1>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "flex-end" }}>
          <button
            onClick={() => setModalProveedoresOpen(true)}
            style={btnDark}
          >
            Proveedores
          </button>
          
          <button
            onClick={() => setModalCategoriaOpen(true)}
            style={btnDark}
          >
            + Categoría
          </button>

          <button
            onClick={handleNuevoProductoBase}
            style={btnPrimary}
          >
            + Nuevo Producto
          </button>

          <button
            onClick={handleIngresarProducto}
            style={btnPrimary}
          >
            + Ingresar Producto
          </button>
        </div>
      </div>

      <TablaProductos productos={productos} onEdit={handleEditarProductoBase} onDelete={handleEliminar} />

      <ModalProducto
        isOpen={modalProductoOpen}
        onClose={() => setModalProductoOpen(false)}
        productoAEditar={productoEditar}
        actualizarLista={cargarProductos}
      />
      <ModalIngresoProducto
        isOpen={modalIngresoOpen}
        onClose={() => setModalIngresoOpen(false)}
        actualizarLista={cargarProductos}
      />
      <ModalCategoria
        isOpen={modalCategoriaOpen}
        onClose={() => setModalCategoriaOpen(false)}
      />
      <ModalProveedores
        isOpen={modalProveedoresOpen}
        onClose={() => setModalProveedoresOpen(false)}
      />
    </div>
  );
};

const btnDark = {
  backgroundColor: "#020617",
  color: "#38bdf8",
  padding: "10px 16px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};

const btnPrimary = {
  backgroundColor: "#020617",
  color: "#38bdf8",
  padding: "10px 16px",
  borderRadius: "6px",
  border: "none",
  cursor: "pointer",
  fontWeight: 700,
};

export default Productos;
