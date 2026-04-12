import { Navigate, Route, Routes } from "react-router-dom";
import Catalogo from "./pages/Catalogo.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="*" element={<Navigate to="/catalogo" replace />} />
    </Routes>
  );
}
