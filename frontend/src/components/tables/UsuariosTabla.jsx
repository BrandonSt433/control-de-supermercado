import React from "react";

const ProductoTabla = ({ usuarios }) => {
  return (
    <table className="min-w-full border rounded-lg shadow-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Nombre</th>
          <th className="p-2 text-left">Rol</th>
          <th className="p-2 text-left">Correo</th>
        </tr>
      </thead>
      <tbody>
        {usuarios.map((p) => (
          <tr key={p.id} className="border-b">
            <td className="p-2">{p.Nombre}</td>
            <td className="p-2">{p.Rol}</td>
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