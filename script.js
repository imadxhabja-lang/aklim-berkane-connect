// تهيئة Firebase (يجب أن تكون قد أضفت التكوين في index.html)
const db = firebase.firestore();
const auth = firebase.auth();

// عناصر DOM
const servicesContainer = document.getElementById('services-container');
const addServiceForm = document.getElementById('add-service-form');
const deleteServiceForm = document.getElementById('delete-service-form');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalServicesElement = document.getElementById('total-services');
const totalCarsElement = document.getElementById('total-cars');

// أيقونات وأسماء لأنواع الخدمات
const typeIcons = {
    delivery: "fas fa-shipping-fast",
    maintenance: "fas fa-tools",
    medical: "fas fa-user-md",
    rental: "fas fa-car",
    other: "fas fa-star"
};

const typeNames = {
    delivery: "توصيل",
    maintenance: "صيانة",
    medical: "طبي",
    rental: "كراء سيارات",
    other: "أخرى"
};

// حالة التحميل
let isLoading = true;

// تهيئة الصفحة
document.addEventListener('DOMContentLoaded', function() {
    // تحميل الخدمات من Firebase
    loadServices();
    
    // إعداد مستمع للنموذج
    addServiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        addNewService();
    });
    
    // مستمع لحذف الخدمة
    deleteServiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        deleteServiceByPhone();
    });
    
    // فلترة الخدمات
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadServices(this.dataset.filter);
        });
    });
});

// تحميل الخدمات من Firebase
function loadServices(filterType = 'all') {
    isLoading = true;
    servicesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الخدمات...</div>';
    
    let query = db.collection('services');
    
    // تطبيق الفلترة إذا لم تكن "all"
    if (filterType !== 'all') {
        query = query.where('type', '==', filterType);
    }
    
    query.orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            servicesContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                servicesContainer.innerHTML = '<p class="no-services">لا توجد خدمات متاحة في هذا القسم حالياً.</p>';
                updateStats(0, 0);
                return;
            }
            
            let servicesCount = 0;
            let carsCount = 0;
            
            querySnapshot.forEach((doc) => {
                const service = doc.data();
                service.id = doc.id;
                
                // عرض الخدمة
                displayService(service);
                
                // عد الخدمات
                servicesCount++;
                if (service.type === 'rental') carsCount++;
            });
            
            updateStats(servicesCount, carsCount);
        })
        .catch((error) => {
            console.error("خطأ في تحميل الخدمات: ", error);
            servicesContainer.innerHTML = '<p class="error">حدث خطأ في تحميل الخدمات. يرجى المحاولة لاحقاً.</p>';
        });
}

// عرض خدمة واحدة
function displayService(service) {
    const serviceCard = document.createElement('div');
    serviceCard.className = `service-card ${service.featured ? 'featured' : ''}`;
    
    serviceCard.innerHTML = `
        <div class="service-type">
            <i class="${typeIcons[service.type] || typeIcons.other}"></i>
            ${typeNames[service.type] || typeNames.other}
        </div>
        <h3>${service.name}</h3>
        <p class="service-location">
            <i class="fas fa-map-marker-alt"></i> ${service.location}
        </p>
        <p class="service-phone">
            <i class="fas fa-phone"></i> ${service.phone}
        </p>
        <p class="service-description">${service.description || "لا يوجد وصف"}</p>
        ${service.featured ? '<div class="featured-badge">مميز</div>' : ''}
        <div class="service-actions">
            <small>تمت الإضافة: ${formatDate(service.createdAt)}</small>
        </div>
    `;
    
    servicesContainer.appendChild(serviceCard);
}

// إضافة خدمة جديدة
function addNewService() {
    const name = document.getElementById('service-name').value.trim();
    const type = document.getElementById('service-type').value;
    const phone = document.getElementById('service-phone').value.trim();
    const location = document.getElementById('service-location').value;
    const description = document.getElementById('service-description').value.trim();
    
    // التحقق من البيانات
    if (!name || !type || !phone || !location) {
        alert("الرجاء ملء جميع الحقول الإلزامية (*)");
        return;
    }
    
    // التحقق من صحة رقم الهاتف
    if (!/^[0-9+\-\s]{8,}$/.test(phone)) {
        alert("يرجى إدخال رقم هاتف صحيح");
        return;
    }
    
    const submitBtn = addServiceForm.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'جاري الإضافة...';
    submitBtn.disabled = true;
    
    // بيانات الخدمة الجديدة
    const newService = {
        name: name,
        type: type,
        phone: phone,
        location: location,
        description: description || "لا يوجد وصف",
        featured: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    // إضافة إلى Firebase
    db.collection('services').add(newService)
        .then((docRef) => {
            alert("تم إضافة الخدمة بنجاح!");
            addServiceForm.reset();
            
            // إعادة تحميل الخدمات
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            loadServices(activeFilter);
        })
        .catch((error) => {
            console.error("خطأ في إضافة الخدمة: ", error);
            alert("حدث خطأ في إضافة الخدمة. يرجى المحاولة مرة أخرى.");
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
}

// حذف خدمة عن طريق رقم الهاتف
function deleteServiceByPhone() {
    const phoneToDelete = document.getElementById('delete-phone').value.trim();
    
    if (!phoneToDelete) {
        alert("يرجى إدخال رقم الهاتف");
        return;
    }
    
    if (!confirm("هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.")) {
        return;
    }
    
    const deleteBtn = deleteServiceForm.querySelector('.delete-btn');
    const originalText = deleteBtn.textContent;
    deleteBtn.textContent = 'جاري الحذف...';
    deleteBtn.disabled = true;
    
    // البحث عن الخدمة بحذف الهاتف
    db.collection('services').where('phone', '==', phoneToDelete).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                alert("لم يتم العثور على خدمة بهذا الرقم!");
                return;
            }
            
            // حذف جميع الخدمات المطابقة (يجب أن يكون رقم واحد فقط)
            const deletePromises = [];
            querySnapshot.forEach((doc) => {
                deletePromises.push(doc.ref.delete());
            });
            
            return Promise.all(deletePromises);
        })
        .then(() => {
            alert("تم حذف الخدمة بنجاح!");
            deleteServiceForm.reset();
            
            // إعادة تحميل الخدمات
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            loadServices(activeFilter);
        })
        .catch((error) => {
            console.error("خطأ في حذف الخدمة: ", error);
            alert("حدث خطأ في حذف الخدمة. يرجى المحاولة مرة أخرى.");
        })
        .finally(() => {
            deleteBtn.textContent = originalText;
            deleteBtn.disabled = false;
        });
}

// تحديث الإحصائيات
function updateStats(totalServices, totalCars) {
    totalServicesElement.textContent = totalServices;
    totalCarsElement.textContent = totalCars;
}

// تنسيق التاريخ
function formatDate(timestamp) {
    if (!timestamp) return "قريباً";
    
    const date = timestamp.toDate();
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return "الآن";
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    
    return date.toLocaleDateString('ar-EG');
}
