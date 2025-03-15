import { useState } from "react";
import { TextInput, Alert, Pressable, View, StyleSheet } from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { PoppinsBoldText, PoppinsText } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";

export default function OTPVerification() {
  const params = useLocalSearchParams();
  const email = params.email as string;
  const theme = useColorScheme() ?? "light";
  const [otp, setOtp] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleVerifyOTP = async () => {
    if (!email) {
      Alert.alert("Error", "Email is required.");
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "email",
    });

    if (error) {
      Alert.alert("Error", error.message);
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
        backgroundColor: Colors[theme].background,
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <PoppinsBoldText
        style={{ fontSize: 28, marginVertical: 10, textAlign: "center" }}
      >
        Verify Your Email
      </PoppinsBoldText>
      <PoppinsText
        style={{ fontSize: 12, marginBottom: 40, textAlign: "center" }}
      >
        Enter the OTP sent to your email.
      </PoppinsText>

      <TextInput
        placeholder="Enter your OTP"
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
          { backgroundColor: Colors[theme].text },
        ]}
      >
        <PoppinsText
          style={{ color: Colors[theme].background, borderRadius: 5 }}
        >
          {loading ? "Loading..." : "Verify OTP"}
        </PoppinsText>
      </Pressable>
    </View>
  );
}
