import React from "react";

const TablaProductos = ({ productos, onEdit, onDelete }) => {
  
  if (!productos || productos.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <p>No hay productos registrados aún.</p>
      </div>
    );
  }

  return (
    <div style={styles.tableContainer}>
      <table style={styles.table}>
        <thead>
          <tr style={styles.headerRow}>
            <th style={styles.th}>Producto</th>
            <th style={styles.th}>Categoría</th>
            <th style={{...styles.th, textAlign: 'center'}}>Stock</th>
            <th style={{...styles.th, textAlign: 'center'}}>Stock Mínimo</th>
            <th style={{...styles.th, textAlign: 'center'}}>Precio Venta</th>
            <th style={styles.th}>Vencimiento</th>
            <th style={{...styles.th, textAlign: 'center'}}>Estado</th>
            <th style={{...styles.th, textAlign: 'right'}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {productos.map((p) => (
            <tr key={p.idProducto} style={styles.row}>
              
              <td style={styles.td}>
                <div style={styles.productInfo}>
                  <span style={styles.productName}>{p.Nombre}</span>
                  <span style={styles.productSku}>SKU: {p.Sku}</span>
                </div>
              </td>

              <td style={styles.td}>
                {p.Categoria || <span style={{color: '#9ca3af', fontStyle: 'italic'}}>Sin Cat.</span>}
              </td>

              <td style={{...styles.td, textAlign: 'center'}}>
                <span style={p.StockActual <= p.StockMinimo ? styles.badgeRed : styles.badgeBlue}>
                  {p.StockActual} u.
                </span>
              </td>
              
              <td style={{...styles.td, textAlign: 'center'}}>
                <span style={styles.badgeAmar}>
                  {p.StockMinimo} u.
                </span>
              </td>

              <td style={{...styles.td, textAlign: 'center'}}>
                <span >
                  {p.PrecioVenta}
                </span>
              </td>

              <td style={styles.td}>
                {p.fechavencimiento 
                  ? new Date(p.fechavencimiento).toLocaleDateString() 
                  : "-"}
              </td>

              <td style={{...styles.td, textAlign: 'center'}}>
                 <span style={p.Estado === 'Activo' ? styles.statusActive : styles.statusInactive}>
                    {p.Estado || 'Activo'}
                 </span>
              </td>

              <td style={{...styles.td, textAlign: 'right'}}>
                
                <button
                  onClick={() => onEdit(p)}
                  style={styles.editButton}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
                >
                  Editar
                </button>

                <button
                  onClick={() => onDelete(p.idProducto)}
                  style={styles.deleteButton}
                  onMouseOver={(e) => e.target.style.backgroundColor = '#b91c1c'}
                  onMouseOut={(e) => e.target.style.backgroundColor = '#dc2626'}
                >
                  Cambiar Estado
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const styles = {
  tableContainer: {
    overflow: 'hidden',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    border: '1px solid #e5e7eb',
    backgroundColor: 'white',
    marginTop: '20px'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontFamily: 'sans-serif',
  },
  headerRow: {
    backgroundColor: '#f9fafb',
    borderBottom: '2px solid #e5e7eb',
  },
  th: {
    padding: '12px 15px',
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  row: {
    borderBottom: '1px solid #e5e7eb',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '12px 15px',
    fontSize: '0.9rem',
    color: '#1f2937',
    verticalAlign: 'middle',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  productName: {
    fontWeight: 'bold',
    fontSize: '0.95rem',
    color: '#111827',
  },
  productSku: {
    fontSize: '0.75rem',
    color: '#6b7280',
  },
  badgeBlue: {
    backgroundColor: '#dbeafe',
    color: '#1e40af',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  badgeRed: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  badgeAmar: {
    backgroundColor: '#e9f337ff',
    color: '#000000ff',
    padding: '4px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600',
  },
  statusActive: {
    backgroundColor: '#dcfce7',
    color: '#161f65ff',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: 'bold',
    border: '1px solid #bbf7d0'
  },
  statusInactive: {
    backgroundColor: '#fee2e2',
    color: '#b91c1c',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
  },
  editButton: {
    backgroundColor: '#2563eb', 
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  deleteButton: {
    backgroundColor: '#dc2626',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    fontSize: '0.85rem',
    cursor: 'pointer',
    marginLeft: '8px',
    transition: 'background-color 0.2s',
  },
  emptyContainer: {
    padding: '40px',
    textAlign: 'center',
    color: '#6b7280',
    backgroundColor: 'white',
    borderRadius: '8px',
    border: '1px solid #e5e7eb',
    marginTop: '20px'
  }
};

export default TablaProductos;