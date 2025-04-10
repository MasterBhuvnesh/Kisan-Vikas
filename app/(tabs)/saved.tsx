import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
  Platform,
  Pressable,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/providers/AuthProvider";
import { Redirect, router, Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Image } from "expo-image";
import { MonoText } from "@/components/StyledText";
import { FontAwesome } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useLanguage } from "@/context/languageContext";
import {
  Cog6ToothIcon,
  InformationCircleIcon,
} from "react-native-heroicons/outline";

interface User {
  id: string;
  fullname: string;
  fullname_Hindi: string | null;
  username: string;
  profile_pic: string | null;
}

interface Post {
  id: string;
  content: string | null;
  content_Hindi: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  user: User;
  is_saved: boolean;
}

const DEFAULT_PROFILE_PIC = require("@/assets/images/user_pic.jpg");

export default function SavedScreen() {
  const { language } = useLanguage();
  const theme = useColorScheme();
  const { session, loading } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [imageLoading, setImageLoading] = useState<{ [key: string]: boolean }>(
    {}
  );
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";

  const fetchSavedPosts = async () => {
    try {
      setRefreshing(true);

      if (!session?.user.id) {
        setPosts([]);
        return;
      }

      // First get all saved post IDs for the current user
      const { data: savedData, error: savedError } = await supabase
        .from("saved_posts")
        .select("post_id")
        .eq("user_id", session.user.id);

      if (savedError) throw savedError;

      if (!savedData || savedData.length === 0) {
        setPosts([]);
        return;
      }

      const savedPostIds = savedData.map((item) => item.post_id);

      // Then fetch the complete post data for those IDs
      const { data: postsData, error: postsError } = await supabase
        .from("posts")
        .select(
          `
          *,
          user:user_id (
            id,
            fullname,
            fullname_Hindi,
            username,
            profile_pic
          )
        `
        )
        .in("id", savedPostIds)
        .order("created_at", { ascending: false });

      if (postsError) throw postsError;

      // Mark all these posts as saved
      const savedPosts =
        postsData?.map((post) => ({
          ...post,
          is_saved: true,
        })) || [];

      setPosts(savedPosts);

      // Initialize loading states for all images
      const initialLoadingStates = savedPosts.reduce((acc, post) => {
        if (post.user.profile_pic) {
          acc[post.id] = true;
        }
        return acc;
      }, {} as { [key: string]: boolean });

      setImageLoading(initialLoadingStates);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch saved posts");
      console.error(error);
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSave = async (postId: string) => {
    if (!session?.user.id) {
      Alert.alert("Error", "You need to be logged in to save posts");
      return;
    }

    try {
      const { error } = await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", session.user.id)
        .eq("post_id", postId);

      if (error) throw error;

      // Remove the unsaved post from the list
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      Alert.alert("Error", "Failed to unsave post");
      console.error(error);
    }
  };

  const handleImageLoad = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  const handleImageError = (postId: string) => {
    setImageLoading((prev) => ({ ...prev, [postId]: false }));
  };

  const getLocalizedName = (user: User) => {
    return language === "hi" && user.fullname_Hindi
      ? user.fullname_Hindi
      : user.fullname;
  };

  useEffect(() => {
    if (session) {
      fetchSavedPosts();

      // Set up realtime subscription for saved posts changes
      const savedPostsSubscription = supabase
        .channel("saved_posts_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "saved_posts",
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            // For any changes to saved_posts for this user, refresh the list
            fetchSavedPosts();
          }
        )
        .subscribe();

      // Set up realtime subscription for posts changes
      const postsSubscription = supabase
        .channel("posts_changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "posts",
          },
          () => {
            // If any post changes, refresh our saved posts list
            fetchSavedPosts();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(savedPostsSubscription);
        supabase.removeChannel(postsSubscription);
      };
    }
  }, [session]);

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

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[theme ?? "light"].background,
          maxWidth: isWeb && !isMobile ? 400 : "100%",
          alignSelf: isWeb && !isMobile ? "center" : "stretch",
        },
      ]}
    >
      <Stack.Screen
        options={{
          title: language === "hi" ? "सेव किए गए पोस्ट" : "Saved Posts",
          headerTitleStyle: { fontFamily: "PoppinsBold" },
          headerStyle: {
            backgroundColor: Colors[theme ?? "light"].background,
          },
          headerRight(props) {
            return (
              <Pressable
                onPress={() => {
                  router.push("/info");
                }}
                style={{
                  padding: 10,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "transparent",
                  borderRadius: 50,
                  marginRight: 10,
                }}
              >
                <InformationCircleIcon
                  size={25}
                  color={Colors[theme ?? "light"].text}
                />
              </Pressable>
            );
          },
        }}
      />

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
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
            {/* User Info */}
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
                  {getLocalizedName(item.user)}
                </Text>
                <Text style={styles.postTime}>
                  {dayjs(item.created_at).format("MMM D, YYYY [at] h:mm A")}
                </Text>
              </View>
              <TouchableOpacity onPress={() => toggleSave(item.id)}>
                <FontAwesome
                  name={"bookmark"}
                  size={20}
                  color={Colors[theme ?? "light"].text}
                />
              </TouchableOpacity>
            </View>

            {/* Post Content */}
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
                {language === "hi" && item.content_Hindi
                  ? item.content_Hindi
                  : item.content}
              </MonoText>
            )}
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={fetchSavedPosts}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <MonoText>
              {language === "hi"
                ? "अभी तक कोई सेव किए गए पोस्ट नहीं हैं। उन्हें यहां देखने के लिए कुछ सेव करें!"
                : "No saved posts yet. Save some to see them here!"}
            </MonoText>
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
    paddingBottom: 30,
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
