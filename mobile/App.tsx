import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { WebView } from "react-native-webview";
import { api } from "./src/api";

const BLUE = "#163A8C";
const ORANGE = "#FF6A1A";
const NAVY = "#0B1F4A";

export default function App() {
  const [tab, setTab] = useState("home");
  const [catalog, setCatalog] = useState([]);
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState({});
  const [token, setToken] = useState(null);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [payHtml, setPayHtml] = useState(null);
  const [pendingOrder, setPendingOrder] = useState(null);

  useEffect(() => {
    api("/api/products").then((data) => setCatalog(data.items || [])).catch(() => setError("Could not reach zuknow.in API. Set EXPO_PUBLIC_API_URL."));
    AsyncStorage.getItem("zk_token").then(setToken);
    AsyncStorage.getItem("zk_cart").then((raw) => {
      if (raw) setCart(JSON.parse(raw));
    });
  }, []);

  useEffect(() => {
    AsyncStorage.setItem("zk_cart", JSON.stringify(cart));
  }, [cart]);

  const items = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return catalog.slice(0, 40);
    return catalog.filter((item) => item.name.toLowerCase().includes(q) || item.blurb.toLowerCase().includes(q));
  }, [catalog, query]);

  const lines = Object.entries(cart)
    .map(([id, qty]) => {
      const product = catalog.find((item) => item.id === id);
      return product ? { product, qty } : null;
    })
    .filter(Boolean);
  const total = lines.reduce((sum, line) => sum + line.product.price * line.qty, 0);

  const add = useCallback((id) => {
    setCart((prev) => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  }, []);

  async function sendOtp() {
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/otp/send", { method: "POST", body: { phone } });
      if (data.preview) setHint(`Dev code: ${data.preview}`);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function verifyOtp() {
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/auth/otp/verify", { method: "POST", body: { phone, code: otp } });
      setToken(data.token);
      await AsyncStorage.setItem("zk_token", data.token);
      setTab("home");
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function pay() {
    if (!token) {
      setTab("login");
      return;
    }
    if (!lines.length) return;
    setBusy(true);
    setError("");
    try {
      const data = await api("/api/payments/create-order", {
        token,
        method: "POST",
        body: {
          items: lines.map((line) => ({ id: line.product.id, qty: line.qty })),
          address: {
            name: "zuknow customer",
            phone,
            line1: "Home",
            city: "Amravati",
            pincode: "444601",
          },
        },
      });
      setPendingOrder({ orderId: data.orderId, razorpayOrderId: data.razorpayOrderId });
      const html = `<!doctype html><html><body>
        <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
        <script>
          const rzp = new Razorpay({
            key: ${JSON.stringify(data.key)},
            amount: ${JSON.stringify(data.amount)},
            currency: "INR",
            name: "zuknow.in",
            order_id: ${JSON.stringify(data.razorpayOrderId)},
            theme: { color: "#163A8C" },
            handler: function (response) {
              window.ReactNativeWebView.postMessage(JSON.stringify(response));
            }
          });
          rzp.open();
        </script></body></html>`;
      setPayHtml(html);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }

  async function onPayMessage(event) {
    try {
      const payload = JSON.parse(event.nativeEvent.data);
      await api("/api/payments/verify", {
        token,
        method: "POST",
        body: {
          orderId: pendingOrder.orderId,
          razorpay_order_id: payload.razorpay_order_id,
          razorpay_payment_id: payload.razorpay_payment_id,
          razorpay_signature: payload.razorpay_signature,
        },
      });
      setPayHtml(null);
      setCart({});
      setTab("home");
    } catch (err) {
      setError(err.message);
    }
  }

  if (payHtml) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
        <WebView originWhitelist={["*"]} source={{ html: payHtml }} onMessage={onPayMessage} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Image source={require("./assets/logo.png")} style={styles.logo} />
        <View>
          <Text style={styles.brand}>zuknow.in</Text>
          <Text style={styles.tag}>EVERYTHING YOU NEED. FASTER.</Text>
        </View>
      </View>

      {tab === "home" ? (
        <>
          <TextInput
            placeholder="Search milk, plumber, cement…"
            value={query}
            onChangeText={setQuery}
            style={styles.search}
          />
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={{ padding: 12, paddingBottom: 90 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.cardImg} />
                <Text numberOfLines={2} style={styles.cardName}>
                  {item.name}
                </Text>
                <Text style={styles.price}>₹{item.price}</Text>
                <Pressable onPress={() => add(item.id)} style={styles.add}>
                  <Text style={styles.addText}>Add</Text>
                </Pressable>
              </View>
            )}
          />
        </>
      ) : null}

      {tab === "cart" ? (
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {lines.length === 0 ? (
            <Text style={styles.muted}>Cart is empty.</Text>
          ) : (
            lines.map((line) => (
              <View key={line.product.id} style={styles.line}>
                <Text style={styles.cardName}>
                  {line.product.name} × {line.qty}
                </Text>
                <Text>₹{line.product.price * line.qty}</Text>
              </View>
            ))
          )}
          <Text style={styles.total}>Total ₹{total}</Text>
          <Pressable onPress={pay} style={styles.cta} disabled={busy || !lines.length}>
            <Text style={styles.ctaText}>{token ? "Pay with Razorpay" : "Login to pay"}</Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </ScrollView>
      ) : null}

      {tab === "login" ? (
        <View style={{ padding: 16 }}>
          <Text style={styles.heading}>WhatsApp login</Text>
          <TextInput
            placeholder="10-digit mobile"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={styles.search}
            maxLength={10}
          />
          <Pressable onPress={sendOtp} style={styles.cta} disabled={busy}>
            <Text style={styles.ctaText}>{busy ? "Sending…" : "Send code"}</Text>
          </Pressable>
          <TextInput
            placeholder="6-digit OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
            style={styles.search}
            maxLength={6}
          />
          {hint ? <Text style={styles.muted}>{hint}</Text> : null}
          <Pressable onPress={verifyOtp} style={[styles.cta, { backgroundColor: NAVY }]} disabled={busy}>
            <Text style={styles.ctaText}>Verify</Text>
          </Pressable>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>
      ) : null}

      <View style={styles.tabs}>
        {["home", "cart", "login"].map((id) => (
          <Pressable key={id} onPress={() => setTab(id)} style={styles.tab}>
            <Text style={[styles.tabText, tab === id && { color: BLUE }]}>
              {id === "home" ? "Home" : id === "cart" ? `Cart (${lines.length})` : token ? "You" : "Login"}
            </Text>
          </Pressable>
        ))}
      </View>
      {busy ? <ActivityIndicator style={StyleSheet.absoluteFill} color={ORANGE} /> : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F7F8FC" },
  header: { flexDirection: "row", alignItems: "center", gap: 10, padding: 16 },
  logo: { width: 44, height: 44 },
  brand: { fontSize: 20, fontWeight: "800", color: BLUE },
  tag: { fontSize: 8, letterSpacing: 1.4, color: "#667" },
  search: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingHorizontal: 16,
    height: 44,
  },
  card: {
    flex: 1,
    margin: 6,
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    paddingBottom: 10,
  },
  cardImg: { width: "100%", height: 110 },
  cardName: { fontWeight: "700", color: NAVY, paddingHorizontal: 10, marginTop: 8 },
  price: { paddingHorizontal: 10, marginTop: 4, fontWeight: "800" },
  add: {
    marginTop: 8,
    marginHorizontal: 10,
    backgroundColor: ORANGE,
    borderRadius: 999,
    alignItems: "center",
    paddingVertical: 8,
  },
  addText: { color: "#fff", fontWeight: "800" },
  tabs: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#E6EAF4",
    paddingVertical: 12,
  },
  tab: { flex: 1, alignItems: "center" },
  tabText: { fontWeight: "700", color: "#99A" },
  heading: { fontSize: 24, fontWeight: "800", color: NAVY, marginBottom: 12 },
  cta: {
    backgroundColor: ORANGE,
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginVertical: 8,
  },
  ctaText: { color: "#fff", fontWeight: "800" },
  muted: { color: "#667", marginVertical: 8 },
  error: { color: "#c00", margin: 12 },
  line: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10 },
  total: { fontSize: 20, fontWeight: "800", marginVertical: 12, color: NAVY },
});
