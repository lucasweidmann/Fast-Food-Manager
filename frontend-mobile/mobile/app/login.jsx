import { useState } from "react";
import {
  Alert,
  Pressable,
  SafeAreaView,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";

export default function LoginPage() {
  const { signIn, signUp } = useAuth();

  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  async function handleSubmit() {
    try {
      setLoading(true);

      if (mode === "register") {
        const result = await signUp(form);

        if (result?.session) {
          router.replace("/home");
        } else {
          Alert.alert(
            "Conta criada",
            "Confira seu email para confirmar o cadastro.",
          );
          setMode("login");
        }

        return;
      }

      await signIn({
        email: form.email,
        password: form.password,
      });

      router.replace("/home");
    } catch (error) {
      Alert.alert("Erro", error.message || "Erro de autenticação");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, justifyContent: "center", padding: 20 }}>
      <View style={{ gap: 12 }}>
        <Text style={{ fontSize: 28, fontWeight: "700" }}>Lucas Food</Text>
        <Text>{mode === "login" ? "Entrar" : "Criar conta"}</Text>

        {mode === "register" && (
          <TextInput
            placeholder="Nome"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
            style={styles.input}
          />
        )}

        <TextInput
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={form.email}
          onChangeText={(text) => setForm({ ...form, email: text })}
          style={styles.input}
        />

        <TextInput
          placeholder="Senha"
          secureTextEntry
          value={form.password}
          onChangeText={(text) => setForm({ ...form, password: text })}
          style={styles.input}
        />

        <Pressable
          style={styles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={{ color: "#fff", fontWeight: "700" }}>
            {loading
              ? "Carregando..."
              : mode === "login"
                ? "Entrar"
                : "Cadastrar"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === "login" ? "register" : "login")}
        >
          <Text>
            {mode === "login"
              ? "Não tem conta? Cadastre-se"
              : "Já tem conta? Entrar"}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = {
  input: {
    borderWidth: 1,
    borderColor: "#d4d4d8",
    borderRadius: 10,
    padding: 12,
  },
  button: {
    backgroundColor: "#111827",
    borderRadius: 10,
    padding: 14,
    alignItems: "center",
  },
};
