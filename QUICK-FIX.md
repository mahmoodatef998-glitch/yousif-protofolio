# حل سريع لمشاكل 404

## المشكلة:
ملفات CSS و JavaScript تظهر 404 في Console

## الحل الفوري:

### الطريقة 1: استخدام clean-start.bat (موصى به)
```bash
clean-start.bat
```

### الطريقة 2: يدوياً

1. **أغلق جميع نوافذ Terminal والـ Browser**

2. **شغل هذا الأمر**:
```powershell
# أوقف Node
Get-Process | Where-Object {$_.ProcessName -eq "node"} | Stop-Process -Force

# احذف .next
Remove-Item -Recurse -Force .next

# شغل من جديد
npm run dev
```

3. **انتظر 15-20 ثانية** حتى يظهر "Ready" في Terminal

4. **افتح المتصفح**: http://localhost:3000

5. **افتح Console** (F12) وتأكد من عدم وجود أخطاء 404

## ملاحظات مهمة:

- ⚠️ **لا تفتح المتصفح قبل أن يظهر "Ready" في Terminal**
- ⚠️ **انتظر 15-20 ثانية بعد تشغيل `npm run dev`**
- ✅ **استخدم clean-start.bat للتنظيف الشامل**

## إذا استمرت المشكلة:

1. تأكد من أن البورت 3000 غير مستخدم من مشروع آخر
2. جرب بورت مختلف: `npm run dev -- -p 3001`
3. احذف node_modules وأعد التثبيت:
   ```bash
   rmdir /s /q node_modules
   npm install
   ```

