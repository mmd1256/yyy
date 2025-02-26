// مدیریت سبد خرید
document.addEventListener('DOMContentLoaded', function() {
    // متغیرهای سبد خرید - ذخیره در localStorage برای حفظ اطلاعات بین بارگذاری‌های صفحه
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    
    // انتخاب المان‌های مورد نیاز
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    const cartCountElement = document.getElementById('cart-count');
    const cartModal = document.getElementById('cart-modal');
    const cartButton = document.getElementById('cart-button');
    const closeButton = document.querySelector('.close');
    const cartItemsContainer = document.getElementById('cart-items');
    const totalPriceElement = document.getElementById('total-price');
    const checkoutButton = document.getElementById('checkout-button');
    const clearCartButton = document.getElementById('clear-cart-button') || createClearCartButton();
    
    // به‌روزرسانی اولیه شمارنده سبد خرید
    updateCartCounter();
    
    // ایجاد دکمه پاک کردن سبد خرید اگر وجود نداشته باشد
    function createClearCartButton() {
        const button = document.createElement('button');
        button.id = 'clear-cart-button';
        button.className = 'clear-cart-button';
        button.textContent = 'پاک کردن سبد خرید';
        
        // اضافه کردن به کنار دکمه پرداخت
        if (checkoutButton && checkoutButton.parentNode) {
            checkoutButton.parentNode.insertBefore(button, checkoutButton);
        }
        
        return button;
    }
    
    // اضافه کردن رویداد کلیک به دکمه‌های افزودن به سبد خرید
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.closest('.product');
            if (!product) {
                console.error('محصول یافت نشد');
                return;
            }
            
            const productId = product.dataset.id;
            const productName = product.dataset.name;
            const productPrice = parseInt(product.dataset.price);
            const productImage = product.dataset.image || ''; // اضافه کردن تصویر محصول
            
            if (!productId || !productName || isNaN(productPrice)) {
                console.error('اطلاعات محصول ناقص است', { productId, productName, productPrice });
                return;
            }
            
            // بررسی اگر محصول قبلاً در سبد خرید وجود دارد
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += 1;
            } else {
                cart.push({
                    id: productId,
                    name: productName,
                    price: productPrice,
                    image: productImage,
                    quantity: 1
                });
            }
            
            // به‌روزرسانی تعداد آیتم‌های سبد خرید
            cartCount++;
            updateCartCounter();
            
            // ذخیره سبد خرید در localStorage
            saveCart();
            
            // نمایش پیام موفقیت
            showNotification(`${productName} به سبد خرید اضافه شد`);
            
            // به‌روزرسانی نمایش سبد خرید اگر باز است
            if (cartModal.style.display === 'block') {
                updateCartDisplay();
            }
            
            // افکت انیمیشن برای دکمه سبد خرید
            animateCartButton();
        });
    });
    
    // افکت انیمیشن برای دکمه سبد خرید
    function animateCartButton() {
        cartButton.classList.add('pulse');
        setTimeout(() => {
            cartButton.classList.remove('pulse');
        }, 500);
    }
    
    // به‌روزرسانی شمارنده سبد خرید
    function updateCartCounter() {
        cartCountElement.textContent = cartCount;
        
        // نمایش یا مخفی کردن شمارنده بر اساس تعداد
        if (cartCount > 0) {
            cartCountElement.style.display = 'inline-block';
        } else {
            cartCountElement.style.display = 'none';
        }
    }
    
    // ذخیره سبد خرید در localStorage
    function saveCart() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    
    // نمایش پیام اعلان
    function showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // اضافه کردن دکمه بستن به اعلان
        const closeNotif = document.createElement('span');
        closeNotif.innerHTML = '&times;';
        closeNotif.className = 'close-notification';
        closeNotif.onclick = function() {
            notification.remove();
        };
        notification.appendChild(closeNotif);
        
        document.body.appendChild(notification);
        
        // حذف اعلان بعد از 3 ثانیه
        setTimeout(() => {
            notification.classList.add('hide');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 500);
        }, 3000);
    }
    
    // به‌روزرسانی نمایش سبد خرید
    function updateCartDisplay() {
        cartItemsContainer.innerHTML = '';
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-message">سبد خرید شما خالی است</p>';
            totalPriceElement.textContent = '0';
            return;
        }
        
        let totalPrice = 0;
        
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            totalPrice += itemTotal;
            
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            
            // اضافه کردن تصویر محصول اگر موجود باشد
            const imageHtml = item.image ? 
                `<div class="item-image"><img src="${item.image}" alt="${item.name}"></div>` : '';
            
            cartItem.innerHTML = `
                ${imageHtml}
                <div class="item-details">
                    <h4>${item.name}</h4>
                    <p>قیمت واحد: ${formatPrice(item.price)} تومان</p>
                    <div class="quantity-control">
                        <button class="decrease-quantity" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="increase-quantity" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div class="item-total">
                    <p>مجموع: ${formatPrice(itemTotal)} تومان</p>
                    <button class="remove-item" data-id="${item.id}">حذف</button>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItem);
        });
        
        // نمایش تخفیف (اگر وجود داشته باشد)
        const discount = calculateDiscount(totalPrice);
        const finalPrice = totalPrice - discount;
        
        // اضافه کردن اطلاعات قیمت نهایی با تخفیف
        const priceDetailsHtml = `
            <div class="price-details">
                <div class="price-row">
                    <span>مجموع:</span>
                    <span>${formatPrice(totalPrice)} تومان</span>
                </div>
                ${discount > 0 ? `
                <div class="price-row discount">
                    <span>تخفیف:</span>
                    <span>-${formatPrice(discount)} تومان</span>
                </div>
                <div class="price-row final-price">
                    <span>قیمت نهایی:</span>
                    <span>${formatPrice(finalPrice)} تومان</span>
                </div>
                ` : ''}
            </div>
        `;
        
        // اضافه کردن جزئیات قیمت به سبد خرید
        const priceDetails = document.createElement('div');
        priceDetails.innerHTML = priceDetailsHtml;
        cartItemsContainer.appendChild(priceDetails);
        
        totalPriceElement.textContent = formatPrice(finalPrice);
        
        // اضافه کردن رویدادها به دکمه‌های کنترل تعداد
        addQuantityControlEvents();
    }
    
    // محاسبه تخفیف (مثال: تخفیف 10% برای خریدهای بالای 500,000 تومان)
    function calculateDiscount(totalPrice) {
        if (totalPrice > 500000) {
            return Math.round(totalPrice * 0.1); // 10% تخفیف
        }
        return 0;
    }
    
    // اضافه کردن رویدادها به دکمه‌های کنترل تعداد
    function addQuantityControlEvents() {
        // دکمه‌های افزایش تعداد
        document.querySelectorAll('.increase-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const item = cart.find(item => item.id === itemId);
                
                if (item) {
                    item.quantity += 1;
                    cartCount++;
                    updateCartCounter();
                    saveCart();
                    updateCartDisplay();
                }
            });
        });
        
        // دکمه‌های کاهش تعداد
        document.querySelectorAll('.decrease-quantity').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                const item = cart.find(item => item.id === itemId);
                
                if (item && item.quantity > 1) {
                    item.quantity -= 1;
                    cartCount--;
                    updateCartCounter();
                    saveCart();
                    updateCartDisplay();
                } else if (item && item.quantity === 1) {
                    // اگر تعداد 1 است، پرسیدن از کاربر برای حذف
                    if (confirm(`آیا مطمئن هستید که می‌خواهید ${item.name} را از سبد خرید حذف کنید؟`)) {
                        removeItemFromCart(itemId);
                    }
                }
            });
        });
        
        // دکمه‌های حذف آیتم
        document.querySelectorAll('.remove-item').forEach(button => {
            button.addEventListener('click', function() {
                const itemId = this.dataset.id;
                removeItemFromCart(itemId);
            });
        });
    }
    
    // حذف آیتم از سبد خرید
    function removeItemFromCart(itemId) {
        const itemIndex = cart.findIndex(item => item.id === itemId);
        
        if (itemIndex !== -1) {
            const removedItem = cart[itemIndex];
            cartCount -= removedItem.quantity;
            updateCartCounter();
            
            cart.splice(itemIndex, 1);
            saveCart();
            updateCartDisplay();
            
            showNotification(`${removedItem.name} از سبد خرید حذف شد`, 'info');
        }
    }
    
    // فرمت‌بندی قیمت
    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    
    // نمایش مدال سبد خرید
    cartButton.addEventListener('click', function(e) {
        e.preventDefault();
        cartModal.style.display = 'block';
        updateCartDisplay();
        
        // اضافه کردن کلاس به body برای جلوگیری از اسکرول
        document.body.classList.add('modal-open');
    });
    
    // بستن مدال سبد خرید
    closeButton.addEventListener('click', function() {
        closeCartModal();
    });
    
    // بستن مدال با کلیک خارج از محتوا
    window.addEventListener('click', function(event) {
        if (event.target === cartModal) {
            closeCartModal();
        }
    });
    
    // بستن مدال با کلید Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && cartModal.style.display === 'block') {
            closeCartModal();
        }
    });
    
    // تابع بستن مدال سبد خرید
    function closeCartModal() {
        cartModal.style.display = 'none';
        document.body.classList.remove('modal-open');
    }
    
    // دکمه پاک کردن سبد خرید
    clearCartButton.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('سبد خرید شما در حال حاضر خالی است', 'info');
            return;
        }
        
        if (confirm('آیا مطمئن هستید که می‌خواهید سبد خرید را پاک کنید؟')) {
            cart = [];
            cartCount = 0;
            updateCartCounter();
            saveCart();
            updateCartDisplay();
            showNotification('سبد خرید با موفقیت پاک شد', 'info');
        }
    });
    
    // دکمه تکمیل خرید
    checkoutButton.addEventListener('click', function() {
        if (cart.length === 0) {
            showNotification('سبد خرید شما خالی است', 'error');
            return;
        }
        
        // ایجاد فرم اطلاعات مشتری
        showCheckoutForm();
    });
    
    // نمایش فرم تکمیل خرید
    function showCheckoutForm() {
        // ایجاد مدال جدید برای فرم پرداخت
        const checkoutModal = document.createElement('div');
        checkoutModal.className = 'modal checkout-modal';
        
        const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discount = calculateDiscount(totalPrice);
        const finalPrice = totalPrice - discount;
        
        checkoutModal.innerHTML = `
            <div class="modal-content checkout-content">
                <span class="close checkout-close">&times;</span>
                <h2>تکمیل خرید</h2>
                <form id="checkout-form">
                    <div class="form-group">
                        <label for="name">نام و نام خانوادگی</label>
                        <input type="text" id="name" name="name" required>
                    </div>
                    <div class="form-group">
                        <label for="phone">شماره تماس</label>
                        <input type="tel" id="phone" name="phone" pattern="[0-9]{11}" required>
                    </div>
                    <div class="form-group">
                        <label for="address">آدرس</label>
                        <textarea id="address" name="address" required></textarea>
                    </div>
                    <div class="form-group">
                        <label for="payment-method">روش پرداخت</label>
                        <select id="payment-method" name="payment-method" required>
                            <option value="">انتخاب کنید</option>
                            <option value="online">پرداخت آنلاین</option>
                            <option value="cash">پرداخت در محل</option>
                        </select>
                    </div>
                    <div class="order-summary">
                        <h3>خلاصه سفارش</h3>
                        <p>تعداد اقلام: ${cartCount}</p>
                        <p>مجموع: ${formatPrice(totalPrice)} تومان</p>
                        ${discount > 0 ? `<p class="discount">تخفیف: ${formatPrice(discount)} تومان</p>` : ''}
                        <p class="final-price">قیمت نهایی: ${formatPrice(finalPrice)} تومان</p>
                    </div>
                    <div class="form-actions">
                        <button type="submit" class="submit-order">ثبت سفارش</button>
                        <button type="button" class="cancel-order">انصراف</button>
                    </div>
                </form>
            </div>
        `;
        
        document.body.appendChild(checkoutModal);
        
        // بستن مدال سبد خرید
        closeCartModal();
        
        // نمایش مدال پرداخت
        checkoutModal.style.display = 'block';
        
        // اضافه کردن رویدادها به دکمه‌های فرم
        const closeCheckoutButton = checkoutModal.querySelector('.checkout-close');
        const cancelOrderButton = checkoutModal.querySelector('.cancel-order');
        const checkoutForm = document.getElementById('checkout-form');
        
        closeCheckoutButton.addEventListener('click', function() {
            document.body.removeChild(checkoutModal);
        });
        
        cancelOrderButton.addEventListener('click', function() {
            document.body.removeChild(checkoutModal);
        });
        
        checkoutForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // جمع‌آوری اطلاعات فرم
            const formData = {
                name: document.getElementById('name').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                paymentMethod: document.getElementById('payment-method').value,
                items: cart,
                totalPrice: finalPrice
            };
            
            // در اینجا می‌توانید کد مربوط به ارسال اطلاعات به سرور را اضافه کنید
            console.log('اطلاعات سفارش:', formData);
            
            // نمایش پیام موفقیت
            document.body.removeChild(checkoutModal);
            showOrderConfirmation(formData);
            
            // خالی کردن سبد خرید
            cart = [];
            cartCount = 0;
            updateCartCounter();
            saveCart();
        });
    }
    
    // نمایش تأیید سفارش
    function showOrderConfirmation(orderData) {
        const confirmationModal = document.createElement('div');
        confirmationModal.className = 'modal confirmation-modal';
        
        confirmationModal.innerHTML = `
            <div class="modal-content confirmation-content">
                <h2>سفارش شما با موفقیت ثبت شد</h2>
                <div class="confirmation-details">
                    <p>شماره سفارش: <strong>${generateOrderNumber()}</strong></p>
                    <p>نام: <strong>${orderData.name}</strong></p>
                    <p>مبلغ پرداختی: <strong>${formatPrice(orderData.totalPrice)} تومان</strong></p>
                    <p>روش پرداخت: <strong>${orderData.paymentMethod === 'online' ? 'پرداخت آنلاین' : 'پرداخت در محل'}</strong></p>
                </div>
                <p class="thank-you-message">با تشکر از خرید شما</p>
                <button class="close-confirmation">بازگشت به فروشگاه</button>
            </div>
        `;
        
        document.body.appendChild(confirmationModal);
        confirmationModal.style.display = 'block';
        
        const closeConfirmationButton = confirmationModal.querySelector('.close-confirmation');
        closeConfirmationButton.addEventListener('click', function() {
            document.body.removeChild(confirmationModal);
        });
    }
    
    // تولید شماره سفارش تصادفی
    function generateOrderNumber() {
        return 'ORD-' + Math.floor(100000 + Math.random() * 900000);
    }
    
    // به‌روزرسانی اولیه نمایش سبد خرید
    updateCartCounter();
});

// اضافه کردن استایل‌های CSS برای انیمیشن و بهبود ظاهر
const cartStyles = document.createElement('style');
cartStyles.textContent = `
    .pulse {
        animation: pulse 0.5s ease-in-out;
    }
    
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: #4CAF50;
        color: white;
        border-radius: 4px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 1000;
        transition: opacity 0.5s, transform 0.5s;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 250px;
    }
    
    .notification.info {
        background-color: #2196F3;
    }
    
    .notification.error {
        background-color: #F44336;
    }
    
    .notification.hide {
        opacity: 0;
        transform: translateY(-20px);
    }
    
    .close-notification {
        margin-left: 10px;
        cursor: pointer;
        font-size: 20px;
    }
    
    .modal-open {
        overflow: hidden;
    }
    
    .cart-item {
        display: flex;
        border-bottom: 1px solid #eee;
        padding: 15px 0;
        align-items: center;
    }
    
    .item-image {
        width: 60px;
        height: 60px;
        margin-right: 15px;
    }
    
    .item-image img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 4px;
    }
    
    .quantity-control {
        display: flex;
        align-items: center;
        margin-top: 10px;
    }
    
    .quantity-control button {
        width: 25px;
        height: 25px;
        border-radius: 50%;
        border: none;
        background-color: #f0f0f0;
        cursor: pointer;
        font-weight: bold;
    }
    
    .quantity-control button:hover {
        background-color: #e0e0e0;
    }
    
    .quantity {
        margin: 0 10px;
        min-width: 20px;
        text-align: center;
    }
    
    .price-details {
        margin-top: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 4px;
    }
    
    .price-row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 10px;
    }
    
    .discount {
        color: #e53935;
    }
    
    .final-price {
        font-weight: bold;
        font-size: 1.1em;
        border-top: 1px solid #ddd;
        padding-top: 10px;
    }
    
    .empty-cart-message {
        text-align: center;
        padding: 20px;
        color: #757575;
    }
    
    .checkout-modal .modal-content {
        max-width: 600px;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-group label {
        display: block;
        margin-bottom: 5px;
        font-weight: bold;
    }
    
    .form-group input,
    .form-group textarea,
    .form-group select {
        width: 100%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-family: inherit;
    }
    
    .form-actions {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
    }
    
    .submit-order,
    .cancel-order {
        padding: 10px 20px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .submit-order {
        background-color: #4CAF50;
        color: white;
    }
    
    .cancel-order {
        background-color: #f0f0f0;
    }
    
    .order-summary {
        margin: 20px 0;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 4px;
    }
    
    .confirmation-modal .modal-content {
        text-align: center;
        max-width: 500px;
    }
    
    .confirmation-details {
        margin: 20px 0;
        text-align: right;
        background-color: #f9f9f9;
        padding: 15px;
        border-radius: 4px;
    }
    
    .thank-you-message {
        font-size: 1.2em;
        margin: 20px 0;
        color: #4CAF50;
    }
    
    .close-confirmation {
        padding: 10px 20px;
        background-color: #4CAF50;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }
    
    .clear-cart-button {
        background-color: #f44336;
        color: white;
        border: none;
        padding: 10px 15px;
        border-radius: 4px;
        cursor: pointer;
        margin-right: 10px;
    }
`;

document.head.appendChild(cartStyles);
