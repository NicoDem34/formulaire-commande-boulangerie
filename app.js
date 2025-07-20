// Variables globales
let currentLang = 'fr';
let orderItems = [];

// Traductions
const translations = {
    fr: {
        title: "Commande pour la boulangerie de Goult",
        "delivery-info": "Livraison chaque matin vers 8h (boulangerie fermée le lundi, sauf juillet et août)",
        "order-info": "Commande à passer avant 11h la veille par WhatsApp",
        "name-label": "Nom / Name :",
        "date-label": "Date de livraison / Delivery date :",
        "show-summary": "Voir Récapitulatif / View Summary",
        "summary-title": "Récapitulatif de commande / Order Summary",
        "whatsapp-btn": "Copier dans WhatsApp / Copy to WhatsApp",
        product: "Produit",
        description: "Description",
        price: "Prix (€)",
        quantity: "Quantité",
        weekdays: ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"]
    },
    en: {
        title: "Order form for Goult bakery",
        "delivery-info": "Delivery every morning around 8 a.m. (bakery closed on Monday, except July & August)",
        "order-info": "Order to be placed before 11 a.m. the day before via WhatsApp",
        "name-label": "Name / Nom :",
        "date-label": "Delivery date / Date de livraison :",
        "show-summary": "View Summary / Voir Récapitulatif",
        "summary-title": "Order Summary / Récapitulatif de commande",
        "whatsapp-btn": "Copy to WhatsApp / Copier dans WhatsApp",
        product: "Product",
        description: "Description",
        price: "Price (€)",
        quantity: "Quantity",
        weekdays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', function() {
    // Date par défaut (demain)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('deliveryDate').value = tomorrow.toISOString().split('T')[0];
    // Génération des catégories dépliées
    generateCategories();
    // Gestion des événements
    setupEventListeners();
    // Langue par défaut
    updateLanguage();
});

// Gestion des événements
function setupEventListeners() {
    // Boutons de langue
    document.getElementById('lang-fr').addEventListener('click', () => switchLanguage('fr'));
    document.getElementById('lang-en').addEventListener('click', () => switchLanguage('en'));

    // Bouton récapitulatif
    document.getElementById('showSummary').addEventListener('click', showSummary);
    // Modal
    document.querySelector('.close').addEventListener('click', closeModal);
    document.getElementById('whatsappBtn').addEventListener('click', openWhatsApp);

    // Fermer modal en cliquant à l'extérieur
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('summaryModal');
        if (event.target === modal) {
            closeModal();
        }
    });

    // Changement de date
    document.getElementById('deliveryDate').addEventListener('change', updateAvailability);

    // Changement de quantité
    document.getElementById('orderAccordion').addEventListener('input', function(event) {
        if (event.target.classList.contains('quantity-input')) {
            const productId = parseInt(event.target.getAttribute('data-product-id'), 10);
            const quantity = parseInt(event.target.value, 10) || 0;
            updateOrderItem(productId, quantity);
        }
    });
}

// Génération des catégories et produits sans accordéon
function generateCategories() {
    const container = document.getElementById('orderAccordion');
    container.innerHTML = '';
    DATA.categories.forEach(category => {
        // Catégorie
        const section = document.createElement('section');
        section.className = 'category-section my-4';

        // Titre catégorie
        section.innerHTML = `<h2>${currentLang === 'fr' ? category.name_fr : category.name_en}</h2>`;

        // Table de produits
        let tableHTML = `<table class="table table-bordered">
            <thead>
                <tr>
                    <th>${translations[currentLang].product}</th>
                    <th>${translations[currentLang].description}</th>
                    <th>${translations[currentLang].price}</th>
                    <th>${translations[currentLang].quantity}</th>
                </tr>
            </thead>
            <tbody>`;

        category.products.forEach(product => {
            tableHTML += `<tr>
                <td>${currentLang === 'fr' ? product.name_fr : product.name_en}${getAvailabilityInfo(product)}</td>
                <td>${currentLang === 'fr' ? product.description_fr : product.description_en}</td>
                <td>${product.price.toFixed(2)}€</td>
                <td>
                    <input type="number" min="0" class="quantity-input"
                        data-product-id="${product.id}"
                        value="${getOrderItemQuantity(product.id)}"
                        ${isProductAvailable(product) ? '' : 'disabled'}>
                </td>
            </tr>`;
        });

        tableHTML += `</tbody></table>`;
        section.innerHTML += tableHTML;
        container.appendChild(section);
    });
}

// Autres fonctions utiles (inchangées)
function switchLanguage(lang) {
    if (lang !== currentLang) {
        currentLang = lang;
        updateLanguage();
        generateCategories();
    }
}
function updateLanguage() {
    document.querySelectorAll('[data-lang]').forEach(el => {
        const key = el.getAttribute('data-lang');
        const translation = translations[currentLang][key];
        if (translation) {
            el.textContent = translation;
        }
    });
    // Mise à jour des jours
    updateDayLabels();
}
function updateDayLabels() {
    // Si tu utilises les jours de la semaine qqpart, adapte ici
}
function updateOrderItem(productId, quantity) {
    const existingIndex = orderItems.findIndex(item => item.productId === productId);
    if (existingIndex >= 0) {
        if (quantity > 0) {
            orderItems[existingIndex].quantity = quantity;
        } else {
            orderItems.splice(existingIndex, 1);
        }
    } else if (quantity > 0) {
        orderItems.push({ productId, quantity });
    }
}
function getOrderItemQuantity(productId) {
    const item = orderItems.find(item => item.productId === productId);
    return item ? item.quantity : '';
}
function isProductAvailable(product) {
    if (!product.days_available) return true;
    const deliveryDate = document.getElementById('deliveryDate').value;
    const dateObj = deliveryDate ? new Date(deliveryDate) : new Date();
    const day = dateObj.getDay();
    return product.days_available.includes(day);
}
function getAvailabilityInfo(product) {
    if (!product.days_available) return '';
    const days = product.days_available.map(day =>
        translations[currentLang].weekdays[day]
    ).join(', ');
    return `<span class="availability-info" title="${days}">*</span>`;
}
function updateAvailability() {
    generateCategories();
}

// --- Partie récapitulatif/modal/WhatsApp (identique à avant, à compléter si besoin) ---

// ... showSummary, closeModal, openWhatsApp, formatDate ...

