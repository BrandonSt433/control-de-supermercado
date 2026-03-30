import React, { useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

export default function ModalCategoria({ isOpen, onClose }) {
  const [Nombre, setNombre] = useState("");
  const [Descripcion, setDescripcion] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!Nombre.trim()) {
      Swal.fire("Error", "Debes ingresar el nombre de la categoría.", "error");
      return;
    }

    try {
      await api.post("/categorias", {
        Nombre: Nombre.trim(),
        Descripcion: Descripcion.trim() || null,
      });

      await Swal.fire({
        icon: "success",
        title: "Categoría creada",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 900,
        timerProgressBar: true,
      });

      setNombre("");
      setDescripcion("");
      onClose();
    } catch (error) {
      console.error("Error creando categoría:", error);
      const msg = error?.response?.data?.error || "Error al crear categoría.";
      Swal.fire("Error", msg, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Crear Categoría</h2>

        <form onSubmit={handleSubmit} style={{ display: "grid", gap: "12px" }}>
          <div>
            <label style={styles.label}>Nombre</label>
            <input
              style={styles.input}
              value={Nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Bebidas"
              required
            />
          </div>

          <div>
            <label style={styles.label}>Descripción (opcional)</label>
            <textarea
              style={styles.textarea}
              value={Descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: Gaseosas, jugos, energéticas..."
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
}

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
    width: "520px",
    maxWidth: "95%",
    color: "#333",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  title: {
    marginBottom: "15px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontWeight: 700,
    fontSize: "0.9rem",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "10px",
    border: "1px solid #d1d5db",
    borderRadius: "6px",
    fontSize: "0.95rem",
    minHeight: "90px",
    boxSizing: "border-box",
    resize: "vertical",
  },
  footer: {
    display: "flex",
    justifyContent: "end",
    gap: "10px",
    marginTop: "8px",
  },
  btnCancel: {
    padding: "10px 18px",
    background: "#e5e7eb",
    color: "#374151",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },
  btnSave: {
    padding: "10px 18px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 700,
  },
};
