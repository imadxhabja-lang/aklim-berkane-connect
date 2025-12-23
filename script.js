// 1. ضع رابط قاعدة البيانات الخاص بك هنا (تأكد من إضافة .json في نهاية الرابط)
const firebaseDatabaseURL = "https://studio-2627154759-2fb87-default-rtdb.firebaseio.com/services.json"; 

// 2. الدالة التي يتم استدعاؤها عند الضغط على زر "نشر"
async function addService(event) {
    if (event) event.preventDefault(); // منع الصفحة من التحديث التلقائي

    // إظهار حالة "جاري النشر" على الزر
    const submitBtn = document.querySelector('button[type="submit"]') || document.querySelector('.orange-button');
    const originalText = submitBtn ? submitBtn.innerText : "نشر";
    if (submitBtn) submitBtn.innerText = "... جاري النشر";

    // 3. جلب البيانات من مربعات الإدخال (تأكد من مطابقة الـ id في HTML)
    const profession = document.getElementById('profession')?.value || "كهربائي"; 
    const city = document.getElementById('city')?.value || "اكليم";
    const phone = document.getElementById('phone')?.value || "";

    // تجهيز البيانات لإرسالها
    const newService = {
        profession: profession,
        city: city,
        phone: phone,
        createdAt: new Date().toLocaleString('ar-EG') // تاريخ الإضافة
    };

    try {
        // 4. عملية الإرسال الفعلي لـ Firebase
        const response = await fetch(firebaseDatabaseURL, {
            method: 'POST',
            body: JSON.stringify(newService),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            alert("✅ تم نشر معلوماتك بنجاح في قاعدة البيانات!");
            // تفريغ الحقول بعد النجاح
            if (document.getElementById('phone')) document.getElementById('phone').value = "";
            // يمكنك هنا إضافة كود لإغلاق النافذة المنبثقة (Modal)
        } else {
            throw new Error("فشل الاتصال بـ Firebase");
        }
    } catch (error) {
        console.error("خطأ في عملية النشر:", error);
        alert("❌ عذراً، حدث خطأ. تأكد من إعدادات القواعد (Rules) في Firebase.");
    } finally {
        // إعادة نص الزر لوضعه الأصلي
        if (submitBtn) submitBtn.innerText = originalText;
    }
}
