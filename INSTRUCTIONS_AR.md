# تعليمات التشغيل - Photography Portfolio Website

## الخطوات النهائية للتشغيل

### 1. تثبيت المكتبات المطلوبة

تم تثبيت المكتبات بالفعل. إذا كنت تريد إعادة التثبيت:

```bash
npm install
```

### 2. إعداد متغيرات البيئة

قم بإنشاء ملف `.env.local` في المجلد الرئيسي للمشروع وأضف المتغيرات التالية:

```env
# Cloudinary Configuration
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Formspree Configuration  
NEXT_PUBLIC_FORMSPREE_ID=your_formspree_id

# Optional: Site URL for SEO
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### 3. إعداد Cloudinary

1. سجل حساب مجاني في [cloudinary.com](https://cloudinary.com)
2. احصل على Cloud Name و API Key و API Secret من لوحة التحكم
3. أنشئ مجلد باسم `portfolio` في Media Library
4. ارفع الصور إلى هذا المجلد
5. أضف tags للصور (مثل: "wedding", "portrait", "events") للتصنيف
6. (اختياري) أضف metadata للصور:
   - Context > Custom > alt (للنص البديل)
   - Context > Custom > caption (للتعليق)

### 4. إعداد Formspree

1. سجل حساب مجاني في [formspree.io](https://formspree.io)
2. أنشئ نموذج جديد وانسخ Form ID
3. أضف Form ID إلى ملف `.env.local`

### 5. تشغيل المشروع

لتشغيل المشروع في وضع التطوير:

```bash
npm run dev
```

ثم افتح المتصفح على: http://localhost:3000

### 6. بناء المشروع للإنتاج

```bash
npm run build
npm start
```

## هيكل المشروع

```
portfolio-website/
├── app/                    # صفحات Next.js
│   ├── page.tsx           # الصفحة الرئيسية
│   ├── portfolio/         # معرض الصور
│   ├── about/             # صفحة من نحن
│   ├── contact/           # صفحة الاتصال
│   └── layout.tsx         # التخطيط الرئيسي
├── components/            # المكونات
│   ├── Navbar.tsx        # شريط التنقل
│   ├── Footer.tsx        # التذييل
│   ├── Hero.tsx          # القسم الرئيسي
│   ├── ImageGallery.tsx  # معرض الصور
│   ├── ImageModal.tsx    # نافذة عرض الصورة
│   └── ContactForm.tsx   # نموذج الاتصال
├── lib/                  # المكتبات المساعدة
│   └── cloudinary.ts     # تكامل Cloudinary
└── types/                # تعريفات TypeScript
```

## المميزات

✅ تصميم حديث ومتجاوب  
✅ وضع داكن/فاتح  
✅ معرض صور ديناميكي مع Cloudinary  
✅ تصفية الصور حسب الفئات  
✅ عرض موسع للصور (Lightbox)  
✅ نموذج اتصال متكامل  
✅ محسّن للأداء ومحركات البحث  

## النشر

### Vercel (موصى به)

1. ارفع الكود إلى GitHub
2. استورد المشروع في Vercel
3. أضف متغيرات البيئة
4. انشر!

### Netlify

1. ارفع الكود إلى GitHub
2. استورد المشروع في Netlify
3. أضف متغيرات البيئة
4. اضبط build command: `npm run build`
5. اضبط publish directory: `.next`

## ملاحظات مهمة

- تأكد من إضافة جميع متغيرات البيئة قبل التشغيل
- الصور تُحمل تلقائيًا من Cloudinary
- يمكنك إدارة الصور مباشرة من Cloudinary بدون تعديل الكود
- الفئات تُحدد تلقائيًا من tags الصور في Cloudinary

## المساعدة

للمزيد من التفاصيل، راجع ملف README.md

