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
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <h1>Lucas Food</h1>
        <p>{mode === "login" ? "Entrar no sistema" : "Criar conta"}</p>

        {mode === "register" && (
          <input
            type="text"
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            style={styles.input}
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          style={styles.input}
        />

        <input
          type="password"
          placeholder="Senha"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          style={styles.input}
        />

        <button type="submit" style={styles.button} disabled={loading}>
          {loading
            ? "Carregando..."
            : mode === "login"
              ? "Entrar"
              : "Cadastrar"}
        </button>

        <button
          type="button"
          style={styles.linkButton}
          onClick={() =>
            setMode((prev) => (prev === "login" ? "register" : "login"))
          }
        >
          {mode === "login"
            ? "Não tem conta? Cadastre-se"
            : "Já tem conta? Entrar"}
        </button>
      </form>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f4f5",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    background: "#fff",
    borderRadius: 16,
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  input: {
    padding: 12,
    borderRadius: 10,
    border: "1px solid #d4d4d8",
  },
  button: {
    padding: 12,
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: "bold",
  },
  linkButton: {
    padding: 10,
    border: "none",
    background: "transparent",
    cursor: "pointer",
  },
};
