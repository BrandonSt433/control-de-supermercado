import React from "react";

const ProductoTabla = ({ productos }) => {
  return (
    <table className="min-w-full border rounded-lg shadow-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Producto</th>
          <th className="p-2 text-left">Stock</th>
          <th className="p-2 text-left">Acciones</th>
        </tr>
      </thead>
      <tbody>
        {productos.map((p) => (
          <tr key={p.id} className="border-b">
            <td className="p-2">{p.nombre}</td>
            <td className="p-2">{p.stock}</td>
            <td className="p-2">
              <button className="px-3 py-1 bg-blue-500 text-white rounded">
                Editar
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductoTabla;
