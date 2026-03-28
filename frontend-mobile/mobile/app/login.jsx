import { useState } from "react";
import {
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../src/contexts/AuthContext";

const C = {
  bg: "#000000",
  panel: "#0b0b10",
  stroke: "rgba(255,255,255,0.09)",
  stroke2: "rgba(255,255,255,0.14)",
  text: "#ffffff",
  text2: "rgba(255,255,255,0.78)",
  text3: "rgba(255,255,255,0.45)",
  accent: "rgba(34,197,94,0.14)",
  accentBorder: "rgba(34,197,94,0.32)",
};

export default function LoginPage() {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  async function handleSubmit() {
    try {
      setLoading(true);
      if (mode === "register") {
        const result = await signUp(form);
        if (result?.session) {
          router.replace("/home");
        } else {
          // Conta criada, aguarde confirmação por email se necessário.
          setMode("login");
        }
        return;
      }
      await signIn({ email: form.email, password: form.password });
      router.replace("/home");
    } catch (error) {
      console.log("Erro de autenticação:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={s.shell}>
      <View style={s.card}>
        {/* Brand */}
        <View style={s.brand}>
          <Text style={s.brandTitle}>Lucas Food</Text>
          <Text style={s.brandSub}>
            {mode === "login"
              ? "Explore nosso cardápio e monte seu pedido em poucos cliques!"
              : "Peça agora e acompanhe tudo em tempo real, do preparo à entrega."}
          </Text>
        </View>

        {/* Fields */}
        <View style={s.form}>
          {mode === "register" && (
            <View style={s.field}>
              <Text style={s.label}>NOME</Text>
              <TextInput
                style={s.input}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                placeholderTextColor={C.text3}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.label}>EMAIL</Text>
            <TextInput
              style={s.input}
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={C.text3}
            />
          </View>

          <View style={s.field}>
            <Text style={s.label}>SENHA</Text>
            <TextInput
              style={s.input}
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
              secureTextEntry
              placeholderTextColor={C.text3}
            />
          </View>

          {/* Submit */}
          <View style={{ marginTop: 8 }}>
            <Pressable
              style={({ pressed }) => [
                s.btnSubmit,
                pressed && { opacity: 0.88 },
              ]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={s.btnSubmitText}>
                {loading
                  ? "Carregando..."
                  : mode === "login"
                    ? "Entrar"
                    : "Cadastrar"}
              </Text>
            </Pressable>
          </View>

          {/* Toggle */}
          <Pressable
            style={s.toggle}
            onPress={() => setMode(mode === "login" ? "register" : "login")}
          >
            <Text style={s.toggleText}>
              {mode === "login" ? "Criar conta" : "Já tenho conta"}
            </Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  shell: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "rgba(12,12,18,0.92)",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    padding: 28,
    gap: 24,
  },
  brand: {
    gap: 10,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: C.text,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 13,
    color: C.text2,
    lineHeight: 20,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 6,
  },
  label: {
    fontSize: 11,
    color: C.text3,
    letterSpacing: 1.2,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderWidth: 1,
    borderColor: C.stroke,
    borderRadius: 16,
    padding: 14,
    fontSize: 15,
    color: C.text,
  },
  btnSubmit: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  btnSubmitText: {
    color: "#0a0a0a",
    fontWeight: "700",
    fontSize: 15,
  },
  toggle: {
    alignItems: "center",
    paddingVertical: 4,
  },
  toggleText: {
    color: C.text3,
    fontSize: 13,
  },
});
