import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { api } from "../src/services/api";
import { useAuth } from "../src/contexts/AuthContext";

const C = {
  bg: "#000000",
  stroke: "rgba(255,255,255,0.09)",
  text: "#ffffff",
  text2: "rgba(255,255,255,0.78)",
  text3: "rgba(255,255,255,0.45)",
  accentText: "#4ade80",
};

const STATUS = {
  pendente: {
    label: "Pendente",
    bg: "rgba(245,158,11,0.14)",
    border: "rgba(245,158,11,0.32)",
    color: "#f59e0b",
  },
  preparando: {
    label: "Preparando",
    bg: "rgba(96,165,250,0.14)",
    border: "rgba(96,165,250,0.32)",
    color: "#60a5fa",
  },
  pronto: {
    label: "Pronto",
    bg: "rgba(34,197,94,0.14)",
    border: "rgba(34,197,94,0.32)",
    color: "#4ade80",
  },
  entregue: {
    label: "Entregue",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    color: "rgba(255,255,255,0.45)",
  },
  cancelado: {
    label: "Cancelado",
    bg: "rgba(239,68,68,0.12)",
    border: "rgba(239,68,68,0.28)",
    color: "#ef4444",
  },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadOrders() {
    try {
      const response = await api.get("/orders/my");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Erro ao carregar pedidos", error?.response?.data || error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOrders();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={s.center}>
        <ActivityIndicator color={C.accentText} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.shell}>
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View style={s.header}>
            <View>
              <Text style={s.headerTitle}>Meus Pedidos</Text>
              <Text style={s.headerSub}>
                {orders.length} pedido{orders.length !== 1 ? "s" : ""}
              </Text>
            </View>
            <Pressable
              style={({ pressed }) => [s.chip, pressed && { opacity: 0.7 }]}
              onPress={loadOrders}
            >
              <Text style={s.chipText}>Atualizar</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <Text style={s.empty}>Você ainda não tem pedidos.</Text>
        }
        renderItem={({ item }) => {
          const st = STATUS[item.status] || STATUS.entregue;
          return (
            <View style={s.card}>
              <View style={s.cardTop}>
                <Text style={s.cardId}>#{item.id}</Text>
                <View
                  style={[
                    s.badge,
                    { backgroundColor: st.bg, borderColor: st.border },
                  ]}
                >
                  <Text style={[s.badgeText, { color: st.color }]}>
                    {st.label}
                  </Text>
                </View>
              </View>

              <View style={s.infoRow}>
                <Text style={s.infoLabel}>Cliente</Text>
                <Text style={s.infoValue}>{item.customer_name || "—"}</Text>
              </View>

              {item.order_items?.length > 0 && (
                <View style={s.items}>
                  {item.order_items.map((oi) => (
                    <View key={oi.id} style={s.itemRow}>
                      <Text style={s.itemQty}>{oi.quantity}×</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={s.itemName}>
                          {oi.products?.name || "Produto"}
                        </Text>
                        {oi.notes ? (
                          <Text style={s.itemNotes}>Obs: {oi.notes}</Text>
                        ) : null}
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Total</Text>
                <Text style={s.totalValue}>
                  R$ {Number(item.total).toFixed(2)}
                </Text>
              </View>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: C.bg,
  },
  center: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
    gap: 8,
    paddingBottom: 32,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    color: C.text3,
    marginTop: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: "rgba(255,255,255,0.02)",
  },
  chipText: {
    fontSize: 12,
    color: C.text2,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 14,
    padding: 14,
    gap: 8,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardId: {
    fontSize: 14,
    fontWeight: "700",
    color: C.text,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 12,
    color: C.text3,
  },
  infoValue: {
    fontSize: 12,
    color: C.text2,
  },
  items: {
    gap: 5,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: C.stroke,
  },
  itemRow: {
    flexDirection: "row",
    gap: 8,
    alignItems: "flex-start",
  },
  itemQty: {
    fontSize: 12,
    color: C.text3,
    minWidth: 24,
  },
  itemName: {
    fontSize: 12,
    color: C.text2,
  },
  itemNotes: {
    fontSize: 11,
    color: C.text3,
    marginTop: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: C.stroke,
  },
  totalLabel: {
    fontSize: 12,
    color: C.text3,
  },
  totalValue: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
  },
  empty: {
    color: C.text3,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 40,
  },
});
