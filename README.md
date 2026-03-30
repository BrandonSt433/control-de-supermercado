Sistema de Control de Supermercado

Descripción
Proyecto de ingeniería enfocado en la gestión de inventarios y control de stock en tiempo real con notifiacion y correos automaticos segun el bajo stock. 

Stack Tecnológico Realizado

Frontend: React, Tailwind CSS y algo de Bootstrap
Backend: Node.js nativo. Manejé las rutas y la lógica sin Express.
Base de Datos: MySQL para tener todo bien relacionado (tablas de productos, usuarios, etc.).
Gráficos: Usé Recharts para mostrar el estado del stock de forma visual.
Seguridad: Las claves están hasheadas con Bcrypt y usé JWT (JSON Web Tokens) para que nadie entre a las rutas si no está logueado.

Funcionalidades Destacadas

Dashboard: Apenas entras, ves gráficos que te dicen qué falta, porcentaje de porductos bajos, productos en mermas, etc.
Alertas de Stock: Si un producto baja de 10 unidades o dependiendo de cuanto le asigne el administrador , el sistema te avisa. 
Si llega a 0, se bloquea la venta pero no se borra (Borrado Lógico), así no perdemos el historial.
Login Seguro: Nadie pasa si no tiene su Token de seguridad al día.
