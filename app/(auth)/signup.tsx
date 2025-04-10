import { useState } from "react";
import {
  TextInput,
  Alert,
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
import { LanguageIcon } from "react-native-heroicons/outline";
import { useLanguage } from "@/context/languageContext";

export default function Signup() {
  const { language, setLanguage } = useLanguage();
  const theme = useColorScheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { width } = useWindowDimensions();

  const isMobile = width < 768;

  const handleSignup = async () => {
    setLoading(true);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      if (Platform.OS === "android") {
        ToastAndroid.show(
          language === "hi"
            ? signUpError.message
            : "त्रुटि: " + signUpError.message,
          ToastAndroid.LONG
        );
      } else {
        alert(
          language === "hi"
            ? "Error: " + signUpError.message
            : "त्रुटि: " + signUpError.message
        );
      }
      setLoading(false);
      return;
    }

    router.replace({ pathname: "/otp-verification", params: { email } });
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
          {language === "hi"
            ? "किसान विकास में खाता बनाएं"
            : "Create a Kisan Vikas Account"}
        </PoppinsBoldText>
        <PoppinsText
          style={{
            fontSize: 12,
            marginBottom: 40,
            textAlign: "center",
          }}
        >
          {language === "hi"
            ? "जारी रखने के लिए अपना ईमेल और पासवर्ड दर्ज करें"
            : "Enter your email and password to continue"}
        </PoppinsText>

        <PoppinsText style={{ fontSize: 12, marginBottom: 10 }}>
          {language === "hi" ? "ईमेल पता नीचे 👇" : "Email Address Below 👇"}
        </PoppinsText>
        <TextInput
          placeholder={
            language === "hi"
              ? "अपना ईमेल पता दर्ज करें"
              : "Enter your email address"
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
          {language === "hi" ? "पासवर्ड नीचे 👇" : "Password Below 👇"}
        </PoppinsText>
        <TextInput
          placeholder={
            language === "hi" ? "अपना पासवर्ड दर्ज करें" : "Enter your password"
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
          onPress={handleSignup}
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
              ? language === "hi"
                ? "लोड हो रहा है..."
                : "Loading..."
              : language === "hi"
              ? "साइन अप करें"
              : "Sign Up"}
          </PoppinsText>
        </Pressable>

        <TouchableOpacity
          onPress={() => router.push("/login")}
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
            {language === "hi"
              ? "पहले से ही एक खाता है?"
              : "Already have an account?"}{" "}
            <PoppinsText
              style={{
                color: Colors[theme ?? "light"].blue,
              }}
            >
              {language === "hi" ? "लॉग इन करें" : "Login"}
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
