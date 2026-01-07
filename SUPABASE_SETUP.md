# Supabase Setup Instructions

## 1. Environment Variables

أضف هذه المتغيرات في `.env.local` و Vercel:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lybpxzruyjphnaffnvuy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_4H5_eqpm52vYNibTCw48Ag_emEFeaq2
SUPABASE_SERVICE_ROLE_KEY=sb_secret_Pcl55RhwiTCroFJo2a8luQ_G6DyUk0F
```

## 2. Database Setup

1. افتح Supabase Dashboard: https://supabase.com/dashboard
2. اختر مشروعك
3. اذهب إلى **SQL Editor**
4. انسخ محتوى ملف `supabase/schema.sql`
5. الصق في SQL Editor واضغط **Run**

هذا سينشئ:
- Tables: sections, content_items, site_settings, contact_info, about_content
- Indexes للسرعة
- Row Level Security (RLS) policies
- Default sections

## 3. Create Admin User

1. اذهب إلى **Authentication** > **Users**
2. اضغط **Add User** > **Create new user**
3. أدخل:
   - Email: admin@example.com (أو أي email تريده)
   - Password: (اختر password قوي)
4. اضغط **Create user**

## 4. Test Login

1. افتح `/admin/login`
2. سجل دخول بالـ email والـ password اللي أنشأته
3. يجب أن يتم توجيهك إلى `/admin`

## 5. Security Notes

- الـ RLS policies تسمح فقط للمستخدمين المسجلين بالكتابة
- القراءة متاحة للجميع (للصفحة الرئيسية)
- تأكد من استخدام password قوي
- لا تشارك الـ SERVICE_ROLE_KEY

## 6. Next Steps

بعد إعداد Database:
- يمكنك البدء في إدارة المحتوى من `/admin`
- الصفحة الرئيسية ستجلب البيانات من Supabase
- كل التعديلات ستظهر تلقائياً


