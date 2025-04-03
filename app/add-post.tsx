import React, { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
} from "react-native";
import { Text } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Stack, useRouter } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import { FontAwesome } from "@expo/vector-icons";
import { MonoText } from "@/components/StyledText";

export default function AddPostScreen() {
  const theme = useColorScheme();
  const { session } = useAuth();
  const router = useRouter();
  const [content, setContent] = useState("");
  const [enhancedContent, setEnhancedContent] = useState("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const pickGif = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*",
      });

      if (!result.canceled && result.assets[0]) {
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick GIF");
    }
  };

  const enhanceContent = async () => {
    if (!content) {
      Alert.alert("Error", "Please enter some content to enhance");
      return;
    }

    setAiLoading(true);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to enhance content");
      }

      const data = await response.json();
      setEnhancedContent(data.enhancedText);
    } catch (error) {
      console.error("AI enhancement error:", error);
      Alert.alert("Error", "Failed to enhance content");
    } finally {
      setAiLoading(false);
    }
  };

  const uploadImage = async () => {
    if (!imageUri || !session) return null;

    try {
      setUploading(true);
      const arrayBuffer = await fetch(imageUri).then((res) =>
        res.arrayBuffer()
      );
      const fileExt = imageUri.split(".").pop()?.toLowerCase() || "jpg";
      const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
      const filePath = `posts/${fileName}`;

      let mimeType = "image/jpeg";
      if (fileExt === "gif") mimeType = "image/gif";
      if (fileExt === "png") mimeType = "image/png";

      const { data, error: uploadError } = await supabase.storage
        .from("images")
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
        });

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("images").getPublicUrl(data.path);
      return publicUrl;
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert("Error", "Failed to upload image");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!content || !imageUri) {
      Alert.alert("Error", "Both text and an image are required");
      return;
    }

    if (!session) {
      Alert.alert("Error", "You must be logged in");
      return;
    }

    try {
      setIsLoading(true);
      let imageUrl = null;
      if (imageUri) {
        imageUrl = await uploadImage();
        if (!imageUrl) return;
      }

      const { error } = await supabase.from("posts").insert([
        {
          content: content || null,
          image_url: imageUrl || null,
          user_id: session.user.id,
        },
      ]);

      if (error) throw error;
      router.replace("/");
    } catch (error) {
      console.error("Error creating post:", error);
      Alert.alert("Error", "Failed to create post");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[theme ?? "light"].background },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Create Post",
          headerTitleStyle: { fontFamily: "PoppinsBold" },
          headerStyle: {
            backgroundColor: Colors[theme ?? "light"].background,
          },
        }}
      />

      <TextInput
        style={[
          styles.input,
          {
            color: Colors[theme ?? "light"].text,
            borderColor: Colors[theme ?? "light"].border,
            backgroundColor: Colors[theme ?? "light"].inputBackground,
          },
        ]}
        placeholder="What's on your mind?"
        placeholderTextColor={Colors[theme ?? "light"].placeholder}
        value={content}
        onChangeText={setContent}
        multiline
        numberOfLines={4}
      />

      <Pressable
        style={({ pressed }) => [
          styles.enhanceButton,
          {
            backgroundColor: pressed
              ? Colors[theme ?? "light"].bluePressed
              : Colors[theme ?? "light"].blue,
            opacity: aiLoading || !content ? 0.6 : 1,
          },
        ]}
        onPress={enhanceContent}
        disabled={aiLoading || !content}
      >
        {aiLoading ? (
          <ActivityIndicator
            color="#FFFFFF"
            size="small"
          />
        ) : (
          <>
            <FontAwesome
              name="magic"
              size={16}
              color="#FFFFFF"
              style={styles.buttonIcon}
            />
            <MonoText style={styles.enhanceButtonText}>
              Enhance with AI
            </MonoText>
          </>
        )}
      </Pressable>

      {enhancedContent && (
        <View style={styles.enhancedContainer}>
          <View
            style={[
              styles.enhancedContentRow,
              {
                backgroundColor:
                  Colors[theme ?? "light"].background ||
                  Colors[theme ?? "light"].inputBackground,
                borderColor: Colors[theme ?? "light"].border,
              },
            ]}
          >
            <View style={styles.enhancedHeader}>
              <FontAwesome
                name="lightbulb-o"
                size={14}
                color={Colors[theme ?? "light"].tint}
              />
              <MonoText
                style={[
                  styles.enhancedTitle,
                  { color: Colors[theme ?? "light"].tint },
                ]}
              >
                AI Enhanced
              </MonoText>
            </View>
            <View style={styles.enhancedTextContainer}>
              <MonoText
                style={[
                  styles.enhancedText,
                  { color: Colors[theme ?? "light"].text },
                ]}
              >
                {enhancedContent}
              </MonoText>
            </View>
            <View
              style={[
                styles.enhancedButtonsContainer,
                {
                  borderLeftColor: Colors[theme ?? "light"].border,
                },
              ]}
            >
              <Pressable
                style={({ pressed }) => [
                  styles.enhancedIconButton,
                  {
                    backgroundColor: pressed
                      ? "rgba(40, 167, 69, 0.8)"
                      : "rgba(40, 167, 69, 1)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: pressed ? 1 : 2 },
                    shadowOpacity: pressed ? 0.1 : 0.2,
                    shadowRadius: pressed ? 1 : 3,
                    elevation: pressed ? 1 : 3,
                  },
                ]}
                onPress={() => {
                  setContent(enhancedContent);
                  setEnhancedContent("");
                }}
              >
                <FontAwesome
                  name="check"
                  size={14}
                  color="#FFFFFF"
                />
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.enhancedIconButton,
                  {
                    backgroundColor: pressed
                      ? "rgba(220, 53, 69, 0.8)"
                      : "rgba(220, 53, 69, 1)",
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: pressed ? 1 : 2 },
                    shadowOpacity: pressed ? 0.1 : 0.2,
                    shadowRadius: pressed ? 1 : 3,
                    elevation: pressed ? 1 : 3,
                  },
                ]}
                onPress={() => setEnhancedContent("")}
              >
                <FontAwesome
                  name="times"
                  size={14}
                  color="#FFFFFF"
                />
              </Pressable>
            </View>
          </View>
        </View>
      )}

      <View style={styles.sectionDivider} />

      <MonoText
        style={[styles.sectionTitle, { color: Colors[theme ?? "light"].text }]}
      >
        Add Media
      </MonoText>

      <View style={styles.buttonGroup}>
        <Pressable
          style={({ pressed }) => [
            styles.mediaButton,
            {
              backgroundColor: pressed
                ? "rgba(13, 110, 253, 0.8)"
                : "rgba(13, 110, 253, 1)",
              opacity: uploading ? 0.6 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: pressed ? 1 : 2 },
              shadowOpacity: pressed ? 0.1 : 0.2,
              shadowRadius: pressed ? 1 : 3,
              elevation: pressed ? 1 : 3,
            },
          ]}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <>
              <FontAwesome
                name="photo"
                size={16}
                color="#FFFFFF"
              />
              <MonoText style={styles.mediaButtonText}>Photo</MonoText>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.mediaButton,
            {
              backgroundColor: pressed
                ? "rgba(25, 135, 84, 0.8)"
                : "rgba(25, 135, 84, 1)",
              opacity: uploading ? 0.6 : 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: pressed ? 1 : 2 },
              shadowOpacity: pressed ? 0.1 : 0.2,
              shadowRadius: pressed ? 1 : 3,
              elevation: pressed ? 1 : 3,
            },
          ]}
          onPress={pickGif}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator
              color="#FFFFFF"
              size="small"
            />
          ) : (
            <>
              <FontAwesome
                name="file-image-o"
                size={16}
                color="#FFFFFF"
              />
              <MonoText style={styles.mediaButtonText}>GIF</MonoText>
            </>
          )}
        </Pressable>
      </View>

      {imageUri && (
        <View style={styles.imagePreviewContainer}>
          <Image
            source={{ uri: imageUri }}
            style={styles.imagePreview}
            contentFit="cover"
          />
          <Pressable
            style={styles.removeImageButton}
            onPress={() => setImageUri(null)}
          >
            <FontAwesome
              name="times-circle"
              size={24}
              color="#FFFFFF"
            />
          </Pressable>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [
          styles.submitButton,
          {
            backgroundColor: pressed
              ? "rgba(102, 16, 242, 0.85)"
              : "rgba(102, 16, 242, 1)",
            opacity: isLoading || uploading ? 0.6 : 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: pressed ? 2 : 4 },
            shadowOpacity: pressed ? 0.15 : 0.25,
            shadowRadius: pressed ? 2 : 5,
            elevation: pressed ? 2 : 5,
          },
        ]}
        onPress={handleSubmit}
        disabled={isLoading || uploading}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <>
            <FontAwesome
              name="paper-plane"
              size={16}
              color="#FFFFFF"
              style={styles.submitButtonIcon}
            />
            <MonoText style={styles.submitButtonText}>Create Post</MonoText>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    fontSize: 14,
    minHeight: 100,
    fontFamily: "Poppins",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  enhanceButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 3,
  },
  enhanceButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  buttonIcon: {
    marginRight: 4,
  },
  enhancedContainer: {
    gap: 8,
    marginBottom: 4,
  },
  enhancedContentRow: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  enhancedHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  enhancedTitle: {
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "PoppinsBold",
  },
  enhancedTextContainer: {
    padding: 14,
    paddingTop: 0,
  },
  enhancedText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: "Poppins",
  },
  enhancedButtonsContainer: {
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#E5E5E5",
  },
  enhancedIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionDivider: {
    height: 1,
    backgroundColor: "#E5E5E5",
    marginVertical: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    fontFamily: "PoppinsBold",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  mediaButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  imagePreviewContainer: {
    position: "relative",
    marginVertical: 8,
  },
  imagePreview: {
    width: "100%",
    height: 200,
    borderRadius: 16,
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  submitButton: {
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: "auto",
    marginBottom: 10,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    fontFamily: "PoppinsBold",
  },
  submitButtonIcon: {
    marginRight: 8,
  },
});
