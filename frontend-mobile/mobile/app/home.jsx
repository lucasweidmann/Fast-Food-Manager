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
import { router } from "expo-router";
import { api } from "../src/services/api";
import { useAuth } from "../src/contexts/AuthContext";

const C = {
  bg: "#000000",
  stroke: "rgba(255,255,255,0.09)",
  stroke2: "rgba(255,255,255,0.14)",
  text: "#ffffff",
  text2: "rgba(255,255,255,0.78)",
  text3: "rgba(255,255,255,0.45)",
  accentText: "#4ade80",
  accentBg: "rgba(34,197,94,0.12)",
  accentBorder: "rgba(34,197,94,0.28)",
};

export default function HomePage() {
  const { signOut } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.log("Erro ao carregar produtos:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function addToCart(product) {
    setCart((prev) => {
      const exists = prev.find((item) => item.product_id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [
        ...prev,
        {
          product_id: product.id,
          name: product.name,
          unit_price: Number(product.price),
          quantity: 1,
        },
      ];
    });
  }

  async function handleLogout() {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      console.log("Erro ao sair:", error);
    }
  }

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={s.listContent}
        ListHeaderComponent={
          <View style={s.header}>
            <View style={s.brand}>
              <Text style={s.headerTitle}>Cardápio</Text>
              <Text style={s.headerSub}>
                {products.length} itens disponíveis
              </Text>
            </View>
            <View style={s.headerActions}>
              <Pressable style={s.chip} onPress={() => router.push("/orders")}>
                <Text style={s.chipText}>Pedidos</Text>
              </Pressable>
              <Pressable style={s.chip} onPress={handleLogout}>
                <Text style={s.chipText}>Sair</Text>
              </Pressable>
            </View>
          </View>
        }
        ListFooterComponent={
          <Pressable
            style={({ pressed }) => [
              s.cartBtn,
              totalItems === 0 && s.cartBtnEmpty,
              pressed && { opacity: 0.88 },
            ]}
            onPress={() =>
              router.push({
                pathname: "/cart",
                params: { cart: JSON.stringify(cart) },
              })
            }
          >
            <Text
              style={[s.cartBtnText, totalItems === 0 && { color: C.text3 }]}
            >
              {totalItems === 0
                ? "Carrinho vazio"
                : `Ver carrinho · ${totalItems} ${totalItems === 1 ? "item" : "itens"}`}
            </Text>
          </Pressable>
        }
        ListEmptyComponent={
          <Text style={s.empty}>Nenhum produto disponível.</Text>
        }
        renderItem={({ item }) => {
          const inCart = cart.find((c) => c.product_id === item.id);
          return (
            <Pressable
              style={({ pressed }) => [s.card, pressed && { opacity: 0.75 }]}
              onPress={() => addToCart(item)}
            >
              <View style={s.cardTop}>
                <Text style={s.cardName}>{item.name}</Text>
                <Text style={s.cardPrice}>
                  R$ {Number(item.price).toFixed(2)}
                </Text>
              </View>
              {item.description ? (
                <Text style={s.cardDesc}>{item.description}</Text>
              ) : null}
              {inCart && (
                <View style={s.cardBadge}>
                  <Text style={s.cardBadgeText}>
                    {inCart.quantity} no carrinho
                  </Text>
                </View>
              )}
            </Pressable>
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
    paddingBottom: 18,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  brand: { gap: 2 },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.4,
  },
  headerSub: {
    fontSize: 12,
    color: C.text3,
  },
  headerActions: {
    flexDirection: "row",
    gap: 8,
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
    gap: 6,
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
  cardDesc: {
    fontSize: 12,
    color: C.text3,
    lineHeight: 17,
  },
  cardBadge: {
    alignSelf: "flex-start",
    marginTop: 2,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: C.accentBg,
    borderWidth: 1,
    borderColor: C.accentBorder,
  },
  cardBadgeText: {
    fontSize: 11,
    color: C.accentText,
    fontWeight: "600",
  },
  empty: {
    color: C.text3,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 40,
  },
  cartBtn: {
    marginTop: 8,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  cartBtnEmpty: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: C.stroke,
  },
  cartBtnText: {
    color: "#0a0a0a",
    fontWeight: "700",
    fontSize: 15,
  },
});
