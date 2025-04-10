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
import {
  MonoText,
  PoppinsBoldText,
  PoppinsText,
} from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { LanguageIcon } from "react-native-heroicons/outline";
import { useLanguage } from "@/context/languageContext";

export default function Login() {
  const { language, setLanguage } = useLanguage();
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
        alert(
          language === "en"
            ? "Error: " + error.message
            : "त्रुटि: " + error.message
        );
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
          {language === "en"
            ? "Welcome Back to Kisan Vikas"
            : "किसान विकास में आपका स्वागत है"}
        </PoppinsBoldText>
        <PoppinsText
          style={{
            fontSize: 12,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          {language === "en"
            ? "Enter your username and password to continue."
            : "जारी रखने के लिए अपना उपयोगकर्ता नाम और पासवर्ड दर्ज करें।"}
        </PoppinsText>

        <PoppinsText style={{ fontSize: 12, marginBottom: 10 }}>
          {language === "en" ? "Email Address Below 👇" : "ईमेल पता नीचे 👇"}
        </PoppinsText>
        <TextInput
          placeholder={
            language === "en"
              ? "Enter your email address"
              : "अपना ईमेल पता दर्ज करें"
          }
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
          {language === "en" ? "Password Below 👇" : "पासवर्ड नीचे 👇"}
        </PoppinsText>
        <TextInput
          placeholder={
            language === "en" ? "Enter your password" : "अपना पासवर्ड दर्ज करें"
          }
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
            {loading
              ? language === "en"
                ? "Loading..."
                : "लोड हो रहा है..."
              : language === "en"
              ? "Login"
              : "लॉगिन करें"}
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
            {language === "en" ? "Don't have an account?" : "खाता नहीं है?"}{" "}
            <PoppinsText
              style={{
                color: Colors[theme ?? "light"].blue,
              }}
            >
              {language === "en" ? "Signup" : "साइनअप करें"}
            </PoppinsText>
          </PoppinsText>
        </TouchableOpacity>
        {/* Language Button */}
        <Pressable
          onPress={() => setLanguage(language === "en" ? "hi" : "en")}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            backgroundColor: Colors[theme ?? "light"].text,
            width: 50,
            height: 50,
            borderRadius: 25,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <LanguageIcon
            size={20}
            color={Colors[theme ?? "light"].background}
          />
        </Pressable>
      </View>
    </View>
  );
}
