import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState } from "react";

import Navbar from "./components/layout/Navbar.jsx";
import Sidebar from "./components/layout/Sidebar.jsx";

import Inventario from "./pages/Inventario";
import Productos from "./pages/Productos";
import Alertas from "./pages/Alertas";
import Usuarios from "./pages/Usuarios";
import Pos from "./pages/Pos";
import Transacciones from "./pages/Transacciones";
import Merma from "./pages/Merma";
import Login from "./pages/Login";
import RecuperarPassword from "./pages/RecuperarPassword";
import VerificarCuenta from "./pages/VerificarCuenta";
import RestablecerPassword from "./pages/RestablecerPassword"; 
import ProtectedRoute from "./components/ProtectedRoute";
import "./App.css";

export default function App() {
  
  const [isLogged, setIsLogged] = useState(
    !!sessionStorage.getItem("token")
  );

  const handleLogin = () => {
    setIsLogged(true);
  };

  return (
    <BrowserRouter>
      {isLogged && <Navbar />}

      <div className="layout">
        {isLogged && <Sidebar />}

        <main className="contenido">
          <Routes>

            <Route path="/login" element={isLogged ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Inventario />
                </ProtectedRoute>
              }
            />

            <Route
              path="/productos"
              element={
                <ProtectedRoute>
                  <Productos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/pos"
              element={
                <ProtectedRoute>
                  <Pos />
                </ProtectedRoute>
              }
            />

            <Route
              path="/alertas"
              element={
                <ProtectedRoute>
                  <Alertas />
                </ProtectedRoute>
              }
            />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <Usuarios />
                </ProtectedRoute>
              }
            />

            <Route
              path="/transacciones"
              element={
                <ProtectedRoute>
                  <Transacciones />
                </ProtectedRoute>
              }
            />

            <Route
              path="/merma"
              element={
                <ProtectedRoute>
                  <Merma />
                </ProtectedRoute>
              }
            />

            <Route path="/recuperar" element={<RecuperarPassword />} />
            <Route path="/verificar/:token" element={<VerificarCuenta />} />
            <Route path="/restablecer/:token" element={<RestablecerPassword />} />

            <Route path="*" element={<Login onLogin={handleLogin} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}