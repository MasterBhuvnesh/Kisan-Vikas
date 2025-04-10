import { useState } from "react";
import { TextInput, Alert, Pressable, StyleSheet } from "react-native";
import { router, Stack } from "expo-router";
import { supabase } from "@/lib/supabase";
import { PoppinsBoldText, PoppinsText } from "@/components/StyledText";
import { useColorScheme } from "@/components/useColorScheme";
import Colors from "@/constants/Colors";
import { useAuth } from "@/providers/AuthProvider";
import { Text, View } from "@/components/Themed";
import { Platform } from "react-native";
import { ToastAndroid } from "react-native";
import { useLanguage } from "@/context/languageContext"; // Add this import

export default function OTPVerification() {
  const { language } = useLanguage(); // Add this
  const user = useAuth();
  const email = user.session?.user.email;
  const theme = useColorScheme() ?? "light";
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState<boolean>(false);

  // Password validation rules
  const passwordValidation = {
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    hasMinLength: password.length >= 8,
  };

  const handleResetPassword = async () => {
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

    // Check if all password requirements are met
    if (!Object.values(passwordValidation).every((rule) => rule)) {
      if (Platform.OS === "android") {
        ToastAndroid.show(
          language === "en"
            ? "Please ensure your password meets all requirements."
            : "कृपया सुनिश्चित करें कि आपका पासवर्ड सभी आवश्यकताओं को पूरा करता है",
          ToastAndroid.LONG
        );
      } else {
        alert(
          language === "en"
            ? "Error: Please ensure your password meets all requirements."
            : "त्रुटि: कृपया सुनिश्चित करें कि आपका पासवर्ड सभी आवश्यकताओं को पूरा करता है"
        );
      }
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

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
      if (Platform.OS === "android") {
        ToastAndroid.show(
          language === "en"
            ? "Password updated successfully!"
            : "पासवर्ड सफलतापूर्वक अपडेट किया गया!",
          ToastAndroid.LONG
        );
      } else {
        alert(
          language === "en"
            ? "Success: Password updated successfully!"
            : "सफलता: पासवर्ड सफलतापूर्वक अपडेट किया गया!"
        );
      }
      router.replace("/");
    }
    setLoading(false);
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Stack.Screen options={{ headerShown: false }} />
      <PoppinsBoldText
        style={{ fontSize: 28, marginVertical: 10, textAlign: "center" }}
      >
        {language === "en" ? "Reset Password" : "पासवर्ड रीसेट करें"}
      </PoppinsBoldText>
      <PoppinsText
        style={{ fontSize: 12, marginBottom: 40, textAlign: "center" }}
      >
        {language === "en"
          ? "Enter your new password."
          : "अपना नया पासवर्ड दर्ज करें"}
      </PoppinsText>

      <TextInput
        placeholder={language === "en" ? "New Password" : "नया पासवर्ड"}
        value={password}
        onChangeText={setPassword}
        placeholderTextColor={Colors[theme ?? "light"].gray}
        autoCapitalize="none"
        secureTextEntry
        style={[
          {
            marginBottom: 10,
            padding: 10,
            borderWidth: 1,
            fontSize: 12,
            borderRadius: 5,
            width: "90%",
            fontFamily: "Poppins",
          },
          {
            color: Colors[theme ?? "light"].text,
            borderColor: Colors[theme ?? "light"].gray,
          },
        ]}
      />

      {/* Password Requirements Checklist */}
      <View style={styles.checklistContainer}>
        <Text
          style={[
            styles.checklistItem,
            passwordValidation.hasUppercase && {
              color: Colors[theme ?? "light"].text,
              fontFamily: "Poppins",
            },
          ]}
        >
          {passwordValidation.hasUppercase ? "👍" : "🔒"}{" "}
          {language === "en" ? "Uppercase letter" : "बड़ा अक्षर"}
        </Text>
        <Text
          style={[
            styles.checklistItem,
            passwordValidation.hasLowercase && {
              color: Colors[theme ?? "light"].text,
              fontFamily: "Poppins",
            },
          ]}
        >
          {passwordValidation.hasLowercase ? "👍" : "🔒"}{" "}
          {language === "en" ? "Lowercase letter" : "छोटा अक्षर"}
        </Text>
        <Text
          style={[
            styles.checklistItem,
            passwordValidation.hasNumber && {
              color: Colors[theme ?? "light"].text,
              fontFamily: "Poppins",
            },
          ]}
        >
          {passwordValidation.hasNumber ? "👍" : "🔒"}{" "}
          {language === "en" ? "Number" : "संख्या"}
        </Text>
        <Text
          style={[
            styles.checklistItem,
            passwordValidation.hasSpecialChar && {
              color: Colors[theme ?? "light"].text,
              fontFamily: "Poppins",
            },
          ]}
        >
          {passwordValidation.hasSpecialChar ? "👍" : "🔒"}{" "}
          {language === "en"
            ? "Special character (e.g., !?<>@#$%)"
            : "विशेष वर्ण (जैसे, !?<>@#$%)"}
        </Text>
        <Text
          style={[
            styles.checklistItem,
            passwordValidation.hasMinLength && {
              color: Colors[theme ?? "light"].text,
              fontFamily: "Poppins",
            },
          ]}
        >
          {passwordValidation.hasMinLength ? "👍" : "🔒"}{" "}
          {language === "en" ? "8 characters or more" : "8 वर्ण या अधिक"}
        </Text>
      </View>

      <Pressable
        onPress={handleResetPassword}
        disabled={
          loading || !Object.values(passwordValidation).every((rule) => rule)
        }
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
            ? "Reset Password"
            : "पासवर्ड रीसेट करें"}
        </PoppinsText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  checklistContainer: {
    width: "90%",
    marginBottom: 20,
  },
  checklistItem: {
    fontSize: 12,
    color: "#888",
    marginVertical: 4,
    fontFamily: "Poppins",
  },
});
