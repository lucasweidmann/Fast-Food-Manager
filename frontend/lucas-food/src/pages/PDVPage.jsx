import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

export default function PDVPage() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [query, setQuery] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
      alert(error.response?.data?.error || "Erro ao carregar produtos");
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function addToCart(product) {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product_id === product.id,
      );

      if (existingItem) {
        return prevCart.map((item) =>
          item.product_id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.unit_price,
              }
            : item,
        );
      }

      return [
        ...prevCart,
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

  function increaseQuantity(productId) {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId
          ? {
              ...item,
              quantity: item.quantity + 1,
              subtotal: (item.quantity + 1) * item.unit_price,
            }
          : item,
      ),
    );
  }

  function decreaseQuantity(productId) {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product_id === productId
            ? {
                ...item,
                quantity: item.quantity - 1,
                subtotal: (item.quantity - 1) * item.unit_price,
              }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function removeItem(productId) {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product_id !== productId),
    );
  }

  function updateNotes(productId, notes) {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product_id === productId ? { ...item, notes } : item,
      ),
    );
  }

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.subtotal, 0),
    [cart],
  );

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart],
  );

  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const name = String(p.name || "").toLowerCase();
      const desc = String(p.description || "").toLowerCase();
      return name.includes(q) || desc.includes(q);
    });
  }, [products, query]);

  async function finalizeOrder() {
    if (cart.length === 0) {
      alert("Adicione itens no carrinho");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        customer_name: customerName || "Cliente balcão",
        payment_method: paymentMethod,
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          notes: item.notes,
        })),
      };

      await api.post("/orders", payload);

      alert("Pedido criado com sucesso");
      setCart([]);
      setCustomerName("");
      setPaymentMethod("pix");
    } catch (error) {
      console.error("Erro ao finalizar pedido:", error);
      alert(error.response?.data?.error || "Erro ao finalizar pedido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-2">
      <section className="surface surface-flat">
        <div className="section-head">
          <div>
            <h1>PDV</h1>
            <div className="section-sub">
              Busque, selecione e adicione produtos ao pedido.
            </div>
          </div>

          <div className="kpis">
            <span className="kpi">{products.length} produtos</span>
            <span className="kpi">{totalItems} itens no carrinho</span>
          </div>
        </div>

        <div style={{ padding: "12px 16px 0" }}>
          <div className="field">
            <span className="label">Buscar produtos</span>
            <input
              className="input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Digite nome ou descrição…"
            />
          </div>
        </div>

        <div className="product-grid">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              className="product-tile"
              type="button"
              onClick={() => addToCart(product)}
            >
              <strong>{product.name}</strong>
              <span>{product.description}</span>
              <em>R$ {Number(product.price).toFixed(2)}</em>
            </button>
          ))}

          {filteredProducts.length === 0 && (
            <div className="empty">
              Nenhum produto encontrado para a busca. Tente outro termo.
            </div>
          )}
        </div>
      </section>

      <section className="surface surface-flat">
        <div className="section-head">
          <div>
            <h2>Carrinho</h2>
            <div className="section-sub">Revise o pedido antes de finalizar.</div>
          </div>

          <div className="kpis">
            <span className="kpi">Pagamento: {paymentMethod}</span>
            <span className="kpi">Total: R$ {total.toFixed(2)}</span>
          </div>
        </div>

        <div className="cart">
          <div className="field">
            <span className="label">Cliente</span>
            <input
              className="input"
              type="text"
              placeholder="Nome do cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
            />
          </div>

          <div className="field" style={{ marginTop: 10 }}>
            <span className="label">Pagamento</span>
            <select
              className="select"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
            </select>
          </div>

          <div className="divider" />

          {cart.length === 0 ? (
            <div className="muted" style={{ fontSize: 13 }}>
              Nenhum item no carrinho.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product_id} className="cart-item">
                <div className="cart-row">
                  <div>
                    <strong>{item.name}</strong>
                    <small>
                      {item.quantity} x R$ {item.unit_price.toFixed(2)} • Subtotal
                      {" "}R$ {item.subtotal.toFixed(2)}
                    </small>
                  </div>

                  <div className="qty">
                    <button
                      type="button"
                      onClick={() => decreaseQuantity(item.product_id)}
                      aria-label="Diminuir"
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      onClick={() => increaseQuantity(item.product_id)}
                      aria-label="Aumentar"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="cart-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => removeItem(item.product_id)}
                  >
                    Remover
                  </button>
                  <span className="pill">Obs:</span>
                  <input
                    className="input"
                    style={{ flex: 1, minWidth: 160 }}
                    type="text"
                    placeholder="ex: sem cebola"
                    value={item.notes}
                    onChange={(e) => updateNotes(item.product_id, e.target.value)}
                  />
                </div>
              </div>
            ))
          )}
        </div>

        <div className="total">
          <div>
            <div className="muted" style={{ fontSize: 12 }}>
              Total do pedido
            </div>
            <strong>R$ {total.toFixed(2)}</strong>
          </div>
          <button
            type="button"
            onClick={finalizeOrder}
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? "Finalizando..." : "Finalizar pedido"}
          </button>
        </div>
      </section>
    </div>
  );
}
