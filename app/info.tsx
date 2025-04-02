import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { View } from "@/components/Themed";
import { MonoText } from "@/components/StyledText";
import { Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
export default function InfoScreen() {
  const theme = useColorScheme();
  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Stack.Screen
        options={{
          headerTitleStyle: { fontFamily: "SpaceMono" },
          headerStyle: { backgroundColor: Colors[theme ?? "light"].background },
          headerTintColor: Colors[theme ?? "light"].text,
        }}
      />
      <MonoText
        style={{
          fontSize: 32,
          padding: 20,
          textAlign: "center",
        }}
      >
        Kisan Vikas
      </MonoText>

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
