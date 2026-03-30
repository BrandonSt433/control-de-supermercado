import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

const initialData = {
  Nombre: "",
  Sku: "",
  idCategoria: "",
  StockMinimo: 0,
};

export const ModalProducto = ({ isOpen, onClose, productoAEditar, actualizarLista }) => {
  const [formData, setFormData] = useState(initialData);
  const [categorias, setCategorias] = useState([]);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const res = await api.get("/categorias");
        setCategorias(res.data || []);
      } catch (error) {
        console.error("Error al cargar categorías:", error);
      }
    };

    if (isOpen) fetchCategorias();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (productoAEditar) {
      let idCat = productoAEditar.idCategoria ?? "";

      // por si viene solo Categoria (string) y no idCategoria:
      if (!idCat && productoAEditar.Categoria && categorias.length > 0) {
        const cat = categorias.find((c) => c.Nombre === productoAEditar.Categoria);
        if (cat) idCat = cat.idCategoria;
      }

      setFormData({
        Nombre: productoAEditar.Nombre ?? "",
        Sku: productoAEditar.Sku ?? "",
        idCategoria: idCat || "",
        StockMinimo: productoAEditar.StockMinimo ?? 0,
      });
    } else {
      setFormData(initialData);
    }
  }, [productoAEditar, isOpen, categorias]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.Nombre.trim()) {
      Swal.fire("Error", "Debes ingresar el nombre.", "error");
      return;
    }

    if (!formData.Sku.trim()) {
      Swal.fire("Error", "Debes ingresar el SKU.", "error");
      return;
    }

    if (!formData.idCategoria) {
      Swal.fire("Error", "Debes seleccionar una categoría.", "error");
      return;
    }

    const payload = {
      Nombre: formData.Nombre.trim(),
      Sku: formData.Sku.trim(),
      idCategoria: Number(formData.idCategoria),
      StockMinimo: Number(formData.StockMinimo ?? 0),
    };

    try {
      if (productoAEditar) {
        await api.put(`/productos/${productoAEditar.idProducto}`, payload);
      } else {
        await api.post("/productos", payload);
      }

      await Swal.fire({
        icon: "success",
        title: productoAEditar ? "Producto actualizado" : "Producto creado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 900,
        timerProgressBar: true,
      });

      actualizarLista();
      onClose();
    } catch (error) {
      console.error("Error al guardar producto base:", error);
      const msg = error?.response?.data?.error || "Error al guardar.";
      Swal.fire("Error", msg, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>
          {productoAEditar ? "Editar Producto (Catálogo)" : "Nuevo Producto (Catálogo)"}
        </h2>

        <p style={styles.help}>
          Este paso solo crea el producto base. Se guardará con <b>StockActual = 0</b> y <b>Estado = Inactivo</b>.
          Luego usa <b>“Ingresar Producto”</b> para recepcionar y crear lote.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={styles.label}>Nombre del producto</label>
            <input
              style={styles.input}
              name="Nombre"
              value={formData.Nombre}
              onChange={handleChange}
              required
              placeholder="Ej: Coca Cola 3L"
            />
          </div>

          <div>
            <label style={styles.label}>SKU</label>
            <input
              style={styles.input}
              name="Sku"
              value={formData.Sku}
              onChange={handleChange}
              required
              placeholder="Código de barras"
            />
          </div>

          <div>
            <label style={styles.label}>Categoría</label>
            <select
              style={styles.input}
              name="idCategoria"
              value={formData.idCategoria || ""}
              onChange={handleChange}
              required
            >
              <option value="">-- Seleccione --</option>
              {categorias.map((cat) => (
                <option key={cat.idCategoria} value={cat.idCategoria}>
                  {cat.Nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{ gridColumn: "span 2" }}>
            <label style={styles.label}>Stock mínimo</label>
            <input
              type="number"
              min="0"
              style={styles.input}
              name="StockMinimo"
              value={formData.StockMinimo}
              onChange={handleChange}
            />
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.btnCancel}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnSave}>
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: "white",
    padding: "25px",
    borderRadius: "10px",
    width: "650px",
    maxWidth: "95%",
    color: "#333",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  title: {
    marginBottom: "10px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  help: {
    fontSize: "0.9rem",
    color: "#4b5563",
    marginBottom: "15px",
    lineHeight: 1.35,
  },
  form: {
    display: "grid",
    gap: "15px",
    gridTemplateColumns: "1fr 1fr",
    alignItems: "end",
  },
  label: {
    display: "block",
    marginBottom: "5px",
    fontWeight: "600",
    fontSize: "0.9rem",
    color: "#4b5563",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    boxSizing: "border-box",
    outline: "none",
  },
  footer: {
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "end",
    gap: "10px",
    marginTop: "10px",
  },
  btnCancel: {
    padding: "10px 20px",
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
  btnSave: {
    padding: "10px 20px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
