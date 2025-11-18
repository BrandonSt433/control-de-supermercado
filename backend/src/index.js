import app from "./app.js";
import dashboardRoutes from "./routes/dashboard.js"

app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

const PORT = 4000;

app.listen(4000, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

