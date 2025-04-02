import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect, Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Image } from "expo-image";
import { MonoText } from "@/components/StyledText";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";

interface Post {
  id: string;
  content: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: {
    id: string;
    fullname: string;
    username: string;
    profile_pic: string | null;
  };
  is_saved?: boolean;
}

// Add a default profile picture (you can use any local image or a default avatar)
const DEFAULT_PROFILE_PIC = require("@/assets/images/user_pic.jpg");

export default function HomeScreen() {
  const theme = useColorScheme();
  const { session, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: Colors[theme ?? "light"].background,
        }}
      >
        <Stack.Screen />
        <ActivityIndicator
          size="large"
          color={Colors[theme ?? "light"].tint}
        />
      </View>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const fetchPosts = async () => {
    try {
      setRefreshing(true);
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:user_id (
            id,
            fullname,
            username,
            profile_pic
          )
        `
        )
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      if (session?.user.id) {
        const { data: savedData, error: savedError } = await supabase
          .from("saved_posts")
          .select("post_id")
          .eq("user_id", session.user.id);

        if (savedError) throw savedError;

        const savedPostIds = savedData?.map((item) => item.post_id) || [];
        const postsWithSavedStatus =
          postsData?.map((post) => ({
            ...post,
            is_saved: savedPostIds.includes(post.id),
          })) || [];

        setPosts(postsWithSavedStatus);

        // Initialize loading states for all images
        const initialLoadingStates = postsWithSavedStatus.reduce(
          (acc, post) => {
            if (post.user.profile_pic) {
              acc[post.id] = true;
            }
            return acc;
          },
          {} as { [key: string]: boolean }
        );

        setImageLoading(initialLoadingStates);
      } else {
        setPosts(postsData || []);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch posts");
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSave = async (postId: string, currentlySaved: boolean) => {
    if (!session?.user.id) {
      Alert.alert("Error", "You need to be logged in to save posts");
      return;
    }

    try {
      if (currentlySaved) {
        const { error } = await supabase
          .from("saved_posts")
          .delete()
          .eq("user_id", session.user.id)
          .eq("post_id", postId);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("saved_posts").insert({
          user_id: session.user.id,
          post_id: postId,
        });

        if (error) throw error;
      }

      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, is_saved: !currentlySaved } : post
        )
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update save status");
      console.error(error);
    }
  };

  const handleImageLoad = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  const handleImageError = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  useEffect(() => {
    fetchPosts();

    const subscription = supabase
      .channel("posts_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => fetchPosts()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [session]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: Colors[theme ?? "light"].background },
      ]}
    >
      <Stack.Screen
        options={{
          title: "Kisan Vikas",
          headerTitleStyle: { fontFamily: "PoppinsBold" },
          headerStyle: {
            backgroundColor: Colors[theme ?? "light"].background,
          },
        }}
      />

      <FlatList
        data={posts}
        renderItem={({ item }) => (
          <View
            style={[
              styles.postContainer,
              {
                backgroundColor: Colors[theme ?? "light"].background,
                borderColor: Colors[theme ?? "light"].border,
              },
            ]}
          >
            {/* User info row */}
            <View style={styles.userRow}>
              <View style={styles.profilePicContainer}>
                {imageLoading[item.id] && (
                  <ActivityIndicator
                    style={styles.loadingIndicator}
                    color={Colors[theme ?? "light"].text}
                  />
                )}
                <Image
                  source={
                    item.user.profile_pic
                      ? { uri: item.user.profile_pic }
                      : DEFAULT_PROFILE_PIC
                  }
                  style={styles.profilePic}
                  contentFit="cover"
                  onLoad={() => handleImageLoad(item.id)}
                  onError={() => handleImageError(item.id)}
                />
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>
                  {item.user.fullname || item.user.username}
                </Text>
                <Text style={styles.postTime}>
                  {dayjs(item.created_at).format("MMM D, YYYY [at] h:mm A")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => toggleSave(item.id, item.is_saved || false)}
              >
                <FontAwesome
                  name={item.is_saved ? "bookmark" : "bookmark-o"}
                  size={20}
                  color={Colors[theme ?? "light"].text}
                />
              </TouchableOpacity>
            </View>

            {item.image_url && (
              <Image
                source={{ uri: item.image_url }}
                style={styles.postImage}
                contentFit="cover"
              />
            )}
            {item.content && (
              <MonoText
                style={[
                  styles.postContent,
                  { color: Colors[theme ?? "light"].text },
                ]}
              >
                {item.content}
              </MonoText>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchPosts}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MonoText>No posts yet. Create the first one!</MonoText>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBlockEnd: 30,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
    gap: 16,
  },
  postContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  profilePicContainer: {
    width: 40,
    height: 40,
    position: "relative",
  },
  profilePic: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  loadingIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontFamily: "Poppins",
    fontSize: 14,
  },
  postTime: {
    fontSize: 12,
    opacity: 0.6,
    fontFamily: "Poppins",
  },
  postImage: {
    width: "100%",
    height: 200,
    borderRadius: 8,
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
});
