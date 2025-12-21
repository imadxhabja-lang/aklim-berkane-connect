// البيانات الأولية للخدمات
let services = [
    {
        id: 1,
        name: "توصيل طعام سريع",
        type: "delivery",
        phone: "0624-112233",
        location: "أكليم",
        description: "توصيل وجبات سريعة لجميع أنحاء المدينة",
        featured: true
    },
    {
        id: 2,
        name: "كهربائي منازل",
        type: "maintenance",
        phone: "0623-456789",
        location: "أكليم",
        description: "إصلاح جميع أعطال الكهرباء المنزلية",
        featured: true
    },
    {
        id: 3,
        name: "طبيب عام",
        type: "medical",
        phone: "0537-123456",
        location: "أكليم",
        description: "استشارات طبية عامة وفحوصات",
        featured: true
    },
    {
        id: 4,
        name: "سباك محترف",
        type: "maintenance",
        phone: "0612-345678",
        location: "أكليم",
        description: "حل جميع مشاكل السباكة المنزلية",
        featured: false
    },
    {
        id: 5,
        name: "كراء سيارة دفع رباعي",
        type: "rental",
        phone: "0620-445566",
        location: "بركان",
        description: "كراء سيارات دفع رباعي لجميع المناسبات",
        featured: false
    }
];

// العناصر الرئيسية في الصفحة
const servicesContainer = document.getElementById('services-container');
const addServiceForm = document.getElementById('add-service-form');
const deleteServiceForm = document.getElementById('delete-service-form');
const filterButtons = document.querySelectorAll('.filter-btn');
const totalServicesElement = document.getElementById('total-services');
const totalCarsElement = document.getElementById('total-cars');

// أيقونات لأنواع الخدمات
const typeIcons = {
    delivery: "fas fa-shipping-fast",
    maintenance: "fas fa-tools",
    medical: "fas fa-user-md",
    rental: "fas fa-car",
    other: "fas fa-star"
};

// أسماء أنواع الخدمات بالعربية
const typeNames = {
    delivery: "توصيل",
    maintenance: "صيانة",
    medical: "طبي",
    rental: "كراء سيارات",
    other: "أخرى"
};

// تهيئة الصفحة عند التحميل
document.addEventListener('DOMContentLoaded', function() {
    displayServices('all'); // عرض جميع الخدمات
    updateStats(); // تحديث الإحصائيات
    
    // إضافة خدمة جديدة
    addServiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('service-name').value;
        const type = document.getElementById('service-type').value;
        const phone = document.getElementById('service-phone').value;
        const location = document.getElementById('service-location').value;
        const description = document.getElementById('service-description').value;
        
        if (!name || !type || !phone || !location) {
            alert("الرجاء ملء جميع الحقول الإلزامية (*)");
            return;
        }
        
        const newService = {
            id: Date.now(), // إنشاء معرف فريد
            name: name,
            type: type,
            phone: phone,
            location: location,
            description: description || "لا يوجد وصف",
            featured: false
        };
        
        services.push(newService);
        displayServices('all');
        updateStats();
        addServiceForm.reset();
        
        alert("تم إضافة الخدمة بنجاح!");
    });
    
    // حذف خدمة
    deleteServiceForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const phoneToDelete = document.getElementById('delete-phone').value;
        const initialLength = services.length;
        
        services = services.filter(service => service.phone !== phoneToDelete);
        
        if (services.length < initialLength) {
            displayServices('all');
            updateStats();
            alert("تم حذف الخدمة بنجاح!");
        } else {
            alert("لم يتم العثور على خدمة بهذا الرقم!");
        }
        
        deleteServiceForm.reset();
    });
    
    // فلترة الخدمات
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // إزالة النشاط من جميع الأزرار
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // إضافة النشاط للزر المحدد
            this.classList.add('active');
            // عرض الخدمات المفلترة
            displayServices(this.dataset.filter);
        });
    });
});

// عرض الخدمات حسب النوع
function displayServices(filterType) {
    servicesContainer.innerHTML = '';
    
    let filteredServices = services;
    
    if (filterType !== 'all') {
        filteredServices = services.filter(service => service.type === filterType);
    }
    
    if (filteredServices.length === 0) {
        servicesContainer.innerHTML = '<p class="no-services">لا توجد خدمات متاحة في هذا القسم حالياً.</p>';
        return;
    }
    
    filteredServices.forEach(service => {
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
            <p class="service-description">${service.description}</p>
            ${service.featured ? '<div class="featured-badge">مميز</div>' : ''}
        `;
        
        servicesContainer.appendChild(serviceCard);
    });
}

// تحديث الإحصائيات
function updateStats() {
    // تحديث عدد الخدمات
    totalServicesElement.textContent = services.length;
    
    // تحديث عدد سيارات الكراء
    const rentalServices = services.filter(service => service.type === 'rental');
    totalCarsElement.textContent = rentalServices.length;
      }
