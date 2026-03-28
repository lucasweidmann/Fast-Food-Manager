import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { supabase } from "../lib/supabase";

const columns = [
  {
    key: "pendente",
    title: "Pendentes",
    accent: "rgba(245,158,11,0.18)",
    border: "rgba(245,158,11,0.32)",
  },
  {
    key: "preparando",
    title: "Preparando",
    accent: "rgba(96,165,250,0.14)",
    border: "rgba(96,165,250,0.28)",
  },
  {
    key: "pronto",
    title: "Prontos",
    accent: "rgba(34,197,94,0.12)",
    border: "rgba(34,197,94,0.28)",
  },
];

const nextAction = {
  pendente: { label: "Iniciar preparo", next: "preparando" },
  preparando: { label: "Marcar pronto", next: "pronto" },
  pronto: { label: "Entregue", next: "entregue" },
};

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  function extractArray(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.orders)) return data.orders;
    return [];
  }

  async function loadOrders() {
    try {
      const response = await api.get("/orders");
      setOrders(extractArray(response.data));
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      alert(error?.response?.data?.error || error.message);
      setOrders([]);
    } finally {
      setLoadingPage(false);
    }
  }

  useEffect(() => {
    loadOrders();
    const channel = supabase
      .channel("kitchen-orders-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        loadOrders,
      )
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  async function updateStatus(orderId, status) {
    try {
      setLoadingAction(true);
      await api.patch(`/orders/${orderId}/status`, { status });
      await loadOrders();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert(error?.response?.data?.error || error.message);
    } finally {
      setLoadingAction(false);
    }
  }

  const groupedOrders = useMemo(() => {
    const safe = Array.isArray(orders) ? orders : [];
    return {
      pendente: safe.filter((o) => o.status === "pendente"),
      preparando: safe.filter((o) => o.status === "preparando"),
      pronto: safe.filter((o) => o.status === "pronto"),
    };
  }, [orders]);

  return (
    <div style={{ padding: "18px", display: "grid", gap: "14px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h2 style={{ margin: 0, fontSize: "15px", letterSpacing: "-0.01em" }}>
            Cozinha
          </h2>
          <p
            style={{
              margin: "2px 0 0",
              fontSize: "12px",
              color: "var(--text-3)",
            }}
          >
            {orders.length} pedido{orders.length !== 1 ? "s" : ""} em aberto
          </p>
        </div>
        <button
          className="btn"
          onClick={loadOrders}
          style={{
            fontSize: "12px",
            padding: "7px 14px",
            borderRadius: "12px",
          }}
        >
          Atualizar
        </button>
      </div>

      {loadingPage ? (
        <p style={{ color: "var(--text-3)", fontSize: "13px" }}>
          Carregando...
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "14px",
            alignItems: "start",
          }}
        >
          {columns.map((col) => {
            const colOrders = groupedOrders[col.key] || [];
            return (
              <div key={col.key} className="surface">
                {/* Cabeçalho da coluna */}
                <div
                  style={{
                    padding: "12px 14px",
                    borderBottom: "1px solid var(--stroke)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 600 }}>
                    {col.title}
                  </span>
                  <span
                    style={{
                      fontSize: "11px",
                      padding: "3px 9px",
                      borderRadius: "999px",
                      background: col.accent,
                      border: `1px solid ${col.border}`,
                      color: "var(--text-2)",
                    }}
                  >
                    {colOrders.length}
                  </span>
                </div>

                {/* Cards dos pedidos */}
                <div style={{ padding: "10px", display: "grid", gap: "8px" }}>
                  {colOrders.length === 0 ? (
                    <p
                      style={{
                        textAlign: "center",
                        color: "var(--text-3)",
                        fontSize: "12px",
                        padding: "20px 0",
                      }}
                    >
                      Nenhum pedido
                    </p>
                  ) : (
                    colOrders.map((order) => (
                      <div
                        key={order.id}
                        style={{
                          borderRadius: "12px",
                          border: `1px solid ${col.border}`,
                          background: col.accent,
                          padding: "12px",
                          display: "grid",
                          gap: "8px",
                        }}
                      >
                        {/* Topo do card */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "baseline",
                          }}
                        >
                          <strong style={{ fontSize: "13px" }}>
                            #{order.id}
                          </strong>
                          <span
                            style={{ fontSize: "12px", color: "var(--text-3)" }}
                          >
                            {order.customer_name || "Cliente balcão"}
                          </span>
                        </div>

                        {/* Itens */}
                        <div style={{ display: "grid", gap: "3px" }}>
                          {(Array.isArray(order.order_items)
                            ? order.order_items
                            : []
                          ).map((item) => (
                            <div
                              key={item.id}
                              style={{
                                fontSize: "12px",
                                color: "var(--text-2)",
                                display: "flex",
                                gap: "6px",
                              }}
                            >
                              <span
                                style={{
                                  color: "var(--text-3)",
                                  minWidth: "20px",
                                }}
                              >
                                {item.quantity}×
                              </span>
                              <span>{item.products?.name || "Produto"}</span>
                            </div>
                          ))}
                        </div>

                        {/* Total + ação */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            paddingTop: "6px",
                            borderTop: "1px solid rgba(255,255,255,0.07)",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "12px",
                              fontWeight: 700,
                              color: "var(--accent-2)",
                            }}
                          >
                            R$ {Number(order.total).toFixed(2)}
                          </span>

                          {nextAction[order.status] && (
                            <button
                              className="btn"
                              disabled={loadingAction}
                              onClick={() =>
                                updateStatus(
                                  order.id,
                                  nextAction[order.status].next,
                                )
                              }
                              style={{
                                fontSize: "11px",
                                padding: "5px 12px",
                                borderRadius: "10px",
                                border: `1px solid ${col.border}`,
                                background: "rgba(255,255,255,0.06)",
                              }}
                            >
                              {nextAction[order.status].label}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
