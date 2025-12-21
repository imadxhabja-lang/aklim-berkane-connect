// ==============================
// 1. تعريف المتغيرات الرئيسية
// ==============================

// عناصر DOM
const servicesContainer = document.getElementById('services-container');
const carsContainer = document.getElementById('cars-container');
const addServiceForm = document.getElementById('add-service-form');
const deleteServiceForm = document.getElementById('delete-service-form');
const addCarForm = document.getElementById('add-car-form');
const directContactForm = document.getElementById('direct-contact-form');
const filterButtons = document.querySelectorAll('.filter-btn');

// إحصائيات
const totalServicesElement = document.getElementById('total-services');
const totalCarsElement = document.getElementById('total-cars');

// أسماء الأنواع
const serviceTypeNames = {
    delivery: 'توصيل',
    maintenance: 'صيانة',
    medical: 'طبي',
    rental: 'كراء سيارات'
};

const carTypeNames = {
    sedan: 'سيدان',
    suv: 'دفع رباعي',
    van: 'فان / عائلية',
    luxury: 'فخمة'
};

// ==============================
// 2. تهيئة الصفحة
// ==============================

document.addEventListener('DOMContentLoaded', function() {
    console.log('جاري تهيئة الصفحة...');
    
    // تحميل البيانات
    loadServices();
    loadCars();
    
    // إعداد النماذج
    setupForms();
    
    // إعداد الفلترة
    setupFiltering();
});

// ==============================
// 3. دوال الخدمات
// ==============================

// تحميل الخدمات
function loadServices(filter = 'all') {
    servicesContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل الخدمات...</div>';
    
    let query = db.collection('services');
    
    if (filter !== 'all') {
        query = query.where('type', '==', filter);
    }
    
    query.orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            servicesContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                servicesContainer.innerHTML = '<div class="no-data">لا توجد خدمات متاحة حالياً. كن أول من يضيف خدمة!</div>';
                updateStats();
                return;
            }
            
            let count = 0;
            querySnapshot.forEach((doc) => {
                displayService(doc.data());
                count++;
            });
            
            updateStats();
        })
        .catch((error) => {
            console.error('خطأ في تحميل الخدمات:', error);
            servicesContainer.innerHTML = '<div class="error">حدث خطأ في تحميل الخدمات. يرجى المحاولة لاحقاً.</div>';
        });
}

// عرض خدمة
function displayService(service) {
    const serviceCard = document.createElement('div');
    serviceCard.className = 'service-card';
    
    serviceCard.innerHTML = `
        <div class="service-type">
            <i class="fas fa-${getServiceIcon(service.type)}"></i>
            ${serviceTypeNames[service.type] || service.type}
        </div>
        <h3>${service.name}</h3>
        <p class="service-location">
            <i class="fas fa-map-marker-alt"></i> ${service.location}
        </p>
        <p class="service-phone">
            <i class="fas fa-phone"></i> ${service.phone}
        </p>
        ${service.description ? `<p class="service-description">${service.description}</p>` : ''}
        <div class="service-actions">
            <small>تمت الإضافة: ${formatDate(service.createdAt)}</small>
        </div>
    `;
    
    servicesContainer.appendChild(serviceCard);
}

// أيقونة الخدمة
function getServiceIcon(type) {
    const icons = {
        delivery: 'shipping-fast',
        maintenance: 'tools',
        medical: 'user-md',
        rental: 'car'
    };
    return icons[type] || 'star';
}

// ==============================
// 4. دوال السيارات
// ==============================

// تحميل السيارات
function loadCars() {
    if (!carsContainer) return;
    
    carsContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> جاري تحميل السيارات...</div>';
    
    db.collection('cars').orderBy('createdAt', 'desc').get()
        .then((querySnapshot) => {
            carsContainer.innerHTML = '';
            
            if (querySnapshot.empty) {
                carsContainer.innerHTML = '<div class="no-data">لا توجد سيارات متاحة للكراء حالياً. كن أول من يعرض سيارته!</div>';
                updateStats();
                return;
            }
            
            querySnapshot.forEach((doc) => {
                displayCar(doc.data());
            });
            
            updateStats();
        })
        .catch((error) => {
            console.error('خطأ في تحميل السيارات:', error);
            carsContainer.innerHTML = '<div class="error">حدث خطأ في تحميل السيارات. يرجى المحاولة لاحقاً.</div>';
        });
}

// عرض سيارة
function displayCar(car) {
    const carCard = document.createElement('div');
    carCard.className = 'car-card';
    
    carCard.innerHTML = `
        <div class="car-type">
            <i class="fas fa-${getCarIcon(car.type)}"></i>
            ${carTypeNames[car.type] || car.type}
        </div>
        <h3>${car.brand} ${car.model}</h3>
        
        <div class="car-details">
            <div class="car-detail">
                <i class="fas fa-money-bill-wave"></i> ${car.price} درهم/يوم
            </div>
            <div class="car-detail">
                <i class="fas fa-map-marker-alt"></i> ${car.location}
            </div>
        </div>
        
        <p class="service-phone">
            <i class="fas fa-phone"></i> ${car.phone}
        </p>
        
        <div class="car-actions">
            <button class="submit-btn" style="padding: 10px; margin-top: 10px;" onclick="window.location.href='tel:${car.phone}'">
                <i class="fas fa-phone"></i> اتصل الآن
            </button>
        </div>
        
        <div class="service-actions">
            <small>تمت الإضافة: ${formatDate(car.createdAt)}</small>
        </div>
    `;
    
    carsContainer.appendChild(carCard);
}

// أيقونة السيارة
function getCarIcon(type) {
    const icons = {
        sedan: 'car',
        suv: 'truck-pickup',
        van: 'van-shuttle',
        luxury: 'crown'
    };
    return icons[type] || 'car';
}

// ==============================
// 5. إعداد النماذج
// ==============================

function setupForms() {
    // إضافة خدمة
    if (addServiceForm) {
        addServiceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewService();
        });
    }
    
    // حذف خدمة
    if (deleteServiceForm) {
        deleteServiceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            deleteService();
        });
    }
    
    // إضافة سيارة
    if (addCarForm) {
        addCarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewCar();
        });
    }
    
    // نموذج التواصل
    if (directContactForm) {
        directContactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            sendContactMessage();
        });
    }
}

// إضافة خدمة جديدة
function addNewService() {
    const name = document.getElementById('service-name').value.trim();
    const type = document.getElementById('service-type').value;
    const phone = document.getElementById('service-phone').value.trim();
    const location = document.getElementById('service-location').value;
    const description = document.getElementById('service-description').value.trim();
    
    if (!name || !type || !phone || !location) {
        alert('الرجاء ملء جميع الحقول الإلزامية (*)');
        return;
    }
    
    const submitBtn = addServiceForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
    submitBtn.disabled = true;
    
    const serviceData = {
        name: name,
        type: type,
        phone: phone,
        location: location,
        description: description || '',
        createdAt: new Date().toISOString()
    };
    
    db.collection('services').add(serviceData)
        .then(() => {
            alert('✅ تمت إضافة الخدمة بنجاح!');
            addServiceForm.reset();
            
            // إعادة تحميل مع الفلترة الحالية
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            loadServices(activeFilter);
        })
        .catch((error) => {
            console.error('خطأ في إضافة الخدمة:', error);
            alert('❌ حدث خطأ في إضافة الخدمة. يرجى المحاولة مرة أخرى.');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// حذف خدمة
function deleteService() {
    const phone = document.getElementById('delete-phone').value.trim();
    
    if (!phone) {
        alert('الرجاء إدخال رقم الهاتف');
        return;
    }
    
    if (!confirm('⚠️ هل أنت متأكد من حذف هذه الخدمة؟ لا يمكن التراجع عن هذا الإجراء.')) {
        return;
    }
    
    const deleteBtn = deleteServiceForm.querySelector('.delete-btn');
    const originalText = deleteBtn.innerHTML;
    deleteBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحذف...';
    deleteBtn.disabled = true;
    
    db.collection('services').where('phone', '==', phone).get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                alert('لم يتم العثور على خدمة بهذا الرقم!');
                return;
            }
            
            const deletePromises = [];
            querySnapshot.forEach((doc) => {
                deletePromises.push(doc.ref.delete());
            });
            
            return Promise.all(deletePromises);
        })
        .then(() => {
            alert('✅ تم حذف الخدمة بنجاح!');
            deleteServiceForm.reset();
            
            const activeFilter = document.querySelector('.filter-btn.active').dataset.filter;
            loadServices(activeFilter);
        })
        .catch((error) => {
            console.error('خطأ في حذف الخدمة:', error);
            alert('❌ حدث خطأ في حذف الخدمة. يرجى المحاولة مرة أخرى.');
        })
        .finally(() => {
            deleteBtn.innerHTML = originalText;
            deleteBtn.disabled = false;
        });
}

// إضافة سيارة جديدة
function addNewCar() {
    const brand = document.getElementById('car-brand').value.trim();
    const model = document.getElementById('car-model').value.trim();
    const type = document.getElementById('car-type').value;
    const price = document.getElementById('car-price').value;
    const location = document.getElementById('car-location').value;
    const phone = document.getElementById('car-phone').value.trim();
    
    if (!brand || !model || !type || !price || !location || !phone) {
        alert('الرجاء ملء جميع الحقول الإلزامية (*)');
        return;
    }
    
    if (price < 50 || price > 5000) {
        alert('السعر يجب أن يكون بين 50 و 5000 درهم');
        return;
    }
    
    const submitBtn = addCarForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإضافة...';
    submitBtn.disabled = true;
    
    const carData = {
        brand: brand,
        model: model,
        type: type,
        price: parseInt(price),
        location: location,
        phone: phone,
        createdAt: new Date().toISOString()
    };
    
    db.collection('cars').add(carData)
        .then(() => {
            alert('✅ تمت إضافة السيارة بنجاح!');
            addCarForm.reset();
            loadCars();
        })
        .catch((error) => {
            console.error('خطأ في إضافة السيارة:', error);
            alert('❌ حدث خطأ في إضافة السيارة. يرجى المحاولة مرة أخرى.');
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// إرسال رسالة تواصل
function sendContactMessage() {
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();
    const feedbackElement = document.getElementById('form-feedback');
    
    if (!name || !email || !message) {
        feedbackElement.innerHTML = '<p style="color: #e74c3c;">الرجاء ملء جميع الحقول.</p>';
        return;
    }
    
    const submitBtn = directContactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الإرسال...';
    submitBtn.disabled = true;
    
    const messageData = {
        name: name,
        email: email,
        message: message,
        timestamp: new Date().toISOString(),
        status: 'new'
    };
    
    db.collection('contactMessages').add(messageData)
        .then(() => {
            feedbackElement.innerHTML = '<p style="color: #27ae60;">✅ شكراً لك! تم إرسال رسالتك بنجاح وسنتواصل معك قريباً.</p>';
            directContactForm.reset();
            
            // إخفاء رسالة النجاح بعد 5 ثوان
            setTimeout(() => {
                feedbackElement.innerHTML = '';
            }, 5000);
        })
        .catch((error) => {
            console.error('خطأ في إرسال الرسالة:', error);
            feedbackElement.innerHTML = '<p style="color: #e74c3c;">❌ عذراً، حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى لاحقاً.</p>';
        })
        .finally(() => {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        });
}

// ==============================
// 6. الفلترة
// ==============================

function setupFiltering() {
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadServices(this.dataset.filter);
        });
    });
}

// ==============================
// 7. دوال مساعدة
// ==============================

// تحديث الإحصائيات
function updateStats() {
    // تحديث عدد الخدمات
    db.collection('services').get()
        .then((querySnapshot) => {
            totalServicesElement.textContent = querySnapshot.size;
        })
        .catch((error) => {
            console.error('خطأ في تحديث إحصائية الخدمات:', error);
        });
    
    // تحديث عدد السيارات
    db.collection('cars').get()
        .then((querySnapshot) => {
            totalCarsElement.textContent = querySnapshot.size;
        })
        .catch((error) => {
            console.error('خطأ في تحديث إحصائية السيارات:', error);
        });
}

// تنسيق التاريخ
function formatDate(dateString) {
    if (!dateString) return 'غير محدد';
    
    try {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'الآن';
        if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
        if (diffMins < 1440) return `منذ ${Math.floor(diffMins / 60)} ساعة`;
        
        return date.toLocaleDateString('ar-EG');
    } catch (error) {
        return 'غير محدد';
    }
}

// ==============================
// 8. كود للتجربة السريعة (اختياري)
// ==============================

// لإضافة بيانات تجريبية (يمكن حذفها لاحقاً)
function addSampleData() {
    // بيانات خدمات عينة
    const sampleServices = [
        {
            name: 'توصيل طعام سريع',
            type: 'delivery',
            phone: '0624-112233',
            location: 'أكليم',
            description: 'توصيل وجبات سريعة لجميع أنحاء المدينة',
            createdAt: new Date().toISOString()
        },
        {
            name: 'كهربائي منازل',
            type: 'maintenance',
            phone: '0623-456789',
            location: 'أكليم',
            description: 'إصلاح جميع أعطال الكهرباء المنزلية',
            createdAt: new Date().toISOString()
        }
    ];
    
    // بيانات سيارات عينة
    const sampleCars = [
        {
            brand: 'تويوتا',
            model: 'كورولا 2023',
            type: 'sedan',
            price: 250,
            location: 'بركان',
            phone: '0620-445566',
            createdAt: new Date().toISOString()
        }
    ];
    
    // إضافة الخدمات العينة
    sampleServices.forEach(service => {
        db.collection('services').add(service);
    });
    
    // إضافة السيارات العينة
    sampleCars.forEach(car => {
        db.collection('cars').add(car);
    });
    
    alert('تم إضافة بيانات تجريبية. سيتم تحديث الصفحة...');
    setTimeout(() => {
        loadServices();
        loadCars();
    }, 1000);
}

// لتشغيل هذا الكود، افتح console المتصفح واكتب: addSampleData()
