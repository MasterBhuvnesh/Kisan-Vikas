import { Link, router, Stack } from "expo-router";
import { TouchableOpacity } from "react-native";
import * as React from "react";
import { Text, View } from "@/components/Themed";
import { PoppinsText } from "@/components/StyledText";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { useLanguage } from "@/context/languageContext";

export default function NotFoundScreen() {
  const theme = useColorScheme();

  const { language } = useLanguage();
  return (
    <>
      <Stack.Screen
        options={{
          title: language === "en" ? "OOPs!" : "ओह!",
          headerTitleStyle: { fontFamily: "SpaceMono" },
          headerStyle: { backgroundColor: Colors[theme ?? "light"].background },
          headerTintColor: Colors[theme ?? "light"].text,
        }}
      />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <PoppinsText style={{ fontSize: 16 }}>
          {language === "en"
            ? "This screen doesn't exist."
            : "यह स्क्रीन मौजूद नहीं है।"}
        </PoppinsText>

        <TouchableOpacity
          onPress={() => router.replace("/")}
          style={{
            backgroundColor: Colors[theme ?? "light"].text,
            width: "90%",
            padding: 10,
            borderRadius: 5,
            alignItems: "center",
            justifyContent: "center",
            marginTop: 20,
          }}
        >
          <PoppinsText
            style={{
              color: Colors[theme ?? "light"].background,
            }}
          >
            {language === "en" ? "Go to Home Page" : "मुख्य पृष्ठ पर जाएं"}
          </PoppinsText>
        </TouchableOpacity>
      </View>
    </>
  );
}
