import { useEffect, useState } from "react";
import { api } from "../services/api";
import { supabase } from "../lib/supabase";

function getStatusLabel(status) {
  switch (status) {
    case "pendente":
      return "Pendente";
    case "preparando":
      return "Preparando";
    case "pronto":
      return "Pronto";
    case "entregue":
      return "Entregue";
    case "cancelado":
      return "Cancelado";
    default:
      return status;
  }
}

function getStatusColor(status) {
  switch (status) {
    case "pendente":
      return "#f59e0b";
    case "preparando":
      return "#3b82f6";
    case "pronto":
      return "#10b981";
    case "entregue":
      return "#6b7280";
    case "cancelado":
      return "#ef4444";
    default:
      return "#111827";
  }
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const response = await api.get("/orders/my");
      setOrders(response.data);
    } catch (error) {
      console.error("Erro ao carregar pedidos:", error);
      alert(error.response?.data?.error || "Erro ao carregar pedidos");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();

    const channel = supabase
      .channel("web-my-orders-realtime")
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

  return (
    <div className="page">
      <div className="page-header">
        <div className="page-header-title">
          <h1>Meus pedidos</h1>
          <p>Acompanhe os pedidos da sua conta</p>
        </div>

        <button onClick={loadOrders} className="btn btn-ghost">
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="card card-muted">Carregando...</div>
      ) : orders.length === 0 ? (
        <div className="card card-muted">Você ainda não tem pedidos</div>
      ) : (
        <div className="card-list">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="card-row">
                <div>
                  <h3 style={{ margin: 0 }}>Pedido #{order.id}</h3>
                  <p className="card-item-note">
                    Cliente: {order.customer_name || "Cliente"}
                  </p>
                </div>

                <span
                  className={`badge badge-pill badge-status`}
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div className="meta-row">
                <span>Pagamento: {order.payment_method || "-"}</span>
                <strong>Total: R$ {Number(order.total).toFixed(2)}</strong>
              </div>

              <div className="card-items">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="card-item">
                    <div>
                      <strong>
                        {item.quantity}x {item.products?.name || "Produto"}
                      </strong>
                      {item.notes ? (
                        <p className="card-item-note">Obs: {item.notes}</p>
                      ) : null}
                    </div>

                    <span>R$ {Number(item.subtotal).toFixed(2)}</span>
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
