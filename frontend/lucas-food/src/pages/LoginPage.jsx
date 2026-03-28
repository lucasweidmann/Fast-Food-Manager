import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
    };
    if (!payload.email || !payload.password) {
      alert("Preencha email e senha");
      return;
    }
    try {
      setLoading(true);
      if (mode === "register") {
        const result = await signUp(payload);
        if (result?.session) {
          navigate("/pdv");
        } else {
          setMode("login");
        }
        return;
      }
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
              {mode === "login"
                ? "Controle seus pedidos, organize sua cozinha e venda com rapidez."
                : "Comece agora e gerencie toda sua operação em um só lugar."}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "register" && (
            <div className="auth-field">
              <label htmlFor="name">Nome</label>
              <input
                id="name"
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
          )}

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
              {loading
                ? "Carregando..."
                : mode === "login"
                  ? "Login"
                  : "Criar conta"}
            </button>
          </div>

          <button
            type="button"
            className="auth-toggle"
            onClick={() =>
              setMode((prev) => (prev === "login" ? "register" : "login"))
            }
            style={{
              marginTop: "0.5rem",
              padding: "0",
              border: "none",
              background: "transparent",
              color: "rgba(255,255,255,0.5)",
              fontWeight: 400,
              fontSize: "0.82rem",
              cursor: "pointer",
              width: "100%",
              textAlign: "center",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.85)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
            }}
          >
            {mode === "login" ? "Criar conta" : "Já tenho conta"}
          </button>
        </form>
      </div>
    </div>
  );
}
