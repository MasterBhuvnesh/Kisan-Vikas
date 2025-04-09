import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type LanguageType = "en" | "hi";

const LanguageContext = createContext<{
  language: LanguageType;
  setLanguage: (lang: LanguageType) => void;
}>({
  language: "en",
  setLanguage: () => {},
});

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [language, setLanguage] = useState<LanguageType>("en");

  useEffect(() => {
    const loadLanguage = async () => {
      const storedLang = await AsyncStorage.getItem("language");
      if (storedLang === "en" || storedLang === "hi") {
        setLanguage(storedLang);
      }
    };
    loadLanguage();
  }, []);

  const handleSetLanguage = async (lang: LanguageType) => {
    await AsyncStorage.setItem("language", lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
