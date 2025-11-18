import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Inventario from "./pages/Inventario";
import Productos from "./pages/Productos";
import Alertas from "./pages/Alertas";
import "./App.css"

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div className="layout">
        <Sidebar />
        <main className="content">
          <Routes>
            <Route path="/" element={<Inventario />} />
            <Route path="/productos" element={<Productos />} />
            <Route path="/alertas" element={<Alertas />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
