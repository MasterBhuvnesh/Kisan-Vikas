import React, { useState } from "react";
import {
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  useWindowDimensions,
} from "react-native";
import { View, Text } from "@/components/Themed";
import { Stack } from "expo-router";
import Colors from "@/constants/Colors";
import { useColorScheme } from "@/components/useColorScheme";
import { Image } from "expo-image";
import { MonoText } from "@/components/StyledText";
import { useLanguage } from "@/context/languageContext";
import * as WebBrowser from "expo-web-browser";

export default function LeprosyInfoScreen() {
  const { language } = useLanguage();
  const theme = useColorScheme();
  const { width } = useWindowDimensions();

  const [result, setResult] = useState<WebBrowser.WebBrowserResult | null>(
    null
  );

  const _handlePressButtonAsync = async () => {
    let result = await WebBrowser.openBrowserAsync(
      "https://en.wikipedia.org/wiki/Leprosy"
    );
    setResult(result);
  };
  const isMobile = width < 768;
  const isWeb = Platform.OS === "web";
  const [imageLoading, setImageLoading] = useState({
    header: true,
    treatment: true,
    prevention: true,
  });

  // Sample image URIs - replace with your actual image paths
  const images = {
    header:
      "https://i.pinimg.com/736x/a2/e6/df/a2e6dffc178967a167ff9e2ecc28fd4e.jpg",
    treatment:
      "https://i.pinimg.com/736x/6d/c6/2d/6dc62dfcee501254b1a09d3ab7975131.jpg",
    prevention:
      "https://i.pinimg.com/736x/2b/ed/03/2bed034aff547e2f713ae49befee27e3.jpg",
  };

  const handleImageLoad = (imageId: string) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const handleImageError = (imageId: string) => {
    setImageLoading((prev) => ({ ...prev, [imageId]: false }));
  };

  const renderInfoSection = (
    title:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | null
      | undefined,
    titleHindi:
      | string
      | number
      | boolean
      | React.ReactElement<any, string | React.JSXElementConstructor<any>>
      | Iterable<React.ReactNode>
      | null
      | undefined,
    points: any[]
  ) => (
    <View style={styles.infoSection}>
      <Text style={styles.sectionTitle}>
        {language === "en" ? title : titleHindi}
      </Text>
      <View style={styles.pointsContainer}>
        {points.map(
          (
            point: {
              en:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | null
                | undefined;
              hi:
                | string
                | number
                | boolean
                | React.ReactElement<
                    any,
                    string | React.JSXElementConstructor<any>
                  >
                | Iterable<React.ReactNode>
                | React.ReactPortal
                | null
                | undefined;
            },
            index: React.Key | null | undefined
          ) => (
            <View
              key={index}
              style={styles.pointItem}
            >
              <View style={styles.bulletPoint} />
              <MonoText style={styles.pointText}>
                {language === "en" ? point.en : point.hi}
              </MonoText>
            </View>
          )
        )}
      </View>
    </View>
  );

  // Content sections with Hindi translations
  const sections = [
    {
      title: "What is Leprosy?",
      titleHindi: "कुष्ठ रोग क्या है?",
      points: [
        {
          en: "Leprosy is a chronic infectious disease caused by Mycobacterium leprae bacteria.",
          hi: "कुष्ठ रोग माइकोबैक्टीरियम लेप्री बैक्टीरिया के कारण होने वाला एक पुरानी संक्रामक बीमारी है।",
        },
        {
          en: "It predominantly affects the skin and peripheral nerves.",
          hi: "यह मुख्य रूप से त्वचा और परिधीय तंत्रिकाओं को प्रभावित करता है।",
        },
        {
          en: "If left untreated, it can cause progressive and permanent disabilities.",
          hi: "अनुपचारित छोड़ने पर, यह प्रगतिशील और स्थायी विकलांगता का कारण बन सकता है।",
        },
      ],
    },
    {
      title: "Transmission",
      titleHindi: "संचरण",
      points: [
        {
          en: "The bacteria are transmitted via droplets from the nose and mouth during close contact with untreated cases.",
          hi: "बैक्टीरिया अनुपचारित मामलों के साथ निकट संपर्क के दौरान नाक और मुंह से निकलने वाली बूंदों के माध्यम से प्रसारित होते हैं।",
        },
        {
          en: "The disease does not spread through casual contact (shaking hands, sharing meals, etc.).",
          hi: "यह रोग आकस्मिक संपर्क (हाथ मिलाना, भोजन साझा करना, आदि) के माध्यम से नहीं फैलता है।",
        },
        {
          en: "Patients stop transmitting the disease once treatment begins.",
          hi: "उपचार शुरू होने के बाद रोगी बीमारी का संचरण बंद कर देते हैं।",
        },
      ],
    },
    {
      title: "Diagnosis",
      titleHindi: "निदान",
      points: [
        {
          en: "Leprosy is diagnosed clinically by finding at least one of the cardinal signs.",
          hi: "कुष्ठ रोग का निदान कम से कम एक प्रमुख लक्षण पाकर नैदानिक रूप से किया जाता है।",
        },
        {
          en: "Signs include loss of sensation in skin patches, thickened peripheral nerves, or detection of bacilli in a skin smear.",
          hi: "लक्षणों में त्वचा के धब्बों में संवेदना की हानि, मोटी परिधीय तंत्रिकाएं, या त्वचा स्मीयर में बैसिली का पता लगाना शामिल है।",
        },
      ],
    },
    {
      title: "Treatment",
      titleHindi: "उपचार",
      points: [
        {
          en: "Leprosy is curable with multidrug therapy (MDT).",
          hi: "कुष्ठ रोग बहु-औषधि चिकित्सा (एमडीटी) से ठीक हो सकता है।",
        },
        {
          en: "The treatment consists of three medicines: dapsone, rifampicin, and clofazimine.",
          hi: "उपचार में तीन दवाएँ शामिल हैं: डैप्सोन, रिफैम्पिसिन और क्लोफ़ाज़िमाइन।",
        },
        {
          en: "Treatment duration is 6 months for paucibacillary (PB) and 12 months for multibacillary (MB) cases.",
          hi: "उपचार की अवधि पौसिबैसिलरी (पीबी) के लिए 6 महीने और मल्टीबैसिलरी (एमबी) मामलों के लिए 12 महीने है।",
        },
        {
          en: "WHO has been providing MDT free of cost to patients worldwide.",
          hi: "विश्व स्वास्थ्य संगठन दुनिया भर के रोगियों को निःशुल्क एमडीटी प्रदान कर रहा है।",
        },
      ],
    },
    {
      title: "Prevention",
      titleHindi: "रोकथाम",
      points: [
        {
          en: "Contact tracing (household, neighborhood, and social contacts) is recommended.",
          hi: "संपर्क ट्रेसिंग (घरेलू, पड़ोस और सामाजिक संपर्क) की सिफारिश की जाती है।",
        },
        {
          en: "Administration of a single dose of rifampicin as post-exposure prophylaxis (SDR-PEP) is recommended.",
          hi: "एक्सपोजर के बाद प्रोफिलैक्सिस (एसडीआर-पीईपी) के रूप में रिफैम्पिसिन की एकल खुराक का प्रशासन अनुशंसित है।",
        },
        {
          en: "Early diagnosis and prompt treatment help prevent disabilities.",
          hi: "शीघ्र निदान और त्वरित उपचार विकलांगता को रोकने में मदद करते हैं।",
        },
      ],
    },
    {
      title: "Global Impact",
      titleHindi: "वैश्विक प्रभाव",
      points: [
        {
          en: "Leprosy is reported in more than 120 countries worldwide.",
          hi: "दुनिया भर के 120 से अधिक देशों में कुष्ठ रोग की सूचना मिलती है।",
        },
        {
          en: "Around 200,000 new cases are reported every year.",
          hi: "हर साल लगभग 200,000 नए मामले सामने आते हैं।",
        },
        {
          en: "The majority of new cases are from the South-East Asia Region.",
          hi: "अधिकांश नए मामले दक्षिण-पूर्व एशिया क्षेत्र से हैं।",
        },
        {
          en: "Leprosy elimination as a public health problem (less than 1 case per 10,000 population) was achieved globally in 2000.",
          hi: "एक सार्वजनिक स्वास्थ्य समस्या के रूप में कुष्ठ रोग का उन्मूलन (प्रति 10,000 जनसंख्या में 1 से कम मामला) वैश्विक स्तर पर 2000 में प्राप्त किया गया था।",
        },
      ],
    },
  ];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: Colors[theme ?? "light"].background,
          width: "100%",
          maxWidth: isWeb && !isMobile ? 600 : "100%",
          alignSelf: isWeb && !isMobile ? "center" : "stretch",
        },
      ]}
    >
      <Stack.Screen
        options={{
          title:
            language === "en" ? "Leprosy Information" : "कुष्ठ रोग जानकारी",
          headerTitleStyle: { fontFamily: "PoppinsBold" },
          headerStyle: {
            backgroundColor: Colors[theme ?? "light"].background,
          },
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Image */}
        <View style={styles.headerSection}>
          <View style={styles.imageContainer}>
            {imageLoading.header && (
              <ActivityIndicator
                style={styles.loadingIndicator}
                color={Colors[theme ?? "light"].text}
                size="large"
              />
            )}
            <Image
              source={{ uri: images.header }}
              style={styles.headerImage}
              contentFit="cover"
              onLoad={() => handleImageLoad("header")}
              onError={() => handleImageError("header")}
            />
          </View>
          <Text style={styles.headerTitle}>
            {language === "en" ? "Leprosy Awareness" : "कुष्ठ रोग जागरूकता"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === "en"
              ? "Understanding, Prevention, and Treatment"
              : "समझ, रोकथाम और उपचार"}
          </Text>
        </View>

        {/* Render all information sections */}
        {sections.map((section, index) => (
          <View key={index}>
            {renderInfoSection(
              section.title,
              section.titleHindi,
              section.points
            )}

            {/* Add images after treatment and prevention sections */}
            {section.title === "Treatment" && (
              <View style={styles.imageContainer}>
                {imageLoading.treatment && (
                  <ActivityIndicator
                    style={styles.loadingIndicator}
                    color={Colors[theme ?? "light"].text}
                  />
                )}
                <Image
                  source={{ uri: images.treatment }}
                  style={styles.sectionImage}
                  contentFit="cover"
                  onLoad={() => handleImageLoad("treatment")}
                  onError={() => handleImageError("treatment")}
                />
                <Text style={styles.imageCaption}>
                  {language === "en"
                    ? "Multidrug therapy (MDT) for leprosy treatment"
                    : "कुष्ठ रोग उपचार के लिए बहु-औषधि चिकित्सा (एमडीटी)"}
                </Text>
              </View>
            )}

            {section.title === "Prevention" && (
              <View style={styles.imageContainer}>
                {imageLoading.prevention && (
                  <ActivityIndicator
                    style={styles.loadingIndicator}
                    color={Colors[theme ?? "light"].text}
                  />
                )}
                <Image
                  source={{ uri: images.prevention }}
                  style={styles.sectionImage}
                  contentFit="cover"
                  onLoad={() => handleImageLoad("prevention")}
                  onError={() => handleImageError("prevention")}
                />
                <Text style={styles.imageCaption}>
                  {language === "en"
                    ? "Early detection and contact screening"
                    : "प्रारंभिक पहचान और संपर्क स्क्रीनिंग"}
                </Text>
              </View>
            )}
          </View>
        ))}

        {/* Call-to-Action Section */}
        <View style={styles.ctaSection}>
          <View
            style={[
              styles.ctaBox,
              { backgroundColor: Colors[theme ?? "light"].tint + "20" },
            ]}
          >
            <Text style={styles.ctaTitle}>
              {language === "en"
                ? "Help Stop Leprosy Stigma"
                : "कुष्ठ रोग कलंक को रोकने में मदद करें"}
            </Text>
            <MonoText style={styles.ctaText}>
              {language === "en"
                ? "Leprosy is curable. Early detection and treatment prevents disabilities. Raise awareness in your community."
                : "कुष्ठ रोग ठीक हो सकता है। शीघ्र पहचान और उपचार विकलांगता को रोकता है। अपने समुदाय में जागरूकता बढ़ाएं।"}
            </MonoText>
            <TouchableOpacity
              onPress={_handlePressButtonAsync}
              style={[
                styles.ctaButton,
                { backgroundColor: Colors[theme ?? "light"].tint },
              ]}
            >
              <Text style={styles.ctaButtonText}>
                {language === "en" ? "Learn More" : "अधिक जानें"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  headerSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  headerImage: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  headerTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 24,
    marginTop: 16,
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Poppins",
    fontSize: 14,
    opacity: 0.8,
    textAlign: "center",
    marginTop: 8,
  },
  infoSection: {
    marginBottom: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    padding: 16,
  },
  sectionTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    marginBottom: 12,
  },
  pointsContainer: {
    gap: 12,
  },
  pointItem: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#007AFF",
    marginTop: 6,
    marginRight: 10,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  imageContainer: {
    width: "100%",
    marginBottom: 24,
    position: "relative",
  },
  loadingIndicator: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  sectionImage: {
    width: "100%",
    height: 180,
    borderRadius: 12,
  },
  imageCaption: {
    fontFamily: "Poppins",
    fontSize: 12,
    opacity: 0.8,
    textAlign: "center",
    marginTop: 8,
  },
  ctaSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  ctaBox: {
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  ctaTitle: {
    fontFamily: "PoppinsBold",
    fontSize: 18,
    marginBottom: 12,
    textAlign: "center",
  },
  ctaText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 16,
  },
  ctaButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontFamily: "PoppinsBold",
    fontSize: 14,
    color: "#FFFFFF",
  },
});
