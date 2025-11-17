// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

// ✅ استيراد ملفات الترجمة
import translationEN from "./locales/en.json";
import translationFR from "./locales/fr.json";
import translationAR from "./locales/ar.json";

// ✅ استرجاع اللغة المحفوظة
const savedLanguage = localStorage.getItem('preferredLanguage') || 'fr';
const savedDarkMode = localStorage.getItem('darkMode') === 'true';

// ✅ تطبيق الإعدادات المحفوظة فوراً
if (savedLanguage === 'ar') {
  document.dir = "rtl";
  document.documentElement.setAttribute("dir", "rtl");
  document.body.style.fontFamily = "Cairo, sans-serif";
} else {
  document.dir = "ltr";
  document.documentElement.setAttribute("dir", "ltr");
  document.body.style.fontFamily = "Poppins, sans-serif";
}

// ✅ تطبيق الوضع الليلي
if (savedDarkMode) {
  document.body.classList.add('dark-mode-global');
}

// ✅ محتوى الترجمة
const resources = {
  en: { translation: translationEN },
  fr: { translation: translationFR },
  ar: { translation: translationAR },
};

// ✅ إعداد i18next
i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // استخدام اللغة المحفوظة
    fallbackLng: "fr",
    interpolation: { escapeValue: false },
  });

// ✅ تبديل الاتجاه تلقائيًا وحفظ الإعدادات
i18n.on("languageChanged", (lng) => {
  // حفظ اللغة في localStorage
  localStorage.setItem('preferredLanguage', lng);
  
  if (lng === "ar") {
    document.dir = "rtl";
    document.documentElement.setAttribute("dir", "rtl");
    document.body.style.fontFamily = "Cairo, sans-serif";
  } else {
    document.dir = "ltr";
    document.documentElement.setAttribute("dir", "ltr");
    document.body.style.fontFamily = "Poppins, sans-serif";
  }
});

export default i18n;