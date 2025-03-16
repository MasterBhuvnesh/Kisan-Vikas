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

export default function OTPVerification() {
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
        ToastAndroid.show("Email is required.", ToastAndroid.LONG);
      } else {
        alert("Error : Email is required.");
      }
      return;
    }

    // Check if all password requirements are met
    if (!Object.values(passwordValidation).every((rule) => rule)) {
      if (Platform.OS === "android") {
        ToastAndroid.show(
          "Please ensure your password meets all requirements.",
          ToastAndroid.LONG
        );
      } else {
        alert("Error : Please ensure your password meets all requirements.");
      }
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      if (Platform.OS === "android") {
        ToastAndroid.show(error.message, ToastAndroid.LONG);
      } else {
        alert("Error : " + error.message);
      }
    } else {
      if (Platform.OS === "android") {
        ToastAndroid.show("Password updated successfully!", ToastAndroid.LONG);
      } else {
        alert("Success : Password updated successfully!");
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
        Reset Password
      </PoppinsBoldText>
      <PoppinsText
        style={{ fontSize: 12, marginBottom: 40, textAlign: "center" }}
      >
        Enter your new password.
      </PoppinsText>

      <TextInput
        placeholder="New Password"
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
          {passwordValidation.hasUppercase ? "👍" : "🔒"} Uppercase letter
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
          {passwordValidation.hasLowercase ? "👍" : "🔒"} Lowercase letter
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
          {passwordValidation.hasNumber ? "👍" : "🔒"} Number
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
          {passwordValidation.hasSpecialChar ? "👍" : "🔒"} Special character
          (e.g., !?&lt;&gt;@#$%)
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
          {passwordValidation.hasMinLength ? "👍" : "🔒"} 8 characters or more
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
          {loading ? "Loading..." : "Reset Password"}
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
