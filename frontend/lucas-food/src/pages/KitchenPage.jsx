import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";
import { supabase } from "../lib/supabase";

const columns = [
  { key: "pendente", title: "Pendentes" },
  { key: "preparando", title: "Preparando" },
  { key: "pronto", title: "Prontos" },
];

export default function KitchenPage() {
  const [orders, setOrders] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);

  async function loadOrders() {
    try {
      const response = await api.get("/orders");
      setOrders(response.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      alert(error.response?.data?.error || "Erro ao carregar pedidos");
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
        {
          event: "*",
          schema: "public",
          table: "orders",
        },
        async () => {
          await loadOrders();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function updateStatus(orderId, status) {
    try {
      setLoadingAction(true);
      await api.patch(`/orders/${orderId}/status`, { status });
      await loadOrders();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      alert(error.response?.data?.error || "Erro ao atualizar status");
    } finally {
      setLoadingAction(false);
    }
  }

  const groupedOrders = useMemo(() => {
    return {
      pendente: orders.filter((order) => order.status === "pendente"),
      preparando: orders.filter((order) => order.status === "preparando"),
      pronto: orders.filter((order) => order.status === "pronto"),
    };
  }, [orders]);

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Cozinha</h1>
          <p>Pedidos atualizando em tempo real</p>
        </div>

        <button onClick={loadOrders} className="btn btn-ghost">
          Atualizar
        </button>
      </div>

      {loadingPage ? (
        <div className="card card-muted">Carregando...</div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
            gap: 16,
          }}
        >
          {columns.map((column) => (
            <div key={column.key} className="card">
              <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 16 }}>
                {column.title} ({groupedOrders[column.key].length})
              </h2>

              <div className="card-list">
                {groupedOrders[column.key].length === 0 && (
                  <div className="card-empty">Nenhum pedido</div>
                )}

                {groupedOrders[column.key].map((order) => (
                  <div key={order.id} className="card" style={{ padding: 14 }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                        marginBottom: 10,
                      }}
                    >
                      <strong>Pedido #{order.id}</strong>
                      <span>{order.customer_name || "Cliente balcão"}</span>
                    </div>

                    <div className="card-items" style={{ borderTop: "none" }}>
                      {order.order_items?.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 2,
                          }}
                        >
                          <span>
                            {item.quantity}x {item.products?.name || "Produto"}
                          </span>

                          {item.notes ? (
                            <small className="card-item-note">
                              Obs: {item.notes}
                            </small>
                          ) : null}
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        fontWeight: "bold",
                        marginTop: 10,
                        marginBottom: 10,
                      }}
                    >
                      Total: R$ {Number(order.total).toFixed(2)}
                    </div>

                    <div style={{ display: "flex" }}>
                      {order.status === "pendente" && (
                        <button
                          disabled={loadingAction}
                          className="btn btn-primary"
                          style={{ width: "100%" }}
                          onClick={() => updateStatus(order.id, "preparando")}
                        >
                          Iniciar preparo
                        </button>
                      )}

                      {order.status === "preparando" && (
                        <button
                          disabled={loadingAction}
                          className="btn btn-primary"
                          style={{ width: "100%" }}
                          onClick={() => updateStatus(order.id, "pronto")}
                        >
                          Marcar como pronto
                        </button>
                      )}

                      {order.status === "pronto" && (
                        <button
                          disabled={loadingAction}
                          className="btn btn-primary"
                          style={{ width: "100%" }}
                          onClick={() => updateStatus(order.id, "entregue")}
                        >
                          Entregue
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
