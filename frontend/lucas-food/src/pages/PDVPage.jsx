import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export default function PDVPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [loading, setLoading] = useState(false);

  function extractArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.products)) return data.products;
    return [];
  }

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(extractArray(response.data));
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert(error?.response?.data?.error || error.message);
      setProducts([]);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function addToCart(product) {
    setCart((prev) => {
      const existing = prev.find((i) => i.product_id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.id
            ? {
                ...i,
                quantity: i.quantity + 1,
                subtotal: (i.quantity + 1) * i.unit_price,
              }
            : i,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          quantity: 1,
          unit_price: Number(product.price),
          subtotal: Number(product.price),
          notes: "",
        },
      ];
    });
  }

  function increaseQuantity(id) {
    setCart((prev) =>
      prev.map((i) =>
        i.product_id === id
          ? {
              ...i,
              quantity: i.quantity + 1,
              subtotal: (i.quantity + 1) * i.unit_price,
            }
          : i,
      ),
    );
  }

  function decreaseQuantity(id) {
    setCart((prev) =>
      prev
        .map((i) =>
          i.product_id === id
            ? {
                ...i,
                quantity: i.quantity - 1,
                subtotal: (i.quantity - 1) * i.unit_price,
              }
            : i,
        )
        .filter((i) => i.quantity > 0),
    );
  }

  function removeItem(id) {
    setCart((prev) => prev.filter((i) => i.product_id !== id));
  }

  function updateNotes(id, notes) {
    setCart((prev) =>
      prev.map((i) => (i.product_id === id ? { ...i, notes } : i)),
    );
  }

  const total = useMemo(
    () => cart.reduce((sum, i) => sum + i.subtotal, 0),
    [cart],
  );

  const filteredProducts = useMemo(() => {
    if (!Array.isArray(products)) return [];
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, query]);

  async function finalizeOrder() {
    if (cart.length === 0) {
      alert("Adicione itens ao carrinho");
      return;
    }
    try {
      setLoading(true);
      await api.post("/orders", {
        customer_name: customerName || "Cliente balcão",
        payment_method: paymentMethod,
        items: cart.map((i) => ({
          product_id: i.product_id,
          quantity: i.quantity,
          notes: i.notes,
        })),
      });
      setCart([]);
      setCustomerName("");
      setPaymentMethod("pix");
    } catch (error) {
      console.error(error);
      alert(error?.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="grid grid-2"
      style={{ padding: "18px", gap: "14px", alignItems: "start" }}
    >
      {/* Produtos */}
      <div className="surface">
        <div className="section-head">
          <div>
            <h2
              style={{ margin: 0, fontSize: "15px", letterSpacing: "-0.01em" }}
            >
              Produtos
            </h2>
            <p className="section-sub">
              {filteredProducts.length} itens disponíveis
            </p>
          </div>
        </div>

        <div style={{ padding: "12px 16px" }}>
          <input
            className="input"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ borderRadius: "18px" }}
          />
        </div>

        {filteredProducts.length === 0 ? (
          <p className="empty">Nenhum produto encontrado.</p>
        ) : (
          <div className="product-grid">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                className="product-tile"
                onClick={() => addToCart(p)}
              >
                <strong>{p.name}</strong>
                {p.description && <span>{p.description}</span>}
                <em>R$ {Number(p.price).toFixed(2)}</em>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Carrinho */}
      <div className="surface" style={{ position: "sticky", top: "18px" }}>
        <div className="section-head">
          <div>
            <h2
              style={{ margin: 0, fontSize: "15px", letterSpacing: "-0.01em" }}
            >
              Carrinho
            </h2>
            {cart.length > 0 && (
              <p className="section-sub">
                {cart.reduce((s, i) => s + i.quantity, 0)} itens
              </p>
            )}
          </div>
        </div>

        {cart.length === 0 ? (
          <p
            className="empty"
            style={{ textAlign: "center", padding: "32px 16px" }}
          >
            Nenhum item adicionado.
          </p>
        ) : (
          <div className="cart">
            {cart.map((i) => (
              <div key={i.product_id} className="cart-item">
                <div className="cart-row">
                  <div>
                    <strong>{i.name}</strong>
                    <small>
                      R$ {i.unit_price.toFixed(2)} × {i.quantity} = R${" "}
                      {i.subtotal.toFixed(2)}
                    </small>
                  </div>
                  <div className="qty">
                    <button onClick={() => decreaseQuantity(i.product_id)}>
                      −
                    </button>
                    <span>{i.quantity}</span>
                    <button onClick={() => increaseQuantity(i.product_id)}>
                      +
                    </button>
                  </div>
                </div>
                <div className="cart-actions">
                  <input
                    className="input"
                    value={i.notes}
                    onChange={(e) => updateNotes(i.product_id, e.target.value)}
                    style={{
                      fontSize: "12px",
                      padding: "7px 12px",
                      borderRadius: "12px",
                      flex: 1,
                    }}
                  />
                  <button
                    className="btn btn-danger"
                    style={{
                      fontSize: "12px",
                      padding: "7px 12px",
                      borderRadius: "12px",
                      whiteSpace: "nowrap",
                    }}
                    onClick={() => removeItem(i.product_id)}
                  >
                    Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Rodapé do carrinho */}
        <div
          style={{
            padding: "14px 16px",
            borderTop: "1px solid var(--stroke)",
            display: "grid",
            gap: "10px",
          }}
        >
          <div className="field">
            <label className="label">Cliente</label>
            <input
              className="input"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ borderRadius: "14px" }}
            />
          </div>

          <div className="field">
            <label className="label">Pagamento</label>
            <select
              className="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ borderRadius: "14px" }}
            >
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          <div
            className="total"
            style={{ padding: "10px 0 0", border: "none" }}
          >
            <span style={{ color: "var(--text-3)", fontSize: "13px" }}>
              Total
            </span>
            <strong style={{ fontSize: "18px", letterSpacing: "-0.02em" }}>
              R$ {total.toFixed(2)}
            </strong>
          </div>

          <button
            className="btn btn-primary"
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "18px",
              fontSize: "14px",
              fontWeight: 700,
              background: "white",
              color: "#0a0a0a",
              border: "none",
            }}
            onClick={finalizeOrder}
            disabled={loading || cart.length === 0}
          >
            {loading ? "Finalizando..." : "Finalizar pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
