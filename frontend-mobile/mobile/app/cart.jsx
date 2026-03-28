import { useMemo, useState } from "react";
import {
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
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

export default function CartPage() {
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const initialCart = params.cart ? JSON.parse(params.cart) : [];

  const [cart, setCart] = useState(initialCart);
  const [loading, setLoading] = useState(false);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + item.unit_price * item.quantity, 0),
    [cart],
  );

  function increase(productId) {
    setCart((prev) =>
      prev.map((item) =>
        item.product_id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      ),
    );
  }

  function decrease(productId) {
    setCart((prev) =>
      prev
        .map((item) =>
          item.product_id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  async function finishOrder() {
    if (!cart.length) {
      return;
    }
    try {
      setLoading(true);
      await api.post("/orders", {
        customer_name:
          user?.user_metadata?.name || user?.email || "Cliente app",
        payment_method: "pix",
        items: cart.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          notes: "",
        })),
      });
      router.replace("/orders");
    } catch (error) {
      console.log(
        "Erro ao finalizar pedido:",
        error?.response?.data?.error || error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.shell}>
      <FlatList
        data={cart}
        keyExtractor={(item) => String(item.product_id)}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View style={s.header}>
            <Text style={s.headerTitle}>Carrinho</Text>
            {cart.length > 0 && (
              <Text style={s.headerSub}>
                {cart.reduce((n, i) => n + i.quantity, 0)} itens
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={s.empty}>Nenhum item no carrinho.</Text>
        }
        ListFooterComponent={
          <View style={s.footer}>
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Total</Text>
              <Text style={s.totalValue}>R$ {total.toFixed(2)}</Text>
            </View>
            <Pressable
              style={({ pressed }) => [
                s.btnFinish,
                pressed && { opacity: 0.88 },
              ]}
              onPress={finishOrder}
              disabled={loading}
            >
              <Text style={s.btnFinishText}>
                {loading ? "Finalizando..." : "Finalizar pedido"}
              </Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => (
          <View style={s.card}>
            <View style={s.cardTop}>
              <Text style={s.cardName}>{item.name}</Text>
              <Text style={s.cardPrice}>
                R$ {(item.unit_price * item.quantity).toFixed(2)}
              </Text>
            </View>
            <View style={s.cardBottom}>
              <Text style={s.cardUnit}>
                R$ {item.unit_price.toFixed(2)} / un
              </Text>
              <View style={s.qty}>
                <Pressable
                  style={s.qtyBtn}
                  onPress={() => decrease(item.product_id)}
                >
                  <Text style={s.qtyBtnText}>−</Text>
                </Pressable>
                <Text style={s.qtyNum}>{item.quantity}</Text>
                <Pressable
                  style={s.qtyBtn}
                  onPress={() => increase(item.product_id)}
                >
                  <Text style={s.qtyBtnText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: C.bg,
  },
  listContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
    gap: 8,
    paddingBottom: 18,
  },
  header: {
    marginBottom: 8,
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
  card: {
    backgroundColor: "rgba(255,255,255,0.02)",
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 14,
    padding: 14,
    gap: 10,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: C.text,
    flex: 1,
  },
  cardPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: C.accentText,
  },
  cardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardUnit: {
    fontSize: 12,
    color: C.text3,
  },
  qty: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: C.stroke,
    backgroundColor: "rgba(255,255,255,0.03)",
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: C.text,
    fontSize: 16,
    lineHeight: 18,
  },
  qtyNum: {
    color: C.text2,
    fontSize: 14,
    minWidth: 20,
    textAlign: "center",
  },
  empty: {
    color: C.text3,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 40,
  },
  footer: {
    marginTop: 8,
    gap: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.stroke,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 13,
    color: C.text3,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  btnFinish: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  btnFinishText: {
    color: "#0a0a0a",
    fontWeight: "700",
    fontSize: 15,
  },
});
