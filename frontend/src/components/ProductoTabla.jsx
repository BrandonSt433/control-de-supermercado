import { useEffect, useState } from "react";
import { api } from "../services/api";
import "../styles/tabla.css";

const ProductoTabla = ({ productos, onEdit }) => {
  return (
    <div className="tabla-container">
      <table className="tabla">
        <thead>
          <tr>
            <th>Producto</th>
            <th>Categoría</th>
            <th>Stock</th>
            <th>Fecha Vencimiento</th>
            <th>Acciones</th>
          </tr>
        </thead>

        <tbody>
          {productos.map((p) => (
            <tr key={p.idProducto}>
              <td>{p.Nombre}</td>
              <td>
                {p.CategoriaNombre}
              </td>
              <td className={p.StockActual <= 5 ? "stock-bajo" : "stock-normal"}>
                {p.StockActual}
              </td>

              <td>{new Date(p.fechavencimiento).toLocaleDateString()}</td>

              <td>
                <button
                  className="btn-editar"
                  onClick={() => onEdit(p)}
                >
                  Editar
                </button>
              </td>
            </tr>
          ))}

          {productos.length === 0 && (
            <tr>
              <td colSpan="5" className="vacio">
                No hay productos registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ProductoTabla;