import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      email: form.email.trim(),
      password: form.password,
    };
    if (!payload.email || !payload.password) {
      alert("Preencha email e senha");
      return;
    }
    try {
      setLoading(true);
      await signIn(payload);
      navigate("/pdv");
    } catch (error) {
      alert(error.message || "Erro");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand" style={{ textAlign: "center" }}>
          <div className="auth-logo">
            <img
              src="/logo-lf.png"
              alt="Lucas Food"
              className="auth-logo-img"
            />
          </div>
          <div className="auth-title">
            <h1>Lucas Food</h1>
            <p style={{ opacity: 0.7 }}>
              Controle seus pedidos, organize sua cozinha e venda com rapidez.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div style={{ marginTop: "2rem" }}>
            <button
              type="submit"
              className="btn btn-primary auth-submit"
              disabled={loading}
              style={{
                background: "white",
                color: "#1a1a1a",
                border: "none",
              }}
            >
              {loading ? "Carregando..." : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
