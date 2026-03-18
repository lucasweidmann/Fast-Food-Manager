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

  async function loadProducts() {
    try {
      const response = await api.get("/products?all=true");
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert(error.response?.data?.error || "Erro ao carregar produtos");
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
      alert("Produto criado com sucesso");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      alert(error.response?.data?.error || "Erro ao salvar produto");
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
      alert(error.response?.data?.error || "Erro ao alterar produto");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="page">
      <div className="card">
        <h1 style={{ marginTop: 0, marginBottom: 12, fontSize: 20 }}>Produtos</h1>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginTop: 8,
          }}
        >
          <input
            placeholder="Categoria ID"
            type="number"
            value={form.category_id}
            onChange={(e) => setForm({ ...form, category_id: e.target.value })}
            className="input"
          />

          <input
            placeholder="Nome"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="input"
          />

          <input
            placeholder="Descrição"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="input"
          />

          <input
            placeholder="Preço"
            type="number"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="input"
          />

          <input
            placeholder="URL da imagem"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            className="input"
          />

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? "Salvando..." : "Salvar produto"}
          </button>
        </form>
      </div>

      <div className="card-list">
        {products.map((product) => (
          <div
            key={product.id}
            className="card"
            style={{ display: "flex", justifyContent: "space-between", gap: 12 }}
          >
            <div style={{ maxWidth: "65%" }}>
              <strong>{product.name}</strong>
              <p className="card-item-note" style={{ marginTop: 4 }}>
                {product.description}
              </p>
              <p style={{ marginTop: 6, fontSize: 13 }}>
                R$ {Number(product.price).toFixed(2)}
              </p>
              <p style={{ marginTop: 2, fontSize: 12, color: "var(--text-soft)" }}>
                Status:{" "}
                <span
                  className={`badge badge-status ${
                    product.active ? "badge-status--ready" : "badge-status--canceled"
                  }`}
                >
                  {product.active ? "Ativo" : "Inativo"}
                </span>
              </p>
            </div>

            <button
              onClick={() => toggleActive(product)}
              className="btn btn-outline"
            >
              {product.active ? "Desativar" : "Ativar"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
