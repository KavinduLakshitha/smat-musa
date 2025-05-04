import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LanguageContextType {
  language: string;
  setLanguage: (newLanguage: string) => Promise<void>;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: async () => {}
});

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<string>("en");

  useEffect(() => {
    const loadLanguage = async () => {
      try {
        const storedLanguage = await AsyncStorage.getItem("appLanguage");
        if (storedLanguage) {
          setLanguage(storedLanguage);
        }
      } catch (error) {
        console.error("Failed to load language preference:", error);
      }
    };
    
    loadLanguage();
  }, []);

  const changeLanguage = async (newLanguage: string): Promise<void> => {
    try {
      setLanguage(newLanguage);
      await AsyncStorage.setItem("appLanguage", newLanguage);
    } catch (error) {
      console.error("Failed to save language preference:", error);
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => useContext(LanguageContext);