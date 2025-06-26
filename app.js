// Boulangerie Goult Bilingual Order Application
let currentLang = 'fr';
let orderItems = [];
let cart = {};

// Text translations
const translations = {
  fr: {
    bakeryTitle: 'Commande Boulangerie – Goult',
    deliveryInfo: '🚚 Livraison tous les matins vers 8h (fermé le lundi sauf exception)',
    orderInfo: '⏰ Commande à passer avant 15h la veille via Valérie ou groupe WhatsApp',
    paymentInfo: '💳 Paiement direct au boulanger le dernier jour',
    nameLabel: 'Nom *',
    dateLabel: 'Date de livraison *',
    summaryBtnText: 'Voir Récapitulatif',
    modalTitle: 'Récapitulatif de votre commande',
    whatsappBtnText: 'Copier pour WhatsApp',
    closeBtnText: 'Fermer',
    tableHeaders: ['Nom', 'Description', 'Prix €', 'Quantité'],
    availabilityTitle: 'Disponibilité limitée :',
    clientLabel: 'Client :',
    deliveryDateLabel: 'Date de livraison :',
    totalLabel: 'Total :',
    nameRequired: 'Veuillez saisir votre nom.',
    dateRequired: 'Veuillez sélectionner une date de livraison.',
    noItemsSelected: 'Veuillez sélectionner au moins un produit.',
    whatsappIntro: 'Bonjour, je souhaite commander',
    whatsappName: 'Nom',
    whatsappDate: 'Date',
    whatsappTotal: 'Total',
    weekdays: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  },
  en: {
    bakeryTitle: 'Bakery Order – Goult',
    deliveryInfo: '🚚 Delivery every morning around 8am (closed Monday except exception)',
    orderInfo: '⏰ Order to be placed before 3pm the day before via Valérie or WhatsApp group',
    paymentInfo: '💳 Direct payment to the baker on the last day',
    nameLabel: 'Name *',
    dateLabel: 'Delivery date *',
    summaryBtnText: 'View Summary',
    modalTitle: 'Your order summary',
    whatsappBtnText: 'Copy to WhatsApp',
    closeBtnText: 'Close',
    tableHeaders: ['Name', 'Description', 'Price €', 'Quantity'],
    availabilityTitle: 'Limited availability:',
    clientLabel: 'Client:',
    deliveryDateLabel: 'Delivery date:',
    totalLabel: 'Total:',
    nameRequired: 'Please enter your name.',
    dateRequired: 'Please select a delivery date.',
    noItemsSelected: 'Please select at least one product.',
    whatsappIntro: 'Hello, I would like to order',
    whatsappName: 'Name',
    whatsappDate: 'Date',
    whatsappTotal: 'Total',
    weekdays: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  }
};

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Load saved language and cart from localStorage
        loadSavedState();
        
        // Set default delivery date (tomorrow)
        setDefaultDeliveryDate();
        
        // Generate categories and products
        generateCategories();
        
        // Set up event listeners
        setupEventListeners();
        
        // Update interface language
        updateLanguage();
        
    } catch (error) {
        console.error('Error initializing application:', error);
        showAlert('Erreur lors du chargement des données. Veuillez recharger la page.', 'error');
    }
});

// Load saved state from localStorage
function loadSavedState() {
    const savedLang = localStorage.getItem('bakery_lang');
    if (savedLang && translations[savedLang]) {
        currentLang = savedLang;
    }
    
    const savedCart = localStorage.getItem('bakery_cart');
    if (savedCart) {
        try {
            cart = JSON.parse(savedCart);
        } catch (e) {
            cart = {};
        }
    }
}

// Save state to localStorage
function saveState() {
    localStorage.setItem('bakery_lang', currentLang);
    localStorage.setItem('bakery_cart', JSON.stringify(cart));
}

// Set default delivery date to tomorrow
function setDefaultDeliveryDate() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dateString = tomorrow.toISOString().split('T')[0];
    document.getElementById('deliveryDate').value = dateString;
}

// Generate categories and products dynamically
function generateCategories() {
    const container = document.getElementById('categoriesContainer');
    container.innerHTML = '';
    
    DATA.categories.forEach(category => {
        const categorySection = createCategorySection(category);
        container.appendChild(categorySection);
    });
    
    // Restore cart quantities
    restoreCartQuantities();
}

// Create a category section with products
function createCategorySection(category) {
    const section = document.createElement('div');
    section.className = 'category-section';
    section.setAttribute('data-category-id', category.id);
    
    // Add mobile-open class for desktop or if saved in localStorage
    if (window.innerWidth > 768) {
        section.classList.add('mobile-open');
    }
    
    // Category header (collapsible)
    const header = document.createElement('div');
    header.className = 'category-header';
    header.innerHTML = `
        <span data-lang-key="category_${category.id}">${category[`name_${currentLang}`]}</span>
        <span class="category-toggle">▼</span>
    `;
    
    // Category content
    const content = document.createElement('div');
    content.className = 'category-content';
    
    // Products table
    const table = createProductsTable(category.products);
    content.appendChild(table);
    
    // Availability info for limited products
    const availabilityInfo = createAvailabilityInfo(category.products);
    if (availabilityInfo) {
        content.appendChild(availabilityInfo);
    }
    
    section.appendChild(header);
    section.appendChild(content);
    
    // Add click event for collapsible functionality
    header.addEventListener('click', () => {
        section.classList.toggle('mobile-open');
        section.classList.toggle('collapsed');
    });
    
    return section;
}

// Create products table for a category
function createProductsTable(products) {
    const table = document.createElement('table');
    table.className = 'products-table';
    
    // Table header
    const thead = document.createElement('thead');
    const headers = translations[currentLang].tableHeaders;
    thead.innerHTML = `
        <tr>
            <th>${headers[0]}</th>
            <th>${headers[1]}</th>
            <th>${headers[2]}</th>
            <th>${headers[3]}</th>
        </tr>
    `;
    table.appendChild(thead);
    
    // Table body
    const tbody = document.createElement('tbody');
    products.forEach(product => {
        const row = createProductRow(product);
        tbody.appendChild(row);
    });
    table.appendChild(tbody);
    
    return table;
}

// Create a product row
function createProductRow(product) {
    const row = document.createElement('tr');
    row.setAttribute('data-product-id', product.id);
    
    // Check if product has limited availability
    const hasLimitedAvailability = product.availability !== 'tous les jours';
    const tooltipClass = hasLimitedAvailability ? 'has-tooltip' : '';
    
    row.innerHTML = `
        <td>
            <div class="product-name ${tooltipClass}">
                ${product[`name_${currentLang}`]}
                ${hasLimitedAvailability ? `<div class="availability-tooltip">${product.availability}</div>` : ''}
            </div>
        </td>
        <td>
            <div class="product-description">${product[`description_${currentLang}`]}</div>
        </td>
        <td class="product-price">${product.price.toFixed(2)}€</td>
        <td>
            <input type="number" 
                   class="quantity-input" 
                   min="0" 
                   value="${cart[product.id] || 0}" 
                   data-product-id="${product.id}"
                   data-availability="${product.availability}">
        </td>
    `;
    
    // Add event listener to quantity input
    const quantityInput = row.querySelector('.quantity-input');
    quantityInput.addEventListener('change', (e) => {
        updateCartQuantity(product.id, parseInt(e.target.value) || 0);
    });
    
    return row;
}

// Create availability info section
function createAvailabilityInfo(products) {
    const limitedProducts = products.filter(p => p.availability !== 'tous les jours');
    
    if (limitedProducts.length === 0) {
        return null;
    }
    
    const info = document.createElement('div');
    info.className = 'availability-info';
    
    const title = document.createElement('p');
    title.innerHTML = `<strong>${translations[currentLang].availabilityTitle}</strong>`;
    info.appendChild(title);
    
    limitedProducts.forEach(product => {
        const badge = document.createElement('span');
        badge.className = 'availability-badge limited';
        badge.textContent = `${product[`name_${currentLang}`]} : ${product.availability}`;
        info.appendChild(badge);
    });
    
    return info;
}

// Update cart quantity
function updateCartQuantity(productId, quantity) {
    if (quantity > 0) {
        cart[productId] = quantity;
    } else {
        delete cart[productId];
    }
    saveState();
    checkAvailability();
}

// Restore cart quantities from saved state
function restoreCartQuantities() {
    Object.keys(cart).forEach(productId => {
        const input = document.querySelector(`input[data-product-id="${productId}"]`);
        if (input) {
            input.value = cart[productId];
        }
    });
    checkAvailability();
}

// Check product availability against selected date
function checkAvailability() {
    const deliveryDate = document.getElementById('deliveryDate').value;
    if (!deliveryDate) return;
    
    const selectedDate = new Date(deliveryDate);
    const weekday = translations[currentLang].weekdays[selectedDate.getDay()];
    
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
        const availability = input.getAttribute('data-availability');
        const isAvailable = availability === 'tous les jours' || availability.includes(weekday);
        
        input.disabled = !isAvailable;
        if (!isAvailable && parseInt(input.value) > 0) {
            input.value = 0;
            updateCartQuantity(parseInt(input.getAttribute('data-product-id')), 0);
        }
    });
}

// Set up event listeners
function setupEventListeners() {
    // Language toggle buttons
    document.getElementById('langFr').addEventListener('click', () => switchLanguage('fr'));
    document.getElementById('langEn').addEventListener('click', () => switchLanguage('en'));
    
    // View summary button
    document.getElementById('viewSummaryBtn').addEventListener('click', showOrderSummary);
    
    // Modal buttons
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelOrder').addEventListener('click', closeModal);
    document.getElementById('copyToWhatsApp').addEventListener('click', copyToWhatsApp);
    
    // Close modal when clicking outside
    document.getElementById('summaryModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // Delivery date change
    document.getElementById('deliveryDate').addEventListener('change', checkAvailability);
    
    // Update HTML lang attribute when language changes
    document.documentElement.addEventListener('langChange', function(e) {
        document.documentElement.setAttribute('lang', e.detail.lang);
    });
}

// Switch language
function switchLanguage(lang) {
    if (lang === currentLang) return;
    
    currentLang = lang;
    saveState();
    
    // Update language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
    
    // Update interface
    updateLanguage();
    
    // Regenerate categories to update product names and descriptions
    generateCategories();
    
    // Dispatch custom event for lang attribute update
    document.documentElement.dispatchEvent(new CustomEvent('langChange', { detail: { lang } }));
}

// Update interface language
function updateLanguage() {
    const t = translations[currentLang];
    
    // Update static text elements
    document.getElementById('bakeryTitle').textContent = t.bakeryTitle;
    document.getElementById('deliveryInfo').textContent = t.deliveryInfo;
    document.getElementById('orderInfo').textContent = t.orderInfo;
    document.getElementById('paymentInfo').textContent = t.paymentInfo;
    document.getElementById('nameLabel').textContent = t.nameLabel;
    document.getElementById('dateLabel').textContent = t.dateLabel;
    document.getElementById('summaryBtnText').textContent = t.summaryBtnText;
    document.getElementById('modalTitle').textContent = t.modalTitle;
    document.getElementById('whatsappBtnText').textContent = t.whatsappBtnText;
    document.getElementById('closeBtnText').textContent = t.closeBtnText;
    
    // Update HTML lang attribute
    document.documentElement.setAttribute('lang', currentLang);
}

// Show order summary
function showOrderSummary() {
    const customerName = document.getElementById('customerName').value.trim();
    const deliveryDate = document.getElementById('deliveryDate').value;
    
    // Validation
    if (!customerName) {
        showAlert(translations[currentLang].nameRequired, 'warning');
        return;
    }
    
    if (!deliveryDate) {
        showAlert(translations[currentLang].dateRequired, 'warning');
        return;
    }
    
    // Collect order items
    orderItems = collectOrderItems();
    
    if (orderItems.length === 0) {
        showAlert(translations[currentLang].noItemsSelected, 'warning');
        return;
    }
    
    // Generate and show summary
    generateOrderSummary(customerName, deliveryDate, orderItems);
    showModal();
}

// Collect order items from cart
function collectOrderItems() {
    const items = [];
    
    Object.keys(cart).forEach(productId => {
        const quantity = cart[productId];
        if (quantity > 0) {
            const product = findProductById(parseInt(productId));
            if (product) {
                items.push({
                    id: parseInt(productId),
                    name_fr: product.name_fr,
                    name_en: product.name_en,
                    price: product.price,
                    quantity: quantity,
                    subtotal: product.price * quantity
                });
            }
        }
    });
    
    return items;
}

// Find product by ID
function findProductById(productId) {
    for (const category of DATA.categories) {
        const product = category.products.find(p => p.id === productId);
        if (product) return product;
    }
    return null;
}

// Generate order summary HTML
function generateOrderSummary(customerName, deliveryDate, items) {
    const summaryContainer = document.getElementById('orderSummary');
    const total = items.reduce((sum, item) => sum + item.subtotal, 0);
    const t = translations[currentLang];
    
    // Format delivery date
    const selectedDate = new Date(deliveryDate);
    const formattedDate = selectedDate.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    summaryContainer.innerHTML = `
        <div class="order-summary-header">
            <p><strong>${t.clientLabel}</strong> ${customerName}</p>
            <p><strong>${t.deliveryDateLabel}</strong> ${formattedDate}</p>
        </div>
        
        <div class="order-items">
            ${items.map(item => `
                <div class="order-item">
                    <div class="item-details">
                        <div class="item-name">${item[`name_${currentLang}`]}</div>
                        <div class="item-name-bilingual">${item[currentLang === 'fr' ? 'name_en' : 'name_fr']}</div>
                        <div class="item-quantity">${item.quantity}× ${item.price.toFixed(2)}€</div>
                    </div>
                    <div class="item-price">${item.subtotal.toFixed(2)}€</div>
                </div>
            `).join('')}
        </div>
        
        <div class="order-total">
            <div class="total-amount">${t.totalLabel} ${total.toFixed(2)}€</div>
        </div>
    `;
}

// Show modal
function showModal() {
    document.getElementById('summaryModal').classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    document.getElementById('summaryModal').classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Copy order to WhatsApp
function copyToWhatsApp() {
    const customerName = document.getElementById('customerName').value.trim();
    const deliveryDate = document.getElementById('deliveryDate').value;
    const t = translations[currentLang];
    
    // Format delivery date
    const selectedDate = new Date(deliveryDate);
    const formattedDate = selectedDate.toLocaleDateString(currentLang === 'fr' ? 'fr-FR' : 'en-US', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    // Create bilingual WhatsApp message
    let message = `${t.whatsappIntro}:%0a${t.whatsappName}/Name: ${customerName}%0a${t.whatsappDate}/Date: ${formattedDate}%0a%0a`;
    
    orderItems.forEach(item => {
        message += `– ${item.quantity}x ${item.name_fr} / ${item.name_en} – ${item.subtotal.toFixed(2)}€%0a`;
    });
    
    const total = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
    message += `%0a${t.whatsappTotal}/Total: ${total.toFixed(2)}€%0a%0aMerci ! Thank you!`;
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/?text=${message}`;
    window.open(whatsappUrl, '_blank');
    
    // Close modal after opening WhatsApp
    closeModal();
}

// Show alert message
function showAlert(message, type = 'info') {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Insert alert at the top of the form
    const form = document.getElementById('orderForm');
    form.insertBefore(alert, form.firstChild);
    
    // Auto-remove alert after 5 seconds
    setTimeout(() => {
        if (alert.parentNode) {
            alert.remove();
        }
    }, 5000);
    
    // Scroll to alert
    alert.scrollIntoView({ behavior: 'smooth', block: 'center' });
}