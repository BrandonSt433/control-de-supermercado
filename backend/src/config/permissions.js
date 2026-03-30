export const permisos = {
  Administrador: [
    // Dashboard
    "dashboard:ver",

    // Productos
    "productos:ver",
    "productos:crear",
    "productos:editar",
    "productos:eliminar",
    "productos:alertas",

    // Inventario
    "inventario:ver",
    "inventario:editar",
    "inventario:eliminar",

    // Punto de venta
    "pos:usar",

    // Transacciones
    "transacciones:ver",
    "transacciones:eliminar",

    // Usuarios
    "usuarios:gestionar",
  ],

  Bodeguero: [
    "dashboard:ver",

    "productos:ver",
    "productos:crear",
    "productos:alertas",

    // Si quieres que vea inventario, lo agregas aquí:
    // "inventario:ver",
  ],

  Supervisor: [
    "dashboard:ver",

    "inventario:ver",
    "inventario:editar",

    "transacciones:ver",
  ],

  Cajero: [
    "dashboard:ver",
    "pos:usar",
    "transacciones:ver",
  ],
};
