import {
  BrowserRouter,
  NavLink,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import ProductsPage from "./pages/ProductsPage";
import PDVPage from "./pages/PDVPage";
import KitchenPage from "./pages/KitchenPage";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./contexts/AuthContext";

function AppLayout() {
  const { signOut, user } = useAuth();

  async function handleLogout() {
    try {
      await signOut();
    } catch (error) {
      alert("Erro ao sair");
    }
  }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="brand">
          <img src="/logo-lf.png" alt="Lucas Food" />
          <div className="brand-title">
            <strong>Lucas Food</strong>
            <span>PDV & Operação</span>
          </div>
        </div>

        <nav className="nav">
          <NavLink to="/pdv" end>
            <span>PDV</span>
            <span className="nav-pill">Venda</span>
          </NavLink>

          <NavLink to="/products">
            <span>Produtos</span>
            <span className="nav-pill">Catálogo</span>
          </NavLink>

          <NavLink to="/kitchen">
            <span>Cozinha</span>
            <span className="nav-pill">Kanban</span>
          </NavLink>
        </nav>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="topbar-left">
            <strong>Painel</strong>
            <span className="muted">Operação em tempo real</span>
          </div>

          <div className="topbar-right">
            <div className="user-chip">
              <span className="avatar">
                {user?.email?.charAt(0)?.toUpperCase() || "U"}
              </span>
              <span>{user?.email}</span>
            </div>
            <button className="btn btn-danger" onClick={handleLogout}>
              Sair
            </button>
          </div>
        </header>

        <div className="container">
          <Routes>
            <Route path="/pdv" element={<PDVPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/kitchen" element={<KitchenPage />} />
            <Route path="*" element={<Navigate to="/pdv" replace />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
