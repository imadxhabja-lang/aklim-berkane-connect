// عناصر DOM
const servicesContainer = document.getElementById('services-container');
const carsContainer = document.getElementById('cars-container');
const addServiceForm = document.getElementById('add-service-form');
const deleteServiceForm = document.getElementById('delete-service-form');
const addCarForm = document.getElementById('add-car-form');
const filterButtons = document.querySelectorAll('.filter-btn');

// التهيئة
document.addEventListener('DOMContentLoaded', function() {
    loadServices();
    loadCars();
    
    // إضافة خدمة
    if (addServiceForm) {
        addServiceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            addService();
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
            addCar();
        });
    }
    
    // الفلترة
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            loadServices(this.dataset.filter);
        });
    });
});

// تحميل الخدمات
function loadServices(filter = 'all') {
    servicesContainer.innerHTML = '<p>جاري التحميل...</p>';
    
    let query = db.collection('services');
    if (filter !== 'all') {
        query = query.where('type', '==', filter);
    }
    
    query.get().then(querySnapshot => {
        servicesContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            servicesContainer.innerHTML = '<p>لا توجد خدمات</p>';
            updateStats();
            return;
        }
        
        let count = 0;
        querySnapshot.forEach(doc => {
            displayService(doc.data());
            count++;
        });
        
        document.getElementById('total-services').textContent = count;
    }).catch(error => {
        servicesContainer.innerHTML = '<p>خطأ في التحميل</p>';
        console.error(error);
    });
}

// عرض خدمة
function displayService(service) {
    const card = document.createElement('div');
    card.className = 'service-card';
    card.innerHTML = `
        <div class="service-type">${getTypeName(service.type)}</div>
        <h3>${service.name}</h3>
        <p><i class="fas fa-map-marker-alt"></i> ${service.location}</p>
        <p class="service-phone"><i class="fas fa-phone"></i> ${service.phone}</p>
        ${service.description ? `<p>${service.description}</p>` : ''}
    `;
    servicesContainer.appendChild(card);
}

// إضافة خدمة
function addService() {
    const name = document.getElementById('service-name').value;
    const type = document.getElementById('service-type').value;
    const phone = document.getElementById('service-phone').value;
    const location = document.getElementById('service-location').value;
    const description = document.getElementById('service-description').value;
    
    if (!name || !type || !phone || !location) {
        alert('املأ الحقول المطلوبة');
        return;
    }
    
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
            alert('تمت الإضافة!');
            addServiceForm.reset();
            loadServices();
        })
        .catch(error => {
            alert('خطأ في الإضافة');
            console.error(error);
        });
}

// حذف خدمة
function deleteService() {
    const phone = document.getElementById('delete-phone').value;
    
    if (!phone) {
        alert('أدخل رقم الهاتف');
        return;
    }
    
    if (!confirm('تأكيد الحذف؟')) return;
    
    db.collection('services').where('phone', '==', phone).get()
        .then(querySnapshot => {
            if (querySnapshot.empty) {
                alert('لا توجد خدمة بهذا الرقم');
                return;
            }
            
            querySnapshot.forEach(doc => {
                doc.ref.delete();
            });
            
            alert('تم الحذف!');
            deleteServiceForm.reset();
            loadServices();
        })
        .catch(error => {
            alert('خطأ في الحذف');
            console.error(error);
        });
}

// تحميل السيارات
function loadCars() {
    carsContainer.innerHTML = '<p>جاري تحميل السيارات...</p>';
    
    db.collection('cars').get().then(querySnapshot => {
        carsContainer.innerHTML = '';
        
        if (querySnapshot.empty) {
            carsContainer.innerHTML = '<p>لا توجد سيارات</p>';
            updateStats();
            return;
        }
        
        let count = 0;
        querySnapshot.forEach(doc => {
            displayCar(doc.data());
            count++;
        });
        
        document.getElementById('total-cars').textContent = count;
    }).catch(error => {
        carsContainer.innerHTML = '<p>خطأ في التحميل</p>';
        console.error(error);
    });
}

// عرض سيارة
function displayCar(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    card.innerHTML = `
        <h3>${car.brand} ${car.model}</h3>
        <p><i class="fas fa-car"></i> ${getCarTypeName(car.type)}</p>
        <p><i class="fas fa-map-marker-alt"></i> ${car.location}</p>
        <div class="car-price">${car.price} درهم/يوم</div>
        <p class="service-phone"><i class="fas fa-phone"></i> ${car.phone}</p>
    `;
    carsContainer.appendChild(card);
}

// إضافة سيارة
function addCar() {
    const brand = document.getElementById('car-brand').value;
    const model = document.getElementById('car-model').value;
    const type = document.getElementById('car-type').value;
    const price = document.getElementById('car-price').value;
    const location = document.getElementById('car-location').value;
    const phone = document.getElementById('car-phone').value;
    
    if (!brand || !model || !type || !price || !location || !phone) {
        alert('املأ جميع الحقول');
        return;
    }
    
    const carData = {
        brand: brand,
        model: model,
        type: type,
        price: price,
        location: location,
        phone: phone,
        createdAt: new Date().toISOString()
    };
    
    db.collection('cars').add(carData)
        .then(() => {
            alert('تمت إضافة السيارة!');
            addCarForm.reset();
            loadCars();
        })
        .catch(error => {
            alert('خطأ في الإضافة');
            console.error(error);
        });
}

// تحديث الإحصائيات
function updateStats() {
    db.collection('services').get().then(snapshot => {
        document.getElementById('total-services').textContent = snapshot.size;
    });
    
    db.collection('cars').get().then(snapshot => {
        document.getElementById('total-cars').textContent = snapshot.size;
    });
}

// أسماء الأنواع
function getTypeName(type) {
    const names = {
        delivery: 'توصيل',
        maintenance: 'صيانة',
        medical: 'طبي',
        rental: 'كراء سيارات'
    };
    return names[type] || type;
}

function getCarTypeName(type) {
    const names = {
        sedan: 'سيدان',
        suv: 'دفع رباعي',
        van: 'فان'
    };
    return names[type] || type;
    }
