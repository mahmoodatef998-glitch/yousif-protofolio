# إصلاح مشكلة حجم الملفات الكبيرة عند الرفع

## 🔍 المشكلة

عند محاولة رفع فيديو كبير، يظهر الخطأ:
```
413 (Content Too Large)
POST /api/cloudinary/upload 413
```

## 🎯 السبب

**Vercel Serverless Functions** لديها حد أقصى لحجم الـ request body وهو **4.5 MB**. هذا الحد لا يمكن تغييره.

عند رفع ملف أكبر من 4.5 MB:
- الـ request يفشل قبل وصوله إلى API route
- يظهر خطأ `413 Content Too Large`

## ✅ الحلول المطبقة

### 1. التحقق من حجم الملف قبل الرفع
- تم إضافة validation في `AdminDashboard.tsx` للتحقق من حجم الملف قبل الرفع
- إذا كان الملف أكبر من 4.5 MB، يتم عرض رسالة خطأ واضحة

### 2. تحسين رسائل الخطأ
- رسائل خطأ واضحة توضح المشكلة والحل
- إرشادات للمستخدم حول كيفية التعامل مع الملفات الكبيرة

### 3. معالجة أفضل للأخطاء
- معالجة خاصة لخطأ 413
- رسائل خطأ مفصلة في API route

## 📋 حلول بديلة للملفات الكبيرة (> 4.5 MB)

### الحل 1: استخدام Cloudinary Upload Widget مباشرة (موصى به)

Cloudinary Upload Widget يرفع الملفات مباشرة من المتصفح إلى Cloudinary، بدون المرور عبر Vercel:

1. في Admin Dashboard، استخدم زر "Upload via Cloudinary Widget" إذا كان متوفراً
2. أو استخدم Cloudinary Upload Widget مباشرة من [Cloudinary Console](https://console.cloudinary.com)

**مميزات:**
- ✅ لا يوجد حد أقصى لحجم الملف (حتى 100MB+)
- ✅ رفع مباشر من المتصفح إلى Cloudinary
- ✅ لا يستهلك موارد Vercel

### الحل 2: ضغط الفيديو قبل الرفع

استخدم أدوات ضغط الفيديو مثل:
- [HandBrake](https://handbrake.fr/) (مجاني)
- [FFmpeg](https://ffmpeg.org/) (سطر الأوامر)
- [Online Video Compressor](https://www.freeconvert.com/video-compressor) (أونلاين)

**إعدادات موصى بها:**
- Resolution: 1080p أو أقل
- Bitrate: 2-5 Mbps
- Format: MP4 (H.264)

### الحل 3: رفع الملفات يدوياً إلى Cloudinary

1. اذهب إلى [Cloudinary Media Library](https://console.cloudinary.com/media/library)
2. اضغط "Upload" واختر الملف
3. بعد الرفع، انسخ الـ URL
4. أضف المحتوى يدوياً في Admin Dashboard باستخدام الـ URL

## ⚙️ الإعدادات الحالية

- **حد أقصى لحجم الملف**: 4.5 MB (حد Vercel)
- **التحقق من الحجم**: قبل الرفع في Admin Dashboard
- **رسائل الخطأ**: واضحة مع إرشادات

## 🔧 إذا أردت رفع ملفات أكبر

### خيار 1: استخدام Cloudinary Upload Widget في الكود

يمكن إضافة Cloudinary Upload Widget مباشرة في Admin Dashboard للرفع المباشر:

```typescript
// Example: Use Cloudinary Upload Widget
const widget = cloudinary.createUploadWidget({
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
  maxFileSize: 100000000, // 100MB
  resourceType: 'auto',
});
```

### خيار 2: استخدام Signed Upload URL

يمكن إنشاء Signed Upload URL من API route ثم رفع الملف مباشرة من المتصفح إلى Cloudinary.

## 📝 ملاحظات

1. **Vercel Limit**: 4.5 MB هو حد Vercel ولا يمكن تغييره
2. **Cloudinary Limit**: Cloudinary يدعم ملفات حتى 100MB+ في الخطة المجانية
3. **الحل الأفضل**: استخدام Cloudinary Upload Widget للفيديوهات الكبيرة

## 🆘 إذا استمرت المشكلة

1. تحقق من حجم الملف (يجب أن يكون أقل من 4.5 MB)
2. جرب ضغط الفيديو
3. استخدم Cloudinary Upload Widget مباشرة
4. راجع Logs في Vercel Dashboard للتفاصيل

