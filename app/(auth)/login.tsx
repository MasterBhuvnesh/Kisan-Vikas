import { useState } from "react";
import {
  TextInput,
  Pressable,
  TouchableOpacity,
  Platform,
  Image,
  ToastAndroid,
  useWindowDimensions,
} from "react-native";
import { router, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { View } from "@/components/Themed";
import { PoppinsBoldText, PoppinsText } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function Login() {
  const theme = useColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const handleLogin = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (Platform.OS === "android") {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      } else {
        alert("Error: " + error.message);
      }
    } else {
      router.replace("/(tabs)");
    }
    setLoading(false);
  };

  const isWeb = Platform.OS === "web";

  return (
    <View style={{ flex: 1, flexDirection: isMobile ? "column" : "row" }}>
      {isWeb && !isMobile && (
        <Image
          source={require("@/assets/images/background.jpg")}
          style={{ width: "70%", height: "100%" }}
          resizeMode="cover"
        />
      )}
      <View
        style={[
          {
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          },
          isWeb && !isMobile && { width: "30%" },
        ]}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <PoppinsBoldText
          style={{
            fontSize: 28,
            marginVertical: 10,
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          Welcome Back to Kisan Vikas
        </PoppinsBoldText>
        <PoppinsText
          style={{
            fontSize: 12,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          Enter your username and password to continue.
        </PoppinsText>

        <PoppinsText style={{ fontSize: 12, marginBottom: 10 }}>
          Email Address Below 👇
        </PoppinsText>
        <TextInput
          placeholder="Enter your email address"
          value={email}
          onChangeText={setEmail}
          placeholderTextColor={Colors[theme ?? "light"].gray}
          autoCapitalize="none"
          style={[
            {
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              fontSize: 12,
              borderColor: "#ccc",
              borderRadius: 5,
              width: "90%",
              fontFamily: "Poppins",
              color: Colors[theme ?? "light"].text,
            },
          ]}
        />
        <PoppinsText style={{ fontSize: 12, marginBottom: 10 }}>
          Password Below 👇
        </PoppinsText>
        <TextInput
          placeholder="Enter your password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor={Colors[theme ?? "light"].gray}
          autoCapitalize="none"
          style={[
            {
              marginBottom: 10,
              padding: 10,
              borderWidth: 1,
              fontSize: 12,
              borderColor: "#ccc",
              borderRadius: 5,
              width: "90%",
              fontFamily: "Poppins",
              color: Colors[theme ?? "light"].text,
            },
          ]}
        />

        <Pressable
          onPress={handleLogin}
          disabled={loading}
          style={{
            backgroundColor: Colors[theme ?? "light"].text,
            width: "90%",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
          }}
        >
          <PoppinsText
            style={{
              borderRadius: 5,
              color: Colors[theme ?? "light"].background,
            }}
          >
            {loading ? "Loading..." : "Login"}
          </PoppinsText>
        </Pressable>

        <TouchableOpacity
          onPress={() => router.push("/signup")}
          style={{
            marginTop: 20,
          }}
        >
          <PoppinsText
            style={{
              color: Colors[theme ?? "light"].text,
              fontSize: 12,
            }}
          >
            Don't have an account?{" "}
            <PoppinsText
              style={{
                color: Colors[theme ?? "light"].blue,
              }}
            >
              Signup
            </PoppinsText>
          </PoppinsText>
        </TouchableOpacity>
      </View>
    </View>
  );
}
