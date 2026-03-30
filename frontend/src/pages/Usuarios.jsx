import { useEffect, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import axios from "axios";
import "../styles/Usuarios.css";

const emptyUser = {
  Nombre: "",
  Run: "",
  NombreUsuario: "",
  Rol: "Bodeguero",
  Correo: "",
  Estado: "Activo",
  Contrasena: "",
};

const limpiarRut = (rut) =>
  (rut || "").replace(/\./g, "").replace(/-/g, "").replace(/\s+/g, "").toUpperCase();

const formatearRut = (rut) => {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return rut;
  const cuerpo = limpio.slice(0, -1);
  const dv = limpio.slice(-1);
  return `${cuerpo}-${dv}`;
};

const esRutValido = (rut) => {
  const limpio = limpiarRut(rut);
  if (limpio.length < 2) return false;

  const cuerpo = limpio.slice(0, -1);
  const dvIngresado = limpio.slice(-1);

  if (!/^[0-9]+$/.test(cuerpo)) return false;

  let suma = 0;
  let multiplicador = 2;

  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador++;
    if (multiplicador > 7) multiplicador = 2;
  }

  const resto = suma % 11;
  const dvCalculadoNum = 11 - resto;
  let dvCalculado;

  if (dvCalculadoNum === 11) dvCalculado = "0";
  else if (dvCalculadoNum === 10) dvCalculado = "K";
  else dvCalculado = String(dvCalculadoNum);

  return dvCalculado === dvIngresado;
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState(emptyUser);
  const [runError, setRunError] = useState("");
  const [mostrarPass, setMostrarPass] = useState(false);

  const cargarUsuarios = async () => {
    try {
      const res = await axios.get("http://localhost:4000/api/usuarios");
      setUsuarios(res.data);
    } catch (error) {
      console.error("Error al cargar usuarios:", error);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const validarRun = (run) => {
    if (!run || run.trim() === "") {
      return "El RUN es obligatorio.";
    }

    if (!/^[0-9kK.\-]+$/.test(run)) {
      return "El RUN solo puede contener números, puntos y guion.";
    }

    if (!esRutValido(run)) {
      return "RUN inválido. Debe tener formato 12345678-9 y ser un RUN chileno válido.";
    }

    const existe = usuarios.some(
      (u) =>
        u.Run &&
        u.Run.trim() === run.trim() &&
        (!editingUser || u.idUsuario !== editingUser.idUsuario)
    );

    if (existe) {
      return "Ya existe un usuario con ese RUN.";
    }

    return "";
  };

  // ABRIR FORMULARIO CREAR
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData(emptyUser);
    setRunError("");
    setMostrarPass(false);
    setShowModal(true);
  };

  // ABRIR FORMULARIO EDITAR
  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      Nombre: u.Nombre || "",
      Run: u.Run || "",
      NombreUsuario: u.NombreUsuario || "",
      Rol: u.Rol || "Bodeguero",
      Correo: u.Correo || "",
      Estado: u.Estado || "Activo",
      Contrasena: "",
    });
    setRunError("");
    setMostrarPass(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData(emptyUser);
    setRunError("");
    setMostrarPass(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "Run") {
      setFormData((prev) => ({ ...prev, Run: value }));
      const msg = validarRun(value);
      setRunError(msg);
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRunBlur = () => {
    setFormData((prev) => ({
      ...prev,
      Run: formatearRut(prev.Run),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const msg = validarRun(formData.Run);
    setRunError(msg);
    if (msg) return;

    try {
      if (editingUser) {
        await axios.put(
          `http://localhost:4000/api/usuarios/${editingUser.idUsuario}`,
          formData
        );
      } else {
        await axios.post("http://localhost:4000/api/usuarios", formData);
      }

      await cargarUsuarios();
      closeModal();
    } catch (error) {
      console.error("Error al guardar usuario:", error);

      const backendMsg = error.response?.data?.error;
      if (backendMsg && backendMsg.includes("RUN")) {
        setRunError(backendMsg);
      } else {
        alert(backendMsg || "Error al guardar el usuario");
      }
    }
  };

  const handleDelete = async (idUsuario) => {
    const confirmar = window.confirm(
      "¿Estás seguro de que quieres eliminar este usuario?"
    );
    if (!confirmar) return;

    try {
      await axios.delete(`http://localhost:4000/api/usuarios/${idUsuario}`);
      await cargarUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      alert("No se pudo eliminar el usuario.");
    }
  };

  return (
    <div className="usuarios-container">
      <div className="usuarios-header">
        <h2 className="usuarios-title">Lista de Usuarios</h2>

        <button
          onClick={openCreateModal}
          style={{
            backgroundColor: "#020617",
            color: "#38bdf8",
            padding: "10px 20px",
            borderRadius: "5px",
            border: "none",
            cursor: "pointer",
            marginBottom: "20px",
          }}
        >
          + Nuevo Usuario
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-user">
            <h3 className="modal-title">
              {editingUser ? "Editar Usuario" : "Nuevo Usuario"}
            </h3>

            <form className="modal-form" onSubmit={handleSubmit}>
              <div className="modal-grid">
                <div className="form-row">
                  <label>Nombre:</label>
                  <input
                    type="text"
                    name="Nombre"
                    value={formData.Nombre}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <label>RUN:</label>
                  <input
                    type="text"
                    name="Run"
                    value={formData.Run}
                    onChange={handleChange}
                    onBlur={handleRunBlur}
                    placeholder="12345678-9"
                    required
                  />
                  {runError && (
                    <span className="error-text">{runError}</span>
                  )}
                </div>

                <div className="form-row">
                  <label>Nombre de usuario:</label>
                  <input
                    type="text"
                    name="NombreUsuario"
                    value={formData.NombreUsuario}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Correo:</label>
                  <input
                    type="email"
                    name="Correo"
                    value={formData.Correo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-row">
                  <label>Rol:</label>
                  <select
                    name="Rol"
                    value={formData.Rol}
                    onChange={handleChange}
                    required
                  >
                    <option value="Administrador">Administrador</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Bodeguero">Bodeguero</option>
                    <option value="Cajero">Cajero</option>
                  </select>
                </div>

                <div className="form-row">
                  <label>Estado:</label>
                  <select
                    name="Estado"
                    value={formData.Estado}
                    onChange={handleChange}
                    required
                  >
                    <option value="Activo">Activo</option>
                    <option value="Inactivo">Inactivo</option>
                  </select>
                </div>

                <div className="form-row full-width">
                  <label>
                    Contraseña{" "}
                    {editingUser && (
                      <span className="hint">
                        (déjala en blanco si no quieres cambiarla)
                      </span>
                    )}
                  </label>
                  <div className="password-wrapper">
                    <input
                      type={mostrarPass ? "text" : "password"}
                      name="Contrasena"
                      value={formData.Contrasena}
                      onChange={handleChange}
                      placeholder={editingUser ? "Nueva contraseña" : "••••••"}
                      required={!editingUser}
                    />
                    <span
                      className="toggle-pass"
                      onClick={() => setMostrarPass(!mostrarPass)}
                    >
                      {mostrarPass ? <AiOutlineEyeInvisible /> : <AiOutlineEye />}
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={closeModal}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {editingUser ? "Guardar cambios" : "Crear usuario"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="usuarios-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre Usuario</th>
            <th>Nombre</th>
            <th>Rol</th>
            <th>Estado</th>
            <th>Correo</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {usuarios.map((u) => (
            <tr key={u.idUsuario}>
              <td>{u.idUsuario}</td>
              <td>{u.NombreUsuario}</td>
              <td>{u.Nombre}</td>
              <td>{u.Rol}</td>
              <td className="estado-cell">
                <span
                  className={
                    u.Estado === "Activo"
                      ? "estado-pill estado-activo"
                      : "estado-pill estado-inactivo"
                  }
                >
                  {u.Estado}
                </span>
              </td>
              <td>{u.Correo}</td>
              <td>
                <button
                  onClick={() => openEditModal(u)}
                  style={styles.editButton}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#1d4ed8")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#2563eb")
                  }
                >
                  Editar
                </button>

                <button
                  onClick={() => handleDelete(u.idUsuario)}
                  style={styles.deleteButton}
                  onMouseOver={(e) =>
                    (e.target.style.backgroundColor = "#b91c1c")
                  }
                  onMouseOut={(e) =>
                    (e.target.style.backgroundColor = "#dc2626")
                  }
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}

          {usuarios.length === 0 && (
            <tr>
              <td colSpan="7" className="vacio">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const styles = {
  statusActive: {
    backgroundColor: "#dcfce7",
    color: "#166534",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    border: "1px solid #bbf7d0",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
    padding: "4px 8px",
    borderRadius: "999px",
    fontSize: "0.75rem",
    fontWeight: "bold",
  },
  editButton: {
    backgroundColor: "#2563eb",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer",
    transition: "background-color 0.2s",
  },
  deleteButton: {
    backgroundColor: "#dc2626",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "4px",
    fontSize: "0.85rem",
    cursor: "pointer",
    marginLeft: "8px",
    transition: "background-color 0.2s",
  },
};
