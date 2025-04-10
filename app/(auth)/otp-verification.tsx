import { useState } from "react";
import {
  TextInput,
  Alert,
  Pressable,
  View,
  StyleSheet,
  Platform,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { PoppinsBoldText, PoppinsText } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { ToastAndroid } from "react-native";
import { useLanguage } from "@/context/languageContext"; // Add this import

export default function OTPVerification() {
  const { language } = useLanguage(); // Add this
  const params = useLocalSearchParams();
  const email = params.email as string;
  const theme = useColorScheme() ?? "light";
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerifyOTP = async () => {
    if (!email) {
      if (Platform.OS === "android") {
        ToastAndroid.show(
          language === "en" ? "Email is required." : "ईमेल आवश्यक है",
          ToastAndroid.LONG
        );
      } else {
        alert(
          language === "en"
            ? "Error: Email is required."
            : "त्रुटि: ईमेल आवश्यक है"
        );
      }
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
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
      router.replace("/edit-profile");
    }
    setLoading(false);
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: Colors[theme ?? "light"].background,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <PoppinsBoldText
        style={{ fontSize: 28, marginVertical: 10, textAlign: "center" }}
      >
        {language === "en" ? "Verify Your Email" : "अपना ईमेल सत्यापित करें"}
      </PoppinsBoldText>
      <PoppinsText
        style={{ fontSize: 12, marginBottom: 40, textAlign: "center" }}
      >
        {language === "en"
          ? "Enter the OTP sent to your email."
          : "अपने ईमेल पर भेजे गए OTP को दर्ज करें"}
      </PoppinsText>

      <TextInput
        placeholder={
          language === "en" ? "Enter your OTP" : "अपना OTP दर्ज करें"
        }
        value={otp}
        onChangeText={setOtp}
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
        onPress={handleVerifyOTP}
        disabled={loading}
        style={[
          {
            paddingHorizontal: 30,
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 10,
          },
          { backgroundColor: Colors[theme ?? "light"].text },
        ]}
      >
        <PoppinsText
          style={{
            color: Colors[theme ?? "light"].background,
            borderRadius: 5,
          }}
        >
          {loading
            ? language === "en"
              ? "Loading..."
              : "लोड हो रहा है..."
            : language === "en"
            ? "Verify OTP"
            : "OTP सत्यापित करें"}
        </PoppinsText>
      </Pressable>
    </View>
  );
}
