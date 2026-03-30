import React, { useEffect, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

const empty = {
  idProveedor: null,
  Nombre: "",
  Contacto: "",
  Telefono: "",
  Email: "",
  Direccion: "",
};

export default function ModalProveedores({ isOpen, onClose }) {
  const [proveedores, setProveedores] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(false);

  const cargar = async () => {
    try {
      setLoading(true);
      const res = await api.get("/proveedores");
      setProveedores(res.data || []);
    } catch (e) {
      console.error("Error cargando proveedores:", e);
      Swal.fire("Error", "No se pudieron cargar proveedores.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setForm(empty);
      cargar();
    }
  }, [isOpen]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const guardar = async (e) => {
    e.preventDefault();

    if (!form.Nombre.trim()) {
      Swal.fire("Error", "El nombre del proveedor es obligatorio.", "error");
      return;
    }

    const payload = {
      Nombre: form.Nombre.trim(),
      Contacto: form.Contacto.trim() || null,
      Telefono: form.Telefono.trim() || null,
      Email: form.Email.trim() || null,
      Direccion: form.Direccion.trim() || null,
    };

    try {
      if (form.idProveedor) {
        await api.put(`/proveedores/${form.idProveedor}`, payload);
      } else {
        await api.post("/proveedores", payload);
      }

      await Swal.fire({
        icon: "success",
        title: form.idProveedor ? "Proveedor actualizado" : "Proveedor creado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 900,
        timerProgressBar: true,
      });

      setForm(empty);
      cargar();
    } catch (e) {
      console.error("Error guardando proveedor:", e);
      const msg = e?.response?.data?.error || "Error al guardar proveedor.";
      Swal.fire("Error", msg, "error");
    }
  };

  const editar = (p) => {
    setForm({
      idProveedor: p.idProveedor,
      Nombre: p.Nombre || "",
      Contacto: p.Contacto || "",
      Telefono: p.Telefono || "",
      Email: p.Email || "",
      Direccion: p.Direccion || "",
    });
  };

  const cancelarEdicion = () => setForm(empty);

  const eliminar = async (id) => {
    const confirm = await Swal.fire({
      title: "¿Eliminar proveedor?",
      text: "Si está asociado a productos/lotes, no se podrá eliminar.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api.delete(`/proveedores/${id}`);

      await Swal.fire({
        icon: "success",
        title: "Proveedor eliminado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 900,
        timerProgressBar: true,
      });

      cargar();
    } catch (e) {
      console.error("Error eliminando proveedor:", e);
      const msg = e?.response?.data?.error || "Error al eliminar proveedor.";
      Swal.fire("Error", msg, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={styles.title}>Proveedores</h2>
          <button onClick={onClose} style={styles.closeBtn}>✕</button>
        </div>

        <form onSubmit={guardar} style={styles.form}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={styles.label}>Nombre *</label>
            <input style={styles.input} name="Nombre" value={form.Nombre} onChange={onChange} required />
          </div>

          <div>
            <label style={styles.label}>Contacto</label>
            <input style={styles.input} name="Contacto" value={form.Contacto} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>Teléfono</label>
            <input style={styles.input} name="Telefono" value={form.Telefono} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>Email</label>
            <input style={styles.input} name="Email" value={form.Email} onChange={onChange} />
          </div>

          <div>
            <label style={styles.label}>Dirección</label>
            <input style={styles.input} name="Direccion" value={form.Direccion} onChange={onChange} />
          </div>

          <div style={styles.footer}>
            {form.idProveedor ? (
              <button type="button" onClick={cancelarEdicion} style={styles.btnCancel}>
                Cancelar edición
              </button>
            ) : null}

            <button type="submit" style={styles.btnSave}>
              {form.idProveedor ? "Actualizar" : "Crear"}
            </button>
          </div>
        </form>

        <div style={styles.list}>
          <h3 style={{ margin: "12px 0", color: "#111827" }}>Lista</h3>

          {loading ? (
            <p style={{ color: "#6b7280" }}>Cargando...</p>
          ) : proveedores.length === 0 ? (
            <p style={{ color: "#6b7280" }}>No hay proveedores.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Nombre</th>
                    <th style={styles.th}>Contacto</th>
                    <th style={styles.th}>Teléfono</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Dirección</th>
                    <th style={{ ...styles.th, textAlign: "right" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {proveedores.map((p) => (
                    <tr key={p.idProveedor} style={styles.tr}>
                      <td style={styles.td}>{p.Nombre}</td>
                      <td style={styles.td}>{p.Contacto || "-"}</td>
                      <td style={styles.td}>{p.Telefono || "-"}</td>
                      <td style={styles.td}>{p.Email || "-"}</td>
                      <td style={styles.td}>{p.Direccion || "-"}</td>
                      <td style={{ ...styles.td, textAlign: "right" }}>
                        <button onClick={() => editar(p)} style={styles.btnEdit}>Editar</button>
                        <button onClick={() => eliminar(p.idProveedor)} style={styles.btnDel}>Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  modal: {
    background: "white",
    width: "980px",
    maxWidth: "96%",
    borderRadius: "10px",
    padding: "20px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  title: {
    margin: 0,
    paddingBottom: "10px",
    borderBottom: "1px solid #eee",
  },
  closeBtn: {
    background: "#1f2020ff",
    border: "none",
    borderRadius: "8px",
    padding: "8px 10px",
    cursor: "pointer",
    fontWeight: 800,
  },
  form: {
    marginTop: "14px",
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  label: {
    display: "block",
    fontWeight: 700,
    fontSize: "0.88rem",
    marginBottom: "6px",
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
  footer: {
    gridColumn: "span 2",
    display: "flex",
    justifyContent: "end",
    gap: "10px",
    marginTop: "4px",
  },
  btnCancel: {
    padding: "10px 14px",
    background: "#e5e7eb",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 800,
  },
  btnSave: {
    padding: "10px 14px",
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: 800,
  },
  list: { marginTop: "16px" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    border: "1px solid #e5e7eb",
    borderRadius: "8px",
    overflow: "hidden",
  },
  th: {
    textAlign: "left",
    background: "#f9fafb",
    padding: "10px",
    fontSize: "0.8rem",
    color: "#374151",
    borderBottom: "1px solid #e5e7eb",
  },
  tr: { borderBottom: "1px solid #e5e7eb" },
  td: { padding: "10px", fontSize: "0.9rem", color: "#111827" },
  btnEdit: {
    background: "#2563eb",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700,
  },
  btnDel: {
    background: "#dc2626",
    color: "white",
    border: "none",
    borderRadius: "6px",
    padding: "6px 10px",
    cursor: "pointer",
    fontWeight: 700,
    marginLeft: "8px",
  },
};
