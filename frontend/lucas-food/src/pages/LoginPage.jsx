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
        const result = await signUp({
          name: payload.name,
          email: payload.email,
          password: payload.password,
        });

        if (result?.session) {
          alert("Conta criada com sucesso");
          navigate("/pdv");
        } else {
          alert(
            "Conta criada. Se a confirmação de email estiver ativa, confirme seu email antes de entrar.",
          );
          setMode("login");
        }

        return;
      }

      await signIn({
        email: payload.email,
        password: payload.password,
      });

      navigate("/pdv");
    } catch (error) {
      console.error(error);

      if (error.message?.includes("rate limit")) {
        alert(
          "Muitas tentativas de envio de email. Espere um pouco ou desative a confirmação de email no Supabase para testar.",
        );
        return;
      }

      alert(error.message || "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-logo">
            <img src="/logo-lf.png" alt="Lucas Food" className="auth-logo-img" />
          </div>
          <div className="auth-title">
            <h1>Lucas Food</h1>
            <p>
              {mode === "login"
                ? "Entre no painel para gerenciar pedidos, cozinha e PDV."
                : "Crie sua conta para começar a vender com o Lucas Food."}
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
                placeholder="Como devemos te chamar?"
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
              placeholder="voce@restaurante.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="auth-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={loading}
          >
            {loading
              ? "Carregando..."
              : mode === "login"
                ? "Entrar no painel"
                : "Criar conta"}
          </button>

          <button
            type="button"
            className="auth-toggle"
            onClick={() =>
              setMode((prev) => (prev === "login" ? "register" : "login"))
            }
          >
            {mode === "login"
              ? "Não tem conta? Cadastre-se"
              : "Já tem conta? Entrar"}
          </button>
        </form>

        <div className="auth-footer">
          <span>Dica para testes rápidos:</span>
          <span>desative a confirmação de email no Supabase.</span>
        </div>
      </div>
    </div>
  );
}
