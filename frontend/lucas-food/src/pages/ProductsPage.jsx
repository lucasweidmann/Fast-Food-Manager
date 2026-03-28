import { useEffect, useState } from "react";
import { api } from "../services/api";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    category_id: 1,
    name: "",
    description: "",
    price: "",
    image_url: "",
  });
  const [loading, setLoading] = useState(false);

  function extractArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.products)) return data.products;
    return [];
  }

  async function loadProducts() {
    try {
      const response = await api.get("/products?all=true");
      setProducts(extractArray(response.data));
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert(error?.response?.data?.error || error.message);
      setProducts([]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      await api.post("/products", {
        category_id: Number(form.category_id),
        name: form.name,
        description: form.description,
        price: Number(form.price),
        image_url: form.image_url || null,
        active: true,
      });
      setForm({
        category_id: 1,
        name: "",
        description: "",
        price: "",
        image_url: "",
      });
      await loadProducts();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(product) {
    try {
      await api.patch(`/products/${product.id}/active`, {
        active: !product.active,
      });
      await loadProducts();
    } catch (error) {
      console.error("Erro ao alterar produto:", error);
      alert(error?.response?.data?.error || error.message);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const active = products.filter((p) => p.active);
  const inactive = products.filter((p) => !p.active);

  return (
    <div style={{ padding: "18px", display: "grid", gap: "14px" }}>
      {/* Formulário */}
      <div className="surface">
        <div className="section-head">
          <div>
            <h2
              style={{ margin: 0, fontSize: "15px", letterSpacing: "-0.01em" }}
            >
              Novo produto
            </h2>
            <p className="section-sub">Preencha os campos e salve</p>
          </div>
        </div>

        <div style={{ padding: "16px", display: "grid", gap: "12px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
            }}
          >
            <div className="field">
              <label className="label">Categoria ID</label>
              <input
                className="input"
                type="number"
                value={form.category_id}
                onChange={(e) =>
                  setForm({ ...form, category_id: e.target.value })
                }
                style={{ borderRadius: "14px" }}
              />
            </div>

            <div className="field">
              <label className="label">Nome</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{ borderRadius: "14px" }}
              />
            </div>

            <div className="field">
              <label className="label">Descrição</label>
              <input
                className="input"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                style={{ borderRadius: "14px" }}
              />
            </div>

            <div className="field">
              <label className="label">Preço</label>
              <input
                className="input"
                type="number"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                style={{ borderRadius: "14px" }}
              />
            </div>

            <div className="field">
              <label className="label">URL da imagem</label>
              <input
                className="input"
                value={form.image_url}
                onChange={(e) =>
                  setForm({ ...form, image_url: e.target.value })
                }
                style={{ borderRadius: "14px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              style={{
                padding: "10px 24px",
                borderRadius: "14px",
                fontWeight: 600,
                fontSize: "13px",
              }}
            >
              {loading ? "Salvando..." : "Salvar produto"}
            </button>
          </div>
        </div>
      </div>

      {/* Lista de produtos */}
      <div className="surface">
        <div className="section-head">
          <div>
            <h2
              style={{ margin: 0, fontSize: "15px", letterSpacing: "-0.01em" }}
            >
              Produtos
            </h2>
            <p className="section-sub">
              {active.length} ativos · {inactive.length} inativos
            </p>
          </div>
        </div>

        {products.length === 0 ? (
          <p
            className="empty"
            style={{ padding: "32px 16px", textAlign: "center" }}
          >
            Nenhum produto cadastrado.
          </p>
        ) : (
          <div style={{ padding: "8px 0" }}>
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderBottom: "1px solid var(--stroke)",
                  opacity: product.active ? 1 : 0.45,
                  transition: "opacity 0.2s",
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: "13px", display: "block" }}>
                    {product.name}
                  </strong>
                  {product.description && (
                    <span
                      style={{
                        fontSize: "12px",
                        color: "var(--text-3)",
                        display: "block",
                        marginTop: "2px",
                      }}
                    >
                      {product.description}
                    </span>
                  )}
                  <span
                    style={{
                      fontSize: "13px",
                      color: "var(--accent-2)",
                      fontWeight: 700,
                      display: "block",
                      marginTop: "6px",
                    }}
                  >
                    R$ {Number(product.price).toFixed(2)}
                  </span>
                </div>

                <button
                  onClick={() => toggleActive(product)}
                  className="btn"
                  style={{
                    fontSize: "12px",
                    padding: "7px 14px",
                    borderRadius: "12px",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                    ...(product.active
                      ? {
                          borderColor: "rgba(239,68,68,0.28)",
                          background: "rgba(239,68,68,0.08)",
                          color: "var(--text-2)",
                        }
                      : {
                          borderColor: "rgba(34,197,94,0.28)",
                          background: "rgba(34,197,94,0.08)",
                          color: "var(--text-2)",
                        }),
                  }}
                >
                  {product.active ? "Desativar" : "Ativar"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
