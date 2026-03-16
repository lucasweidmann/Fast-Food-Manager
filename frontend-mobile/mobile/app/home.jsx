import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  Text,
  View,
} from "react-native";
import { router } from "expo-router";
import { api } from "../src/services/api";
import { useAuth } from "../src/contexts/AuthContext";

export default function HomePage() {
  const { signOut } = useAuth();
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadProducts() {
    try {
      const response = await api.get("/products");
      setProducts(response.data);
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

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.title}>Cardápio</Text>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable onPress={() => router.push("/orders")}>
            <Text>Pedidos</Text>
          </Pressable>

          <Pressable onPress={handleLogout}>
            <Text>Sair</Text>
          </Pressable>
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ gap: 12, paddingBottom: 100 }}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => addToCart(item)}>
            <Text style={styles.name}>{item.name}</Text>
            <Text>{item.description}</Text>
            <Text style={styles.price}>R$ {Number(item.price).toFixed(2)}</Text>
          </Pressable>
        )}
      />

      <Pressable
        style={styles.cartButton}
        onPress={() =>
          router.push({
            pathname: "/cart",
            params: {
              cart: JSON.stringify(cart),
            },
          })
        }
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>
          Ver carrinho ({cart.reduce((sum, item) => sum + item.quantity, 0)})
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = {
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
  },
  card: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    gap: 6,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  price: {
    fontWeight: "700",
  },
  cartButton: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 20,
    backgroundColor: "#111827",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
};
