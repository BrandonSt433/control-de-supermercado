import app from "./app.js";
import { iniciarCronJob } from "./cron/cronJob.js";

app.get("/", (req, res) => {
  res.send("Servidor funcionando correctamente");
});

const PORT = 4000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  
  iniciarCronJob(); 
});

