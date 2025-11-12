// utils/emailService.js - الإصدار النهائي
import emailjs from "@emailjs/nodejs";
import dotenv from "dotenv";

dotenv.config();

/**
 * 🔹 إرسال بريد إلكتروني عبر EmailJS
 * @param {string} to - بريد المستلم
 * @param {string} subject - موضوع الرسالة  
 * @param {string} otp_code - كود التحقق
 * @param {string} user_name - اسم المستخدم (اختياري)
 */
export async function sendEmail(to, subject, otp_code, user_name = "Utilisateur") {
  try {
    // التحقق من صحة البيانات
    if (!to || !to.includes('@')) {
      throw new Error(`❌ البريد الإلكتروني غير صالح: ${to}`);
    }

    if (!otp_code) {
      throw new Error(`❌ كود OTP مطلوب`);
    }

    // تنظيف وتجهيز البيانات
    const cleanTo = to.trim();
    const cleanSubject = subject.trim();
    const cleanOtp = otp_code.toString().trim();
    const cleanUserName = (user_name && user_name.trim() !== '') ? user_name.trim() : "Utilisateur";

    console.log("🔄 تجهيز بيانات الإرسال:");
    console.log("📧 المستلم:", cleanTo);
    console.log("📋 الموضوع:", cleanSubject);
    console.log("🔢 الكود:", cleanOtp);
    console.log("👤 الاسم:", cleanUserName);

    // 🔹 إرسال جميع المتغيرات الممكنة
    const templateParams = {
      // متغيرات المستلم
      to_email: cleanTo,
      email: cleanTo,
      user_email: cleanTo,
      recipient: cleanTo,
      
      // متغيرات الموضوع
      subject: cleanSubject,
      message_subject: cleanSubject,
      
      // متغيرات الكود - جميع الاحتمالات
      otp_code: cleanOtp,
      code: cleanOtp,
      verification_code: cleanOtp,
      otp: cleanOtp,
      password_code: cleanOtp,
      reset_code: cleanOtp,
      
      // متغيرات الاسم - جميع الاحتمالات
      user_name: cleanUserName,
      name: cleanUserName,
      username: cleanUserName,
      client_name: cleanUserName,
      user: cleanUserName,
      nom: cleanUserName,
      
      // متغيرات الرد
      reply_to: "no-reply@livraison-express.com",
      reply_to_email: "no-reply@livraison-express.com",
      
      // معلومات إضافية
      app_name: "Livraison Express",
      company_name: "Livraison Express",
      expiration_time: "10 minutes"
    };

    console.log("🚀 بدء إرسال Email عبر EmailJS...");
    console.log("🔧 Service ID:", process.env.EMAILJS_SERVICE_ID ? "✅ موجود" : "❌ مفقود");
    console.log("🔧 Template ID:", process.env.EMAILJS_TEMPLATE_ID ? "✅ موجود" : "❌ مفقود");

    // إرسال البريد
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY,
      }
    );

    console.log("✅ تم إرسال البريد بنجاح!");
    console.log("📊 حالة الإرسال:", response.status);
    console.log("📝 رسالة الاستجابة:", response.text);
    
    return response;
    
  } catch (error) {
    console.error("❌ فشل في إرسال البريد:");
    console.error("📊 كود الخطأ:", error.status);
    console.error("📝 رسالة الخطأ:", error.text);
    console.error("🔧 التفاصيل:", error);
    
    // معالجة الأخطاء الشائعة
    if (error.status === 422) {
      throw new Error("مشكلة في متغيرات القالب - تحقق من أسماء المتغيرات في EmailJS Dashboard");
    } else if (error.status === 401) {
      throw new Error("مشكلة في المصادقة - تحقق من API Keys في ملف .env");
    } else if (error.status === 400) {
      throw new Error("طلب غير صالح - تحقق من معطيات الإرسال");
    } else {
      throw new Error(`فشل إرسال البريد: ${error.text || error.message}`);
    }
  }
}

/**
 * 🔹 دالة مساعدة للتحقق من إعدادات EmailJS
 */
export function checkEmailJSConfig() {
  const requiredEnvVars = [
    'EMAILJS_SERVICE_ID',
    'EMAILJS_TEMPLATE_ID', 
    'EMAILJS_PUBLIC_KEY',
    'EMAILJS_PRIVATE_KEY'
  ];

  console.log("🔍 فحص إعدادات EmailJS:");
  
  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    console.error("❌ متغيرات environment مفقودة:", missingVars);
    return false;
  }

  console.log("✅ جميع متغيرات EmailJS موجودة");
  console.log("🔧 Service ID:", process.env.EMAILJS_SERVICE_ID?.substring(0, 10) + '...');
  console.log("🔧 Template ID:", process.env.EMAILJS_TEMPLATE_ID?.substring(0, 10) + '...');
  
  return true;
}

/**
 * 🔹 إصدار مبسط للإرسال السريع
 */
export async function sendQuickEmail(to, otp_code, user_name = "Utilisateur", isReset = false) {
  const subject = isReset 
    ? "Code de réinitialisation du mot de passe - Livraison Express"
    : "Code de vérification - Livraison Express";

  return await sendEmail(to, subject, otp_code, user_name);
}