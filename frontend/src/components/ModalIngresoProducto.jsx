import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import Swal from "sweetalert2";

const initialData = {
  idProducto: "",
  PrecioCompra: 0,
  PrecioVenta: 0,
  StockActual: 0,
  codigoLote: "",
  fechavencimiento: "",
  idProveedor: "",
  Estado: "Activo",
};

export default function ModalIngresoProducto({ isOpen, onClose, actualizarLista }) {
  const [formData, setFormData] = useState(initialData);
  const [productos, setProductos] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [prodRes, provRes] = await Promise.all([
          api.get("/productos"),
          api.get("/proveedores"),
        ]);
        setProductos(prodRes.data || []);
        setProveedores(provRes.data || []);
      } catch (error) {
        console.error("Error al cargar datos de ingreso:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      setFormData(initialData);
      fetchData();
    }
  }, [isOpen]);

  const productoSeleccionado = useMemo(() => {
    const id = Number(formData.idProducto);
    if (!id) return null;
    return productos.find((p) => Number(p.idProducto) === id) || null;
  }, [formData.idProducto, productos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const idProducto = Number(formData.idProducto);
    const precioCompra = Number(formData.PrecioCompra);
    const precioVenta = Number(formData.PrecioVenta);
    const cantidad = Number(formData.StockActual);
    const idProveedor = Number(formData.idProveedor);

    if (!idProducto) {
      Swal.fire("Error", "Debes seleccionar un producto.", "error");
      return;
    }

    if (!idProveedor) {
      Swal.fire("Error", "Debes seleccionar un proveedor.", "error");
      return;
    }

    if (Number.isNaN(precioCompra) || Number.isNaN(precioVenta)) {
      Swal.fire("Error", "Los precios deben ser numéricos.", "error");
      return;
    }
    if (precioCompra < 0 || precioVenta < 0) {
      Swal.fire("Error", "Los precios no pueden ser negativos.", "error");
      return;
    }
    if (precioVenta < precioCompra) {
      Swal.fire("Error", "El precio de venta no puede ser menor al de compra.", "error");
      return;
    }

    if (Number.isNaN(cantidad) || cantidad <= 0) {
      Swal.fire("Error", "La cantidad recibida debe ser mayor a 0.", "error");
      return;
    }

    if (!formData.fechavencimiento) {
      Swal.fire("Error", "Debes ingresar la fecha de vencimiento.", "error");
      return;
    }

    const confirmacion = await Swal.fire({
      title: "¿Confirmar ingreso?",
      html: `Producto: <b>${productoSeleccionado?.Nombre ?? ""}</b><br/>Cantidad: <b>${cantidad}</b><br/>Vence: <b>${formData.fechavencimiento}</b>`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#d33",
      confirmButtonText: "Sí, ingresar",
      cancelButtonText: "Cancelar",
    });

    if (!confirmacion.isConfirmed) return;

    const payload = {
      idProducto,
      PrecioCompra: precioCompra,
      PrecioVenta: precioVenta,
      StockActual: cantidad,
      codigoLote: formData.codigoLote,
      fechavencimiento: formData.fechavencimiento,
      idProveedor, // ✅ requerido
      Estado: formData.Estado,
    };

    try {
      await api.post("/productos/ingreso", payload);

      await Swal.fire({
        icon: "success",
        title: "Ingreso registrado",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1000,
        timerProgressBar: true,
      });

      actualizarLista();
      onClose();
    } catch (error) {
      console.error("Error al ingresar producto:", error);
      const msg = error?.response?.data?.error || "Error al registrar el ingreso.";
      Swal.fire("Error", msg, "error");
    }
  };

  if (!isOpen) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2 style={styles.title}>Ingresar Producto (Recepción)</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={{ gridColumn: "span 2" }}>
            <label style={styles.label}>Producto</label>
            <select
              style={styles.input}
              name="idProducto"
              value={formData.idProducto}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="">-- Seleccione --</option>
              {productos.map((p) => (
                <option key={p.idProducto} value={p.idProducto}>
                  {p.Nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>SKU</label>
            <input style={styles.inputDisabled} value={productoSeleccionado?.Sku || "-"} disabled />
          </div>

          <div>
            <label style={styles.label}>Categoría</label>
            <input style={styles.inputDisabled} value={productoSeleccionado?.Categoria || "-"} disabled />
          </div>

          <div>
            <label style={styles.label}>Precio Compra</label>
            <input
              type="number"
              min="0"
              style={styles.input}
              name="PrecioCompra"
              value={formData.PrecioCompra}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Precio Venta</label>
            <input
              type="number"
              min="0"
              style={styles.input}
              name="PrecioVenta"
              value={formData.PrecioVenta}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Stock Actual (Cantidad recibida)</label>
            <input
              type="number"
              min="1"
              style={styles.input}
              name="StockActual"
              value={formData.StockActual}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Código Lote</label>
            <input
              style={styles.input}
              name="codigoLote"
              value={formData.codigoLote}
              onChange={handleChange}
              placeholder="Ej: LOTE-A1"
            />
          </div>

          <div>
            <label style={styles.label}>Fecha Vencimiento</label>
            <input
              type="date"
              style={styles.input}
              name="fechavencimiento"
              value={formData.fechavencimiento}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label style={styles.label}>Proveedor</label>
            <select
              style={styles.input}
              name="idProveedor"
              value={formData.idProveedor}
              onChange={handleChange}
              disabled={loading}
              required
            >
              <option value="">-- Seleccione --</option>
              {proveedores.map((pr) => (
                <option key={pr.idProveedor} value={pr.idProveedor}>
                  {pr.Nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={styles.label}>Estado</label>
            <select style={styles.input} name="Estado" value={formData.Estado} onChange={handleChange}>
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.btnCancel}>
              Cancelar
            </button>
            <button type="submit" style={styles.btnSave}>
              Registrar ingreso
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
    width: "760px",
    maxWidth: "95%",
    color: "#333",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
  },
  title: {
    marginBottom: "20px",
    borderBottom: "1px solid #eee",
    paddingBottom: "10px",
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
  inputDisabled: {
    width: "100%",
    padding: "10px",
    border: "1px solid #e5e7eb",
    borderRadius: "6px",
    fontSize: "0.95rem",
    background: "#f9fafb",
    color: "#6b7280",
    boxSizing: "border-box",
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
